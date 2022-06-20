import { ChainId } from "../models/Chain";
import axios from "axios";
import {
  AllocationResponse,
  ClaimAllocationRequest,
  ClaimAllocationResponse,
} from "../models/Api";

const useAirdropApi = () => {
  const checkAllocation = async (
    chain: ChainId,
    address: string
  ): Promise<AllocationResponse> => {
    console.log(process.env);
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_URL}/allocation/${chain}/${address}`
    );
    data.allocation = Number(data.allocation);
    return data;
  };

  const claimAllocation = async (
    chain: ChainId,
    address: string,
    requestData: ClaimAllocationRequest
  ): Promise<ClaimAllocationResponse> => {
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/claim/${chain}/${address}`,
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
