use crate::contract::{execute, instantiate, query};
use crate::distribution::{Coin as DistributionCoin, MsgFundCommunityPool};
use crate::msg::{
    ConfigResponse, ExecuteMsg, InstantiateMsg, IsClaimedResponse, MerkleRootResponse, QueryMsg,
};
use crate::vesting::{Coin as VestingCoin, MsgCreatePeriodicVestingAccount, Period};
use cosmwasm_std::testing::{
    mock_dependencies, mock_dependencies_with_balance, mock_env, mock_info,
};
use cosmwasm_std::{
    attr, coins, from_binary, BankMsg, Binary, Coin, CosmosMsg, StdError, SubMsg, Timestamp,
    Uint128,
};
use protobuf::Message;

#[test]
fn proper_instantiate() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: None,
        prefix: None,
        claim_end_time: 1955870000u64,
        fee_refund: None,
    };

    let info = mock_info("addr0000", &[]);

    // we can just call .unwrap() to assert this was a success
    let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

    // it worked, let's query the state
    let res = query(deps.as_ref(), mock_env(), QueryMsg::Config {}).unwrap();
    let config: ConfigResponse = from_binary(&res).unwrap();
    assert_eq!("admin0000", config.admin.as_str());
    assert_eq!("uluna", config.denom.as_str());
}

#[test]
fn invalid_instantiation() {
    let mut deps = mock_dependencies();
    let info = mock_info("addr0000", &[]);

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            -15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: None,
        prefix: None,
        claim_end_time: 1955870000u64,
        fee_refund: None,
    };

    assert_eq!(
        instantiate(deps.as_mut(), mock_env(), info.clone(), msg),
        Err(StdError::generic_err("periods must be greater than 0"))
    );

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: Some(-15552000i64),
        prefix: None,
        claim_end_time: 1955870000u64,
        fee_refund: None,
    };

    assert_eq!(
        instantiate(deps.as_mut(), mock_env(), info.clone(), msg),
        Err(StdError::generic_err("start_time must be greater than 0"))
    );
}

#[test]
fn update_config() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: None,
        prefix: None,
        claim_end_time: 1955870000u64,
        fee_refund: None,
    };

    let info = mock_info("addr0000", &[]);
    let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

    // update admin and fee
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::UpdateConfig {
        admin: Some("admin0001".to_string()),
        fee_refund: Some(Uint128::new(10000)),
        enabled: None,
    };

    let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(0, res.messages.len());

    // it worked, let's query the state
    let res = query(deps.as_ref(), mock_env(), QueryMsg::Config {}).unwrap();
    let config: ConfigResponse = from_binary(&res).unwrap();
    assert_eq!(
        config,
        ConfigResponse {
            admin: "admin0001".to_string(),
            denom: "uluna".to_string(),
            fee: Some(Uint128::new(10000)),
            enabled: true
        },
    );

    // Unauthorized err
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::UpdateConfig {
        admin: None,
        fee_refund: None,
        enabled: None,
    };

    let res = execute(deps.as_mut(), mock_env(), info, msg);
    match res {
        Err(StdError::GenericErr { msg, .. }) => assert_eq!(msg, "unauthorized"),
        _ => panic!("Must return unauthorized error"),
    }
}

#[test]
fn update_invalid_config() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: None,
        prefix: None,
        claim_end_time: 1955870000u64,
        fee_refund: None,
    };

    let info = mock_info("addr0000", &[]);
    let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::UpdateConfig {
        admin: Some("".to_string()),
        fee_refund: Some(Uint128::new(10000)),
        enabled: None,
    };

    assert_eq!(
        execute(deps.as_mut(), mock_env(), info, msg),
        Err(StdError::generic_err(
            "Invalid input: human address too short"
        ))
    );
}

#[test]
fn disable_airdrop_contract() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: None,
        prefix: None,
        claim_end_time: 1955870000u64,
        fee_refund: None,
    };

    let info = mock_info("addr0000", &[]);
    let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

    // update admin and fee
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::UpdateConfig {
        admin: Some("admin0001".to_string()),
        fee_refund: None,
        enabled: Some(false),
    };

    let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(0, res.messages.len());

    // it worked, let's query the state
    let res = query(deps.as_ref(), mock_env(), QueryMsg::Config {}).unwrap();
    let config: ConfigResponse = from_binary(&res).unwrap();
    assert_eq!(
        config,
        ConfigResponse {
            admin: "admin0001".to_string(),
            denom: "uluna".to_string(),
            fee: None,
            enabled: false
        },
    );
    let msg = ExecuteMsg::Claim {
        allocation: "0x78864ce3e53a439ae0a8e15622aa0d21675ad4cd,0,1000,12000,0,100000,0".to_string(),
        proofs: vec![
            "cbcae9860f77d0d6a3ba13892c8de9daf7a5505878fd35a4f82ce161bdbf4ae8".to_string(),
            "47e6a6ada4d2a53b6b78835a73d194758694968e9f17be7260acf3f12dee1d42".to_string(),
            "e677d3688a7cc4aaedc4c49aa510f8a1b01553f02b4524bbf79bc3cef6ac47ea".to_string(),
        ],
        message: "terra1gtf24wp9fvpupaykl6sskkc6mw8c5l4wny5fhk".to_string(),
        signature: "cac2f150692e11a108ff05a75f364d245cf7e322cdc847555cdada5b3ba7dfc7200f37110b48752e6813b2f02361e26edf3e129ba7930ab60b996daa6f7dd9b11c".to_string(),
    };

    let info = mock_info("terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8", &[]);
    let res = execute(deps.as_mut(), mock_env(), info.clone(), msg.clone());

    assert_eq!(res, Err(StdError::generic_err("airdrop event is disabled")));
}

#[test]
fn register_merkle_root() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: None,
        prefix: None,
        claim_end_time: 1955870000u64,
        fee_refund: None,
    };

    let info = mock_info("addr0000", &[]);
    let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

    // register new merkle root
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::RegisterMerkleRoot {
        merkle_root: "634de21cde1044f41d90373733b0f0fb1c1c71f9652b905cdf159e73c4cf0d37".to_string(),
    };

    let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(
        res.attributes,
        vec![
            attr("action", "register_merkle_root"),
            attr(
                "merkle_root",
                "634de21cde1044f41d90373733b0f0fb1c1c71f9652b905cdf159e73c4cf0d37"
            )
        ]
    );

    let res = query(deps.as_ref(), mock_env(), QueryMsg::MerkleRoot {}).unwrap();
    let merkle_root: MerkleRootResponse = from_binary(&res).unwrap();
    assert_eq!(
        "634de21cde1044f41d90373733b0f0fb1c1c71f9652b905cdf159e73c4cf0d37".to_string(),
        merkle_root.merkle_root
    );
}

#[cfg(feature = "eth")]
#[test]
fn claim_eth() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: None,
        prefix: None,
        claim_end_time: 1955870000u64,
        fee_refund: Some(Uint128::new(100)),
    };

    let info = mock_info("addr0000", &[]);
    let env = mock_env();
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();

    // Register merkle roots
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::RegisterMerkleRoot {
        merkle_root: "aef38d9db282ffdcf070ea04c771442f64e6a93d93aa9dd0f2a25a52ea57e48d".to_string(),
    };
    let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

    let msg = ExecuteMsg::Claim {
        allocation: "0x78864ce3e53a439ae0a8e15622aa0d21675ad4cd,0,1000,12000,0,100000,0".to_string(),
        proofs: vec![
            "cbcae9860f77d0d6a3ba13892c8de9daf7a5505878fd35a4f82ce161bdbf4ae8".to_string(),
            "47e6a6ada4d2a53b6b78835a73d194758694968e9f17be7260acf3f12dee1d42".to_string(),
            "e677d3688a7cc4aaedc4c49aa510f8a1b01553f02b4524bbf79bc3cef6ac47ea".to_string(),
        ],
        message: "terra1gtf24wp9fvpupaykl6sskkc6mw8c5l4wny5fhk".to_string(),
        signature: "cac2f150692e11a108ff05a75f364d245cf7e322cdc847555cdada5b3ba7dfc7200f37110b48752e6813b2f02361e26edf3e129ba7930ab60b996daa6f7dd9b11c".to_string(),
    };

    let info = mock_info("terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8", &[]);
    let res = execute(deps.as_mut(), mock_env(), info.clone(), msg.clone()).unwrap();

    let mut vesting_msg = MsgCreatePeriodicVestingAccount::new();
    vesting_msg.from_address = env.contract.address.to_string();
    vesting_msg.to_address = "terra1gtf24wp9fvpupaykl6sskkc6mw8c5l4wny5fhk".to_string();
    vesting_msg.start_time = env.block.time.seconds() as i64;
    vesting_msg.vesting_periods = [
        (15552000i64, "900".to_string()),
        (15552000i64, "12000".to_string()),
        (46656000i64, "0".to_string()),
        (15552000i64, "100000".to_string()),
        (62208000i64, "0".to_string()),
    ]
    .iter()
    .map(|v| {
        let mut coin = VestingCoin::new();
        coin.denom = "uluna".to_string();
        coin.amount = v.1.clone();

        let mut period = Period::new();
        period.length = v.0;
        period.amount = vec![coin];

        period
    })
    .collect::<Vec<Period>>();

    let bytes = Message::write_to_bytes(&vesting_msg).unwrap();

    assert_eq!(
        res.messages[0],
        SubMsg::new(CosmosMsg::Stargate {
            type_url: "/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount".to_string(),
            value: Binary(bytes),
        })
    );
    assert_eq!(
        res.messages[1],
        SubMsg::new(CosmosMsg::Bank(BankMsg::Send {
            to_address: String::from("terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8"),
            amount: coins(100u128, "uluna"),
        }))
    );

    assert_eq!(
        res.attributes,
        vec![
            attr("action", "claim"),
            attr("address", "0x78864ce3e53a439ae0a8e15622aa0d21675ad4cd"),
            attr(
                "new_address",
                "terra1gtf24wp9fvpupaykl6sskkc6mw8c5l4wny5fhk"
            ),
            attr("vested", "0"),
            attr("vesting", "112900"),
        ]
    );

    assert!(
        from_binary::<IsClaimedResponse>(
            &query(
                deps.as_ref(),
                mock_env(),
                QueryMsg::IsClaimed {
                    address: "0x78864CE3E53A439ae0A8e15622aA0d21675ad4Cd".to_string(),
                }
            )
            .unwrap()
        )
        .unwrap()
        .is_claimed
    );

    let res = execute(deps.as_mut(), mock_env(), info, msg);
    match res {
        Err(StdError::GenericErr { msg, .. }) => assert_eq!(msg, "already claimed"),
        _ => panic!("DO NOT ENTER HERE"),
    }
}

#[cfg(feature = "cosmos")]
#[test]
fn is_claimed_cosmos() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: Some(1655360550i64),
        prefix: Some("inj".to_string()),
        claim_end_time: 1955870000u64,
        fee_refund: Some(Uint128::new(1)),
    };
    let info = mock_info("addr0000", &[]);
    let env = mock_env();
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();

    let query_result = query(
        deps.as_ref(),
        mock_env(),
        QueryMsg::IsClaimed {
            address: "inj1mlv7s4rpyzakjq29mf78hnjczdez0s45fc8esh".to_string(),
        },
    )
    .unwrap();
    assert_eq!(
        from_binary::<IsClaimedResponse>(&query_result).unwrap(),
        IsClaimedResponse { is_claimed: false }
    );
}

#[cfg(feature = "cosmos")]
#[test]
fn claim_cosmos() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: Some(1655360550i64),
        prefix: Some("kava".to_string()),
        claim_end_time: 1955870000u64,
        fee_refund: Some(Uint128::new(1)),
    };

    let info = mock_info("addr0000", &[]);
    let env = mock_env();
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();

    // Register merkle roots
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::RegisterMerkleRoot {
        merkle_root: "72e0f34627f8520beab9a6e4ffbd793c03315a068f99800636a140c74b65bf9c".to_string(),
    };
    let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

    let msg = ExecuteMsg::Claim {
        allocation: "kava190xtwywsgwu75xqz8sk8s3nj06s0n7tmur9sdq,100,100,10000,0,100000,0".to_string(),
        proofs: vec![
            "5bfe0f948bf6d24bf680dfcf66f9ced40ffa64e3ab32a44c0a7dcb90aebd8fb9".to_string(),
            "4e8d4562357996064b42ee7f71ac465867099b4a31489aa45831f9fe42c0604e".to_string(),
            "d9cf56bc6d08e38b1b22c6d738176d58c757b9213c8b6bc5a5eba3041f347705".to_string(),
            "d6bc7ed9c68fc90098c71cb5545825f9ddb965dfc6cd925f7dc9ea470208e0eb".to_string(),
        ],
        message: "terra1gtf24wp9fvpupaykl6sskkc6mw8c5l4wny5fhk".to_string(),
        signature: "283de2b632fcad3f5eb10e0dea5c324cc7094cd0bc33a1b9a46021fb29b3812f5e1d4617c82cd53a6b5309a08349da34b7e24747b0b1f0bb48b668f815b46ec1".to_string(),
    };

    let info = mock_info("terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8", &[]);
    let res = execute(deps.as_mut(), mock_env(), info.clone(), msg.clone()).unwrap();

    let mut vesting_msg = MsgCreatePeriodicVestingAccount::new();
    vesting_msg.from_address = env.contract.address.to_string();
    vesting_msg.to_address = "terra1gtf24wp9fvpupaykl6sskkc6mw8c5l4wny5fhk".to_string();
    vesting_msg.start_time = 1655360550i64;
    vesting_msg.vesting_periods = [
        (15552000i64, "100".to_string()),
        (15552000i64, "10000".to_string()),
        (46656000i64, "0".to_string()),
        (15552000i64, "100000".to_string()),
        (62208000i64, "0".to_string()),
    ]
    .iter()
    .map(|v| {
        let mut coin = VestingCoin::new();
        coin.denom = "uluna".to_string();
        coin.amount = v.1.clone();

        let mut period = Period::new();
        period.length = v.0;
        period.amount = vec![coin];

        period
    })
    .collect::<Vec<Period>>();

    let bytes = Message::write_to_bytes(&vesting_msg).unwrap();

    assert_eq!(
        res.messages[0],
        SubMsg::new(CosmosMsg::Bank(BankMsg::Send {
            to_address: String::from("terra1gtf24wp9fvpupaykl6sskkc6mw8c5l4wny5fhk"),
            amount: coins(99u128, "uluna"),
        }))
    );
    assert_eq!(
        res.messages[1],
        SubMsg::new(CosmosMsg::Stargate {
            type_url: "/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount".to_string(),
            value: Binary(bytes),
        })
    );
    assert_eq!(
        res.messages[2],
        SubMsg::new(CosmosMsg::Bank(BankMsg::Send {
            to_address: String::from("terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8"),
            amount: coins(1, "uluna"),
        }))
    );

    assert_eq!(
        res.attributes,
        vec![
            attr("action", "claim"),
            attr("address", "kava190xtwywsgwu75xqz8sk8s3nj06s0n7tmur9sdq"),
            attr(
                "new_address",
                "terra1gtf24wp9fvpupaykl6sskkc6mw8c5l4wny5fhk"
            ),
            attr("vested", "99"),
            attr("vesting", "110100"),
        ]
    );

    assert!(
        from_binary::<IsClaimedResponse>(
            &query(
                deps.as_ref(),
                mock_env(),
                QueryMsg::IsClaimed {
                    address: "kava190xtwywsgwu75xqz8sk8s3nj06s0n7tmur9sdq".to_string(),
                }
            )
            .unwrap()
        )
        .unwrap()
        .is_claimed
    );

    let res = execute(deps.as_mut(), mock_env(), info, msg);
    match res {
        Err(StdError::GenericErr { msg, .. }) => assert_eq!(msg, "already claimed"),
        _ => panic!("DO NOT ENTER HERE"),
    }
}

#[cfg(feature = "terra")]
#[test]
fn claim_terra() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: Some(1655360550i64),
        prefix: None,
        claim_end_time: 1955870000u64,
        fee_refund: None,
    };

    let info = mock_info("addr0000", &[]);
    let env = mock_env();
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();

    // Register merkle roots
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::RegisterMerkleRoot {
        merkle_root: "beb27623e893c39077484c0ca17e67f432cfe1fe1d7ab8b3d6d5f6f675519de8".to_string(),
    };
    let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

    let msg = ExecuteMsg::Claim {
        allocation: "terra1zdpgj8am5nqqvht927k3etljyl6a52kwqup0je,0,999,1066666,1,100000,1"
            .to_string(),
        proofs: vec![
            "5df8b9241c4261fb1819caf3e8d67f0e5732bc4a14295ba1311cff8efaa6b13d".to_string(),
            "9d8fb82c5e9aa4c20bb7d6c3286a3d34c48910ce3270f929449df7324c02ecad".to_string(),
            "a08d96bbc63eb5c478c795b07d878685708221d47e49d6665c1d406b3683c232".to_string(),
            "fafb068ae402d1ab5cf138c27101ff9a3aa89f23cc0a3191b637fcddc0b1cbca".to_string(),
        ],
        message: "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9".to_string(),
        signature: "".to_string(),
    };

    let info = mock_info("terra1zdpgj8am5nqqvht927k3etljyl6a52kwqup0je", &[]);
    let res = execute(deps.as_mut(), mock_env(), info.clone(), msg.clone()).unwrap();

    let mut vesting_msg = MsgCreatePeriodicVestingAccount::new();
    vesting_msg.from_address = env.contract.address.to_string();
    vesting_msg.to_address = "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9".to_string();
    vesting_msg.start_time = 1655360550i64;
    vesting_msg.vesting_periods = [
        (15552000i64, "999".to_string()),
        (15552000i64, "1066666".to_string()),
        (46656000i64, "1".to_string()),
        (15552000i64, "100000".to_string()),
        (62208000i64, "1".to_string()),
    ]
    .iter()
    .map(|v| {
        let mut coin = VestingCoin::new();
        coin.denom = "uluna".to_string();
        coin.amount = v.1.clone();

        let mut period = Period::new();
        period.length = v.0;
        period.amount = vec![coin];

        period
    })
    .collect::<Vec<Period>>();

    let bytes = Message::write_to_bytes(&vesting_msg).unwrap();

    assert_eq!(
        res.messages[0],
        SubMsg::new(CosmosMsg::Stargate {
            type_url: "/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount".to_string(),
            value: Binary(bytes),
        })
    );

    assert_eq!(
        res.attributes,
        vec![
            attr("action", "claim"),
            attr("address", "terra1zdpgj8am5nqqvht927k3etljyl6a52kwqup0je"),
            attr(
                "new_address",
                "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9"
            ),
            attr("vested", "0"),
            attr("vesting", "1167667"),
        ]
    );

    assert!(
        from_binary::<IsClaimedResponse>(
            &query(
                deps.as_ref(),
                mock_env(),
                QueryMsg::IsClaimed {
                    address: "terra1zdpgj8am5nqqvht927k3etljyl6a52kwqup0je".to_string(),
                }
            )
            .unwrap()
        )
        .unwrap()
        .is_claimed
    );

    let res = execute(deps.as_mut(), mock_env(), info, msg);
    match res {
        Err(StdError::GenericErr { msg, .. }) => assert_eq!(msg, "already claimed"),
        _ => panic!("DO NOT ENTER HERE"),
    }
}

#[cfg(feature = "terra")]
#[test]
fn claim_terra_with_vested() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: None,
        prefix: None,
        claim_end_time: 1955870000u64,
        fee_refund: None,
    };

    let info = mock_info("addr0000", &[]);
    let env = mock_env();
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();

    // Register merkle roots
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::RegisterMerkleRoot {
        merkle_root: "0c38144e58971ea7e80324ca7a3ad757f6f3fc1630ee31f72ce39640508c4f53".to_string(),
    };
    let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

    let msg = ExecuteMsg::Claim {
        allocation: "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8,100,100,10000,0,100000,0"
            .to_string(),
        proofs: vec![
            "5df8b9241c4261fb1819caf3e8d67f0e5732bc4a14295ba1311cff8efaa6b13d".to_string(),
            "9d8fb82c5e9aa4c20bb7d6c3286a3d34c48910ce3270f929449df7324c02ecad".to_string(),
            "a08d96bbc63eb5c478c795b07d878685708221d47e49d6665c1d406b3683c232".to_string(),
            "6187d817ede01c90d6ea57b3df2e916e71d7d562cdac94944b10a15f06da4ed5".to_string(),
        ],
        message: "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9".to_string(),
        signature: "".to_string(),
    };

    let info = mock_info("terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8", &[]);
    let res = execute(deps.as_mut(), mock_env(), info.clone(), msg.clone()).unwrap();

    let mut vesting_msg = MsgCreatePeriodicVestingAccount::new();
    vesting_msg.from_address = env.contract.address.to_string();
    vesting_msg.to_address = "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9".to_string();
    vesting_msg.start_time = env.block.time.seconds() as i64;
    vesting_msg.vesting_periods = [
        (15552000i64, "100".to_string()),
        (15552000i64, "10000".to_string()),
        (46656000i64, "0".to_string()),
        (15552000i64, "100000".to_string()),
        (62208000i64, "0".to_string()),
    ]
    .iter()
    .map(|v| {
        let mut coin = VestingCoin::new();
        coin.denom = "uluna".to_string();
        coin.amount = v.1.clone();

        let mut period = Period::new();
        period.length = v.0;
        period.amount = vec![coin];

        period
    })
    .collect::<Vec<Period>>();

    let bytes = Message::write_to_bytes(&vesting_msg).unwrap();

    assert_eq!(
        res.messages[0],
        SubMsg::new(CosmosMsg::Bank(BankMsg::Send {
            to_address: "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9".to_string(),
            amount: coins(100, "uluna")
        }))
    );
    assert_eq!(
        res.messages[1],
        SubMsg::new(CosmosMsg::Stargate {
            type_url: "/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount".to_string(),
            value: Binary(bytes),
        })
    );

    assert_eq!(
        res.attributes,
        vec![
            attr("action", "claim"),
            attr("address", "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8"),
            attr(
                "new_address",
                "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9"
            ),
            attr("vested", "100"),
            attr("vesting", "110100"),
        ]
    );

    assert!(
        from_binary::<IsClaimedResponse>(
            &query(
                deps.as_ref(),
                mock_env(),
                QueryMsg::IsClaimed {
                    address: "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8".to_string(),
                }
            )
            .unwrap()
        )
        .unwrap()
        .is_claimed
    );

    let res = execute(deps.as_mut(), mock_env(), info, msg);
    match res {
        Err(StdError::GenericErr { msg, .. }) => assert_eq!(msg, "already claimed"),
        _ => panic!("DO NOT ENTER HERE"),
    }
}

#[cfg(feature = "terra")]
#[test]
fn claim_terra_fail() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: Some(1655360550i64),
        prefix: None,
        claim_end_time: 1955870000u64,
        fee_refund: None,
    };

    let info = mock_info("addr0000", &[]);
    let env = mock_env();
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();

    // Register merkle roots
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::RegisterMerkleRoot {
        merkle_root: "41be415f546ffcd24173c6c435bd6f37942b654365454b6d554a32b71c7d3eb3".to_string(),
    };
    let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

    let msg = ExecuteMsg::Claim {
        allocation: "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8,100,10000,0,100000,0".to_string(),
        proofs: vec![
            "9efa86bf87944e9023a32741eca1b37b59446e7fd7b7b9e6e9f7415807d51615".to_string(),
            "fa758dfa5394b2c425c17805ba2665597f3d765e12943d0ef8601c08524f3222".to_string(),
            "f9db7a772327af0a99846a61afcb5978fb96a87f0668eab3d2447077fc3a0ada".to_string(),
            "7fa36eaa4d530755aa99ac4501e5c5be7a2ad2c5e93dc6e2516edba74a5ef512".to_string(),
        ],
        message: "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9".to_string(),
        signature: "".to_string(),
    };

    let info = mock_info("terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtaps8", &[]);
    let res = execute(deps.as_mut(), mock_env(), info.clone(), msg.clone());
    match res {
        Err(StdError::GenericErr { msg, .. }) => assert_eq!(msg, "signature verification error. Expected: terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtaps8 Received: terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8"),
        _ => panic!("DO NOT ENTER HERE"),
    }

    let msg = ExecuteMsg::Claim {
        allocation: "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8,100,10000,0,100000,0".to_string(),
        proofs: vec![
            "9efa86bf87944e9023a32741eca1b37b59446e7fd7b7b9e6e9f7415807d51615".to_string(),
            "fa758dfa5394b2c425c17805ba2665597f3d765e12943d0ef8601c08524f3222".to_string(),
            "f9db7a772327af0a99846a61afcb5978fb96a87f0668eab3d2447077fc3a0ada".to_string(),
            "7fa36eaa4d530755aa99ac4501e5c5be7a2ad2c5e93dc6e2516edba74a5ef512".to_string(),
        ],
        message: "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9".to_string(),
        signature: "".to_string(),
    };

    let mut env = mock_env();
    env.block.time = Timestamp::from_seconds(1965870000u64);
    let info = mock_info("terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8", &[]);
    let res = execute(deps.as_mut(), env, info, msg.clone());
    match res {
        Err(StdError::GenericErr { msg, .. }) => assert_eq!(msg, "airdrop event ended"),
        _ => panic!("DO NOT ENTER HERE"),
    }
}

#[test]
fn end_airdrop() {
    let coins = [Coin::new(100000000u128, "uluna")];
    let mut deps = mock_dependencies_with_balance(&coins);

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [
            15552000i64,
            15552000i64,
            46656000i64,
            15552000i64,
            62208000i64,
        ],
        start_time: None,
        prefix: None,
        claim_end_time: 1655870000u64,
        fee_refund: None,
    };

    let info = mock_info("addr0000", &[]);
    let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

    // end airdrop from non-admin
    let info = mock_info("admin0001", &[]);
    let msg = ExecuteMsg::End {};
    let mut env = mock_env();
    env.block.time = Timestamp::from_seconds(1655860000u64);

    let res = execute(deps.as_mut(), env, info, msg);
    match res {
        Err(StdError::GenericErr { msg, .. }) => assert_eq!(msg, "unauthorized"),
        _ => panic!("Must return unauthorized error"),
    };

    // end airdrop before end time
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::End {};
    let mut env = mock_env();
    env.block.time = Timestamp::from_seconds(1655860000u64);

    let res = execute(deps.as_mut(), env, info, msg);
    match res {
        Err(StdError::GenericErr { msg, .. }) => assert_eq!(msg, "airdrop event not ended"),
        _ => panic!("Must return unauthorized error"),
    };

    // end airdrop after end time
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::End {};
    let mut env = mock_env();
    let contract_addr = env.clone().contract.address;
    env.block.time = Timestamp::from_seconds(1655900000u64);

    let res = execute(deps.as_mut(), env, info, msg).unwrap();

    let mut msg = MsgFundCommunityPool::new();
    let mut coin = DistributionCoin::new();
    coin.amount = "100000000".to_string();
    coin.denom = "uluna".to_string();
    msg.amount = vec![coin];
    msg.depositor = contract_addr.to_string();
    let bytes = Message::write_to_bytes(&msg).unwrap();

    assert_eq!(
        res.messages[0],
        SubMsg::new(CosmosMsg::Stargate {
            type_url: "/cosmos.distribution.v1beta1.MsgFundCommunityPool".to_string(),
            value: Binary(bytes),
        })
    );
}
