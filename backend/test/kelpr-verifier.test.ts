import { KelprVerifier } from "../src/helpers/verifiers/kelpr";

describe("Kelpr verifier", () => {
  test("should verify signature successfully", () => {
    const verifier = new KelprVerifier("terra");
    const isValid = verifier.verify(
      "terra14j45vucl8ehyua0k9kwkzylrdkzuk6d49xled5",
      "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9",
      "9df700d4090fcdf1ba70ea8960105689c187b393ea4673c5abfaa884c850294a6b61e491cd17b50f365baff9e060be57221a44d03d53e9fcfc43b40b276d6503"
    );
    expect(isValid).toBe(true);
  });
  test("should invalidate signature successfully", () => {
    const verifier = new KelprVerifier("terra");
    const isValid = verifier.verify(
      "terra14j45vucl8ehyua0k9kwkzylrdkzuk6d49xled4",
      "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9",
      "9df700d4090fcdf1ba70ea8960105689c187b393ea4673c5abfaa884c850294a6b61e491cd17b50f365baff9e060be57221a44d03d53e9fcfc43b40b276d6503"
    );
    expect(isValid).toBe(false);
  });
  test("should invalidate signature successfully", () => {
    const verifier = new KelprVerifier("terra");
    const isValid = verifier.verify(
      "terra14j45vucl8ehyua0k9kwkzylrdkzuk6d49xled5",
      "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h8",
      "9df700d4090fcdf1ba70ea8960105689c187b393ea4673c5abfaa884c850294a6b61e491cd17b50f365baff9e060be57221a44d03d53e9fcfc43b40b276d6503"
    );
    expect(isValid).toBe(false);
  });
});
