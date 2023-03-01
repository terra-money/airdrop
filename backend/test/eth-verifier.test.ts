import { EthVerifier } from "../src/helpers/verifiers/eth";

describe("Ethereum verifier", () => {
  // Signed with metamask
  test("should verify signature successfully", () => {
    const terraVerifier = new EthVerifier();
    const isValid = terraVerifier.verify(
      "0x78864CE3E53A439ae0A8e15622aA0d21675ad4Cd",
      "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpw",
      "0x93a37e1a568cdcba6454e24cc8f31a57e8d947b147adf4c16ff67c4c12112c0700adf75abbfa00f5bfbf8d5057cdaf0b6ca11572c4d3a1064b5e967a5b39e53f1c"
    );
    expect(isValid).toBe(true);
  });
  test("should invalidate signature successfully", () => {
    const terraVerifier = new EthVerifier();
    const isValid = terraVerifier.verify(
      "0x78864CE3E53A439ae0A8e15622aA0d21675ad4CC",
      "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpw",
      "0x93a37e1a568cdcba6454e24cc8f31a57e8d947b147adf4c16ff67c4c12112c0700adf75abbfa00f5bfbf8d5057cdaf0b6ca11572c4d3a1064b5e967a5b39e53f1c"
    );
    expect(isValid).toBe(false);
  });
  test("should invalidate signature successfully", () => {
    const terraVerifier = new EthVerifier();
    const isValid = terraVerifier.verify(
      "0x78864CE3E53A439ae0A8e15622aA0d21675ad4Cd",
      "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpx",
      "0x93a37e1a568cdcba6454e24cc8f31a57e8d947b147adf4c16ff67c4c12112c0700adf75abbfa00f5bfbf8d5057cdaf0b6ca11572c4d3a1064b5e967a5b39e53f1c"
    );
    expect(isValid).toBe(false);
  });
});
