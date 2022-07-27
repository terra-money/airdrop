# Airdrop Frontend 

This app has four environment variables:

 name                               | description
------------------------------------|---------------
REACT_APP_PHOENIX_API_URL           | mainnet backend API url where to check the address eligibility and claim the airdrop. 
REACT_APP_PISCO_API_URL             | testnet backend API url where to check the address eligibility and claim the airdrop. 
REACT_APP_PHOENIX_CONTRACT_ADDRESS  | Terra V2 Mainnet contract address where user will send a transaction to claim allocated airdrop from former Terra protocol.
REACT_APP_PISCO_CONTRACT_ADDRESS    | Terra V2 Testnet contract address where user will send a transaction to claim allocated airdrop from former Terra protocol.


# How to use the app

To run this app you must create a **.env** file in the **frontend** directory filling the environment variables with they corresponding values:

```
REACT_APP_PHOENIX_CONTRACT_ADDRESS=
REACT_APP_PHOENIX_API_URL=

REACT_APP_PISCO_CONTRACT_ADDRESS=
REACT_APP_PISCO_API_URL=
```

*When you build the app this **.env** variables will be embedded in the app, if the .env file is not defined all variables will be undefined.