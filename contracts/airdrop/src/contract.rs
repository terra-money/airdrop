#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;

use cosmwasm_std::{
    to_binary, Binary, CosmosMsg, Deps, DepsMut, Env, MessageInfo, Response, StdError, StdResult,
    Uint128,
};

use crate::msg::{
    ConfigResponse, ExecuteMsg, InstantiateMsg, IsClaimedResponse, MerkleRootResponse, QueryMsg,
};
use crate::state::{Config, CLAIM_INDEX, CONFIG, MERKLE_ROOT};
use crate::verification::verify_signature;
use crate::vesting::{Coin, MsgCreatePeriodicVestingAccount, Period};

use sha3::Digest;
use std::convert::TryInto;

use protobuf::Message;

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
            address,
            fee_refund: _,
        } => claim(
            deps, env, info, allocation, proofs, message, signature, address,
        ),
        ExecuteMsg::CreateVestingAccount { recipient, periods } => {
            create_vesting_account(deps, env, recipient, periods)
        }
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

pub fn create_vesting_account(
    deps: DepsMut,
    env: Env,
    recipient: String,
    periods: Vec<(i64, String)>,
) -> StdResult<Response> {
    let config: Config = CONFIG.load(deps.storage)?;

    let mut msg = MsgCreatePeriodicVestingAccount::new();
    msg.from_address = env.contract.address.to_string();
    msg.to_address = recipient;
    msg.start_time = env.block.time.seconds() as i64;
    msg.vesting_periods = periods
        .iter()
        .map(|v| {
            let mut coin = Coin::new();
            coin.denom = config.denom.clone();
            coin.amount = v.1.clone();

            let mut period = Period::new();
            period.length = v.0;
            period.amount = vec![coin];

            period
        })
        .collect::<Vec<Period>>();

    let bytes = Message::write_to_bytes(&msg).unwrap();
    Ok(Response::new().add_message(CosmosMsg::Stargate {
        type_url: "/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount".to_string(),
        value: Binary(bytes),
    }))
}

pub fn claim(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    amount: String,
    proofs: Vec<String>,
    message: String,
    signature: String,
    address: String,
) -> StdResult<Response> {
    verify_signature(deps.as_ref(), "123", "123", "123");

    let merkle_root: String = MERKLE_ROOT.load(deps.storage)?;

    let user_raw = deps.api.addr_canonicalize(info.sender.as_str())?;

    // If user claimed target stage, return err
    if CLAIM_INDEX
        .may_load(deps.storage, user_raw.as_slice())?
        .unwrap_or(false)
    {
        return Err(StdError::generic_err("already claimed"));
    }

    let user_input: String = info.sender.to_string() + &amount.to_string();
    let mut hash: [u8; 32] = sha3::Keccak256::digest(user_input.as_bytes())
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
        return Err(StdError::generic_err("Verification is failed"));
    }

    // Update claim index to the current stage
    CLAIM_INDEX.save(deps.storage, (user_raw.as_slice()), &true)?;

    Ok(Response::new()
        // .add_message(CosmosMsg::Wasm(WasmMsg::Execute {
        //     contract_addr: deps.api.addr_humanize(&config.mirror_token)?.to_string(),
        //     funds: vec![],
        //     msg: to_binary(&Cw20ExecuteMsg::Transfer {
        //         recipient: info.sender.to_string(),
        //         amount,
        //     })?,
        // }))
        .add_attributes(vec![
            ("action", "claim"),
            ("address", info.sender.as_str()),
            ("amount", &amount.to_string()),
        ]))
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
    let user_raw = deps.api.addr_canonicalize(&address)?;
    let resp = IsClaimedResponse {
        is_claimed: CLAIM_INDEX
            .may_load(deps.storage, user_raw.as_slice())?
            .unwrap_or(false),
    };

    Ok(resp)
}
