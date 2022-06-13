import { AirdropService } from "./airdrop.service";
import {
  MsgExecuteContract,
  LCDClient,
  Wallet,
  MnemonicKey,
} from "@terra-money/terra.js";
import { Config } from "../config";

interface ClaimExecuteMsg {
  claim_amount: string;
  merkle_proofs: string[];
  new_terra_address: string;
  signature: string;
  address: string;
  fee_paid?: string;
}

export class ClaimService {
  private lcd: LCDClient;
  private wallet: Wallet;
  public constructor(private aidropService: AirdropService) {
    this.lcd = new LCDClient({
      URL: Config.lcdUrl,
      chainID: Config.chainId,
      gasPrices: Config.gasPrice,
    });
    this.wallet = this.lcd.wallet(
      new MnemonicKey({ mnemonic: Config.mnemonic })
    );
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
            claim_amount: allocString,
            merkle_proofs: proofs,
            new_terra_address: newTerraAddress,
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
