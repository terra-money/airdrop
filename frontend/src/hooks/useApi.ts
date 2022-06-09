import { ChainId } from "../models/Chain";
import axios from 'axios';
import { AllocationResponse, ClaimAllocationRequest, ClaimAllocationResponse } from "../models/Api";

const useApi = () => {

    const checkAllocation = async (
        chain: ChainId, 
        address: string
    ): Promise<AllocationResponse> => {
        const { data } = await axios.get(`/allocations/${chain}/${address}`);
        return data;
    }

    const claimAllocation = async (
        chain: ChainId, 
        address: string,
        requestData: ClaimAllocationRequest
    ): Promise<ClaimAllocationResponse> => {
        const { data } = await axios.post(`/claim/${chain}/${address}`, requestData);
        return data;
    }

    return {
        checkAllocation,
        claimAllocation
    }
}

export default useApi;