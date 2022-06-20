import {
  LCDClient,
  MsgStoreCode,
  MnemonicKey,
  isTxError,
  MsgInstantiateContract,
  MsgExecuteContract,
} from "@terra-money/terra.js";

const CONTRACT_ADDRESS =
  "terra14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9ssrc8au";

async function main() {
  const mk = new MnemonicKey({
    mnemonic: "_",
  });
  const terra = new LCDClient({
    URL: "http://localhost:1317",
    chainID: "localterra",
  });
  const wallet = terra.wallet(mk);
  const execClaimTx = await wallet.createAndSignTx({
    msgs: [
      new MsgExecuteContract(wallet.key.accAddress, CONTRACT_ADDRESS, {
        claim: {
          allocation:
            "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8,100,10000,0,100000,0",
          proofs: [
            "9efa86bf87944e9023a32741eca1b37b59446e7fd7b7b9e6e9f7415807d51615",
            "fa758dfa5394b2c425c17805ba2665597f3d765e12943d0ef8601c08524f3222",
            "f9db7a772327af0a99846a61afcb5978fb96a87f0668eab3d2447077fc3a0ada",
            "7fa36eaa4d530755aa99ac4501e5c5be7a2ad2c5e93dc6e2516edba74a5ef512",
          ],
          message: "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9",
          signature: "",
        },
      }),
    ],
  });
  const execClaimTxResult = await terra.tx.broadcast(execClaimTx);
  console.log(execClaimTxResult);
}

main();
