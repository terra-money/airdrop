import { useMetaMask } from "metamask-react";
import { ConnectType, useWallet } from "@terra-money/wallet-provider";
import { Wallet } from "../models/Wallet";
import { Chain, KeplrChain } from "../models/Chain";
import { ethers } from 'ethers';
import { MsgExecuteContract } from "@terra-money/terra.js";
import useWalletsHelpers from "./useWalletsHelpers";
import { AllocationResponse } from "../models/Api";

const useWallets = () => {
    const { terraClassicKeplrConfig, injectiveKeplrConfig } = useWalletsHelpers();
    const metamask = useMetaMask();
    const station = useWallet();
    const _window: any = window;

    const isInstalled = (wallet: Wallet): boolean => {
        switch (wallet.id) {
            case "station":
                return !!station.availableConnectTypes.find(connectType => connectType === ConnectType.EXTENSION);
            case "walletconnect":
                return !!station.availableConnectTypes.find(connectType => connectType === ConnectType.WALLETCONNECT);
            case "keplr":
                return _window.keplr !== undefined;
            case "metamask":
                return metamask.status !== "unavailable";
            case "phantom":
                return _window.solana?.isPhantom;
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
            case "keplr":
                return false;
            case "metamask":
                return metamask.status === "connected";
            case "phantom":
                return _window.solana.isConnected;
            default:
                throw Error(`Unknown wallet with id '${wallet.id}'`);
        }
    }

    const connect = async (wallet: Wallet, chain: Chain): Promise<any> => {
        switch (wallet.id) {
            case "station":
                return Promise.resolve(station.connect(ConnectType.EXTENSION));
            case "walletconnect":
                return Promise.resolve(station.connect(ConnectType.WALLETCONNECT));
            case "keplr":
                return _connectKeplrWallet(chain as KeplrChain);
            case "metamask":
                return metamask.connect();
            case "phantom":
                return _window.solana?.connect();
            default:
                throw Error(`Unknown wallet with id '${wallet.id}'`);
        }
    }

    const _connectKeplrWallet = async (chain: KeplrChain): Promise<any> => {
        if (chain.keplrChainId === "columbus-5") {
            const terraClassicConfig = terraClassicKeplrConfig();
            await _window.keplr.experimentalSuggestChain(terraClassicConfig);
        }
        else if (chain.keplrChainId === "injective-1") {
            const injectiveConfig = injectiveKeplrConfig();
            await _window.keplr.experimentalSuggestChain(injectiveConfig);
        }

        return _window.keplr.enable(chain.keplrChainId);
    }

    const getAddress = async (wallet: Wallet, chain?: Chain): Promise<string> => {
        switch (wallet.id) {
            case "station":
                return station.wallets[0]?.terraAddress;
            case "walletconnect":
                return station.wallets[0]?.terraAddress;
            case "keplr":
                const keplrChainId = (chain as KeplrChain).keplrChainId;
                const offlineSigner = _window.getOfflineSigner(keplrChainId);
                const accounts = await offlineSigner.getAccounts();
                return accounts[0].address;
            case "metamask":
                return metamask.account as string;
            case "phantom":
                return _window.solana?.publicKey.toString();
            default:
                throw Error(`Unknown wallet with id '${wallet.id}'`);
        }
    }

    const signClaimAllocation = async (
        wallet: Wallet,
        chain: Chain,
        newTerraAddress: string,
        allocationResponse: AllocationResponse
    ): Promise<{ signature: string, signerAddress: string }> => {
        let signature;

        switch (wallet.id) {
            case "station":
            case "walletconnect":
                signature = await _signAddressWithStation(wallet, newTerraAddress, allocationResponse);
                break;
            case "keplr":
                const keplrChainId = (chain as KeplrChain).keplrChainId;
                const response = await _window.keplr.signArbitrary(
                    keplrChainId,
                    await getAddress(wallet, chain),
                    newTerraAddress
                );
                signature = Buffer.from(response.signature, 'base64').toString('hex');
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
            signerAddress: await getAddress(wallet, chain)
        }
    }

    const _signAddressWithStation = async (
        wallet: Wallet, 
        newTerraAddress: string, 
        allocationResponse: AllocationResponse
    ): Promise<string> => {
        console.log(allocationResponse);
        const result = await station.post({
            msgs: [
                new MsgExecuteContract(
                    await getAddress(wallet),
                    process.env.REACT_APP_TERRA_2_CONTRACT_ADDRESS as string,
                    {
                        claim: {
                            allocation: allocationResponse.allocation_string,
                            proofs: allocationResponse.proofs,
                            message: newTerraAddress,
                            signature: newTerraAddress
                        }
                    }
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
        const signedMessage = await _window.solana.signMessage(encodedMessage, "utf8");
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