import { Verifier } from "../helpers/verifiers/interface";

export class VerificationService {
  private verifiers: Map<string, Verifier>;
  constructor() {
    this.verifiers = new Map();
    // Add list of verifiers
  }

  public verify(
    chain: string,
    address: string,
    message: string,
    signature: string
  ): [boolean | null, Error | null] {
    return [false, null];
  }
}
