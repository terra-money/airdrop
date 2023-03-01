import { Verifier } from "./interface";
import { SimplePublicKey } from "@terra-money/terra.js";
import crypto from "crypto";
import secp256k1 from "secp256k1";

export class TerraVerifier implements Verifier {
  verify(address: string, message: string, signature: string): boolean {
    const hasher = crypto.createHash("SHA256");
    const hash = hasher.update(message).digest();
    const signatureBuffer = Buffer.from(signature, "hex");
    const k = secp256k1.ecdsaRecover(signatureBuffer, 1, hash);
    const pubKey = new SimplePublicKey(Buffer.from(k).toString("base64"));
    return address === pubKey.address();
  }
}
