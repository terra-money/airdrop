import {
  isTxError,
  LCDClient,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgStoreCode,
  Wallet,
} from "@terra-money/terra.js";
import * as fs from "fs";
import axios from "axios";

export async function uploadCode(
  lcd: LCDClient,
  wallet: Wallet,
  pathToWasm: string
): Promise<number> {
  const storeCode = new MsgStoreCode(
    wallet.key.accAddress,
    fs.readFileSync(pathToWasm).toString("base64")
  );
  const storeCodeTx = await wallet.createAndSignTx({
    msgs: [storeCode],
  });
  const storeCodeTxResult = await lcd.tx.broadcast(storeCodeTx);

  if (isTxError(storeCodeTxResult)) {
    throw new Error(
      `store code failed. code: ${storeCodeTxResult.code}, codespace: ${storeCodeTxResult.codespace}, raw_log: ${storeCodeTxResult.raw_log}`
    );
  }
  const code_id = storeCodeTxResult.logs[0].eventsByType.store_code.code_id;
  return Number(code_id[0]);
}

export async function instantiateContract(
  lcd: LCDClient,
  wallet: Wallet,
  codeId: number,
  initMsg: {
    denom: string;
    vestingPeriods: number[];
    startTime: number;
    endTime: number;
    chain: string;
    fee_refund?: string;
    prefix?: string;
  }
): Promise<string> {
  const instantiate = new MsgInstantiateContract(
    wallet.key.accAddress,
    wallet.key.accAddress,
    codeId,
    {
      admin: wallet.key.accAddress,
      denom: initMsg.denom,
      vesting_periods: initMsg.vestingPeriods,
      start_time: initMsg.startTime,
      claim_end_time: initMsg.endTime,
      prefix: initMsg.prefix,
      fee_refund: initMsg.fee_refund,
    },
    {},
    `airdrop-contract-${initMsg.chain}`
  );

  const instantiateTx = await wallet.createAndSignTx({
    msgs: [instantiate],
  });
  const instantiateTxResult = await lcd.tx.broadcast(instantiateTx);
  return JSON.parse(instantiateTxResult.raw_log)[0].events[0].attributes[0]
    .value;
}

export async function getMerkleRoot(
  airdropServiceUrl: string,
  denom: string,
  chain: string
): Promise<string> {
  const res = await axios.get(
    `${airdropServiceUrl}/merkle_root/${chain}/${denom}`
  );
  const { merkle_root: merkleRoot } = (await res.data) as any;
  return merkleRoot;
}

export async function updateMerkleRoot(
  lcd: LCDClient,
  wallet: Wallet,
  contract: string,
  merkleRoot: string
): Promise<void> {
  const execCreateMerkle = new MsgExecuteContract(
    wallet.key.accAddress,
    contract,
    {
      register_merkle_root: {
        merkle_root: merkleRoot,
      },
    }
  );

  const execCreateMerkleTx = await wallet.createAndSignTx({
    msgs: [execCreateMerkle],
  });
  await lcd.tx.broadcast(execCreateMerkleTx);
  return;
}
