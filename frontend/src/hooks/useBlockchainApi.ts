import axios from 'axios';
import { decode } from 'bech32';

const useBlockchainApi = () => {

    const isNewValidAccount = async (address: string): Promise<boolean> => {
        try {
            const { prefix: decodedPrefix } = decode(address)
            const { data } = await axios.get(`https://phoenix-lcd.terra.dev/auth/accounts/${address}`);
            return data.height === "0" && decodedPrefix === "terra";
        }
        catch(e) {
            return false;
        }
    }

    return { isNewValidAccount }
}

export default useBlockchainApi;