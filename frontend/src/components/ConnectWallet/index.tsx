import { Alert, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import useWallets from '../../hooks/useWallets';
import { Chain } from '../../models/Chain';
import { Wallet } from '../../models/Wallet';
import './ConnectWallet.scss'

export type ConnectWalletType = {
    wallets: Array<Wallet>,
    onWalletConnected: (wallet: Wallet, chain: Chain) => void
}

export const ConnectWallet = (props: ConnectWalletType) => {
    const {
        wallets,
        onWalletConnected
    } = props;

    const [wallet, setWallet] = useState<Wallet | null>();
    const [walletId, setWalletId] = useState('');

    const [chains, setChains] = useState(new Array<Chain>());
    const [chain, setChain] = useState<Chain | null>();
    const [chainId, setChainId] = useState('');

    const [walletInstalled, setWalletInstalled] = useState<boolean>();

    const { enqueueSnackbar } = useSnackbar();
    const {
        isInstalled,
        isConnected,
        connect
    } = useWallets();
    const connectedWallet = useConnectedWallet();

    // Imperative way to detect if station is connected
    useEffect(() => {
        if (connectedWallet && wallet && chain) {
            onWalletConnected(wallet, chain)
        }
    }, [connectedWallet])


    const handleSelectWallet = (event: any) => {
        const selectedWallet = wallets.find(wallet => wallet.id === event.target.value);
        setChain(null);
        setChainId("");
        setChains([]);

        if (selectedWallet) {
            setWalletId(event.target.value);
            setWallet(selectedWallet);
            setChains(selectedWallet.chains);

            const walletInstalled = isInstalled(selectedWallet);
            setWalletInstalled(walletInstalled);
        }
    };

    const handleSelectChain = (event: any) => {
        const selectedChain = chains.find(chain => chain.id === event.target.value);

        if (wallet) {
            setChainId(event.target.value);
            setChain(selectedChain);

            if (isConnected(wallet) && selectedChain) {
                onWalletConnected(wallet, selectedChain)
            }
        }
    };


    const handleConnectWallet = async () => {
        try {
            if (wallet && chain) {
                await connect(wallet, chain);

                // For station and wallet connect 
                // the status must be checked on 
                // an imperative way thru useEffect
                if (wallet.id !== "station" && wallet.id !== "walletconnect") {
                    onWalletConnected(wallet, chain);
                }
            }
        }
        catch (e) {
            console.log(e);
            enqueueSnackbar("Operation cancelled", { variant: "error" });
        }
    }

    const handleCleanSelections = () => {
        setWallet(null);
        setWalletId('');
        setChain(null);
        setChainId('');
        setChains([]);
        setWalletInstalled(false);
    }

    return (
        <div className='ConnectWallet'>
            <h4>Select a wallet and connect to one of the available networks. Check the airdrop eligibility for the connected wallet. Sign a transaction to prove the ownership and claim the airdrop.</h4>
            <FormControl className='FormControl' fullWidth>
                <InputLabel id='WalletLabel'>Select Wallet</InputLabel>
                <Select
                    id='WalletDropdown'
                    labelId='Wallet'
                    value={walletId}
                    label='Select Wallet'
                    onChange={handleSelectWallet}>
                    {wallets.map((wallet, index) => (
                        <MenuItem
                            className='DropdownItem'
                            key={index}
                            value={wallet.id}>
                            <div className={'icon ' + wallet.icon} />
                            <span>{wallet.name}</span>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {wallet && !walletInstalled
                && <Alert severity="info" onClose={() => handleCleanSelections()}>Install {wallet.name} to connect to select a chain</Alert>}
            {wallet && walletInstalled && <FormControl className='FormControl' fullWidth>

                <InputLabel id='OriginChainDropdownLabel'>Origin Chain</InputLabel>
                <Select
                    id='OriginChainDropdown'
                    labelId='OriginChainDropdown'
                    value={chainId}
                    label='Origin Chain'
                    onChange={handleSelectChain}>
                    {chains.map((chain, index) => (
                        <MenuItem
                            className='DropdownItem'
                            key={index}
                            value={chain.id}>
                            <div className={'icon ' + chain.icon} />
                            <span>{chain.name}</span>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>}
            {wallet && chain && <div className='ConnectWalletFooter'>
                <Button variant='outlined'
                    fullWidth
                    onClick={() => handleConnectWallet()}>
                    Use {wallet.name} with {chain?.name}
                </Button>
            </div>
            }
        </div>
    )
}
