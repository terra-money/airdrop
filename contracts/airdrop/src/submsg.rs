use crate::vesting::{Coin as VestingCoin, MsgCreatePeriodicVestingAccount, Period};
use cosmwasm_std::{coins, BankMsg, Binary, CosmosMsg, Env, Response, StdResult};
use protobuf::Message;

pub fn create_claim_response(
    env: Env,
    denom: String,
    claimer: String,
    recipient: String,
    vested: u128,
    periods: Vec<(i64, String)>,
    start_time: Option<i64>,
) -> StdResult<Response> {
    create_vesting_account(env, denom, claimer, recipient, vested, periods, start_time)
}

pub fn create_vesting_account(
    env: Env,
    denom: String,
    claimer: String,
    recipient: String,
    vested: u128,
    periods: Vec<(i64, String)>,
    start_time: Option<i64>,
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
            let mut coin = VestingCoin::new();
            coin.denom = denom.clone();
            coin.amount = v.1.clone();
            let amount_u128 = u128::from_str_radix(&v.1.clone(), 10).unwrap_or_else(|_| 0u128);
            total_vesting += amount_u128;
            let mut period = Period::new();
            period.length = v.0;
            period.amount = vec![coin];

            period
        })
        .collect::<Vec<Period>>();
    let bytes = Message::write_to_bytes(&msg).unwrap();
    match total_vesting {
        0 => Ok(Response::new()
            .add_message(CosmosMsg::Bank(BankMsg::Send {
                to_address: recipient.clone(),
                amount: coins(vested, denom.clone()),
            }))
            .add_attributes(vec![
                ("action", "claim"),
                ("address", &claimer.to_string()),
                ("new_address", &recipient.to_string()),
                ("vested", &vested.to_string()),
                ("vesting", &total_vesting.to_string()),
            ])),
        _ => Ok(Response::new()
            .add_message(CosmosMsg::Stargate {
                type_url: "/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount".to_string(),
                value: Binary(bytes),
            })
            .add_message(CosmosMsg::Bank(BankMsg::Send {
                to_address: recipient.clone(),
                amount: coins(vested, denom.clone()),
            }))
            .add_attributes(vec![
                ("action", "claim"),
                ("address", &claimer.to_string()),
                ("new_address", &recipient.to_string()),
                ("vested", &vested.to_string()),
                ("vesting", &total_vesting.to_string()),
            ])),
    }
}
