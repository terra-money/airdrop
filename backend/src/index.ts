import express from "express";
import { readdirSync } from "fs";
import morgan from "morgan";
import { Config } from "./config";
import { MainController } from "./controller";
import { errorHandler } from "./helpers/error-handler";
import { AirdropService } from "./services/airdrop.service";
import { ClaimService } from "./services/claim.service";
import { VerificationService } from "./services/verification.service";

export const CreateApp = (): express.Express => {
  // App setup
  const app = express();
  app.use(express.json());
  app.use(morgan("combined"));

  // Create airdrop service and add airdrop files
  const airdropService = new AirdropService();
  const files = readdirSync(Config.csvFolderPath);
  for (const f of files) {
    let err = airdropService.addAirdropFile(Config.csvFolderPath + "/" + f);
    if (err) {
      console.error(err);
    }
  }

  const verificationService = new VerificationService();
  const claimService = new ClaimService(airdropService);

  // Register controllers
  const mainController = new MainController(
    airdropService,
    verificationService,
    claimService
  );
  mainController.registerRoutes(app);

  app.use(errorHandler);
  return app;
};

// Main entrypoint
(() => {
  const app = CreateApp();
  app.listen(Config.port, () => {
    console.log(`Service started successfully on port ${Config.port}`);
  });
})();
