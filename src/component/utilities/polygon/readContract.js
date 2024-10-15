import { ethers } from "ethers";
import { ddwapp_abi, app_token_abi, ddw_token_abi, chainlink_abi } from "../../../resources/abipolygon";

export const providers = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_URL);
export const app_read_contract = new ethers.Contract(process.env.REACT_APP_DDWAPP_CONTRACT_ADDRESS, ddwapp_abi, providers);
export const ddw_token_read_contract = new ethers.Contract(process.env.REACT_APP_DDWTOKEN_CONTRACT_ADDRESS, ddw_token_abi, providers);
export const app_token_read_contract = new ethers.Contract(process.env.REACT_APP_APPTOKEN_CONTRACT_ADDRESS, app_token_abi, providers);
export const chainlink_read_contract = new ethers.Contract(process.env.REACT_APP_CHAINLINK_CONTRACT_ADDRESS, chainlink_abi, providers);