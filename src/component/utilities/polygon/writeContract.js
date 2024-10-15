import { ethers } from "ethers";
import { ddwapp_abi, ddw_token_abi, chainlink_abi } from "../../../resources/abipolygon";

export const createDDWAppWriteContract = () => {
    try {
        const { ethereum } = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner()
            const Contract = new ethers.Contract(
                process.env.REACT_APP_DDWAPP_CONTRACT_ADDRESS,
                ddwapp_abi,
                signer
            );
            return Contract;
        } else {
            console.log("Ethereum object doesn't exist!");
        }
    } catch (error) {
        console.log('write contract', error);
    }
};

export const createDDWTokenWriteContract = () => {
    try {
        const { ethereum } = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner()
            const Contract = new ethers.Contract(
                process.env.REACT_APP_DDWTOKEN_CONTRACT_ADDRESS,
                ddw_token_abi,
                signer
            );
            return Contract;
        } else {
            console.log("Ethereum object doesn't exist!");
        }
    } catch (error) {
        console.log('write contract', error);
    }
};

export const createChainlinkWriteContract = () => {
    try {
        const { ethereum } = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner()
            const Contract = new ethers.Contract(
                process.env.REACT_APP_CHAINLINK_CONTRACT_ADDRESS,
                chainlink_abi,
                signer
            );
            return Contract;
        } else {
            console.log("Ethereum object doesn't exist!");
        }
    } catch (error) {
        console.log('write contract', error);
    }
};
