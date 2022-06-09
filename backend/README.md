# Backend for the Airdrop app

## Introduction

This express app helps with the claiming process. Features:
1. Allow users to check how much airdrop they are eligible for
2. Performing verification before claiming
3. Generate a transaction with merkle proofs
4. Sign and pay fee for a transaction (that will be refunded using the airdrop claim)

## Endpoints

### POST /submit_claim

Endpoint to submit claims by providing user's snapshot address, new terra address and a signture to that we can verify that the message is signed by the snapshot address. Even though the airdrop contract will perform verification, this endpoint will perform verification to reduce spam. After verification, the app will generate a set of proofs and the claim message to be submitted to the smart contract.

```
POST /submit_claim/{chain}

# request
{
    "address": "",
    "signature": "",
    "new_terra_address: "",
}

# response
{
    "submitted": true,
    "transaction_hash": ""
}
```


### GET /claim_amount/{chain}/{address}

Endpoint to look up the amount of LUNA the address is allocated. We do not save the airdrop amount in the smart contract and will just do a lookup using a CSV that is saved together in this repository. It will also check with the smart contract to see if the user has claimed or not.

```
GET /claim_amount/{chain}/{address}

# response
{
    "amount_claimable": "",
    "has_claimed": "",
    "chain": "",
    "address": ""
}

```

### GET /merkle_root/{chain}

Generate the merkle root for a set of claims by chain. Purely used for verification of the merkle root hash uploaded to the airdrop smart contract. 

```
GET /merkle_root/{chain}

# respone
{
    "chain": "",
    "merkle_root": ""
}
```