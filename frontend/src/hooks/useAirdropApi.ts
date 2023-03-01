import { ChainId } from "../models/Chain";
import axios from "axios";
import {
  AllocationResponse,
  ClaimAllocationRequest,
  ClaimAllocationResponse,
  Denom,
} from "../models/Api";
import useWallets from "./useWallets";

const useAirdropApi = () => {
  const { isStationConnectedToMainnent } = useWallets();

  const checkAllocation = async (
    chain: ChainId,
    address: string,
    denom: Denom
  ): Promise<AllocationResponse> => {
    const API_URL = _getApiUrl();
    const { data } = await axios.get(
      `${API_URL}/allocation/${chain}/${address}/${denom}`
    );
    data.allocation = Number(data.allocation);
    return data;
  };

  const claimAllocation = async (
    chain: ChainId,
    address: string,
    denom: Denom,
    requestData: ClaimAllocationRequest
  ): Promise<ClaimAllocationResponse> => {
    const API_URL = _getApiUrl();
    const { data } = await axios.post(
      `${API_URL}/claim/${chain}/${address}/${denom}`,
      requestData
    );
    return data;
  };

  const _getApiUrl = () => {
    return isStationConnectedToMainnent()
      ? process.env.REACT_APP_PHOENIX_API_URL as string
      : process.env.REACT_APP_PISCO_API_URL as string;
  }

  return {
    checkAllocation,
    claimAllocation,
  };
};

export default useAirdropApi;
