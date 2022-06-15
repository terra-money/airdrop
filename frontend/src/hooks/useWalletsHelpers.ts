import { Bech32Address } from "@keplr-wallet/cosmos";

const useWalletsHelpers = () => {

    const terraClassicKeplrConfig = () => {
        return {
            rpc: "https://rpc-columbus.keplr.app",
            rest: "https://lcd-columbus.keplr.app",
            chainId: "columbus-5",
            chainName: "Terra Classic",
            bip44: {
                coinType: 330,
            },
            bech32Config: Bech32Address.defaultBech32Config("terra"),
            currencies: [{
                coinDenom: "LUNC",
                coinMinimalDenom: "uluna",
                coinDecimals: 6,
                coinGeckoId: "terra-luna"
            }],
            feeCurrencies: [{
                coinDenom: "LUNC",
                coinMinimalDenom: "uluna",
                coinDecimals: 6,
                coinGeckoId: "terra-luna",
            }],
            stakeCurrency: {
                coinDenom: "LUNC",
                coinMinimalDenom: "uluna",
                coinDecimals: 6,
                coinGeckoId: "terra-luna"
            },
            gasPriceStep: {
                low: 5.665,
                average: 5.665,
                high: 10,
            },
            explorerUrlToTx: "https://finder.terra.money/columbus-5/tx/{txHash}",
        };
    }

    return {
        terraClassicKeplrConfig
    }
}

export default useWalletsHelpers;