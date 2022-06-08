import { Alert, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import useWallets from '../../hooks/useWallets';
import './connect-wallet.scss'

type ConnectWalletType = {
    networks: Array<Network>,
    onWalletConnected: (wallet: Wallet, network: Network) => void
}

export type Network = {
    id: NetworkId,
    name: string,
    icon: string,
    wallets: Array<Wallet>
}

export type NetworkId = 'terraclassic' | 'eth' | 'avax' | 'sol' | string;

export type Wallet = {
    id: WalletId,
    name: string,
    icon: string,
}

export type WalletId = 'station' | 'walletconnect' | 'metamask' | 'phantom' | string;

export const ConnectWallet = (props: ConnectWalletType) => {
    const { 
        networks, 
        onWalletConnected
    } = props;

    const [networkId, setNetworkId] = useState('');
    const [network, setNetwork] = useState<Network | null>();
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

    const handleSelectNetwork = (event: any) => {
        const selectedNetwork = networks.find(network => network.id === event.target.value);
        setWallet(null);
        setWalletId('');

        if (selectedNetwork) {
            setNetwork(selectedNetwork);
            setNetworkId(event.target.value);
            setWallets(selectedNetwork.wallets);
            setWalletInstalled(false);
        }
    };

    const handleSelectWallet = (event: any) => {
        const selectedWallet = wallets.find(wallet => wallet.id === event.target.value);

        if (selectedWallet && network) {
            setWalletId(event.target.value);
            setWallet(selectedWallet);

            const walletInstalled = isInstalled(selectedWallet);
            setWalletInstalled(walletInstalled);

            if(isConnected(selectedWallet)) {
                onWalletConnected(selectedWallet, network)
            }
        }
    };

    const handleConnectWallet = async () => {
        try{
            if(wallet && network) {
                await connect(wallet);
                onWalletConnected(wallet, network)
            }
        }
        catch(e) {
            enqueueSnackbar("Operation cancelled", { variant: "error"});
        }
    }

    const handleCleanSelections = () => {
        setWallet(null);
        setWalletId('');
        setNetwork(null);
        setNetworkId('');
        setWallets([]);
        setWalletInstalled(false);
    }

    return (
        <div className='ConnectWallet'>
            <FormControl className='FormControl' fullWidth>
                <InputLabel id='OriginNetworkDropdownLabel'>Origin Network</InputLabel>
                <Select
                    id='OriginNetworkDropdown'
                    labelId='OriginNetworkDropdown'
                    value={networkId}
                    label='Origin Network'
                    onChange={handleSelectNetwork}>
                    {networks.map((network, index) => (
                        <MenuItem
                            className='DropdownItem'
                            key={index}
                            value={network.id}>
                            <div className={'icon ' + network.icon} />
                            <span>{network.name}</span>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {network
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
                                Use {wallet.name} with {network?.name}
                            </Button>
                        : <Alert severity="info" onClose={() => handleCleanSelections()}>Install {wallet.name} to connect to {network?.name}</Alert>
                    }
                    
                </div>
            }
        </div>
    )
}
