import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { getResourceType } from './utilities/aptos';
import { app_read_contract } from './utilities/polygon/readContract';
import { read_from_ipfs } from './utilities/web3storage';

const Search = (props) => {
  const navigate = useNavigate();
    const [searchValue, setsearchValue] = useState();
    const handlechange = async(e) =>{
        setsearchValue(e.target.value);
    }

    const sendValue =async(e) => {
      e.preventDefault();
      var mongo_res = await axios.get(process.env.REACT_APP_MONGODB_API_ENDPOINT + `discordName/${searchValue}`);
      if(!mongo_res.data){
        alert("This Discord Account is not Registered")
        document.getElementById("searchDiscord").value = "";
        setsearchValue("")
        return;
      }
      var search_ipfsCid = "";
      if(mongo_res.data.blockchain === "aptos")
      {  
        var search_info = await getResourceType(mongo_res.data.walletAddress, `${process.env.REACT_APP_APTOS_CONTRACT_OWNER}::DDWApp::UserInfo`);
        if(!search_info) {
        return;
        }
        search_ipfsCid = search_info.data.ipfsCid;
      }
      else if(mongo_res.data.blockchain === "metamask")
      {
        if(!(await app_read_contract.is_account_registered(mongo_res.data.walletAddress))) return;
        search_ipfsCid = await app_read_contract.get_user_details(mongo_res.data.walletAddress);
      }
      if(search_ipfsCid === "") return;
      var files = await read_from_ipfs(search_ipfsCid, "userInfo.json");
      if(files[0]) {
        files = files[1];
      console.log(files);
      var searchDetails = {};
      let reader = new FileReader();
      reader.readAsText(files[0]);
      reader.onload = function() {
      searchDetails = JSON.parse(reader.result);
      console.log(searchDetails);
      read_from_ipfs(searchDetails.image, "avatar.png").then((search_image_files) => {
          var search_image_src = null;
          if(search_image_files[0])
          search_image_src = window.URL.createObjectURL(search_image_files[1][0]);
          else
          search_image_src = search_image_files[1];
          searchDetails.src = search_image_src;
          navigate('/Searchprofile', {state: {searchData: searchDetails, userDetails: props.userDetails, imageSrc: props.imageSrc}})
        })
      }
      }
      else {
        var searchDetails = files[1];
        console.log(searchDetails);
        read_from_ipfs(searchDetails.image, "avatar.png").then((search_image_files) => {
          var search_image_src = null;
          if(search_image_files[0])
          search_image_src = window.URL.createObjectURL(search_image_files[1][0]);
          else
          search_image_src = search_image_files[1];
          searchDetails.src = search_image_src;
          navigate('/Searchprofile', {state: {searchData: searchDetails, userDetails: props.userDetails, imageSrc: props.imageSrc}})
        })
      }
    }

  return (
    <>        
        <div className='container' style={{overflowY: "scroll"}}>
  <form action="/action_page.php">
    <label for="fname">Name</label>
    <input type="text" name="enteredAmount" placeholder="Enter user name" onChange={handlechange}/>
    <input onClick={sendValue} type="submit" value="Search"/>
  </form>
</div>

    </>
  )
}

export default Search