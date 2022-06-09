export type WalletId = 'station' | 'walletconnect' | 'metamask' | 'phantom' | string;
export type Wallet = {
    id: WalletId,
    name: string,
    icon: string,
}

