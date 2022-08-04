import "dotenv/config";

export const Config = {
  port: Number(process.env.PORT) || 3001,
  csvFolderPath: process.env.CSV_FOLDER_PATH || "./files/pisco-1",
  chainId: process.env.TERRA_CHAIN_ID || "pisco-1",
  lcdUrl: process.env.TERRA_LCD_URL || "https://pisco-lcd.terra.dev",
  gasPrice: process.env.TERRA_GAS_PRICE || "0.15uluna",
  mnemonic: process.env.TERRA_MNEMONIC || "",
  terraAirdropContract: process.env.TERRA_AIRDROP_CONTRACT || "",
  ethAirdropContract: process.env.ETH_AIRDROP_CONTRACT || "",
  avaxAirdropContract: process.env.AVAX_AIRDROP_CONTRACT || "",
  fantomAirdropContract: process.env.FANTOM_AIRDROP_CONTRACT || "",
  polygonAirdropContract: process.env.POLYGON_AIRDROP_CONTRACT || "",
  bscAirdropContract: process.env.BSC_AIRDROP_CONTRACT || "",
  cronosAirdropContract: process.env.CRONOS_AIRDROP_CONTRACT || "",
  kavaAirdropContract: process.env.KAVA_AIRDROP_CONTRACT || "",
  injectiveAirdropContract: process.env.INJECTIVE_AIRDROP_CONTRACT || "",
};

if (!Config.csvFolderPath) {
  throw Error(
    "Missing csv folder path. Did you forget to set CSV_FOLDER_PATH?"
  );
}

if (!Config.mnemonic) {
  throw Error(
    "Missing airdropper mnemonic. Did you forget to set TERRA_MNEMONIC?"
  );
}
