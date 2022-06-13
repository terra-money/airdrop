import axios from 'axios';

const useBlockchainApi = () => {

    const isNewAccount = async (address: String): Promise<boolean> => {
        try {
            const { data } = await axios.get(`https://phoenix-lcd.terra.dev/auth/accounts/${address}`);
            return data.height === "0";
        }
        catch(e) {
            return false;
        }
    }

    return { isNewAccount }
}

export default useBlockchainApi;