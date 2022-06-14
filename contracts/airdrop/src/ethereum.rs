use cosmwasm_std::{Api, StdError, StdResult};
use sha3::{Digest, Keccak256};
use std::convert::TryInto;

/// Helpers for eth address and message verification
/// Taking from: https://github.com/CosmWasm/cosmwasm/blob/main/contracts/crypto-verify/src/ethereum.rs

/// Get the recovery param from the value `v` when no chain ID for replay protection is used.
///
/// This is needed for chain-agnostig aignatures like signed text.
///
/// See [EIP-155] for how `v` is composed.
///
/// [EIP-155]: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
pub fn get_recovery_param(v: u8) -> StdResult<u8> {
    match v {
        27 => Ok(0),
        28 => Ok(1),
        _ => Err(StdError::generic_err("Values of v other than 27 and 28 not supported. Replay protection (EIP-155) cannot be used here."))
    }
}

/// Get the recovery param from the value `v` when a chain ID for replay protection is used.
///
/// This is needed for chain-agnostig aignatures like signed text.
///
/// See [EIP-155] for how `v` is composed.
///
/// [EIP-155]: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
pub fn get_recovery_param_with_chain_id(v: u64, chain_id: u64) -> StdResult<u8> {
    let recovery = v - chain_id * 2 - 35;
    match recovery {
        0 | 1 => Ok(recovery as u8),
        _ => Err(StdError::generic_err(format!(
            "Calculated recovery parameter must be 0 or 1 but is {}.",
            recovery
        ))),
    }
}

/// Returns a raw 20 byte Ethereum address
pub fn ethereum_address_raw(pubkey: &[u8]) -> StdResult<[u8; 20]> {
    let (tag, data) = match pubkey.split_first() {
        Some(pair) => pair,
        None => return Err(StdError::generic_err("Public key must not be empty")),
    };
    if *tag != 0x04 {
        return Err(StdError::generic_err("Public key must start with 0x04"));
    }
    if data.len() != 64 {
        return Err(StdError::generic_err("Public key must be 65 bytes long"));
    }

    let hash = Keccak256::digest(data);
    Ok(hash[hash.len() - 20..].try_into().unwrap())
}

pub fn decode_address(input: &str) -> StdResult<[u8; 20]> {
    if input.len() != 42 {
        return Err(StdError::generic_err(
            "Ethereum address must be 42 characters long",
        ));
    }
    if !input.starts_with("0x") {
        return Err(StdError::generic_err("Ethereum address must start wit 0x"));
    }
    let data = hex::decode(&input[2..]).map_err(|_| StdError::generic_err("hex decoding error"))?;
    Ok(data.try_into().unwrap())
}
