import "dotenv/config";

export const Config = {
  port: Number(process.env.APP_PORT) || 3000,
  csvFolderPath: process.env.CSV_FOLDER_PATH || "",
};

if (!Config.csvFolderPath) {
  throw Error("Missing csv folder path. Did you forget to set CSV_FOLDER_PATH");
}
