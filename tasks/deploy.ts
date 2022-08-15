import {
  LCDClient,
  MsgStoreCode,
  MnemonicKey,
  isTxError,
  MsgInstantiateContract,
  MsgExecuteContract,
} from "@terra-money/terra.js";
import {
  getMerkleRoot,
  uploadCode,
  instantiateContract,
  updateMerkleRoot,
} from "./routines";
import * as fs from "fs";

const AIRDROP_SERVICE_URL = "https://pisco-airdrop.terra.dev";
const LCD_ENDPOINT = "https://pisco-lcd.terra.dev";
const CHAIN_ID = "pisco-1";
const OUTPUT_FILE = `${CHAIN_ID}.json`;
const TERRA_CONTRACT_PATH = "./contracts/airdrop/artifacts/airdrop-terra.wasm";
const ETH_CONTRACT_PATH = "./contracts/airdrop/artifacts/airdrop-eth.wasm";
const COSMOS_CONTRACT_PATH =
  "./contracts/airdrop/artifacts/airdrop-cosmos.wasm";
const CONTRACTS: { [key: string]: string } = {
  eth: ETH_CONTRACT_PATH,
  bsc: ETH_CONTRACT_PATH,
  polygon: ETH_CONTRACT_PATH,
  fantom: ETH_CONTRACT_PATH,
  cronos: ETH_CONTRACT_PATH,
  avax: ETH_CONTRACT_PATH,
  injective: ETH_CONTRACT_PATH,
  terraclassic: TERRA_CONTRACT_PATH,
  kava: COSMOS_CONTRACT_PATH,
};
const CHAINS_WITH_PREFIX = ["kava"];
const CHAINS_WITHOUT_FEE_REFUND = ["terraclassic"];
const WALLET_MNEMONIC = "";

const DENOM = "uluna";
const VESTING_START_TIME = 0;
const CLAIM_END_TIME = 0;
const VESTING_PERIODS = [0, 15552000, 46656000, 15552000, 62208000];
const FEE_REFUND = "50000";

main();

export async function main(): Promise<void> {
  const mk = new MnemonicKey({
    mnemonic: WALLET_MNEMONIC,
  });

  const terra = new LCDClient({
    URL: LCD_ENDPOINT,
    chainID: CHAIN_ID,
  });
  const wallet = terra.wallet(mk);
  const state = getState();

  for (const chain of Object.keys(CONTRACTS)) {
    console.log(`Deploying airdrop contract for ${chain}`);
    const path = CONTRACTS[chain];

    if (!state.code_ids[CONTRACTS[chain]]) {
      console.log(`Uploading contract ${path} for the first time`);
      const codeId = await uploadCode(terra, wallet, path);
      console.log(`Code ID for ${path}: ${codeId}`);
      state.code_ids[path] = codeId;
      updateState(state);
    }

    let fee_refund: string | undefined = FEE_REFUND;
    if (CHAINS_WITHOUT_FEE_REFUND.includes(chain)) {
      fee_refund = undefined;
    }

    let prefix: string | undefined;
    if (CHAINS_WITH_PREFIX.includes(chain)) {
      prefix = chain;
    }

    if (!state.contracts[chain]) {
      console.log(`Instantiating ${chain} contract...`);
      const contractAddr = await instantiateContract(
        terra,
        wallet,
        state.code_ids[path],
        {
          denom: DENOM,
          vestingPeriods: VESTING_PERIODS,
          startTime: VESTING_START_TIME,
          endTime: CLAIM_END_TIME,
          fee_refund,
          prefix,
          chain,
        }
      );
      state.contracts[chain] = {
        denom: DENOM,
        contract_addr: contractAddr,
        chain: chain,
      };
      updateState(state);
    }

    if (state.contracts[chain] && !state.contracts[chain].merkle_root) {
      const merkleRoot = await getMerkleRoot(AIRDROP_SERVICE_URL, DENOM, chain);
      await updateMerkleRoot(
        terra,
        wallet,
        state.contracts[chain].contract_addr,
        merkleRoot
      );
      state.contracts[chain].merkle_root = merkleRoot;
      updateState(state);
    }
    console.log(
      `Contract for ${chain}:${DENOM} successfully created with addr: ${state.contracts[chain].contract_addr}, merkle root: ${state.contracts[chain].merkle_root}`
    );
  }
}

interface State {
  code_ids: {
    [key: string]: number;
  };
  contracts: {
    [key: string]: {
      chain: string;
      denom: string;
      contract_addr: string;
      merkle_root?: string;
    };
  };
}

function updateState(state: State) {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(state, null, 4));
}

function getState(): State {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return {
      code_ids: {},
      contracts: {},
    };
  }
  return JSON.parse(fs.readFileSync(OUTPUT_FILE).toString()) as State;
}
