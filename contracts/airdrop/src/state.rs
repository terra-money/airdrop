use cosmwasm_std::Uint128;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cw_storage_plus::{Item, Map};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    pub admin: String,
    pub denom: String,
    pub prefix: Option<String>,
    pub start_time: Option<i64>,
    pub vesting_periods: [i64; 5],
    pub claim_end_time: u64,
    pub fee_refund: Option<Uint128>,
    pub enabled: bool,
}

pub const CONFIG: Item<Config> = Item::new("config");

pub const MERKLE_ROOT: Item<String> = Item::new("merkle_root");
pub const CLAIM_INDEX: Map<&str, bool> = Map::new("claim_index");
