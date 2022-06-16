use bech32::{encode, ToBase32};
use cosmwasm_std::{Api, StdError, StdResult};
use ripemd::{Digest as RipeDigest, Ripemd160};
use sha2::Sha256;
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

pub fn compress_public_key(p: &[u8]) -> StdResult<[u8; 33]> {
    let (tag, data) = match p.split_first() {
        Some(pair) => pair,
        None => return Err(StdError::generic_err("Public key must not be empty")),
    };
    if *tag != 0x04 {
        return Err(StdError::generic_err("Public key must start with 0x04"));
    }
    if data.len() != 64 {
        return Err(StdError::generic_err("Public key must be 65 bytes long"));
    }

    // 1. check if the last 32 bytes is odd or even (y value of the key)
    // 2. need to take the first 32 bytes (x value of the key) without the tag
    // 3. prefix (2) with the tag from (1)
    // 4. return the compress public key
    let (last, _) = match p.split_last() {
        Some(pair) => pair,
        None => return Err(StdError::generic_err("Public key must not be empty")),
    };
    let last_byte = [*last];
    let l = u8::from_be_bytes(last_byte);
    let prefix: u8;
    if l % 2 == 0 {
        prefix = 2
    } else {
        prefix = 3
    }
    let mut ret = [0u8; 33];
    ret[1..].copy_from_slice(&data[..32]);
    ret[0] = prefix;
    return Ok(ret);
}

pub fn public_key_to_address(k: &[u8], prefix: &str) -> StdResult<String> {
    let mut hasher = Ripemd160::new();
    let mut sha = Sha256::new();
    // let mut sha_result: [u8; 32] = [0; 32];
    // let mut ripe_result: [u8; 20] = [0; 20];
    sha.update(k);
    let sha_result = sha.finalize();
    hasher.update(&sha_result);
    let ripe_result = hasher.finalize();
    encode(
        prefix,
        ripe_result.as_slice().to_base32(),
        bech32::Variant::Bech32,
    )
    .map_err(|_| StdError::generic_err("bech32 encoding failed"))
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
