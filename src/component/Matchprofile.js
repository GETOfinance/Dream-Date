import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Matchelement from './MatchElement/Matchelement';
import "./MatchProfile.css"
import TypeWriter from './TypeWriter/TypeWriter';
import axios from 'axios';
import { isWalletCorrect, signAndSubmitTransaction } from './utilities/aptos';
import SwipeButton from './SwipeButton/SwipeButton.js'
import { isPolygonWalletCorrect } from './utilities/contract';
import { createDDWAppWriteContract, createDDWTokenWriteContract } from './utilities/polygon/writeContract';
import { app_read_contract } from './utilities/polygon/readContract';

const Matchprofile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [matchDetails, setMatchDetails] = useState(location.state.matchData);
    const [userDetails, setuserDetails] = useState(location.state.userDetails);
    const [VCTime, setVCTime] = useState(0);

    const handleTimeEntry = async (e) => {
        setVCTime(e.target.value);
    }

    const startVC = async () => {
        if(!Number.isInteger(parseInt(VCTime))){
        alert("Enter correct number in the field");
        return}
        if(userDetails.blockchain === "aptos") {
            var isItRightWallet = await isWalletCorrect(userDetails.wallet);
            if(!isItRightWallet) {
                alert(`Wrong Wallet. You should switch to ${userDetails.wallet}`);
                return;
            }
            var trans_res = await signAndSubmitTransaction(
                {
                    type: "entry_function_payload",
                    function: `${process.env.REACT_APP_APTOS_CONTRACT_OWNER}::DDWApp::create_private_space_on_chain`,
                    arguments: [matchDetails.wallet, parseInt(VCTime)],
                    type_arguments: [],
                }
            )
            if(!trans_res.transactionSubmitted) return;
        }
        else if(userDetails.blockchain === "metamask") {
            var isItRightWallet = await isPolygonWalletCorrect(userDetails.wallet);
            if(!isItRightWallet) {
                alert(`Wrong Wallet. You should switch to ${userDetails.wallet}`);
                return;
            }
            var DDWContract = createDDWTokenWriteContract();
            try {
                let COINS_PER_MIN = await app_read_contract.COINS_PER_MINUTE_OF_PRIVATE_SPACE();
                let nftTx = await DDWContract.increaseAllowance(process.env.REACT_APP_DDWAPP_CONTRACT_ADDRESS, COINS_PER_MIN.mul(parseInt(VCTime)));
                console.log("Mining....", nftTx.hash);
                } catch (error) {
                console.log("Error increase allowance", error);
                return;
                }
            var Contract = createDDWAppWriteContract();
            try {
                let nftTx = await Contract.create_private_space_on_chain(matchDetails.wallet, parseInt(VCTime));
                console.log("Mining....", nftTx.hash);
                } catch (error) {
                console.log("Error create private space", error);
                return;
                }
        }
        var postData = {
            content: `CreatePrivateSpace ${matchDetails.Id} ${userDetails.id} ${VCTime}`,
            username: "Webhook Message Sender",
            avatarURL: "foo.png"
      
          }
          var res = await axios.post(process.env.REACT_APP_DISCORD_WEBHOOK_URL, postData, 
            {headers: {
              'Content-Type': 'application/json'
            }})
          console.log(res.status);
          document.getElementById("VCTime").value = "";
          setVCTime("")
          alert("Private VC Created, check the Discord Server ;)");
    }
    return (
        <div className='containerMarginTop1' style={{overflowY: "scroll"}}>
            <div className='containerMarginTop'>
                <Matchelement key={matchDetails.id} name={matchDetails.name} src={matchDetails.src} lastseen={matchDetails.lastseen} onClick={["", console.log]} />
            </div>
            <div>
                <div className='UserDetails'>
                    <div>
                        <label htmlFor="">
                        <TypeWriter text = {`Interest = ${matchDetails.interest.join(', ')}`}/>
                        </label>
                    </div>

                    <div>


                        <label htmlFor="">
                        <TypeWriter text = {`Bio = ${matchDetails.bio}`}/>
                            
                        </label>
                    </div>

                    <div>


                        <label htmlFor="">
                        <TypeWriter text = {`Gender = ${matchDetails.gender}`}/>
                        </label>
                    </div>
                </div>

                <label htmlFor="Time Entry" style={{fontFamily:"Oswald, sans-serif"}}>
                     <TypeWriter text = "Enter Duration Of Your VC in minutes:"/>
                     
                     <input style={{width:"200px"}} type="text" id="VCTime" className="vcInput" onChange={handleTimeEntry}/>
                </label>
                <div style={{marginRight: "15px", marginTop:"15px"}}>
                <SwipeButton text = "Start Your VC" className='buttonMargin' onClick={startVC}/>
                </div>
            </div>

            <div style={{margin: "20px"}}>
            <SwipeButton text = "Back" className='buttonMargin' onClick={(e) => navigate('/Userdashboard', {state: {userDetails: userDetails, imageSrc: location.state.imageSrc}})} style={{ margin: "10px" }}/>
            </div>
        </div>
    )
}

export default Matchprofile