import {
  LCDClient,
  MsgStoreCode,
  MnemonicKey,
  isTxError,
  MsgInstantiateContract,
  MsgExecuteContract,
  Wallet,
  WasmMsg,
} from "@terra-money/terra.js";

// Instructions on how to test claiming using a CW3 multisig
// 1. Create a CW3 multisig
// 2. Add the CW3 multisig to the claim allocation csv in airdrop backend
// 3. Generate the new merkle_root and proofs
// 4. Deploy a new airdrop contract with the new merkle root
// 5. Update the new contract addresses and proofs in this test case

const AIRDROP_CONTRACT =
  "terra17p9rzwnnfxcjp32un9ug7yhhzgtkhvl9jfksztgw5uh69wac2pgsydrqk7";
const CW3_CONTRACT =
  "terra1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrquka9l6";

async function main() {
  const terra = new LCDClient({
    URL: "http://localhost:1317",
    chainID: "localterra",
  });
  const wallet1 = terra.wallet(
    new MnemonicKey({
      mnemonic: "_",
    })
  );
  const wallet2 = terra.wallet(
    new MnemonicKey({
      mnemonic: "_",
    })
  );

  const freshWallet = terra.wallet(new MnemonicKey());
  console.log("FRESH WALLET: ", freshWallet.key.accAddress);

  const proposal = [
    new MsgExecuteContract(wallet1.key.accAddress, CW3_CONTRACT, {
      propose: {
        title: "claim",
        description: "claim",
        msgs: [
          {
            wasm: {
              execute: {
                funds: [],
                contract_addr: AIRDROP_CONTRACT,
                msg: Buffer.from(
                  JSON.stringify({
                    claim: {
                      allocation:
                        "terra1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrquka9l6,1000000000,1066666,1,100000,1",
                      proofs: [
                        "9efa86bf87944e9023a32741eca1b37b59446e7fd7b7b9e6e9f7415807d51615",
                        "fa758dfa5394b2c425c17805ba2665597f3d765e12943d0ef8601c08524f3222",
                        "f9db7a772327af0a99846a61afcb5978fb96a87f0668eab3d2447077fc3a0ada",
                        "5b1ee67b79b9e06e684579dc768e2f6e57764c8a89ef3cc6c453f14157016f02",
                      ],
                      message: "terra1r9udn4q5wr5ks7l73v2737rrye6zrngtrfv06g",
                      signature: "",
                    },
                  })
                ).toString("base64"),
              },
            },
          },
        ],
        latest: null,
      },
    }),
  ];
  const propTx = await wallet1.createAndSignTx({
    msgs: proposal,
  });
  const propProposalResult = await terra.tx.broadcast(propTx);
  const proposalId = JSON.parse(propProposalResult.raw_log)[0].events[2]
    .attributes[3].value;
  console.log("PROPOSAL_ID:", proposalId);

  const execTx = await wallet1.createAndSignTx({
    msgs: [
      new MsgExecuteContract(wallet1.key.accAddress, CW3_CONTRACT, {
        execute: {
          proposal_id: +proposalId,
        },
      }),
    ],
  });
  const execProposalResult = await terra.tx.broadcast(execTx);
  console.log(execProposalResult);
}

main();
