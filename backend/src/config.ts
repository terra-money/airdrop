import "dotenv/config";

export const Config = {
  port: Number(process.env.APP_PORT) || 3000,
  csvFolderPath: process.env.CSV_FOLDER_PATH || "",
  chainId: process.env.TERRA_CHAIN_ID || "pisco-1",
  lcdUrl: process.env.TERRA_LCD_URL || "https://pisco-lcd.terra.dev",
  gasPrice: process.env.TERRA_GAS_PRICE || "0.15uluna",
  mnemonic: process.env.TERRA_MNEMONIC || "",
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
