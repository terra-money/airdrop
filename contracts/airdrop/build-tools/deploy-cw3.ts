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
    mnemonic:
      "notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius",
  });

  // connect to localterra
  const terra = new LCDClient({
    URL: "http://localhost:1317",
    chainID: "localterra",
  });

  const wallet = terra.wallet(mk);

  const storeCode = new MsgStoreCode(
    wallet.key.accAddress,
    fs.readFileSync("./artifacts/cw3_fixed_multisig.wasm").toString("base64")
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
      voters: [
        {
          addr: "terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v",
          weight: 1,
        },
        {
          addr: "terra17lmam6zguazs5q5u6z5mmx76uj63gldnse2pdp",
          weight: 1,
        },
      ],
      threshold: {
        absolute_count: {
          weight: 1,
        },
      },
      max_voting_period: {
        time: 15552000,
      },
    },
    {}, // init coins
    "Instantiate terra"
  );

  const instantiateTx = await wallet.createAndSignTx({
    msgs: [instantiate],
  });
  const instantiateTxResult = await terra.tx.broadcast(instantiateTx);
  console.log(instantiateTxResult.raw_log);
  const CONTRACT_ADDRESS = JSON.parse(instantiateTxResult.raw_log)[0].events[0]
    .attributes[0].value;
  console.log("CONTRACT_ADDRESS " + CONTRACT_ADDRESS);
};

init();
