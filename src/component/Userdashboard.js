import React, { useEffect, useState } from 'react'
import Matchlist from './Matchlist'
import "./Userdashboard.css"
import Search from './Search';
import DDWTokenSend from './DDWTokenSend';
import ApprovalToken from './ApprovalToken';
import UserDetails from './UserDetails';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { getResourceType } from './utilities/aptos';
import { read_from_ipfs } from './utilities/web3storage';
import { app_read_contract } from './utilities/polygon/readContract';
import { createDDWAppWriteContract } from './utilities/polygon/writeContract';


const TextField = styled.h1`
align-items: center;
justify-content: center;
display: flex;
&:hover {
  cursor: pointer;
  transform: scale(1.1) skew(-8deg);
  transition: transform 120ms;
}
`
const TextFieldUserDetails = styled.h1`
    margin-right: 66em;
    font-family: 'Oswald', sans-serif;
`
const Userdashboard = () => {
    const location = useLocation();
    var wallet = location.state.userDetails.wallet;
    var blockchain = location.state.userDetails.blockchain;
    const [matches, setMatches] = useState([]);

    useEffect(()=>{
        loadMatchesData(wallet);
    }, []);

    const loadMatchesData = async (wallet) => {
        var matchListOnChain = [];
        var matchTimestampOnChain = [];
        if(blockchain==="aptos")
        {
            var likes_info = await getResourceType(wallet, `${process.env.REACT_APP_APTOS_CONTRACT_OWNER}::DDWApp::LikesInfo`);
            if(!likes_info) return;
            matchListOnChain = likes_info.data.matchedListOnChain;
            if(matchListOnChain.length === matches.length) return;
            console.log("matchList", matchListOnChain);
            matchTimestampOnChain = likes_info.data.matchedTimestampListOnChain;
            console.log("matchTime", matchTimestampOnChain);
        }
        else if(blockchain==="metamask")
        {
            var Contract = createDDWAppWriteContract();
            var likes_info = await Contract.get_matches();
            if(likes_info[0].length === 0) return;
            matchListOnChain = likes_info[0];
            if(matchListOnChain.length === matches.length) return;
            console.log("matchList", matchListOnChain);
            matchTimestampOnChain = likes_info[1];
            console.log("matchTime", matchTimestampOnChain);
        }
        var matchListValue = [];
        for(var index = 0; index < matchListOnChain.length; index++) {
                var user_ipfs_cid = "";
                if(blockchain === "aptos") {
                    var match_info = await getResourceType(matchListOnChain[index], `${process.env.REACT_APP_APTOS_CONTRACT_OWNER}::DDWApp::UserInfo`);
                    if(!match_info) {
                    continue;
                    }
                    user_ipfs_cid = match_info.data.ipfsCid;
                }
                else if(blockchain === "metamask") {
                    if(!(await app_read_contract.is_account_registered(matchListOnChain[index]))) continue;
                    user_ipfs_cid = await app_read_contract.get_user_details(matchListOnChain[index]);
                }
                if(user_ipfs_cid === "") continue;   
                console.log("loop index outside onload", index);
                var files = await read_from_ipfs(user_ipfs_cid, "userInfo.json");
                if(files[0]) {
                    files = files[1];
                    console.log(files);
                    var matchDetails = {};
                    let reader = new FileReader();
                    reader.readAsText(files[0]);
                    reader.onload = async function() {
                        matchDetails = JSON.parse(reader.result);
                        var match_image_files = await read_from_ipfs(matchDetails.image, "avatar.png");
                        var match_image_src = null;
                        if(match_image_files[0])
                        match_image_src = window.URL.createObjectURL(match_image_files[1][0]);
                        else
                        match_image_src = match_image_files[1];
                        var matched_date = (new Date(parseInt(matchTimestampOnChain[index-1])*1000)).toUTCString();
                        matchDetails.src = match_image_src;
                        matchDetails.lastseen = `Matched on ${matched_date}`
                        matchDetails.Id = matchDetails.id;
                        matchDetails.id = index;
                        matchListValue.push(matchDetails);
                        console.log("loop index inside onload", index);
                        if(matchListValue.length === matchListOnChain.length) {
                                
                            setMatches(matchListValue);
                            console.log("set matches", matchListValue);
                        }
                    }
                }
                else {
                    matchDetails = files[1];
                    var match_image_files = await read_from_ipfs(matchDetails.image, "avatar.png");
                    var match_image_src = null;
                    if(match_image_files[0])
                    match_image_src = window.URL.createObjectURL(match_image_files[1][0]);
                    else
                    match_image_src = match_image_files[1];
                    var matched_date = (new Date(parseInt(matchTimestampOnChain[index])*1000)).toUTCString();
                    matchDetails.src = match_image_src;
                    matchDetails.lastseen = `Matched on ${matched_date}`
                    matchDetails.Id = matchDetails.id;
                    matchDetails.id = index;
                    matchListValue.push(matchDetails);
                    console.log("loop index inside onload", index);
                    if(matchListValue.length === matchListOnChain.length) {
                            
                        setMatches(matchListValue);
                        console.log("set matches", matchListValue);
                    }
                }
            }
    }
    // const matches = [
    //     { lastseen: "6 days ago", id: 1, Id: "989823227599671316", name: "Leanne Graham", src: "https://getwallpapers.com/wallpaper/full/9/2/b/1434187-vertical-avatar-movie-wallpaper-hd-1080x1920-laptop.jpg" },
    //     { lastseen: "6 days ago", id: 2, Id: "989823227599671316", name: "Ervin Howell", src: "https://getwallpapers.com/wallpaper/full/9/2/b/1434187-vertical-avatar-movie-wallpaper-hd-1080x1920-laptop.jpg" },
    //     { lastseen: "6 days ago", id: 3, Id: "989823227599671316", name: "Clementine Bauch", src: "https://getwallpapers.com/wallpaper/full/9/2/b/1434187-vertical-avatar-movie-wallpaper-hd-1080x1920-laptop.jpg" },
    //     { lastseen: "6 days ago", id: 4, Id: "989823227599671316", name: "Patricia Lebsack", src: "https://getwallpapers.com/wallpaper/full/9/2/b/1434187-vertical-avatar-movie-wallpaper-hd-1080x1920-laptop.jpg" }
    // ];

    return (
        <div className='usersInfo'>
            
            <TextFieldUserDetails>User's Details </TextFieldUserDetails>

                <UserDetails userDetails={location.state.userDetails} imageSrc={location.state.imageSrc}/>

                <Search userDetails={location.state.userDetails} imageSrc={location.state.imageSrc}/>

            <TextField>Send DDW Tokens </TextField>
                <DDWTokenSend userWallet={location.state.userDetails.wallet} blockchain={location.state.userDetails.blockchain}/>

            <TextField>Claim DDW Tokens </TextField>
                <ApprovalToken userWallet={location.state.userDetails.wallet} blockchain={location.state.userDetails.blockchain}/>


                <Matchlist matches={matches} userDetails={location.state.userDetails} imageSrc={location.state.imageSrc} />

        </div>
    )
}

export default Userdashboard