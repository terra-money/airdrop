use crate::ethereum::{decode_address, ethereum_address_raw, get_recovery_param};
use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, QueryResponse, Response,
    StdError, StdResult, Uint128,
};
use sha2::{Digest, Sha256};
use sha3::Keccak256;

#[cfg(feature = "eth")]
pub fn verify_signature(
    deps: Deps,
    message: &str,
    signature: &str,
    signer_address: &str,
) -> StdResult<bool> {
    let signer_address = decode_address(signer_address)?;

    // Hashing
    let mut hasher = Keccak256::new();
    hasher.update(format!("\x19Ethereum Signed Message:\n{}", message.len()));
    hasher.update(message);
    let hash = hasher.finalize();

    let signature_u8 = hex::decode(signature);
    // Decompose signature
    let (v, rs) = match signature_u8.split_last() {
        Some(pair) => pair,
        None => return Err(StdError::generic_err("Signature must not be empty")),
    };
    let recovery = get_recovery_param(*v)?;

    // Verification
    let calculated_pubkey = deps.api.secp256k1_recover_pubkey(&hash, rs, recovery)?;
    let calculated_address = ethereum_address_raw(&calculated_pubkey)?;
    if signer_address != calculated_address {
        return Ok(false);
    }
    let result = deps.api.secp256k1_verify(&hash, rs, &calculated_pubkey);
    match result {
        Ok(verifies) => Ok(true),
        Err(err) => Err(err.into()),
    }
}

#[cfg(feature = "solana")]
pub fn verify_signature(
    deps: Deps,
    message: &str,
    signature: &str,
    signer_address: &str,
) -> StdResult<bool> {
    let signature_u8 =
        &hex::decode(signature).map_err(|_| StdError::generic_err("error decoding signature"))?;
    let public_key = &bs58::decode(signer_address)
        .into_vec()
        .map_err(|_| StdError::generic_err("unable to decode signer address"))?;
    let result = deps
        .api
        .ed25519_verify(message.as_bytes(), signature_u8, public_key);
    match result {
        Ok(verified) => Ok(verified),
        Err(err) => Err(err.into()),
    }
}

#[cfg(feature = "terra")]
pub fn verify_signature(deps: Deps, message: &str, signature: &str, signer_address: &str) {}
