import { ChainId } from "./Chain"

export type AllocationResponse = {
    allocation: string,
    has_claimed: boolean,
    chain: ChainId,
    address: string
}

export type ClaimAllocationRequest = {
    signature: string,
    new_terra_address: string,
}

export type ClaimAllocationResponse = {
    has_claimed: boolean,
    transaction_hash: string
}