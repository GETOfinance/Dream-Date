import React, { useEffect, useState } from 'react'
import { getResourceType } from './utilities/aptos';
import styled from 'styled-components'
import "./UserDetails.css"
import { shorten_address } from './utilities/utils';
import { app_token_read_contract, ddw_token_read_contract } from './utilities/polygon/readContract';
import { ethers } from 'ethers';
const SectionWrapper = styled.div`
color: white;

`
const Image = styled.img`
height: 100px;
width: 100px;
border-radius: 100%;
`
const UserDetails = (props) => {
  const [DDWToken, setDDWToken] = useState(0);
  const [APPToken, setAPPToken] = useState(0);

  useEffect(
    ()=>{
      getDDWBalance();
      getAPPBalance();
    },[]
  )

  const getDDWBalance = async ()=> {
    if(props.userDetails.blockchain === "aptos")
    {
      var resource = await getResourceType(props.userDetails.wallet, `0x1::coin::CoinStore<${process.env.REACT_APP_APTOS_CONTRACT_OWNER}::DDWcoin::CoinType>`);
      if(!resource) {
        return;
      }
      setDDWToken(parseInt(resource.data.coin.value)/10**8);
    }
    else if(props.userDetails.blockchain === "metamask")
    {
      var balance = await ddw_token_read_contract.balanceOf(props.userDetails.wallet);
      var denom = ethers.utils.parseUnits('1', 18);
      var value = balance.div(denom).toNumber();
      setDDWToken(value);
    }
  }
  const getAPPBalance = async ()=> {
    if(props.userDetails.blockchain === "aptos") {
      var resource = await getResourceType(props.userDetails.wallet, `0x1::coin::CoinStore<${process.env.REACT_APP_APTOS_CONTRACT_OWNER}::DDWapproval::CoinType>`);
      if(!resource) {
        return;
      }
      setAPPToken(parseInt(resource.data.coin.value));
    }
    else if(props.userDetails.blockchain === "metamask") {
      var balance = await app_token_read_contract.balanceOf(props.userDetails.wallet);
      var denom = ethers.utils.parseUnits('1', 18);
      var value = balance.div(denom).toNumber();
      setAPPToken(value);
    }
  }
  return (
        <div  style={{color : "white"}}>
          <div id='containerJam'>
          <Image src={props.imageSrc} alt="Avtar Img" height="50" width="50" style={ {borderRadius :"100%"}} />
            <h4 className='headerValues' style={{color: "white"}}>Wallet Address :{shorten_address(props.userDetails.wallet)} {} </h4>
            <h4 className='headerValues' >Discord Name : {props.userDetails.name} </h4>
            <h4 className='headerValues'>DDW Token Balance :{DDWToken}  </h4>
            <h4 className='headerValues'>SBT Token Balance : {APPToken} </h4>
          </div>
                
        </div>

  )
}

export default UserDetails