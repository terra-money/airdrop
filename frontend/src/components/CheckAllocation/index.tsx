import { useEffect, useState } from "react";
import useAirdropApi from "../../hooks/useAirdropApi";
import useWallets from "../../hooks/useWallets";
import { AllocationResponse } from "../../models/Api";
import { Chain } from "../../models/Chain";
import { Wallet } from "../../models/Wallet";
import { Loader } from "../Loader";
import "./CheckAllocation.scss";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Button } from "@mui/material";

type CheckAllocationType = {
  wallet: Wallet;
  chain: Chain;
  onCollectAllocation: (allocationResponse: AllocationResponse) => void;
};

export const CheckAllocation = (props: CheckAllocationType) => {
  const { wallet, chain, onCollectAllocation } = props;

  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [allocationResponse, setAllocationResponse] =
    useState<AllocationResponse>();

  const { checkAllocation } = useAirdropApi();
  const { getAddress } = useWallets();

  useEffect(() => {
    const init = async () => {
      try {
        const address = await getAddress(wallet, chain);
        setAddress(address);
        const allocationResponse = await checkAllocation(
          chain.id,
          address,
          "uluna"
        );
        setAllocationResponse(allocationResponse);
      } catch (e: any) {
        if (e?.response?.data?.message) {
          setAllocationResponse({
            message: e?.response?.data?.message,
          });
        } else {
          setAllocationResponse({
            message: "Unexpected error",
          });
        }
      }
      setLoading(false);
    };
    init();
  }, [
    chain,
    wallet,
    setAddress,
  ]);

  const parseAllocationRow = (allocationResponse: AllocationResponse) => {
    const allocation = Number(allocationResponse.allocation) / 10 ** 6;

    switch (allocationResponse.denom) {
      case "uluna":
        return `${allocation} LUNA`;
      case "usdc":
        return `${allocation} USDC`;
    }
  };

  return (
    <div className="CheckAllocationWrapper">
      {!loading ? (
        <div className="AllocationBody">
          {allocationResponse?.has_claimed ? (
            <>
              <DoneAllIcon className="AllocationIcon success" />
              <h5>The corresponding airdrop of</h5>
              <h4>{parseAllocationRow(allocationResponse)} LUNA</h4>
              <h5>was already processed for address</h5>
              <h4>{address}</h4>
            </>
          ) : (
            <>
              {!!allocationResponse?.allocation &&
                !allocationResponse?.message && (
                  <>
                    <InfoOutlinedIcon className="AllocationIcon info" />
                    <h5>There is</h5>
                    <h4>{parseAllocationRow(allocationResponse)}</h4>
                    <h5>to be claimed for</h5>
                    <h4>{address}</h4>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => onCollectAllocation(allocationResponse)}
                    >
                      Claim airdrop
                    </Button>
                  </>
                )}

              {!allocationResponse?.allocation && !allocationResponse?.message && (
                <>
                  <ErrorOutlineIcon className="AllocationIcon error" />
                  <h5>There is no airdrop to be claimed for address</h5>
                  <h4>{address}</h4>
                  <h5>from chain</h5>
                  <h4>{chain.name}</h4>
                </>
              )}
            </>
          )}

          {allocationResponse?.message && (
            <div className="AllocationError">
              <h5>{allocationResponse.message}</h5>
              <h4>
                <a
                  href="https://discord.com/invite/sTmERSFnYW"
                  target="_blank"
                  rel="noreferrer"
                >
                  Check Terra 2 Discord for help
                </a>
                <div className="icon external-link"></div>
              </h4>
            </div>
          )}
        </div>
      ) : (
        <div className="LoadingAllocation">
          <Loader
            bottomElement={
              <>
                <h5>Checking airdrop for address</h5>
                <h4>{address}</h4>
                <h5>from chain</h5>
                <h4>{chain.name}</h4>
              </>
            }
          />
        </div>
      )}
    </div>
  );
};
