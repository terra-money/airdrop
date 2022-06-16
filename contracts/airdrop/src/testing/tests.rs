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
            attr("amount0", "1000"),
            attr("amount1", "12000"),
            attr("amount2", "0"),
            attr("amount3", "100000"),
            attr("amount4", "0"),
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

    // // Claim next airdrop
    // let msg = ExecuteMsg::Claim {
    //     allocation: "".to_string(),
    //     proofs: vec![
    //         "ca2784085f944e5594bb751c3237d6162f7c2b24480b3a37e9803815b7a5ce42".to_string(),
    //         "5b07b5898fc9aa101f27344dab0737aede6c3aa7c9f10b4b1fda6d26eb669b0f".to_string(),
    //         "4847b2b9a6432a7bdf2bdafacbbeea3aab18c524024fc6e1bc655e04cbc171f3".to_string(),
    //         "cad1958c1a5c815f23450f1a2761a5a75ab2b894a258601bf93cd026469d42f2".to_string(),
    //     ],
    //     message: "".to_string(),
    //     signature: "".to_string(),
    //     fee_refund: None,
    // };

    // let info = mock_info("terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8", &[]);
    // let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    // assert_eq!(
    //     res.messages,
    //     vec![SubMsg::new(CosmosMsg::Wasm(WasmMsg::Execute {
    //         contract_addr: "mirror0000".to_string(),
    //         funds: vec![],
    //         msg: to_binary(&Cw20ExecuteMsg::Transfer {
    //             recipient: "terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8".to_string(),
    //             amount: Uint128::from(2000001u128),
    //         })
    //         .unwrap(),
    //     }))]
    // );

    // assert_eq!(
    //     res.attributes,
    //     vec![
    //         attr("action", "claim"),
    //         attr("address", "terra1qfqa2eu9wp272ha93lj4yhcenrc6ymng079nu8"),
    //         attr("amount", "2000001")
    //     ]
    // );
}
