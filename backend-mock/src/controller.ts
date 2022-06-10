import { Application, Request, Response } from "express";

export class MainController {
    public registerRoutes(app: Application) {
        app.get("/healthcheck", this.healthCheck.bind(this));
        app.get("/allocation/:chain/:address", this.allocation.bind(this));
        app.post("/claim/:chain/:address", this.claim.bind(this));
    }

    private healthCheck(req: Request, res: Response) {
        res.status(200);
        res.send("OK");
    }

    private allocation(req: Request, res: Response) {
        const { params } = req;
        setTimeout(() => {
            return res.send({
                "allocation": "0.2",
                "has_claimed": false,
                "chain": params.chain,
                "address": params.address
            });
        }, 1000)
    }

    private claim(req: Request, res: Response) {
        const { params } = req;

        setTimeout(() => {
            return res.send({
                "allocation": "0.123456",
                "has_claimed": false,
                "chain": params.chain,
                "address": params.address
            });
        }, 1000)

    }
}
