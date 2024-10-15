import { ethers } from 'ethers';
import { React, useState } from 'react'
import { isWalletCorrect, signAndSubmitTransaction } from './utilities/aptos';
import { isPolygonWalletCorrect } from './utilities/contract';
import { chainlink_read_contract } from './utilities/polygon/readContract';
import { createDDWAppWriteContract, createChainlinkWriteContract } from './utilities/polygon/writeContract';


const ApprovalToken = (props) => {
    const [amount, setAmount] = useState();

    const handleChange = (e) => {
        setAmount(e.target.value);
    }
    const sendChange = async (e) => {
        e.preventDefault();
        if(!Number.isInteger(parseInt(amount))){
            alert("Enter correct number in the field");
            return}
        if(props.blockchain === "aptos") {
            var isItRightWallet = await isWalletCorrect(props.userWallet);
            if(!isItRightWallet) {
                alert(`Wrong Wallet. You should switch to ${props.userWallet}`);
                return;
            }
            var trans_res = await signAndSubmitTransaction(
                {
                    type: "entry_function_payload",
                    function: `${process.env.REACT_APP_APTOS_CONTRACT_OWNER}::DDWApp::exchange_approval_and_claim_coin`,
                    arguments: [parseInt(amount)],
                    type_arguments: [],
                }
            )
            if(!trans_res.transactionSubmitted) return;
        }
        else if(props.blockchain === "metamask") {
            var isItRightWallet = await isPolygonWalletCorrect(props.userWallet);
            if(!isItRightWallet) {
                alert(`Wrong Wallet. You should switch to ${props.userWallet}`);
                return;
            }
            var Contract = createChainlinkWriteContract();
            try {
                let nftTx = await Contract.requestVolumeData();
                console.log("Mining....", nftTx.hash);
                } catch (error) {
                console.log("Error Chainlink Req Data", error);
                return;
                }
            alert("Requested for the Current APP/DDW Xchange Data. It might take sometime to update the Data!");
            Contract = createDDWAppWriteContract();
            try {
                let nftTx = await Contract.exchange_approval_and_claim_coin(ethers.utils.parseEther(amount));
                let xr_rate = await chainlink_read_contract.APPROVAL_TO_COIN_XR_RATE();
                alert(`You Claimed the tokens at ${xr_rate} DDW per APP!`);
                console.log("Mining....", nftTx.hash);
                } catch (error) {
                console.log("Error APP token xchange", error);
                return;
                }
        }
        document.getElementById("inputVal").value = "";
        setAmount("");
        alert("Tokens Claimed");

    }

    return (
        <>
        {/* <form id='formVal'>
  <label id='labelVal'>
    <input id = "inputVal"  className="inputVal" name="claimableAmt" onChange={handleChange} type="text" placeholder="Enter Approval Token Amount"/>
    <span>Enter Approval Token Amount</span>
  </label>
 
  <input onClick={sendChange} type="submit" value="Claim"/>
</form> */}

<div className='container'>
  <form action="/action_page.php">
    <label for="fname">First Name</label>
    <input type="text" name="claimableAmt" onChange={handleChange} placeholder="Enter Approval Token Amount"/>  
    <input onClick={sendChange} type="submit" value="Claim"/>
  </form>
</div>

</>
    )
}

export default ApprovalToken