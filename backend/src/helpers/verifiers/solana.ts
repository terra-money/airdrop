import { Verifier } from "./interface";
import { Verify } from "ed25519";
const Base58 = require("base-58");

export class SolanaVerifier implements Verifier {
  verify(address: string, message: string, signature: string): boolean {
    const sig = Buffer.from(signature, "hex");
    const msg = Buffer.from(message);
    const pubKey = Base58.decode(address);
    return Verify(msg, sig, pubKey);
  }
}
