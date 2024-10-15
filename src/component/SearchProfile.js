import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from './Button/Button';
import Matchelement from './MatchElement/Matchelement';
import SwipeButton from './SwipeButton/SwipeButton';
import TypeWriter from './TypeWriter/TypeWriter';
import "./SearchProfile.css"
import { isWalletCorrect, signAndSubmitTransaction } from './utilities/aptos';
import { isPolygonWalletCorrect } from './utilities/contract';
import { createDDWAppWriteContract } from './utilities/polygon/writeContract';


const SearchProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchDetails, setSearchDetails] = useState(location.state.searchData);
    const [userDetails, setuserDetails] = useState(location.state.userDetails);
    const [classNameValue, setClassNameValue] = useState("")

    const handleClassNameValueLike = () =>{
        setClassNameValue("rotateProfileElement")
    }
    const handleClassNameValueSuperLike = () => {
        setClassNameValue("rotateProfileElementEaseInOut")
    }

    const onLike = async() => {
        if(userDetails.blockchain === "aptos") {
            var isItRightWallet = await isWalletCorrect(userDetails.wallet);
            if(!isItRightWallet) {
                alert(`Wrong Wallet. You should switch to ${userDetails.wallet}`);
                return;
            }
            var trans_res = await signAndSubmitTransaction(
                {
                    type: "entry_function_payload",
                    function: `${process.env.REACT_APP_APTOS_CONTRACT_OWNER}::DDWApp::like_on_chain`,
                    arguments: [searchDetails.wallet],
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
            var Contract = createDDWAppWriteContract();
            try {
                let nftTx = await Contract.like_on_chain(searchDetails.wallet);
                console.log("Mining....", nftTx.hash);
                } catch (error) {
                console.log("Error like on chain", error);
                return;
                }
        }
        alert("Liked, now see if they like you back ;)");
        navigate('/Userdashboard', {state: {userDetails: userDetails, imageSrc: location.state.imageSrc}});

    }

    const onSuperLike = async() => {
        if(userDetails.blockchain === "aptos") {
            var isItRightWallet = await isWalletCorrect(userDetails.wallet);
            if(!isItRightWallet) {
                alert(`Wrong Wallet. You should switch to ${userDetails.wallet}`);
                return;
            }
            var trans_res = await signAndSubmitTransaction(
                {
                    type: "entry_function_payload",
                    function: `${process.env.REACT_APP_APTOS_CONTRACT_OWNER}::DDWApp::super_like_on_chain`,
                    arguments: [searchDetails.wallet],
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
            var Contract = createDDWAppWriteContract();
            try {
                let nftTx = await Contract.super_like_on_chain(searchDetails.wallet);
                console.log("Mining....", nftTx.hash);
                } catch (error) {
                console.log("Error like on chain", error);
                return;
                }
        }
        alert("Super Liked, now see if they like you back ;)");
        navigate('/Userdashboard', {state: {userDetails: userDetails, imageSrc: location.state.imageSrc}});

    }
    return (
        <div style={{background: "black", height : "100vh", width : "100vw" ,  overflowY: "scroll"}}>
            <div style={{ position: "relative", paddingBottom: "10px", paddingTop: "4px" }} >
            <Matchelement className={classNameValue} key={"fake ID"} name={searchDetails.name} src={searchDetails.src}
             lastseen={""} onClick={["", console.log]}  />
            </div>

            <div className='UserDetails'>
                <TypeWriter text = {`Interest : ${searchDetails.interest.join(", ")}`}>
                </TypeWriter>

                <TypeWriter text = {`Bio : ${searchDetails.bio}`}>
                        
                </TypeWriter>

                <TypeWriter text = {`Gender : ${searchDetails.gender}`} >
                </TypeWriter>
            </div>
            <div style={{display : "flex"}}>
                <SwipeButton onClick = {() => {handleClassNameValueLike(); onLike();}} text = "Like"/> 
                <SwipeButton onClick = {() => {handleClassNameValueSuperLike(); onSuperLike();}} text = "Super Like"/>
            </div>
            <div style={{marginBottom : "50px"}}>
            <SwipeButton text = "Back" onClick={(e) => navigate('/Userdashboard', {state: {userDetails: userDetails, imageSrc: location.state.imageSrc}})}>Back</SwipeButton>
            </div>
        </div>
    )
}

export default SearchProfile