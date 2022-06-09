import { useWallet } from "@terra-money/wallet-provider"
import { useEffect } from "react"
import useApi from "../../hooks/useApi"
import useWallets from "../../hooks/useWallets"
import { Chain } from "../../models/Chain"
import { Wallet } from "../../models/Wallet"
import "./CheckAllocation.scss"

type CheckAllocationType = {
    wallet: Wallet,
    chain: Chain
}

export const CheckAllocation = (props: CheckAllocationType) => {
    const { wallet, chain } = props;
    const { checkAllocation } = useApi();
    const { status } = useWallet();
    const { getAddress } = useWallets();

    useEffect(() => {
        const init = () => {
            console.log("address - " + getAddress(wallet));
        };
        init();
    },[status]);

    return (
        <div>CheckAllocation</div>
    )
}
