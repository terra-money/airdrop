import "dotenv/config";

export const Config = {
  port: Number(process.env.PORT) || 3001,
  csvFolderPath: process.env.CSV_FOLDER_PATH || "./files",
  chainId: process.env.TERRA_CHAIN_ID || "localterra",
  lcdUrl: process.env.TERRA_LCD_URL || "http://localhost:1317",
  gasPrice: process.env.TERRA_GAS_PRICE || "0.15uluna",
  mnemonic: process.env.TERRA_MNEMONIC || "",
  terraAirdropContract: process.env.TERRA_AIRDROP_CONTRACT || "",
  ethAirdropContract: process.env.ETH_AIRDROP_CONTRACT || "",
  avaxAirdropContract: process.env.AVAX_AIRDROP_CONTRACT || "",
  phantomAirdropContract: process.env.PHANTOM_AIRDROP_CONTRACT || "",
  polygonAirdropContract: process.env.POLYGON_AIRDROP_CONTRACT || "",
  bscAirdropContract: process.env.BSC_AIRDROP_CONTRACT || "",
  solanaAirdropContract: process.env.SOLANA_AIRDROP_CONTRACT || "",
  kavaAirdropContract: process.env.KAVA_AIRDROP_CONTRACT || "",
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
