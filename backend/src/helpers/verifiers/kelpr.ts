import { Verifier } from "./interface";
import crypto from "crypto";
import secp256k1 from "secp256k1";
import {
  Pubkey,
  pubkeyToAddress,
  rawSecp256k1PubkeyToRawAddress,
  makeSignDoc,
  serializeSignDoc,
} from "@cosmjs/amino";

import { sortedObject } from "../util";

export class KelprVerifier implements Verifier {
  public constructor(private prefix: string) {}
  verify(address: string, message: string, signature: string): boolean {
    // const doc = this.makeADR36AminoSignDoc(address, message);
    // const rawMessage = JSON.stringify(sortedObject(doc));
    const doc = this.signDoc(address, message);
    const hasher = crypto.createHash("sha256");
    const hash = hasher.update(doc).digest();
    const signatureBuffer = Buffer.from(signature, "hex");

    for (const recId of [0, 1]) {
      try {
        const k = secp256k1.ecdsaRecover(signatureBuffer, recId, hash);
        const recoveredAddress = pubkeyToAddress(
          {
            type: "tendermint/PubKeySecp256k1",
            value: Buffer.from(k).toString("base64"),
          },
          this.prefix
        );
        if (address === recoveredAddress) {
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  private signDoc(signer: string, data: string) {
    const encodedData = Buffer.from(data).toString("base64");
    const doc = makeSignDoc(
      [
        {
          type: "sign/MsgSignData",
          value: {
            signer,
            data: encodedData,
          },
        },
      ],
      {
        amount: [],
        gas: "0",
      },
      "",
      "",
      "0",
      "0"
    );
    return serializeSignDoc(doc);
  }
}
