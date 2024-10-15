import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

export const checkCorrectNetwork = async () => {
  const provider = await detectEthereumProvider();
    if (provider.networkVersion !== parseInt(process.env.REACT_APP_CHAIN_ID)) {
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ethers.utils.hexValue(parseInt(process.env.REACT_APP_CHAIN_ID)) }],
        });
      } catch (err) {
        if (err.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainName: process.env.REACT_APP_CHAIN_NAME,
                chainId: ethers.utils.hexValue(parseInt(process.env.REACT_APP_CHAIN_ID)),
                nativeCurrency: { name: "MATIC", decimals: 18, symbol: "MATIC" },
                rpcUrls: [process.env.REACT_APP_RPC_URL],
              },
            ],
          });
        }
      }
    }
  };

  export const ConnectWalletHandler = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      let addresses = await provider.request({
        method: "eth_requestAccounts",
      });
      let userBalance = await getUserBalance(addresses[0]);
      return [addresses[0], userBalance];
    }
    else {
      alert("Install MetaMask")
      return ["0x0000000000000000000000000000000000000000","0x0"]
    }
  };

  export const accountChangeHandler = async (newAccount) => {
    return newAccount[0];
  };
  export const getUserBalance = async (address) => {
    const provider = await detectEthereumProvider();
    return await provider.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });
  };
  export const chainChangedHandler = () => {
    window.location.reload();
  };

  export const checkAndGetPolygonAddress = async () => {
    await checkCorrectNetwork();
    var returnValue = await ConnectWalletHandler();
    if(returnValue[0])
    return returnValue[0];
    else 
    return null;
  }

  export const isPolygonWalletCorrect = async (walletAddress) => {
    var address = await checkAndGetPolygonAddress();
    return walletAddress === address;

  }