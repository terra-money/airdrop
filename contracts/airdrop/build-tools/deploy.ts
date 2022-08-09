import {
  LCDClient,
  MsgStoreCode,
  MnemonicKey,
  isTxError,
  MsgInstantiateContract,
  MsgExecuteContract,
} from "@terra-money/terra.js";
import * as fs from "fs";

const init = async () => {
  const mk = new MnemonicKey({
    mnemonic: "_",
  });

  // connect to localterra
  const terra = new LCDClient({
    URL: "http://localhost:1317",
    chainID: "localterra",
  });

  const wallet = terra.wallet(mk);

  const storeCode = new MsgStoreCode(
    wallet.key.accAddress,
    fs.readFileSync("./artifacts/airdrop-cosmos.wasm").toString("base64")
  );
  const storeCodeTx = await wallet.createAndSignTx({
    msgs: [storeCode],
  });
  const storeCodeTxResult = await terra.tx.broadcast(storeCodeTx);

  if (isTxError(storeCodeTxResult)) {
    throw new Error(
      `store code failed. code: ${storeCodeTxResult.code}, codespace: ${storeCodeTxResult.codespace}, raw_log: ${storeCodeTxResult.raw_log}`
    );
  }

  const {
    store_code: { code_id },
  } = storeCodeTxResult.logs[0].eventsByType;

  const instantiate = new MsgInstantiateContract(
    wallet.key.accAddress,
    wallet.key.accAddress,
    +code_id[0],
    {
      admin: wallet.key.accAddress,
      denom: "uluna",
      vesting_periods: [15552000, 15552000, 46656000, 15552000, 62208000],
      start_time: 1669269600, // genesis + 6 months
      prefix: "kava",
      claim_end_time: 1655870000,
    },
    { uluna: 1000000000000 }, // init coins
    "Instantiate terra"
  );

  const instantiateTx = await wallet.createAndSignTx({
    msgs: [instantiate],
  });
  const instantiateTxResult = await terra.tx.broadcast(instantiateTx);
  const CONTRACT_ADDRESS = JSON.parse(instantiateTxResult.raw_log)[0].events[2]
    .attributes[0].value;
  console.log(instantiateTxResult);
  const execCreateMerkle = new MsgExecuteContract(
    wallet.key.accAddress,
    CONTRACT_ADDRESS,
    {
      register_merkle_root: {
        merkle_root:
          "b92bf21a99dee7f8152603f42079606b4e528f18c7d57d48fb5f50bf3dc70159",
      },
    }
  );

  const execCreateMerkleTx = await wallet.createAndSignTx({
    msgs: [execCreateMerkle],
  });
  const execCreateMerkleResult = await terra.tx.broadcast(execCreateMerkleTx);

  console.log(execCreateMerkleResult);
  console.log("CONTRACT_ADDRESS " + CONTRACT_ADDRESS);

  // End airdrop event
  //   const execEndTx = await wallet.createAndSignTx({
  //     msgs: [
  //       new MsgExecuteContract(wallet.key.accAddress, CONTRACT_ADDRESS, {
  //         end: {},
  //       }),
  //     ],
  //   });
  //   const execEndResult = await terra.tx.broadcast(execEndTx);
  //   console.log(execEndResult);
};
init();
