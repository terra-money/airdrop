import { Alert, Button, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import useAirdropApi from "../../hooks/useAirdropApi";
import useBlockchainApi from "../../hooks/useBlockchainApi";
import useWallets from "../../hooks/useWallets";
import { ClaimAllocationResponse } from "../../models/Api";
import { Chain } from "../../models/Chain";
import { Wallet } from "../../models/Wallet";
import { Loader } from "../Loader";
import DoneAllIcon from "@mui/icons-material/DoneAll"
import "./ClaimAirdrop.scss"

type ClaimAirdropType = {
    wallet: Wallet,
    chain: Chain,
    onClaimAirdropSuccessfully: () => void,
    onCheckAnotherWallet: () => void
}

export const ClaimAirdrop = (props: ClaimAirdropType) => {
    const { wallet, chain, onCheckAnotherWallet, onClaimAirdropSuccessfully } = props;

    const [newTerraAddress, setNewTerraAddress] = useState("");
    const [isValidAccount, setIsValidAccount] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [claimResponse, setClaimResponse] = useState<ClaimAllocationResponse | null>(null);

    const { enqueueSnackbar } = useSnackbar();
    const { signClaimAllocation } = useWallets();
    const { isNewAccount } = useBlockchainApi();
    const { claimAllocation } = useAirdropApi();

    const onChangeAddress = (event: any) => {
        setNewTerraAddress(event.target.value);
        setIsValidAccount(null);
    }

    const onSignTransaction = async () => {
        setLoading(true);

        const isNew = await isNewAccount(newTerraAddress);
        setIsValidAccount(isNew);

        if (isNew) {
            try {
                const { signature, signerAddress } = await signClaimAllocation(wallet, newTerraAddress);

                try {
                    const claimResponse = await claimAllocation(
                        chain.id,
                        signerAddress,
                        { new_terra_address: newTerraAddress, signature }
                    );
                    setClaimResponse(claimResponse);
                    onClaimAirdropSuccessfully();
                }
                catch (e : any) {
                    if (e?.response?.data?.message) {
                        setClaimResponse({
                            message: e?.response?.data?.message
                        })
                    }
                    else {
                        setClaimResponse({
                            message: "Something went wrong claiming the airdrop. Try again or"
                        })
                    }
                    
                    enqueueSnackbar("Something went wrong claiming the airdrop. Try again", { variant: "error" });
                }
            }
            catch (e) {
                enqueueSnackbar("Something went wrong signing the transaction. Try again", { variant: "error" });
            }
        }

        setLoading(false);
    };

    return (
        <div className="ClaimAirdropWrapper">
            {!loading
                ? <>{claimResponse === null
                    ? <div className="ClaimForm">
                        <h4 className="ClaimAirdropTitle">
                            Define a Terra 2 address to collect the tokens. <br />
                            This address must be new (without previous transactions)
                        </h4>

                        <TextField className="ClaimAddressInput"
                            value={newTerraAddress}
                            label="New Terra 2 address"
                            placeholder="terra..."
                            onChange={onChangeAddress}
                            variant="outlined"
                            error={isValidAccount === false} />

                        {isValidAccount === false && <>
                            <Alert className="ClaimAddressAlert"
                                severity="error">
                                <div>This address is invalid, use a different address</div>
                                <a className="AlertLink"
                                    href={`https://finder.terra.money/mainnet/address/${newTerraAddress}`}
                                    target="_blank"
                                    rel="noreferrer">
                                    <div className="AlertText">Check address in Finder</div>
                                    <div className="icon external-link"></div>
                                </a>
                            </Alert>
                        </>}

                        <Button
                            disabled={!newTerraAddress}
                            variant="outlined"
                            onClick={() => onSignTransaction()}>
                            Sign transaction and claim airdrop
                        </Button>
                    </div>
                    : <div className="ClaimAllocationResult">
                        {!claimResponse?.message
                            ? <>
                                <DoneAllIcon className="AllocationIcon success" />
                                <h4>Airdrop claimed, transaction is being broadcasted</h4>
                                <h3>
                                    <a href={`https://finder.terra.money/mainnet/address/${newTerraAddress}`}
                                        target="_blank"
                                        rel="noreferrer"> Check your address in Finder
                                    </a>
                                    <div className="icon external-link"></div>
                                </h3>

                                <Button variant="outlined"
                                    onClick={() => onCheckAnotherWallet()}>
                                    Check another address
                                </Button>
                            </>
                            : <>
                                <h4>{claimResponse.message}</h4>
                                <h3>
                                    <a href="https://discord.com/invite/sTmERSFnYW"
                                        target="_blank"
                                        rel="noreferrer">
                                        Check Terra 2 Discord for help
                                    </a>
                                    <div className="icon external-link"></div>
                                </h3>
                            </>
                        }
                    </div>}
                </>
                : <div className="LoadingAllocation">
                    <Loader bottomElement={<h4 className="ClaimAirdropTitle">Claiming airdrop</h4>} />
                </div>}
        </div>
    )
}
