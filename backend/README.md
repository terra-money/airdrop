# Backend for the Airdrop app

## Introduction

This express app helps with the claiming process. Features:
1. Allow users to check how much airdrop they are eligible for
2. Performing verification before claiming
3. Generate a transaction with merkle proofs
4. Sign and pay fee for a transaction (that will be refunded using the airdrop claim)

## Frontend endpoints

Note: the possible chains should match with the network id from /frontend/src/networks.json which currently are "terraclassic" | "eth" | "avax" | "sol".

### GET:/allocation/{chain}/{address}

Endpoint to look up the amount of LUNA the address is allocated. We do not save the airdrop amount in the smart contract and will just do a lookup using a CSV that is saved together in this repository. It will also check with the smart contract to see if the user has claimed or not.

Response when user has funds to claim:
```
GET:/allocation/{chain}/{address}
{
    "allocation": "0.123456",
    "has_claimed": false,
    "chain": "terraclassic",
    "address": "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8"
}
```

Response when user already claimed the funds:
```
GET:/allocation/{chain}/{address}
{
    "allocation": "0.123456",
    "has_claimed": true,
    "chain": "terraclassic",
    "address": "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8"
}
```

Response when user has no funds to claim:
```
GET:/allocation/{chain}/{address}

# response
{
    "allocation": "0",
    "has_claimed": false,
    "chain": "terraclassic",
    "address": "terra15lsftv92eyssjwkh2393s0nhjc07kryqeux5s6"
}
```

### POST:/claim/{chain}

Endpoint to submit claims by providing user's snapshot address, new terra address and a signture to that we can verify that the message is signed by the snapshot address. Even though the airdrop contract will perform verification, this endpoint will perform verification to reduce spam. After verification, the app will generate a set of proofs and the claim message to be submitted to the smart contract.

User submit a request to claim successfully:
```
POST:/claim/{chain}/{address}

# request
{
    "signature": "dGVycmExemRwZ2o4YW01bnFxdmh0OTI3azNldGxqeWw2YTUya3dxdXAwamU=",
    "new_terra_address: "terra1zdpgj8am5nqqvht927k3etljyl6a52kwqup0je",
}

# response
{
    "has_claimed": false,
    "transaction_hash": "3A41C57DDBFA6F68052947BC3204CE9DB64767CA907E899D9EDF9DB88E0896C5"
}
```

User submit a request to claim but funds were already claimed:
```
POST:/claim/{chain}/{address}

# request
{
    "signature": "dGVycmExemRwZ2o4YW01bnFxdmh0OTI3azNldGxqeWw2YTUya3dxdXAwamU=",
    "new_terra_address: "terra1zdpgj8am5nqqvht927k3etljyl6a52kwqup0je",
}

# response
{
    "has_claimed": true,
    "transaction_hash": "3A41C57DDBFA6F68052947BC3204CE9DB64767CA907E899D9EDF9DB88E0896C5"
}
```

## Internal endpoints

### GET:/merkle_root/{chain}

Generate the merkle root for a set of claims by chain. Purely used for verification of the merkle root hash uploaded to the airdrop smart contract. 

```
GET:/merkle_root/{chain}

# respone
{
    "chain": "",
    "merkle_root": ""
}
```

### Error handling

Return 500 on every endpoint with the following structure:
```
{
    "message": ""
}
```