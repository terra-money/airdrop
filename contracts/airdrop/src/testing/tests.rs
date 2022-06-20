use crate::contract::{execute, instantiate, query};
use crate::msg::{
    ConfigResponse, ExecuteMsg, InstantiateMsg, IsClaimedResponse, MerkleRootResponse, QueryMsg,
};
use crate::vesting::{Coin as VestingCoin, MsgCreatePeriodicVestingAccount, Period};
use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
use cosmwasm_std::{
    attr, coins, from_binary, to_binary, BankMsg, Binary, CosmosMsg, ReplyOn, StdError, SubMsg,
    Uint128, WasmMsg,
};
use cw20::Cw20ExecuteMsg;
use protobuf::Message;

#[test]
fn proper_instantiate() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [15552000i64, 46656000i64, 15552000i64, 62208000i64],
        start_time: None,
        prefix: None,
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
fn update_config() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [15552000i64, 46656000i64, 15552000i64, 62208000i64],
        start_time: None,
        prefix: None,
    };

    let info = mock_info("addr0000", &[]);
    let _res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();

    // update admin
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::UpdateConfig {
        admin: Some("admin0001".to_string()),
    };

    let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(0, res.messages.len());

    // it worked, let's query the state
    let res = query(deps.as_ref(), mock_env(), QueryMsg::Config {}).unwrap();
    let config: ConfigResponse = from_binary(&res).unwrap();
    assert_eq!("admin0001", config.admin.as_str());

    // Unauthorized err
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::UpdateConfig { admin: None };

    let res = execute(deps.as_mut(), mock_env(), info, msg);
    match res {
        Err(StdError::GenericErr { msg, .. }) => assert_eq!(msg, "unauthorized"),
        _ => panic!("Must return unauthorized error"),
    }
}

#[test]
fn register_merkle_root() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [15552000i64, 46656000i64, 15552000i64, 62208000i64],
        start_time: None,
        prefix: None,
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

#[test]
fn update_merkle_root() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [15552000i64, 46656000i64, 15552000i64, 62208000i64],
        start_time: None,
        prefix: None,
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

    // register new merkle root
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::UpdateMerkleRoot {
        merkle_root: "12345678".to_string(),
    };

    let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(
        res.attributes,
        vec![
            attr("action", "update_merkle_root"),
            attr("merkle_root", "12345678")
        ]
    );

    let res = query(deps.as_ref(), mock_env(), QueryMsg::MerkleRoot {}).unwrap();
    let merkle_root: MerkleRootResponse = from_binary(&res).unwrap();
    assert_eq!("12345678".to_string(), merkle_root.merkle_root);
}

#[cfg(feature = "eth")]
#[test]
fn claim_eth() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [15552000i64, 46656000i64, 15552000i64, 62208000i64],
        start_time: Some(1655360550i64),
        prefix: None,
    };

    let info = mock_info("addr0000", &[]);
    let env = mock_env();
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();

    // Register merkle roots
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::RegisterMerkleRoot {
        merkle_root: "f63b24076d5619a1e65e5190e05ccc8c4acbef54e12c567d0fd4c2a774c0dd6c".to_string(),
    };
    let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

    let msg = ExecuteMsg::Claim {
        allocation: "0x78864CE3E53A439ae0A8e15622aA0d21675ad4Cd,1000,12000,0,100000,0".to_string(),
        proofs: vec![
            "2a8465686efe8d016d7bbb617134848fa544ced1f93c1c355ca6d92c16257e14".to_string(),
            "662cb31a348d45aa0bfe1b3e8a9a203014f6836481840a325dd4a5c5eaa74e63".to_string(),
            "ef1f1b2665bed3c525e7d2707d1d72ef7a43a4a93cd823a51339ea7d7cd6b955".to_string(),
        ],
        message: "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpw".to_string(),
        signature: "93a37e1a568cdcba6454e24cc8f31a57e8d947b147adf4c16ff67c4c12112c0700adf75abbfa00f5bfbf8d5057cdaf0b6ca11572c4d3a1064b5e967a5b39e53f1c".to_string(),
        fee_refund: None,
    };

    let info = mock_info("terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8", &[]);
    let res = execute(deps.as_mut(), mock_env(), info.clone(), msg.clone()).unwrap();

    let mut vesting_msg = MsgCreatePeriodicVestingAccount::new();
    vesting_msg.from_address = env.contract.address.to_string();
    vesting_msg.to_address = "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpw".to_string();
    vesting_msg.start_time = 1655360550i64;
    vesting_msg.vesting_periods = [
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
            to_address: String::from("terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpw"),
            amount: coins(1000u128, "uluna"),
        }))
    );

    assert_eq!(
        res.attributes,
        vec![
            attr("action", "claim"),
            attr("address", "0x78864CE3E53A439ae0A8e15622aA0d21675ad4Cd"),
            attr(
                "new_address",
                "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpw"
            ),
            attr("vested", "1000"),
            attr("vesting", "112000"),
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

#[cfg(feature = "eth")]
#[test]
fn claim_eth_no_vesting() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF".to_string(),
        vesting_periods: [15552000i64, 46656000i64, 15552000i64, 62208000i64],
        start_time: Some(1655360550i64),
        prefix: None,
    };

    let info = mock_info("addr0000", &[]);
    let env = mock_env();
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();

    // Register merkle roots
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::RegisterMerkleRoot {
        merkle_root: "ff7522234e071161ef65158356df50c3f7edb5037988d764c4e29171bec31d06".to_string(),
    };
    let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

    let msg = ExecuteMsg::Claim {
        allocation: "0x9d216a50b77b0db00299242c82c0de739f83cb63,1000000,0,0,0,0".to_string(),
        proofs: vec![
            "6321ab2115b5c82a643177ba6842d20dc04eeeea2afa8a9d9b4362ddf812bc96".to_string(),
            "c14a538e401fe91bf74fbe858c4cd838d92c9d5f1b4580f4adbbfc2732547aa6".to_string(),
            "ef1f1b2665bed3c525e7d2707d1d72ef7a43a4a93cd823a51339ea7d7cd6b955".to_string(),
        ],
        message: "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9".to_string(),
        signature: "6bdac3a40cd00166f9948c56b9c72c4c5c8e0fe0dca4852a7325d227d96121f1442aa8a84907adc7020e9fda7551b4f7de84a42a32f2ae57be0d8896964a2fe61b".to_string(),
        fee_refund: None,
    };

    let info = mock_info("terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8", &[]);
    let res = execute(deps.as_mut(), mock_env(), info.clone(), msg.clone()).unwrap();

    assert_eq!(
        res.messages[0],
        SubMsg::new(CosmosMsg::Bank(BankMsg::Send {
            to_address: String::from("terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9"),
            amount: coins(
                1000000u128,
                "ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF"
            ),
        }))
    );

    assert_eq!(
        res.attributes,
        vec![
            attr("action", "claim"),
            attr("address", "0x9d216a50b77b0db00299242c82c0de739f83cb63"),
            attr(
                "new_address",
                "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9"
            ),
            attr("vested", "1000000"),
            attr("vesting", "0"),
        ]
    );

    assert!(
        from_binary::<IsClaimedResponse>(
            &query(
                deps.as_ref(),
                mock_env(),
                QueryMsg::IsClaimed {
                    address: "0x9d216a50b77b0db00299242c82c0de739f83cb63".to_string(),
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
fn claim_cosmos() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [15552000i64, 46656000i64, 15552000i64, 62208000i64],
        start_time: Some(1655360550i64),
        prefix: Some("kava".to_string()),
    };

    let info = mock_info("addr0000", &[]);
    let env = mock_env();
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();

    // Register merkle roots
    let info = mock_info("admin0000", &[]);
    let msg = ExecuteMsg::RegisterMerkleRoot {
        merkle_root: "61b88379b661dfad12d6d3fc3764cf189d655d34f6a7ade3de3d253b1ab60656".to_string(),
    };
    let _res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

    let msg = ExecuteMsg::Claim {
        allocation: "kava190xtwywsgwu75xqz8sk8s3nj06s0n7tmur9sdq,100,10000,0,100000,0".to_string(),
        proofs: vec![
            "a6c6bec719c58c60478fd2a4c05cb298dd72b354e57acccc7010a96116a29520".to_string(),
            "572f3f165aab7510a61b51f9acdb21040a5f634b70024bd78d449ce286d30f95".to_string(),
            "e974eb19d77890f9ca62738b10a974ef079c12cd067be59c9396a654b9fd3231".to_string(),
            "66de85f84f70faa792aef4c7033ba9bd0cb23fbe7f9cdb046b073131f6510944".to_string(),
        ],
        message: "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9".to_string(),
        signature: "3a6d14fd6fabc5b57153f1aa425e9112cf11e5e1cb02a8ef933786a5f8dc76ef62cbbc6871335a7b1caabe0517971596e71b3bb9d38885e3771b81efc0055b15".to_string(),
        fee_refund: None,
    };

    let info = mock_info("terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8", &[]);
    let res = execute(deps.as_mut(), mock_env(), info.clone(), msg.clone()).unwrap();

    let mut vesting_msg = MsgCreatePeriodicVestingAccount::new();
    vesting_msg.from_address = env.contract.address.to_string();
    vesting_msg.to_address = "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9".to_string();
    vesting_msg.start_time = 1655360550i64;
    vesting_msg.vesting_periods = [
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
        SubMsg::new(CosmosMsg::Stargate {
            type_url: "/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount".to_string(),
            value: Binary(bytes),
        })
    );
    assert_eq!(
        res.messages[1],
        SubMsg::new(CosmosMsg::Bank(BankMsg::Send {
            to_address: String::from("terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9"),
            amount: coins(100u128, "uluna"),
        }))
    );

    assert_eq!(
        res.attributes,
        vec![
            attr("action", "claim"),
            attr("address", "kava190xtwywsgwu75xqz8sk8s3nj06s0n7tmur9sdq"),
            attr(
                "new_address",
                "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9"
            ),
            attr("vested", "100"),
            attr("vesting", "110000"),
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
        vesting_periods: [15552000i64, 46656000i64, 15552000i64, 62208000i64],
        start_time: Some(1655360550i64),
        prefix: None,
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
        fee_refund: None,
    };

    let info = mock_info("terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8", &[]);
    let res = execute(deps.as_mut(), mock_env(), info.clone(), msg.clone()).unwrap();

    let mut vesting_msg = MsgCreatePeriodicVestingAccount::new();
    vesting_msg.from_address = env.contract.address.to_string();
    vesting_msg.to_address = "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9".to_string();
    vesting_msg.start_time = 1655360550i64;
    vesting_msg.vesting_periods = [
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
        SubMsg::new(CosmosMsg::Stargate {
            type_url: "/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount".to_string(),
            value: Binary(bytes),
        })
    );
    assert_eq!(
        res.messages[1],
        SubMsg::new(CosmosMsg::Bank(BankMsg::Send {
            to_address: String::from("terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9"),
            amount: coins(100u128, "uluna"),
        }))
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
            attr("vesting", "110000"),
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
fn claim_terra_unauthorized() {
    let mut deps = mock_dependencies();

    let msg = InstantiateMsg {
        admin: "admin0000".to_string(),
        denom: "uluna".to_string(),
        vesting_periods: [15552000i64, 46656000i64, 15552000i64, 62208000i64],
        start_time: Some(1655360550i64),
        prefix: None,
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
        fee_refund: None,
    };

    let info = mock_info("terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtaps8", &[]);
    let res = execute(deps.as_mut(), mock_env(), info.clone(), msg.clone());
    match res {
        Err(StdError::GenericErr { msg, .. }) => assert_eq!(msg, "signature verification error"),
        _ => panic!("DO NOT ENTER HERE"),
    }
}
