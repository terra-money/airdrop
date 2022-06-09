import { Wallet } from "./Wallet";

export type ChainId = 'terraclassic' | 'eth' | 'avax' | 'sol' | string;
export type Chain = {
    id: ChainId,
    name: string,
    icon: string,
    wallets: Array<Wallet>
}