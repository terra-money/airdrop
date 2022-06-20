import { ChainId } from "./Chain"

export type AllocationResponse = {
    address?: string,
    allocation?: string,
    allocation_string?: string,
    chain?: ChainId,
    has_claimed?: boolean,
    proofs?: Array<string>,
    message?: any
}

export type ClaimAllocationRequest = {
    signature: string,
    new_terra_address: string,
}

export type ClaimAllocationResponse = {
    transaction_hash?: string,
    message?: any
}