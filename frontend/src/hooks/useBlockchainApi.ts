import axios from "axios";
import { decode } from "bech32";

const useBlockchainApi = () => {
  const isNewValidAccount = async (address: string): Promise<boolean> => {
    try {
      const { prefix: decodedPrefix } = decode(address);
      const { data } = await axios.get(
        `https://phoenix-lcd.terra.dev/cosmos/auth/v1beta1/accounts/${address}`
      );
      return data.height === "0" && decodedPrefix === "terra";
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const message: string = (e.response?.data as any)?.message || "";
        return message.includes("key not found");
      }
      return false;
    }
  };

  return { isNewValidAccount };
};

export default useBlockchainApi;
