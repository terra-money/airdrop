#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;

use cosmwasm_std::{
    coins, to_binary, BankMsg, Binary, CosmosMsg, Deps, DepsMut, Env, MessageInfo, Response,
    StdError, StdResult, WasmMsg,
};

use crate::msg::{
    ConfigResponse, ExecuteMsg, InstantiateMsg, IsClaimedResponse, MerkleRootResponse, QueryMsg,
};
use crate::state::{Config, CLAIM_INDEX, CONFIG, MERKLE_ROOT};
use crate::submsg::{create_claim_response, create_fund_community_pool_response};
use crate::verification::verify_signature;

use sha3::Digest;
use std::convert::TryInto;

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    CONFIG.save(
        deps.storage,
        &Config {
            admin: deps.api.addr_validate(&msg.admin)?.to_string(),
            denom: msg.denom,
            prefix: msg.prefix,
            start_time: msg.start_time,
            vesting_periods: msg.vesting_periods,
            claim_end_time: msg.claim_end_time,
        },
    )?;

    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    match msg {
        ExecuteMsg::UpdateConfig { admin } => update_config(deps, env, info, admin),
        ExecuteMsg::UpdateMerkleRoot { merkle_root } => {
            update_merkle_root(deps, env, info, merkle_root)
        }
        ExecuteMsg::RegisterMerkleRoot { merkle_root } => {
            register_merkle_root(deps, env, info, merkle_root)
        }
        ExecuteMsg::Claim {
            allocation,
            proofs,
            message,
            signature,
            fee_refund: _,
        } => claim(deps, env, info, allocation, proofs, message, signature),
        ExecuteMsg::End {} => end_airdrop(deps, env, info),
    }
}

pub fn update_merkle_root(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    merkle_root: String,
) -> StdResult<Response> {
    let config: Config = CONFIG.load(deps.storage)?;
    if info.sender != config.admin {
        return Err(StdError::generic_err("unauthorized"));
    }

    MERKLE_ROOT.save(deps.storage, &merkle_root)?;

    Ok(Response::new().add_attributes(vec![
        ("action", "update_merkle_root"),
        ("merkle_root", &merkle_root),
    ]))
}

pub fn update_config(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    admin: Option<String>,
) -> StdResult<Response> {
    let mut config: Config = CONFIG.load(deps.storage)?;
    if info.sender != config.admin {
        return Err(StdError::generic_err("unauthorized"));
    }

    if let Some(admin) = admin {
        config.admin = admin;
    }

    CONFIG.save(deps.storage, &config)?;
    Ok(Response::new().add_attribute("action", "update_config"))
}

pub fn register_merkle_root(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    merkle_root: String,
) -> StdResult<Response> {
    let config: Config = CONFIG.load(deps.storage)?;
    if info.sender != config.admin {
        return Err(StdError::generic_err("unauthorized"));
    }

    MERKLE_ROOT.save(deps.storage, &merkle_root)?;

    Ok(Response::new().add_attributes(vec![
        ("action", "register_merkle_root"),
        ("merkle_root", &merkle_root),
    ]))
}

pub fn claim(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    amount: String,
    proofs: Vec<String>,
    new_terra_address: String,
    signature: String,
) -> StdResult<Response> {
    let config = CONFIG.load(deps.storage)?;
    if env.block.time.seconds() > config.claim_end_time {
        return Err(StdError::generic_err("airdrop event ended"));
    }
    let mut values = (&amount).split(",");
    let signer = values
        .next()
        .ok_or(StdError::generic_err("unable to parse claim amount"))?;

    let (verified, verified_terra_address) = verify_signature(
        deps.as_ref(),
        String::from(&info.sender),
        new_terra_address,
        signature,
        String::from(signer),
    )?;
    if !verified {
        return Err(StdError::generic_err(&format!(
            "signature verification error. Expected: {} Received: {}",
            info.sender.into_string(),
            String::from(signer)
        )));
    };

    let amount0 = values
        .next()
        .ok_or(StdError::generic_err("unable to parse claim amount0"))?;
    let amount0_u128 = u128::from_str_radix(amount0, 10)
        .map_err(|_| StdError::generic_err("unable to parse amount0"))?;

    let mut vesting_periods: Vec<(i64, String)> = vec![];
    let amount1 = values
        .next()
        .ok_or(StdError::generic_err("unable to parse claim amount1"))?;
    vesting_periods.push((config.vesting_periods[0], String::from(amount1)));

    let amount2 = values
        .next()
        .ok_or(StdError::generic_err("unable to parse claim amount2"))?;
    vesting_periods.push((config.vesting_periods[1], String::from(amount2)));

    let amount3 = values
        .next()
        .ok_or(StdError::generic_err("unable to parse claim amount3"))?;
    vesting_periods.push((config.vesting_periods[2], String::from(amount3)));

    let amount4 = values
        .next()
        .ok_or(StdError::generic_err("unable to parse claim amount4"))?;
    vesting_periods.push((config.vesting_periods[3], String::from(amount4)));

    let merkle_root: String = MERKLE_ROOT.load(deps.storage)?;

    if CLAIM_INDEX.may_load(deps.storage, signer)?.unwrap_or(false) {
        return Err(StdError::generic_err("already claimed"));
    }

    let mut hash: [u8; 32] = sha3::Keccak256::digest(amount.as_bytes())
        .as_slice()
        .try_into()
        .expect("Wrong length");

    for p in proofs {
        let mut proof_buf: [u8; 32] = [0; 32];
        hex::decode_to_slice(p, &mut proof_buf).unwrap();
        hash = if bytes_cmp(hash, proof_buf) == std::cmp::Ordering::Less {
            sha3::Keccak256::digest(&[hash, proof_buf].concat())
                .as_slice()
                .try_into()
                .expect("Wrong length")
        } else {
            sha3::Keccak256::digest(&[proof_buf, hash].concat())
                .as_slice()
                .try_into()
                .expect("Wrong length")
        };
    }

    let mut root_buf: [u8; 32] = [0; 32];
    hex::decode_to_slice(merkle_root, &mut root_buf).unwrap();
    if root_buf != hash {
        return Err(StdError::generic_err("Merkle verification failed"));
    }

    CLAIM_INDEX.save(deps.storage, signer, &true)?;

    Ok(create_claim_response(
        env,
        config.denom,
        signer.to_string(),
        verified_terra_address,
        amount0_u128,
        vesting_periods,
        config.start_time,
    )?)
}

fn end_airdrop(deps: DepsMut, env: Env, info: MessageInfo) -> StdResult<Response> {
    let config: Config = CONFIG.load(deps.storage)?;
    if info.sender != config.admin {
        return Err(StdError::generic_err("unauthorized"));
    }

    if env.block.time.seconds() < config.claim_end_time {
        return Err(StdError::generic_err("airdrop event not ended"));
    }

    let coin = deps
        .querier
        .query_balance(env.contract.address.clone(), config.denom.clone())?;

    create_fund_community_pool_response(
        config.denom,
        env.contract.address.into_string(),
        coin.amount,
    )
}

fn bytes_cmp(a: [u8; 32], b: [u8; 32]) -> std::cmp::Ordering {
    let mut i = 0;
    while i < 32 {
        match a[i].cmp(&b[i]) {
            std::cmp::Ordering::Greater => return std::cmp::Ordering::Greater,
            std::cmp::Ordering::Less => return std::cmp::Ordering::Less,
            _ => {}
        }

        i += 1;
    }

    std::cmp::Ordering::Equal
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Config {} => to_binary(&query_config(deps, env)?),
        QueryMsg::MerkleRoot {} => to_binary(&query_merkle_root(deps, env)?),
        QueryMsg::IsClaimed { address } => to_binary(&query_is_claimed(deps, env, address)?),
    }
}

pub fn query_config(deps: Deps, _env: Env) -> StdResult<ConfigResponse> {
    let state = CONFIG.load(deps.storage)?;
    let resp = ConfigResponse {
        admin: state.admin,
        denom: state.denom,
    };

    Ok(resp)
}

pub fn query_merkle_root(deps: Deps, _env: Env) -> StdResult<MerkleRootResponse> {
    let merkle_root = MERKLE_ROOT.load(deps.storage)?;
    let resp = MerkleRootResponse { merkle_root };

    Ok(resp)
}

pub fn query_is_claimed(deps: Deps, _env: Env, address: String) -> StdResult<IsClaimedResponse> {
    let resp = IsClaimedResponse {
        is_claimed: CLAIM_INDEX
            .may_load(deps.storage, &address)?
            .unwrap_or(false),
    };

    Ok(resp)
}
