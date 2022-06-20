import {
  LCDClient,
  MsgStoreCode,
  MnemonicKey,
  isTxError,
  MsgInstantiateContract,
  MsgExecuteContract,
} from "@terra-money/terra.js";

const CONTRACT_ADDRESS =
  "terra1ghd753shjuwexxywmgs4xz7x2q732vcnkm6h2pyv9s6ah3hylvrqcmwekl";

async function main() {
  const mk = new MnemonicKey({
    mnemonic:
      "satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn",
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
            "kava1xy25akmlyu2qexzpy62h6c67lnf8tap74wsa2d,1000000000,1066666,1,100000,1",
          proofs: [
            "ab74b0f5500a142c455ca0c436dd88afb9b8775c6783952f34e224fcdc845aca",
            "572f3f165aab7510a61b51f9acdb21040a5f634b70024bd78d449ce286d30f95",
            "e974eb19d77890f9ca62738b10a974ef079c12cd067be59c9396a654b9fd3231",
            "9296eba955d79c16fe46ca81a72f6475ef7855f890bc2f7612d3b2cc2b8cc789",
          ],
          message: "terra1jq3dg9ggzqngp3hhjzr8tug6h8q35e5p63y7ae",
          signature:
            "4b26d9728140e5ce720b045e02b5cec7beca4d2efe511b30cd35ae6eada02cf9011a58600deda9d03c1dd1369df5e356a9c62b114042285d32ec984369aeb1cd",
        },
      }),
    ],
  });
  const execClaimTxResult = await terra.tx.broadcast(execClaimTx);
  console.log(execClaimTxResult);
}

main();
