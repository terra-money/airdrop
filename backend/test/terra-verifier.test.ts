import { TerraVerifier } from "../src/helpers/verifiers/terra";

describe("Terra verifier", () => {
  test("should verify signature successfully", () => {
    const terraVerifier = new TerraVerifier();
    const isValid = terraVerifier.verify(
      "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpw",
      "hello world",
      "3ea138e59a229615997fb8ce7a51f40ed115edf7e217b1e79bc6a688bf2be8d32a87aceb9048689c39f722c1593e028210438928bf8a89375d7cef25df0154fb"
    );
    expect(isValid).toBe(true);
  });
  test("should invalidate signature successfully", () => {
    const terraVerifier = new TerraVerifier();
    const isValid = terraVerifier.verify(
      "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdpw",
      "hello worlds",
      "3ea138e59a229615997fb8ce7a51f40ed115edf7e217b1e79bc6a688bf2be8d32a87aceb9048689c39f722c1593e028210438928bf8a89375d7cef25df0154fb"
    );
    expect(isValid).toBe(false);
  });
  test("should invalidate signature successfully", () => {
    const terraVerifier = new TerraVerifier();
    const isValid = terraVerifier.verify(
      "terra1lxc6c5rnvcfx94x2ejarsr55cmcec6apklkdxw",
      "hello world",
      "3ea138e59a229615997fb8ce7a51f40ed115edf7e217b1e79bc6a688bf2be8d32a87aceb9048689c39f722c1593e028210438928bf8a89375d7cef25df0154fb"
    );
    expect(isValid).toBe(false);
  });
});
