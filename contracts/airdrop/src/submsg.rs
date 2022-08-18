use crate::distribution::{Coin as DistributionCoin, MsgFundCommunityPool};
use crate::vesting::{Coin as VestingCoin, MsgCreatePeriodicVestingAccount, Period};
use cosmwasm_std::{coins, BankMsg, Binary, CosmosMsg, Env, Response, StdResult, Uint128};
use protobuf::Message;

pub fn create_fund_community_pool_response(
    denom: String,
    depositor: String,
    amount: Uint128,
) -> StdResult<Response> {
    let mut msg = MsgFundCommunityPool::new();
    let mut coin = DistributionCoin::new();
    coin.amount = amount.to_string();
    coin.denom = denom.clone();
    msg.amount = vec![coin];
    msg.depositor = depositor;
    let bytes = Message::write_to_bytes(&msg).unwrap();

    Ok(Response::default().add_message(CosmosMsg::Stargate {
        type_url: "/cosmos.distribution.v1beta1.MsgFundCommunityPool".to_string(),
        value: Binary(bytes),
    }))
}

pub fn create_claim_response(
    env: Env,
    sender: String,
    denom: String,
    claimer: String,
    recipient: String,
    vested: u128,
    periods: Vec<(i64, String)>,
    start_time: Option<i64>,
    refund_amount: Uint128,
) -> StdResult<Response> {
    create_vesting_account(
        env,
        sender,
        denom,
        claimer,
        recipient,
        vested,
        periods,
        start_time,
        refund_amount,
    )
}

pub fn create_vesting_account(
    env: Env,
    sender: String,
    denom: String,
    claimer: String,
    recipient: String,
    vested: u128,
    periods: Vec<(i64, String)>,
    start_time: Option<i64>,
    refund_amount: Uint128,
) -> StdResult<Response> {
    let mut msg = MsgCreatePeriodicVestingAccount::new();
    msg.from_address = env.contract.address.to_string();
    msg.to_address = recipient.clone();
    msg.start_time = match start_time {
        Some(t) => t,
        None => env.block.time.seconds() as i64,
    };
    let mut total_vesting = 0u128;
    msg.vesting_periods = periods
        .iter()
        .map(|v| {
            let coins: Vec<VestingCoin> = if v.1.eq("0") {
                vec![]
            } else {
                let mut coin = VestingCoin::new();
                coin.denom = denom.clone();
                coin.amount = v.1.clone();
                vec![coin]
            };
            let amount_u128 = u128::from_str_radix(&v.1.clone(), 10).unwrap_or_else(|_| 0u128);
            total_vesting += amount_u128;
            let mut period = Period::new();
            period.length = v.0;
            period.amount = coins;

            period
        })
        .collect::<Vec<Period>>();
    let bytes = Message::write_to_bytes(&msg).unwrap();
    let mut msgs: Vec<CosmosMsg> = vec![];
    if vested > 0 {
        msgs.push(CosmosMsg::Bank(BankMsg::Send {
            to_address: recipient.clone(),
            amount: coins(vested, denom.clone()),
        }))
    }
    if total_vesting > 0 {
        msgs.push(CosmosMsg::Stargate {
            type_url: "/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount".to_string(),
            value: Binary(bytes),
        });
    }
    if !refund_amount.is_zero() {
        msgs.push(CosmosMsg::Bank(BankMsg::Send {
            to_address: sender.clone(),
            amount: coins(refund_amount.u128(), denom.clone()),
        }));
    }
    Ok(Response::new().add_messages(msgs).add_attributes(vec![
        ("action", "claim"),
        ("address", &claimer.to_string()),
        ("new_address", &recipient.to_string()),
        ("vested", &vested.to_string()),
        ("vesting", &total_vesting.to_string()),
    ]))
}
