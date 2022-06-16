use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cw_storage_plus::{Item, Map};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    pub admin: String,
    pub denom: String,
    pub prefix: Option<String>,
    pub vesting_schedule: Vec<i64>,
}

pub const CONFIG: Item<Config> = Item::new("config");

pub const MERKLE_ROOT: Item<String> = Item::new("merkle_root");
pub const CLAIM_INDEX: Map<&str, bool> = Map::new("claim_index");
