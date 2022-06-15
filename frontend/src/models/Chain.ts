export type ChainId = 'terraclassic' | 'eth' | 'avax' | 'sol' | "axl" | "injective" | "juno" | "kava" | string;
export type keplrChainId = "columbus-5" | "axelar-dojo-1" | "injective-1" | "juno-1" | "kava_2222-10";

export type Chain = {
    id: ChainId,
    name: string,
    icon: string
}

export interface KeplrChain extends Chain {
    keplrChainId: keplrChainId
}
