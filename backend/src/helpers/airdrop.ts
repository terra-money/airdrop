// Referenced from https://github.com/Mirror-Protocol/mirror-airdrop/blob/main/src/Airdrop.ts

import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import { AllocationValidation, validateAndClean } from "../validation";

export interface Allocation {
  address: string;
  amount0: string;
  amount1: string;
  amount2: string;
  amount3: string;
  amount4: string;
}

export const EMPTY_ALLOCATION = {
  address: "",
  amount0: "0",
  amount1: "0",
  amount2: "0",
  amount3: "0",
  amount4: "0",
};

export class Airdrop {
  private tree: MerkleTree;
  private allocationMap: Map<string, Allocation>;

  constructor(allocations: Array<Allocation>) {
    const leaves = allocations.map(this.hashFromAllocation);
    this.allocationMap = new Map();
    for (const a of allocations) {
      this.allocationMap.set(a.address, a);
    }
    this.tree = new MerkleTree(leaves, keccak256, { sort: true });
  }

  public getMerkleRoot(): string {
    return this.tree.getHexRoot().replace("0x", "");
  }

  public getMerkleProof(a: Allocation): string[] {
    return this.tree
      .getHexProof(this.hashFromAllocation(a))
      .map((v) => v.replace("0x", ""));
  }

  public getMerkleProofByAddress(
    address: string
  ): [string, string[], Error | null] {
    const [allocation, err] = this.getAllocation(address);
    if (err || !allocation) {
      return ["", [], err];
    }
    const proofs = this.getMerkleProof(allocation);
    const allocationString = Airdrop.allocationToString(allocation);
    return [allocationString, proofs, null];
  }

  public verify(proof: string[], a: Allocation): boolean {
    let hashBuf = this.hashFromAllocation(a);

    proof.forEach((proofElem) => {
      const proofBuf = Buffer.from(proofElem, "hex");

      if (Buffer.compare(hashBuf, proofBuf) === -1) {
        hashBuf = keccak256(Buffer.concat([hashBuf, proofBuf]));
      } else {
        hashBuf = keccak256(Buffer.concat([proofBuf, hashBuf]));
      }
    });

    return this.getMerkleRoot() === hashBuf.toString("hex");
  }

  public getAllocation(address: string): [Allocation | null, any] {
    const allocation = this.allocationMap.get(address);
    if (!allocation) {
      return [null, `allocation not found for: ${address}`];
    }
    return [allocation, null];
  }

  private hashFromAllocation(alloc: Allocation): Buffer {
    const a = validateAndClean(alloc, AllocationValidation);
    return keccak256(Airdrop.allocationToString(a));
  }

  private static allocationToString(a: Allocation): string {
    return `${a.address},${a.amount0},${a.amount1},${a.amount2},${a.amount3},${a.amount4}`;
  }
}
