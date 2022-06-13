import { SolanaVerifier } from "../src/helpers/verifiers/solana";

describe("Solana verifier", () => {
  // Signed with metamask
  test("should verify signature successfully", () => {
    const terraVerifier = new SolanaVerifier();
    const isValid = terraVerifier.verify(
      "A6KdXfxGYKbZdoftawVr6pEWXMpJ6eyQvVjg3VgrLHeZ",
      "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9",
      "3576ba6ac025dab237921571c9e9614d0533b244e84f4847fbc36b0f3441e00681c03b0b884eb45dddcd3fc4a2e4ffe976cb5bc7357bdf07a7d6854f5d70a209"
    );
    expect(isValid).toBe(true);
  });
  test("should invalidate signature successfully", () => {
    const terraVerifier = new SolanaVerifier();
    const isValid = terraVerifier.verify(
      "A6KdXfxGYKbZdoftawVr6pEWXMpJ6eyQvVjg3VgrLHeZ",
      "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h8",
      "3576ba6ac025dab237921571c9e9614d0533b244e84f4847fbc36b0f3441e00681c03b0b884eb45dddcd3fc4a2e4ffe976cb5bc7357bdf07a7d6854f5d70a209"
    );
    expect(isValid).toBe(false);
  });
  test("should invalidate signature successfully", () => {
    const terraVerifier = new SolanaVerifier();
    const isValid = terraVerifier.verify(
      "A6KdXfxGYKbZdoftawVr6pEWXMpJ6eyQvVjg3VgrLHeZ",
      "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9",
      "3576ba6ac025dab237921571c9e9614d0533b244e8444847fbc36b0f3441e00681c03b0b884eb45dddcd3fc4a2e4ffe976cb5bc7357bdf07a7d6854f5d70a209"
    );
    expect(isValid).toBe(false);
  });
});
