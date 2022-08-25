import { AirdropService } from "./airdrop.service";
import {
  MsgExecuteContract,
  LCDClient,
  Wallet,
  MnemonicKey,
  isTxError,
} from "@terra-money/terra.js";
import { Config } from "../config";
import Axios from "axios";

interface ClaimExecuteMsg {
  allocation: string;
  proofs: string[];
  message: string;
  signature: string;
  fee_refund?: string;
}

export class ClaimService {
  private lcd: LCDClient;
  private wallet: Wallet;
  private contracts: Record<string, string>;
  public constructor(private airdropService: AirdropService) {
    if (Config.lcdUrl.indexOf("http") != 0) {
      Config.lcdUrl = "http://" + Config.lcdUrl;
    }
    this.lcd = new LCDClient({
      URL: Config.lcdUrl,
      chainID: Config.chainId,
      gasPrices: Config.gasPrice,
    });
    this.wallet = this.lcd.wallet(
      new MnemonicKey({ mnemonic: Config.mnemonic })
    );
    this.contracts = {
      "terraclassic.uluna": Config.terraAirdropContract,
      "terraclassic.usdc": Config.terraAirdropContract,
      "eth.uluna": Config.ethAirdropContract,
      "bsc.uluna": Config.bscAirdropContract,
      "kava.uluna": Config.kavaAirdropContract,
      "avax.uluna": Config.avaxAirdropContract,
      "fantom.uluna": Config.fantomAirdropContract,
      "polygon.uluna": Config.polygonAirdropContract,
      "injective.uluna": Config.injectiveAirdropContract,
      "cronos.uluna": Config.cronosAirdropContract,
    };
  }

  public async checkIsClaimed(
    chain: string,
    denom: string,
    address: string
  ): Promise<[boolean | null, Error | null]> {
    const chainDenom = `${chain}.${denom}`;
    const contractAddress = this.contracts[chainDenom];
    if (!contractAddress) {
      return [null, Error("Airdrop contract not found for " + chain)];
    }
    const query = {
      is_claimed: {
        address: address,
      },
    };
    try {
      const claimResponse = await this.lcd.wasm.contractQuery<{
        is_claimed: boolean;
      }>(contractAddress, query);
      return [claimResponse.is_claimed, null];
    } catch (e) {
      console.error(e);
      return [null, new Error("Error querying airdrop contract")];
    }
  }

  public async claim(
    chain: string,
    denom: string,
    address: string,
    newTerraAddress: string,
    signature: string
  ): Promise<[string | null, Error | null]> {
    signature = signature.replace(/^0x/, "");
    const chainDenom = `${chain}.${denom}`;
    let [airdrop, err] = this.airdropService.getAirdrop(chain, denom);
    if (err || !airdrop) {
      return [null, err];
    }

    let allocation;
    [allocation, err] = airdrop.getAllocation(address);
    if (err || !allocation) {
      return [null, err];
    }

    let allocString: string;
    let proofs: string[];
    [allocString, proofs, err] = airdrop.getMerkleProofByAddress(address);
    if (err || !allocation) {
      return [null, err];
    }

    const claimMsg: ClaimExecuteMsg = {
      allocation: allocString,
      proofs: proofs,
      message: newTerraAddress,
      signature: signature,
    };

    try {
      const tx = await this.wallet.createAndSignTx({
        msgs: [
          new MsgExecuteContract(
            this.wallet.key.accAddress,
            this.contracts[chainDenom],
            {
              claim: claimMsg,
            }
          ),
        ],
      });
      const txReceipt = await this.lcd.tx.broadcast(tx);
      if (isTxError(txReceipt)) {
        return [null, Error(txReceipt.raw_log)];
      }
      return [txReceipt.txhash, null];
    } catch (e) {
      if (Axios.isAxiosError(e)) {
        const message =
          e.response?.data.message ??
          JSON.stringify(e.response?.data, null, " ") ??
          "Unknown error";
        return [null, Error(message)];
      }
      if (e instanceof Error) {
        return [null, e];
      }
      return [null, Error(String(e))];
    }
  }
}
