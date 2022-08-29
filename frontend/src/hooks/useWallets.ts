import { useMetaMask } from "metamask-react";
import { ConnectType, useWallet } from "@terra-money/wallet-provider";
import { Wallet } from "../models/Wallet";
import { Chain, KeplrChain } from "../models/Chain";
import { ethers } from 'ethers';
import { MsgExecuteContract } from "@terra-money/terra.js";
import useWalletsHelpers from "./useWalletsHelpers";
import { AllocationResponse } from "../models/Api";
import { decode } from "bech32";
import { useLCDClient } from '@terra-money/wallet-provider';

const useWallets = () => {
    const { terraClassicKeplrConfig, injectiveKeplrConfig } = useWalletsHelpers();
    const lcd = useLCDClient();
    const metamask = useMetaMask();
    const station = useWallet();
    const _window: any = window;

    const isInstalled = (wallet: Wallet): boolean => {
        switch (wallet.id) {
            case "station":
                return !!station.availableConnectTypes.find(connectType => connectType === ConnectType.EXTENSION);
            case "stationmobile":
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
            case "stationmobile":
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
            case "stationmobile":
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

    const disconnectStation = () => {
        return station?.disconnect();
    }

    /**
        * This method uses the LCD implemented into Wallet Provider 
        * validate if the account exist in the selected network. 
        * This way the frontend can be tested with both mainnet or testnet.
        * e.g.: if you have selected testnet in Terra Station it will point to the testnet
        */
    const isNewValidAccount = async (address: string): Promise<boolean> => {
        let decodedAddress;
        try {
            // This check is done to avoid users spamming
            // the API with invalid addresses 
            decodedAddress = decode(address);
        }
        catch (e) {
            return false;
        }

        if (decodedAddress.prefix === "terra") {
            try {
                // If this request return a status code 200, means 
                // that the account exist in the selected network
                await lcd.auth.accountInfo(address);
                return false;
            }
            catch (e: any) {
                // To increase the method validity a check to the code 5 
                // must be done which means that the account is NotFound.
                // e.g.:https://phoenix-lcd.terra.dev/cosmos/auth/v1beta1/accounts/terra1zdpgj8am5nqqvht927k3etljyl6a52kwqup0je
                return e.response?.data?.code === 5;
            };
        }
        return false;
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
            case "stationmobile":
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
            case "stationmobile":
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

    const isStationConnectedToMainnent = () => {
        return station.network.name === 'mainnet';
    }

    const _signAddressWithStation = async (
        wallet: Wallet,
        newTerraAddress: string,
        allocationResponse: AllocationResponse
    ): Promise<string> => {
        const CONTRACT_ADDRESS = isStationConnectedToMainnent()
            ? process.env.REACT_APP_PHOENIX_CONTRACT_ADDRESS as string
            : process.env.REACT_APP_PISCO_CONTRACT_ADDRESS as string;

        const result = await station.post({
            msgs: [
                new MsgExecuteContract(
                    await getAddress(wallet),
                    CONTRACT_ADDRESS,
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
        isNewValidAccount,
        isStationConnectedToMainnent,
        connect,
        disconnectStation,
        getAddress,
        signClaimAllocation
    }
}

export default useWallets;