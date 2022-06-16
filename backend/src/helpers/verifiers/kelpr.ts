import { Verifier } from "./interface";
import crypto from "crypto";
import secp256k1 from "secp256k1";
import {
  Pubkey,
  pubkeyToAddress,
  rawSecp256k1PubkeyToRawAddress,
} from "@cosmjs/amino";
import { sortedObject } from "../util";

export class KelprVerifier implements Verifier {
  public constructor(private prefix: string) {}
  verify(address: string, message: string, signature: string): boolean {
    const doc = this.makeADR36AminoSignDoc(address, message);
    const rawMessage = JSON.stringify(sortedObject(doc));
    console.log(rawMessage);
    const hasher = crypto.createHash("SHA256");
    const hash = hasher.update(rawMessage).digest();
    const signatureBuffer = Buffer.from(signature, "hex");
    const k = secp256k1.ecdsaRecover(signatureBuffer, 1, hash);
    const recoveredAddress = pubkeyToAddress(
      {
        type: "tendermint/PubKeySecp256k1",
        value: Buffer.from(k).toString("base64"),
      },
      this.prefix
    );
    return address === recoveredAddress;
  }

  private makeADR36AminoSignDoc(signer: string, data: string | Uint8Array) {
    if (typeof data === "string") {
      data = Buffer.from(data, "utf-8").toString("base64");
    } else {
      data = Buffer.from(data).toString("base64");
    }

    return {
      chain_id: "",
      account_number: "0",
      sequence: "0",
      fee: {
        gas: "0",
        amount: [],
      },
      msgs: [
        {
          type: "sign/MsgSignData",
          value: {
            signer,
            data,
          },
        },
      ],
      memo: "",
    };
  }
}
