import { Alert, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import useWallets from '../../hooks/useWallets';
import { Chain } from '../../models/Chain';
import { Wallet } from '../../models/Wallet';
import './ConnectWallet.scss'

export type ConnectWalletType = {
    chains: Array<Chain>,
    onWalletConnected: (wallet: Wallet, chain: Chain) => void
}

export const ConnectWallet = (props: ConnectWalletType) => {
    const {
        chains,
        onWalletConnected
    } = props;

    const [chainId, setChainId] = useState('');
    const [chain, setChain] = useState<Chain | null>();

    const [wallets, setWallets] = useState(new Array<Wallet>());
    const [walletId, setWalletId] = useState('');

    const [wallet, setWallet] = useState<Wallet | null>();
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


    const handleSelectChain = (event: any) => {
        const selectedChain = chains.find(chain => chain.id === event.target.value);
        setWallet(null);
        setWalletId('');

        if (selectedChain) {
            setChain(selectedChain);
            setChainId(event.target.value);
            setWallets(selectedChain.wallets);
            setWalletInstalled(false);
        }
    };

    const handleSelectWallet = (event: any) => {
        const selectedWallet = wallets.find(wallet => wallet.id === event.target.value);

        if (selectedWallet && chain) {
            setWalletId(event.target.value);
            setWallet(selectedWallet);

            const walletInstalled = isInstalled(selectedWallet);
            setWalletInstalled(walletInstalled);

            if (isConnected(selectedWallet)) {
                onWalletConnected(selectedWallet, chain)
            }
        }
    };

    const handleConnectWallet = async () => {
        try {
            if (wallet && chain) {
                await connect(wallet);

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
        setWallets([]);
        setWalletInstalled(false);
    }

    return (
        <div className='ConnectWallet'>
            <FormControl className='FormControl' fullWidth>
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
            </FormControl>
            {chain
                ? <FormControl className='FormControl' fullWidth>
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
                : <></>
            }
            {wallet &&
                <div className='ConnectWalletFooter'>
                    {walletInstalled
                        ? <Button variant='outlined'
                            onClick={() => handleConnectWallet()}>
                            Use {wallet.name} with {chain?.name}
                        </Button>
                        : <Alert severity="info" onClose={() => handleCleanSelections()}>Install {wallet.name} to connect to {chain?.name}</Alert>
                    }
                </div>
            }
        </div>
    )
}
