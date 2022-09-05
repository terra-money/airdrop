use crate::verification::{verify_signature_cosmos, verify_signature_eth, verify_signature_solana};
use cosmwasm_std::testing::{mock_dependencies, MockApi, MockQuerier, MockStorage};
use cosmwasm_std::OwnedDeps;

fn setup() -> OwnedDeps<MockStorage, MockApi, MockQuerier> {
    mock_dependencies()
}

#[test]
fn verify_correct_eth_signature() {
    let signer_address = "0x08ac9f754d73fcd3cf7b0fad738668d3474c5040";
    let message = "terra1352nvukmex9ax4c329cp7ln9jfgjf0z7whvfca";
    let signature = "91057d9ea8fe7dc18a54ebd0c397772595f3884d533f68678f292cde896d4cb75f8c64004accaed85b0e7adceebf722cd12ea7590666923058d296154cb5bb791b";

    let deps = setup();
    let verified = verify_signature_eth(deps.as_ref(), message, signature, signer_address).unwrap();
    assert_eq!(verified, true);
}

#[test]
fn verify_correct_eth_ledger_signature() {
    let signer_address = "0x11ddd954aa0772e56bd369c629c166d5ddf1f0c1";
    let message = "terra1vvyz34dance4v682w470x4gyl2zhjmcgg25qpt";
    let signature = "3e573b5900fdc93c48e8d0488c19529e6bce59fcfea70facad7098a67f13fff77fef241de0205ecd744d97b4c19e3973404fb3a0d6c0e4c7850f5d6b2910213b01";

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
    let signer_address = "kava1xy25akmlyu2qexzpy62h6c67lnf8tap74wsa2d";
    let message = "terra1jq3dg9ggzqngp3hhjzr8tug6h8q35e5p63y7ae";
    let signature = "4b26d9728140e5ce720b045e02b5cec7beca4d2efe511b30cd35ae6eada02cf9011a58600deda9d03c1dd1369df5e356a9c62b114042285d32ec984369aeb1cd";

    let deps = setup();
    let verified =
        verify_signature_cosmos(deps.as_ref(), message, signature, signer_address, "kava").unwrap();
    assert_eq!(verified, true);

    let signer_address = "kava1myp8uav2hazdw79ldvruc96wcdf74dekva9qqu";
    let message = "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9";
    let signature = "fca7363243143ad4b0350beb18bdf1c9bba6ebb5667892e652197e5f3bd0b4646b4ea3d6856bf35dcba919b6f96557541fe9ab78858d5790ac363b51ac6cec06";

    let deps = setup();
    let verified =
        verify_signature_cosmos(deps.as_ref(), message, signature, signer_address, "kava").unwrap();
    assert_eq!(verified, true);
}

#[test]
fn verify_wrong_cosmos_signer() {
    let signer_address = "kava190xtwywsgwu75xqz8sk8s3nj06s0n7tmur9sdq";
    let message = "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h8";
    let signature = "3a6d14fd6fabc5b57153f1aa425e9112cf11e5e1cb02a8ef933786a5f8dc76ef62cbbc6871335a7b1caabe0517971596e71b3bb9d38885e3771b81efc0055b15";

    let deps = setup();
    let verified =
        verify_signature_cosmos(deps.as_ref(), message, signature, signer_address, "terra")
            .unwrap();
    assert_eq!(verified, false);
}

#[test]
fn verify_wrong_cosmos_message() {
    let signer_address = "kava190xtwswsgwu75xqz8sk8s3nj06s0n7tmur9sdq";
    let message = "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9";
    let signature = "3a6d14fd6fabc5b57153f1aa425e9112cf11e5e1cb02a8ef933786a5f8dc76ef62cbbc6871335a7b1caabe0517971596e71b3bb9d38885e3771b81efc0055b15";

    let deps = setup();
    let verified =
        verify_signature_cosmos(deps.as_ref(), message, signature, signer_address, "terra")
            .unwrap();
    assert_eq!(verified, false);
}
