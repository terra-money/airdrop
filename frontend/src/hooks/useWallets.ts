import { Wallet } from "../components/connect-wallet";
import { useMetaMask } from "metamask-react";
import { ConnectType, useWallet } from "@terra-money/wallet-provider";

const useWallets = () => {
    const metamask = useMetaMask();
    const station = useWallet();

    const isInstalled = (wallet: Wallet) : boolean => {
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

    const isConnected = (wallet: Wallet) : boolean => {
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

    const connect = async (wallet: Wallet) : Promise<any> => {
        switch (wallet.id) {
            case "station":
                return station.connect(ConnectType.EXTENSION);
            case "walletconnect":
                return station.connect(ConnectType.WALLETCONNECT);
            case "metamask":
                return metamask.connect();
            case "phantom":
                return (window as any).solana?.connect();
            default: 
                throw Error(`Unknown wallet with id '${wallet.id}'`);
        }
    }

    return {
        isInstalled,
        isConnected,
        connect
    }
}

export default useWallets;