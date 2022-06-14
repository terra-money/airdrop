import { useMetaMask } from "metamask-react";
import { ConnectType, useWallet } from "@terra-money/wallet-provider";
import { Wallet } from "../models/Wallet";
import { ethers } from 'ethers';
import { Coins, MsgSend } from "@terra-money/terra.js";

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
                signature = await _signAddressWithStation(wallet, newTerraAddress);
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

    const _signAddressWithStation = async (wallet: Wallet, newTerraAddress: string): Promise<string> => {
        const result = await station.sign({
            msgs: [
                new MsgSend(
                    getAddress(wallet),
                    newTerraAddress, 
                    Coins.fromString("1uluna")
                )
            ],
            memo: newTerraAddress
        });

        return JSON.stringify(result);
    };

    const _signAddressWithMetamask = async (newTerraAddress: string): Promise<string> => {
        await metamask.ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(metamask.ethereum);
        const signer = provider.getSigner();
        return signer.signMessage(newTerraAddress);
    };

    const _signAddressWithPhantom = async (newTerraAddress: string): Promise<string> => {
        const encodedMessage = new TextEncoder().encode(newTerraAddress);
        const signedMessage = await (window as any).solana.signMessage(encodedMessage, "utf8");
        return Buffer.from(signedMessage.signature).toString('hex');
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