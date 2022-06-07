import { Card, CardContent, CardHeader, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import './origin-networks.scss'

type OriginNetworksType = {
    originNetworks: Array<OriginNetwork>
}

type OriginNetwork = {
    id: string,
    name: string,
    icon: string,
    wallets: Array<Wallet>
}

type Wallet = {
    id: string,
    name: string,
    icon: string,
}

export const OriginNetworks = (props: OriginNetworksType) => {
    const { originNetworks } = props;
    const [selectedNetwork, setSelectedNetwork] = useState({});
    const [networkId, setNetworkId] = useState("");
    const [walletId, setWalletId] = useState("");
    const [wallets, setWallets] = useState(new Array<Wallet>());

    const handleSelectNetwork = (event: any) => {
        const selectedNetwork = originNetworks.find(network => network.id === event.target.value);
        if (selectedNetwork) {
            setNetworkId(event.target.value);
            setSelectedNetwork(selectedNetwork);
            setWallets(selectedNetwork.wallets)
        }
    };

    const handleSelectWallet = (event: any) => {
        setWalletId(event.target.value);
    };

    return (
        <div className='OriginNetwork'>
            <Card>
                <CardHeader title="Select origin network" />
                <CardContent>
                    <FormControl className='FormControl' fullWidth>
                        <InputLabel id="OriginNetworkDropdownLabel">Origin Network</InputLabel>
                        <Select
                            id="OriginNetworkDropdown"
                            labelId="OriginNetworkDropdown"
                            value={networkId}
                            label="Origin Network"
                            onChange={handleSelectNetwork}>
                            {originNetworks.map((network, index) => (
                                <MenuItem
                                    className="DropdownItem"
                                    key={index}
                                    value={network.id}>
                                    <div className={"icon " + network.icon} />
                                    <span>{network.name}</span>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {wallets.length
                        ? <FormControl className='FormControl' fullWidth>
                            <InputLabel id="WalletLabel">Select Wallet</InputLabel>
                            <Select
                                id="WalletDropdown"
                                labelId="Wallet"
                                value={walletId}
                                label="Select Wallet"
                                onChange={handleSelectWallet}>
                                {wallets.map((wallet, index) => (
                                    <MenuItem
                                        className="DropdownItem"
                                        key={index}
                                        value={wallet.id}>
                                        <div className={"icon " + wallet.icon} />
                                        <span>{wallet.name}</span>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        : <></>
                    }

                </CardContent>
            </Card>
        </div>
    )
}
