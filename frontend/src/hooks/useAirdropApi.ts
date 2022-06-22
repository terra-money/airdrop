import { ChainId } from "../models/Chain";
import axios from "axios";
import {
  AllocationResponse,
  ClaimAllocationRequest,
  ClaimAllocationResponse,
  Denom,
} from "../models/Api";

const useAirdropApi = () => {
  const checkAllocation = async (
    chain: ChainId,
    address: string,
    denom: Denom
  ): Promise<AllocationResponse> => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_URL}/allocation/${chain}/${address}/${denom}`
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
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/claim/${chain}/${address}/${denom}`,
      requestData
    );
    return data;
  };

  return {
    checkAllocation,
    claimAllocation,
  };
};

export default useAirdropApi;
