import { Application, Request, Response } from "express";
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
  ) {}

  public registerRoutes(app: Application) {
    app.get("/healthcheck", this.healthCheck.bind(this));
    app.get("/allocation/:chain/:address", this.allocation.bind(this));
    app.get("/merkle_root/:chain", this.merkle_root.bind(this));
    app.post("/claim/:chain/:address", this.claim.bind(this));
  }

  private healthCheck(req: Request, res: Response) {
    res.status(200);
    res.send("OK");
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
    const { chain, address } = req.body;

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

  private allocation(req: Request, res: Response) {
    let hasClaim = false;
    const chain = req.params.chain;
    const address = req.params.address;
    let [allocation, err] = this.airdropService.getAllocation(chain, address);
    if (err || !allocation) {
      res.status(404);
      return res.json({
        message: String(err),
      });
    } else {
      // Check has claimed
      hasClaim = true;
    }

    const response: Record<string, any> = {
      allocation: String(
        parseInt(allocation.amount0) +
          parseInt(allocation.amount1) +
          parseInt(allocation.amount2) +
          parseInt(allocation.amount3) +
          parseInt(allocation.amount4)
      ),
      has_claimed: hasClaim,
      chain,
      address,
    };

    if (req.query.verbose) {
      let [airdrop, _] = this.airdropService.getAirdrop(chain);
      let [allocationString, proofs, __] =
        airdrop?.getMerkleProofByAddress(address)!;
      response["allocation_string"] = allocationString;
      response["proofs"] = proofs;
    }

    res.status(200);
    return res.json(response);
  }

  private merkle_root(req: Request, res: Response) {
    const chain = req.params.chain;
    let [airdrop, err] = this.airdropService.getAirdrop(chain);
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
