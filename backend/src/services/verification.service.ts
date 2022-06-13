import { EthVerifier } from "../helpers/verifiers/eth";
import { Verifier } from "../helpers/verifiers/interface";
import { TerraVerifier } from "../helpers/verifiers/terra";

export class VerificationService {
  private verifiers: Map<string, Verifier>;
  constructor() {
    this.verifiers = new Map();
    // Add list of verifiers
    this.verifiers.set("eth", new EthVerifier());
    this.verifiers.set("terraclassic", new TerraVerifier());
  }

  public verify(
    chain: string,
    address: string,
    message: string,
    signature: string
  ): [boolean | null, Error | null] {
    try {
      const verifier = this.verifiers.get(chain);
      if (!verifier) {
        return [null, Error(`Verifier for ${chain} not found`)];
      }
      return [verifier.verify(address, message, signature), null];
    } catch (e) {
      if (e instanceof Error) {
        return [null, e];
      }
      return [null, Error(String(e))];
    }
  }
}
