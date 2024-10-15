import {AptosClient, AptosAccount} from 'aptos';

const client = new AptosClient(process.env.REACT_APP_DEVNET_URL);

export const getAptosWallet = () => {
  return "aptos" in window;
};

export const isWalletConnected = async () => {
  try {
    if (await window.aptos?.isConnected?.()) {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
  return false;
};

export const isAccountCreated = async () => {
  try {
    const res = await window.aptos?.isConnected?.();
    // if there is an account we are getting a true/false response else we are getting an object type response
    return typeof res === "boolean";
  } catch (error) {
    console.log(error);
  }
  return false;
};

export const connectToWallet = async () => {
  try {
    const result = await window.aptos?.connect?.();
    if ("address" in result) return true;
  } catch (error) {
    console.log(error);
  }
  return false;
};

export const getAccountAddress = async () => {
  try {
    const data = await window.aptos?.account?.();
    if ("address" in data) return data.address;
  } catch (error) {
    console.log(error);
  }
  return null;
};

export const getWalletNetwork = async () => {
  try {
    return await window.aptos?.network?.();
  } catch (error) {
    console.log(error);
  }
  return "Devnet"; // default wallet network
};

export const isUpdatedVersion = () =>
  window.aptos?.on instanceof Function;

export const signAndSubmitTransaction = async (
  transactionPayload
) => {
  const responseOnError = {
    transactionSubmitted: false,
    message: "Unknown Error",
  };
  try {
    const response = await window.aptos?.signAndSubmitTransaction?.(
      transactionPayload,
    );
    // transaction succeed
    if ("hash" in response) {
      await client.waitForTransaction(response["hash"]);
      return {
        transactionSubmitted: true,
        transactionHash: response["hash"],
      };
    }
    // transaction failed
    return {...responseOnError, message: response.message};
  } catch (error) {
    if (typeof error == "object" && "message" in error) {
      responseOnError.message = error.message;
    }
  }
  return responseOnError;
};

export const checkAndGetAccountAddress = async () => {
  if(!getAptosWallet()) {
      alert("Install Aptos Wallet");
      return null;
    }
    if(!connectToWallet()) return null;
    let network = await getWalletNetwork();
    if(network!=="Devnet") {
        alert("Switch to devnet in Aptos");
        return null;
    }
    let accountAddress = await getAccountAddress();

    if(!accountAddress) return null;

    return accountAddress;

}

export const isWalletCorrect = async (walletAddress) => {
  var address = await checkAndGetAccountAddress();
  return walletAddress === address;
}

export const getResourceType = async (aptosAddress, resourceType) => {
  try {return await client.getAccountResource(aptosAddress, resourceType);}
  catch(error) {
    console.log(error);
    return;
  }
}
