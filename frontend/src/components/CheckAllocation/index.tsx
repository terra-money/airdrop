import { useEffect, useState } from "react"
import useAirdropApi from "../../hooks/useAirdropApi"
import useWallets from "../../hooks/useWallets"
import { AllocationResponse } from "../../models/Api"
import { Chain } from "../../models/Chain"
import { Wallet } from "../../models/Wallet"
import { Loader } from "../Loader"
import "./CheckAllocation.scss"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { Button } from "@mui/material"

type CheckAllocationType = {
    wallet: Wallet,
    chain: Chain,
    onCollectAllocation: (allocationResponse: AllocationResponse) => void
}

export const CheckAllocation = (props: CheckAllocationType) => {
    const { wallet, chain, onCollectAllocation } = props;

    const [address, setAddress] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [allocationResponse, setAllocationResponse] = useState<AllocationResponse>();

    const { checkAllocation } = useAirdropApi();
    const { getAddress } = useWallets();

    useEffect(() => {
        const init = async () => {
            const address = await getAddress(wallet, chain);
            setAddress(address);
            try {
                const allocationResponse = await checkAllocation(chain.id, address);
                setAllocationResponse(allocationResponse);
            }
            catch (e: any) {
                if (e?.response?.data?.message) {
                    setAllocationResponse({
                        message: e?.response?.data?.message
                    });
                }
                else {
                    setAllocationResponse({
                        message: "Unexpected error"
                    });
                }
            }
            setLoading(false);
        };
        init();
    }, [chain, wallet]);

    return (
        <div className="CheckAllocationWrapper">
            {!loading
                ? <div className="AllocationBody">
                    {allocationResponse?.has_claimed
                        ? <>
                            <DoneAllIcon className="AllocationIcon success" />
                            <h4>The corresponding airdrop of</h4>
                            <h3>{allocationResponse.allocation} LUNA</h3>
                            <h4>was already processed for address</h4>
                            <h3>{address}</h3>
                        </>
                        : <>
                            {!!allocationResponse?.allocation && !allocationResponse?.message && <>
                                <InfoOutlinedIcon className="AllocationIcon info" />
                                <h4>There is</h4>
                                <h3>{allocationResponse?.allocation} LUNA</h3>
                                <h4>to be claimed for address</h4>
                                <h3>{address}</h3>
                                <Button variant="outlined"
                                    fullWidth
                                    onClick={() => onCollectAllocation(allocationResponse)}>
                                    Claim airdrop
                                </Button>
                            </>}

                            {!allocationResponse?.allocation && !allocationResponse?.message && <>
                                <ErrorOutlineIcon className="AllocationIcon error" />
                                <h4>There is no airdrop to be claimed for address</h4>
                                <h3>{address}</h3>
                                <h4>from chain</h4>
                                <h3>{chain.name}</h3>
                            </>}
                        </>}

                    {allocationResponse?.message && <div className="AllocationError">
                        <h4>{allocationResponse.message}</h4>
                        <h3>
                            <a href="https://discord.com/invite/sTmERSFnYW"
                                target="_blank"
                                rel="noreferrer">
                                Check Terra 2 Discord for help
                            </a>
                            <div className="icon external-link"></div>
                        </h3>
                    </div>}
                </div>
                : <div className="LoadingAllocation">
                    <Loader bottomElement={<>
                        <h4>Checking airdrop for address</h4>
                        <h3>{address}</h3>
                        <h4>from chain</h4>
                        <h3>{chain.name}</h3>
                    </>} />
                </div>}
        </div>
    )
}
