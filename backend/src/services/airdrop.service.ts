import { Airdrop, Allocation, EMPTY_ALLOCATION } from "../helpers/airdrop";
import { createReadStream } from "fs";
import { parse } from "@fast-csv/parse";

export class AirdropService {
  private airdrops: Map<string, Airdrop>;
  public constructor() {
    this.airdrops = new Map();
  }

  public addAirdropFile(path: string): Error | null {
    // Assume filename maps to chain eth.csv -> chain = eth
    const allocations: Allocation[] = [];
    try {
      const splitPath = path.split("/");
      const chainToken = splitPath[splitPath.length - 1].replace(".csv", "");
      createReadStream(path)
        .pipe(parse({ headers: true }))
        .on("error", (error) => {
          throw error;
        })
        .on("data", (row) => allocations.push(row))
        .on("end", (rowCount: number) => {
          console.log(`Parsed ${rowCount} rows for ${path}`);
          const airdrop = new Airdrop(allocations);
          this.airdrops.set(chainToken, airdrop);
        });
    } catch (e) {
      if (e instanceof Error) {
        return e;
      } else {
        return new Error(String(e));
      }
    }
    return null;
  }

  public getAirdrop(
    chain: string,
    denom: string
  ): [Airdrop | null, Error | null] {
    const chainDenom = `${chain}.${denom}`;
    const airdrop = this.airdrops.get(chainDenom);
    if (airdrop) {
      return [airdrop, null];
    }
    return [
      null,
      new Error(`Airdrop not found for ${chain} chain for ${denom}`),
    ];
  }

  public getAllocation(
    chain: string,
    denom: string,
    address: string
  ): [Allocation | null, Error | null] {
    let airdrop, allocation, err;
    [airdrop, err] = this.getAirdrop(chain, denom);
    if (err || !airdrop) {
      return [null, err];
    }
    [allocation, err] = airdrop.getAllocation(address);
    if (err) {
      allocation = {
        ...EMPTY_ALLOCATION,
        address: address,
      };
    }
    return [allocation, null];
  }
}
