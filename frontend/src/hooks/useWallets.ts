import { useMetaMask } from "metamask-react";
import { ConnectType, useWallet } from "@terra-money/wallet-provider";
import { Wallet } from "../models/Wallet";
import { ClaimAllocationRequest } from "../models/Api";
import { TextEncoder } from "util";

const useWallets = () => {
    const metamask = useMetaMask();
    const station = useWallet();

    const isInstalled = (wallet: Wallet): boolean => {
        switch (wallet.id) {
            case "station":
                return !!station.availableConnectTypes.find(connectType => connectType === ConnectType.EXTENSION);
            case "walletconnect":
                return !!station.availableConnectTypes.find(connectType => connectType === ConnectType.WALLETCONNECT);
            case "metamask":
                return metamask.status !== "unavailable";
            case "phantom":
                return (window as any).solana?.isPhantom;
            default:
                throw Error(`Unknown wallet with id '${wallet.id}'`);
        }
    }

    const isConnected = (wallet: Wallet): boolean => {
        switch (wallet.id) {
            case "station":
                return station?.connection?.type === ConnectType.EXTENSION;
            case "walletconnect":
                return station?.connection?.type === ConnectType.WALLETCONNECT;
            case "metamask":
                return metamask.status === "connected";
            case "phantom":
                return (window as any).solana.isConnected;
            default:
                throw Error(`Unknown wallet with id '${wallet.id}'`);
        }
    }

    const connect = (wallet: Wallet): Promise<any> => {
        switch (wallet.id) {
            case "station":
                return Promise.resolve(station.connect(ConnectType.EXTENSION));
            case "walletconnect":
                return Promise.resolve(station.connect(ConnectType.WALLETCONNECT));
            case "metamask":
                return metamask.connect();
            case "phantom":
                return (window as any).solana?.connect();
            default:
                throw Error(`Unknown wallet with id '${wallet.id}'`);
        }
    }

    const getAddress = (wallet: Wallet): string => {
        switch (wallet.id) {
            case "station":
                return station.wallets[0]?.terraAddress;
            case "walletconnect":
                return station.wallets[0]?.terraAddress;
            case "metamask":
                return metamask.account as string;
            case "phantom":
                return (window as any).solana?.publicKey.toString();
            default:
                throw Error(`Unknown wallet with id '${wallet.id}'`);
        }
    }

    const signClaimAllocation = async (
        wallet: Wallet,
        newTerraAddress: string
    ): Promise<{ signature: string, signerAddress: string }> => {
        let signature; 

        switch (wallet.id) {
            case "station":
            case "walletconnect":
                signature = await _signAddressWithStation(newTerraAddress);
                break;
            case "metamask":
                signature = await _signAddressWithMetamask(newTerraAddress);
                break;
            case "phantom":
                signature = await _signAddressWithPhantom(newTerraAddress);
                break;
            default:
                throw Error(`Unknown wallet with id '${wallet.id}'`);
        }

        return {
            signature,
            signerAddress: getAddress(wallet)
        }
    }

    const _signAddressWithStation = async (new_terra_address: string): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            const params = Buffer.from(JSON.stringify({
                domain: {},
                message: { new_terra_address },
                primaryType: 'TerraAddress',
                types: {
                    TerraAddress: [{ name: 'new_terra_address', type: 'string' }]
                },
            }));
            try {
                const response = await station.signBytes(params);
                
                return resolve(Buffer.from(response.result.signature).toString('base64'))
            }
            catch(e) {
                return reject(e);
            }
        })
    };

    const _signAddressWithMetamask = (new_terra_address: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const params = [metamask.ethereum.selectedAddress, JSON.stringify({
                domain: {},
                message: { new_terra_address },
                primaryType: 'TerraAddress',
                types: {
                    TerraAddress: [{ name: 'new_terra_address', type: 'string' }]
                },
            })];

            metamask.ethereum.sendAsync(
                {
                    method: 'eth_signTypedData_v4',
                    params,
                    from: metamask.ethereum.selectedAddress,
                },
                (err: any, result: { result: string }) => {
                    if (err) return reject(err);
                    else return resolve(Buffer.from(result.result).toString('base64'))
                }
            );
        })
    };

    const _signAddressWithPhantom = async (new_terra_address: string): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            const params = Buffer.from(JSON.stringify({
                domain: {},
                message: { new_terra_address },
                primaryType: 'TerraAddress',
                types: {
                    TerraAddress: [{ name: 'new_terra_address', type: 'string' }]
                },
            }));
            try {
                const signedMessage = await (window as any).solana.signMessage(params, "utf8");
                return resolve(Buffer.from(signedMessage.signature).toString('base64'));
            }
            catch(e) {
                return reject(e);
            }
        })
    };

    return {
        isInstalled,
        isConnected,
        connect,
        getAddress,
        signClaimAllocation
    }
}

export default useWallets;