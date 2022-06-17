import { AirdropService } from "./airdrop.service";
import {
  MsgExecuteContract,
  LCDClient,
  Wallet,
  MnemonicKey,
} from "@terra-money/terra.js";
import { Config } from "../config";

interface ClaimExecuteMsg {
  allocation: string;
  proofs: string[];
  message: string;
  signature: string;
  address: string;
  fee_refund?: string;
}

export class ClaimService {
  private lcd: LCDClient;
  private wallet: Wallet;
  private contracts: Record<string, string>;
  public constructor(private aidropService: AirdropService) {
    this.lcd = new LCDClient({
      URL: Config.lcdUrl,
      chainID: Config.chainId,
      gasPrices: Config.gasPrice,
    });
    this.wallet = this.lcd.wallet(
      new MnemonicKey({ mnemonic: Config.mnemonic })
    );
    this.contracts = {
      terraclassic: Config.terraAirdropContract,
      eth: Config.ethAirdropContract,
      bsc: Config.bscAirdropContract,
      kava: Config.kavaAirdropContract,
    };
  }

  public async checkIsClaimed(
    chain: string,
    address: string
  ): Promise<[boolean | null, Error | null]> {
    const contractAddress = this.contracts[chain];
    if (!contractAddress) {
      return [null, Error("Airdrop contract not found for " + chain)];
    }
    const query = {
      is_claimed: { address },
    };
    const claimResponse = await this.lcd.wasm.contractQuery<{
      is_claimed: boolean;
    }>(contractAddress, query);
    return [claimResponse.is_claimed, null];
  }

  public async claim(
    chain: string,
    address: string,
    newTerraAddress: string,
    signature: string
  ): Promise<[string | null, Error | null]> {
    let [airdrop, err] = this.aidropService.getAirdrop(chain);
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

    const tx = await this.wallet.createAndSignTx({
      msgs: [
        {
          contract: "",
          execute_msg: {
            address: address,
            allocation: allocString,
            proofs: proofs,
            message: newTerraAddress,
            signature: signature,
          } as ClaimExecuteMsg,
        } as MsgExecuteContract,
      ],
    });
    try {
      const txReceipt = await this.lcd.tx.broadcastSync(tx);
      return [txReceipt.txhash, Error("Not implemented yet")];
    } catch (e) {
      if (e instanceof Error) {
        return [null, e];
      }
      return [null, Error(String(e))];
    }
  }
}
