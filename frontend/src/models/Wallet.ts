import { Chain } from "./Chain";

export type WalletId = 'station' | 'walletconnect' | 'keplr' | 'metamask' | 'phantom' | string;

export type Wallet = {
    id: WalletId,
    name: string,
    icon: string,
    chains: Array<Chain>
}

