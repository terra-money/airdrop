import { Application, Request, Response } from "express";
import { Config } from "./config";
import { EMPTY_ALLOCATION } from "./helpers/airdrop";
import { AirdropService } from "./services/airdrop.service";
import { ClaimService } from "./services/claim.service";
import { VerificationService } from "./services/verification.service";
import { ClaimRequest } from "./validation";

export class MainController {
  public constructor(
    private airdropService: AirdropService,
    private verificationService: VerificationService,
    private claimService: ClaimService
  ) { }

  public registerRoutes(app: Application) {
    app.get("/healthcheck", this.healthCheck.bind(this));
    app.get("/config", this.getConfig.bind(this));
    app.get("/allocation/:chain/:address/:denom", this.allocation.bind(this));
    app.get("/merkle_root/:chain/:denom", this.merkle_root.bind(this));
    app.post("/claim/:chain/:address/:denom", this.claim.bind(this));
  }

  private healthCheck(req: Request, res: Response) {
    res.status(200);
    res.send("OK");
  }

  private getConfig(_req: Request, res: Response) {
    const blackListedKeys = ["mnemonic"]
    const config = {
      ...Config
    } as any;
    for (let k of blackListedKeys) {
      delete config[k];
    }
    res.status(200);
    res.json(config);
  }

  private async claim(req: Request, res: Response) {
    const { value: _, error: error } = ClaimRequest.validate(req);
    if (error) {
      res.status(400);
      return res.json({
        message: error.message,
      });
    }

    const { new_terra_address: newTerraAddress, signature } = req.body;
    const { chain, address, denom } = req.params;

    // Verify message to authenticate the request
    let [isVerified, err] = this.verificationService.verify(
      chain,
      address,
      newTerraAddress,
      signature
    );

    if (err) {
      res.status(500);
      return res.json({
        message: err.message,
      });
    }

    if (!isVerified) {
      res.status(400);
      return res.json({
        message: "Signature verificaton failed",
      });
    }

    // Create transaction and relay message
    let transactionHash: string | null;
    [transactionHash, err] = await this.claimService.claim(
      chain,
      denom,
      address,
      newTerraAddress,
      signature
    );

    if (err) {
      res.status(500);
      return res.json({
        message: err.message,
      });
    }

    res.status(200);
    return res.send({
      transaction_hash: transactionHash,
    });
  }

  private async allocation(req: Request, res: Response) {
    const chain = req.params.chain;
    const denom = req.params.denom;
    const address = req.params.address;
    let [allocation, err] = this.airdropService.getAllocation(
      chain,
      denom,
      address
    );
    let isClaimed;
    if (err || !allocation) {
      res.status(404);
      return res.json({
        message: String(err),
      });
    } else {
      // Check has claimed
      if (!req.query.skip_check) {
        [isClaimed, err] = await this.claimService.checkIsClaimed(
          chain,
          denom,
          address
        );
        if (err || isClaimed == null) {
          res.status(500);
          return res.json({
            message: String(err),
          });
        }
      }
    }

    const response: Record<string, any> = {
      allocation: String(
        parseInt(allocation.amount0) +
        parseInt(allocation.amount1) +
        parseInt(allocation.amount2) +
        parseInt(allocation.amount3) +
        parseInt(allocation.amount4)
      ),
      has_claimed: isClaimed,
      chain,
      denom,
      address,
    };

    let [airdrop, _] = this.airdropService.getAirdrop(chain, denom);
    let [allocationString, proofs, __] =
      airdrop?.getMerkleProofByAddress(address)!;
    response["allocation_string"] = allocationString;
    response["proofs"] = proofs;

    res.status(200);
    return res.json(response);
  }

  private merkle_root(req: Request, res: Response) {
    const chain = req.params.chain;
    const denom = req.params.denom;
    let [airdrop, err] = this.airdropService.getAirdrop(chain, denom);
    if (err || !airdrop) {
      res.status(404);
      return res.json({
        message: String(err),
      });
    }
    const hash = airdrop.getMerkleRoot();
    res.status(200);
    return res.json({
      chain: chain,
      merkle_root: hash,
    });
  }
}
