import { useMetaMask } from "metamask-react";
import { ConnectType, useWallet} from "@terra-money/wallet-provider";
import { Wallet } from "../models/Wallet";

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

    return {
        isInstalled,
        isConnected,
        connect,
        getAddress
    }
}

export default useWallets;