import { LCDClient, MsgStoreCode, MnemonicKey, isTxError, MsgInstantiateContract, MsgExecuteContract } from '@terra-money/terra.js';
import * as fs from 'fs';

const init = async () => {

    const mk = new MnemonicKey({
        mnemonic: '_'
    })
    
    // connect to localterra
    const terra = new LCDClient({
        URL: 'http://localhost:1317',
        chainID: 'localterra'
    });
    
    const wallet = terra.wallet(mk);
    
    const storeCode = new MsgStoreCode(
        wallet.key.accAddress,
        fs.readFileSync('./artifacts/airdrop-terra.wasm').toString('base64')
    );
    const storeCodeTx = await wallet.createAndSignTx({
        msgs: [storeCode],
    });
    const storeCodeTxResult = await terra.tx.broadcast(storeCodeTx);
    
    if (isTxError(storeCodeTxResult)) {
        throw new Error(
            `store code failed. code: ${storeCodeTxResult.code}, codespace: ${storeCodeTxResult.codespace}, raw_log: ${storeCodeTxResult.raw_log}`
        );
    }
    
    const {
        store_code: { code_id },
    } = storeCodeTxResult.logs[0].eventsByType;
    
    const instantiate = new MsgInstantiateContract(
        wallet.key.accAddress,
        wallet.key.accAddress,
        +code_id[0],
        {
            admin: wallet.key.accAddress,
            denom: "uluna",
            vesting_periods: [15552000, 46656000, 15552000, 62208000]
        },
        { uluna: 1000000}, // init coins
        "Instantiate terra"
    );

    
    const instantiateTx = await wallet.createAndSignTx({
        msgs: [instantiate],
    });
    const instantiateTxResult = await terra.tx.broadcast(instantiateTx);
    const CONTRACT_ADDRESS = JSON.parse(instantiateTxResult.raw_log)[0].events[2].attributes[0].value;
    console.log(instantiateTxResult);
    const execCreateMerkle = new MsgExecuteContract(
        wallet.key.accAddress,
        CONTRACT_ADDRESS,
        {
            register_merkle_root: {
                merkle_root: "634de21cde1044f41d90373733b0f0fb1c1c71f9652b905cdf159e73c4cf0d37"
            }
        }
    );

    const execCreateMerkleTx = await wallet.createAndSignTx({
        msgs: [execCreateMerkle],
    });
    const execCreateMerkleResult = await terra.tx.broadcast(execCreateMerkleTx);

    console.log(execCreateMerkleResult);
    console.log("CONTRACT_ADDRESS " + CONTRACT_ADDRESS)
}
init();