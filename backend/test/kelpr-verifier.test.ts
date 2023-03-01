import { KelprVerifier } from "../src/helpers/verifiers/kelpr";

describe("Kelpr verifier", () => {
  describe("terra", () => {
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
  describe("kava", () => {
    test("should verify signature successfully", () => {
      const verifier = new KelprVerifier("kava");
      const isValid = verifier.verify(
        "kava190xtwywsgwu75xqz8sk8s3nj06s0n7tmur9sdq",
        "terra1muqcftc62pe4w0ep8yd76m83zcrdpfluq4xqzv",
        "4522165a566407797150a1edf8be22d2a6da54b14bd11ed88374ac319c8176da2cecd059a89c67139cff222ae1785cedab250f22abab652b21a402b797538160"
      );
      expect(isValid).toBe(true);
    });
    test("should verify signature successfully", () => {
      const verifier = new KelprVerifier("kava");
      const isValid = verifier.verify(
        "kava190xtwywsgwu75xqz8sk8s3nj06s0n7tmur9sdq",
        "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9",
        "3a6d14fd6fabc5b57153f1aa425e9112cf11e5e1cb02a8ef933786a5f8dc76ef62cbbc6871335a7b1caabe0517971596e71b3bb9d38885e3771b81efc0055b15"
      );
      expect(isValid).toBe(true);
    });
    test("should verify signature successfully", () => {
      const verifier = new KelprVerifier("kava");
      const isValid = verifier.verify(
        "kava1myp8uav2hazdw79ldvruc96wcdf74dekva9qqu",
        "terra1jh4th9u5zk4wa38wgtmxjmpsvwnsjevjqaz8h9",
        "fca7363243143ad4b0350beb18bdf1c9bba6ebb5667892e652197e5f3bd0b4646b4ea3d6856bf35dcba919b6f96557541fe9ab78858d5790ac363b51ac6cec06"
      );
      expect(isValid).toBe(true);
    });
    test("should verify signature successfully", () => {
      const verifier = new KelprVerifier("kava");
      const isValid = verifier.verify(
        "kava190xtwywsgwu75xqz8sk8s3nj06s0n7tmur9sdq",
        "terra12m8njvjxhm53h0fjgwm7454ywypknm9ztxmf9t",
        "48652d699fa6449120aa84d1a75ebdcc7019b58e8f8d4f3cf71767b7c40995334cdfee8fdde0d69596bdcf96b92282c16ecb545f40241757c1a5fb10d81135e8"
      );
      expect(isValid).toBe(true);
    });
    test("should verify signature successfully", () => {
      const verifier = new KelprVerifier("kava");
      const isValid = verifier.verify(
        "kava1myp8uav2hazdw79ldvruc96wcdf74dekva9qqu",
        "terra1muqcftc62pe4w0ep8yd76m83zcrdpfluq4xqzv",
        "79acf81fe7ebe324bb52aa273110dab87c1b5d3a22c03b62b6927b05dee22c215a67be80a174c5e8f7284ff3bc244b8e5565446d9000f222895f7e27155a4587"
      );
      expect(isValid).toBe(true);
    });
  });
  describe("inj", () => {
    test("should verify signature successfully", () => {
      const verifier = new KelprVerifier("inj");
      const isValid = verifier.verify(
        "inj1mlv7s4rpyzakjq29mf78hnjczdez0s45fc8esh",
        "terra1muqcftc62pe4w0ep8yd76m83zcrdpfluq4xqzv",
        "465460a40fbdc4ce1ddb06a55a398ffc9b056f602b8fb547b4ae4d29e499014a7b488b2c6d807b21321912accfe40070428519bfcc7523b344225cf32f744097"
      );
      expect(isValid).toBe(true);
    });
    test("should verify signature successfully", () => {
      const verifier = new KelprVerifier("inj");
      const isValid = verifier.verify(
        "inj10736pcy2lyzdv3r88n5gzj9k5k5w9t4ameey5j",
        "terra12m8njvjxhm53h0fjgwm7454ywypknm9ztxmf9t",
        "ebde9a7bfb26bff989d97f50abfe86bd488aa497f9f2309596d4a28ba8bf5c0625d302c980dbfbab44c49327ddaf4303d1e443fa724add5de9d28d10c84a7028"
      );
      expect(isValid).toBe(true);
    });
  });
});
