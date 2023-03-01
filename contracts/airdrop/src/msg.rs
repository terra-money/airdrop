use cosmwasm_std::Uint128;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub admin: String,
    pub denom: String,
    pub vesting_periods: [i64; 5],
    // Only used for cosmos chains (ex. terra)
    pub prefix: Option<String>,
    // Start time from when the vesting starts. If None, then it will start
    // when the user claims the airdrop
    pub start_time: Option<i64>,
    // End time of the airdrop event. Afterwhich funds will be sent back to
    // the community pool
    pub claim_end_time: u64,
    pub fee_refund: Option<Uint128>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    UpdateConfig {
        admin: Option<String>,
        fee_refund: Option<Uint128>,
        enabled: Option<bool>,
    },
    RegisterMerkleRoot {
        merkle_root: String,
    },
    Claim {
        allocation: String,
        proofs: Vec<String>,
        message: String,
        signature: String,
    },
    End {},
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    Config {},
    MerkleRoot {},
    IsClaimed { address: String },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum MigrateMsg {
    Migrate {},
}

// We define a custom struct for each query response
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ConfigResponse {
    pub admin: String,
    pub denom: String,
    pub fee: Option<Uint128>,
    pub enabled: bool,
}

// We define a custom struct for each query response
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MerkleRootResponse {
    pub merkle_root: String,
}

// We define a custom struct for each query response
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct IsClaimedResponse {
    pub is_claimed: bool,
}
