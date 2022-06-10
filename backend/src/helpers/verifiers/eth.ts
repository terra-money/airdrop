import { Verifier } from "./interface";
import Web3Account from "web3-eth-accounts";

export class EthVerifier implements Verifier {
  verify(address: string, message: string, signature: string): boolean {
    // Web3 Accounts type definitions are wrongly defined.
    const Account = Web3Account as any;
    const accounts = new Account("");
    const signingAddress = accounts.recover(message, signature);
    return address === signingAddress;
  }
}
