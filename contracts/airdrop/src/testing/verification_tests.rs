use crate::verification::{verify_signature_cosmos, verify_signature_eth, verify_signature_solana};
use cosmwasm_std::testing::{
    mock_dependencies, mock_env, mock_info, MockApi, MockQuerier, MockStorage,
};
use cosmwasm_std::{
    from_slice, Binary, OwnedDeps, RecoverPubkeyError, StdError, VerificationError,
};

fn setup() -> OwnedDeps<MockStorage, MockApi, MockQuerier> {
    mock_dependencies()
}

#[test]
fn verify_correct_eth_signature() {
    let signer_address = "0x78864CE3E53A439ae0A8e15622aA0d21675ad4Cd";
    let message = "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpw";
    let signature = "93a37e1a568cdcba6454e24cc8f31a57e8d947b147adf4c16ff67c4c12112c0700adf75abbfa00f5bfbf8d5057cdaf0b6ca11572c4d3a1064b5e967a5b39e53f1c";

    let deps = setup();
    let verified = verify_signature_eth(deps.as_ref(), message, signature, signer_address).unwrap();
    assert_eq!(verified, true);
}

#[test]
fn verify_wrong_eth_message() {
    let signer_address = "0x8898702932F9e10c696146AA8DC6dD0E6F524b88";
    let message = "terra1zdpgj8am5nqqvht927k3etljyl6a52kwqup0j";
    let signature = "e9185703bba3a4da838788fe38d4d1e771fba1cd91726552192fa2d51e6ad646293cb0b0db770f0eb105a26eef11de076ada843ff025f9bbcb551a37487c9d4f1c";

    let deps = setup();
    let verified = verify_signature_eth(deps.as_ref(), message, signature, signer_address).unwrap();
    assert_eq!(verified, false);
}
#[test]
fn verify_wrong_eth_signer() {
    let signer_address = "0x8898702932F9e10c696146AA8DC6dD0E6F524b87";
    let message = "terra1zdpgj8am5nqqvht927k3etljyl6a52kwqup0je";
    let signature = "e9185703bba3a4da838788fe38d4d1e771fba1cd91726552192fa2d51e6ad646293cb0b0db770f0eb105a26eef11de076ada843ff025f9bbcb551a37487c9d4f1c";

    let deps = setup();
    let verified = verify_signature_eth(deps.as_ref(), message, signature, signer_address).unwrap();
    assert_eq!(verified, false);
}

#[test]
fn verify_correct_solana_signature() {
    let signer_address = "62ckGY2ntsSBd1YCoyUPTuV4aWtcDEKNMeysg2xv9px8";
    let message = "terra1zdpgj8am5nqqvht927k3etljyl6a52kwqup0je";
    let signature = "8c78d40738fd257dffec56714ece1837d0a561aa6aaff741f2992e327aa3c2f493d3267a3041c45d524cd81ac613c70a440ea54dc8ef28da3fd9fa8433579401";

    let deps = setup();
    let verified =
        verify_signature_solana(deps.as_ref(), message, signature, signer_address).unwrap();
    assert_eq!(verified, true);
}

#[test]
fn verify_wrong_solana_message() {
    let signer_address = "62ckGY2ntsSBd1YCoyUPTuV4aWtcDEKNMeysg2xv9px8";
    let message = "terra1zdpgj8am5nqqvht927k3etljyl6a52kkqup0je";
    let signature = "8c78d40738fd257dffec56714ece1837d0a561aa6aaff741f2992e327aa3c2f493d3267a3041c45d524cd81ac613c70a440ea54dc8ef28da3fd9fa8433579401";

    let deps = setup();
    let verified =
        verify_signature_solana(deps.as_ref(), message, signature, signer_address).unwrap();
    assert_eq!(verified, false);
}

#[test]
fn verify_wrong_solana_signer() {
    let signer_address = "62ckGY2ntsSBd1YCoyUPTuV4aWtcDEKNMeysg2xv9xx8";
    let message = "terra1zdpgj8am5nqqvht927k3etljyl6a52kwqup0je";
    let signature = "8c78d40738fd257dffec56714ece1837d0a561aa6aaff741f2992e327aa3c2f493d3267a3041c45d524cd81ac613c70a440ea54dc8ef28da3fd9fa8433579401";

    let deps = setup();
    let verified =
        verify_signature_solana(deps.as_ref(), message, signature, signer_address).unwrap();
    assert_eq!(verified, false);
}

#[test]
fn verify_correct_cosmos_signer() {
    let signer_address = "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpw";
    let message = "hello world";
    let signature = "3ea138e59a229615997fb8ce7a51f40ed115edf7e217b1e79bc6a688bf2be8d32a87aceb9048689c39f722c1593e028210438928bf8a89375d7cef25df0154fb";

    let deps = setup();
    let verified =
        verify_signature_cosmos(deps.as_ref(), message, signature, signer_address, "terra")
            .unwrap();
    assert_eq!(verified, true);
}

#[test]
fn verify_wrong_cosmos_signer() {
    let signer_address = "terra1lxc1c5rnvcfx94x2ejarsr55cmcec6apklkdpw";
    let message = "hello world";
    let signature = "3ea138e59a229615997fb8ce7a51f40ed115edf7e217b1e79bc6a688bf2be8d32a87aceb9048689c39f722c1593e028210438928bf8a89375d7cef25df0154fb";

    let deps = setup();
    let verified =
        verify_signature_cosmos(deps.as_ref(), message, signature, signer_address, "terra")
            .unwrap();
    assert_eq!(verified, false);
}

#[test]
fn verify_wrong_cosmos_message() {
    let signer_address = "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpw";
    let message = "hello worlds";
    let signature = "3ea138e59a229615997fb8ce7a51f40ed115edf7e217b1e79bc6a688bf2be8d32a87aceb9048689c39f722c1593e028210438928bf8a89375d7cef25df0154fb";

    let deps = setup();
    let verified =
        verify_signature_cosmos(deps.as_ref(), message, signature, signer_address, "terra")
            .unwrap();
    assert_eq!(verified, false);
}
