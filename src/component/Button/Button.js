import React from 'react'
import styled from 'styled-components'

const Btn = styled.button`
background: #171a21;
border-radius: 7px;
border: 2px solid #3a8df2;
color: #fff;
margin: 1.5em 1.5em;
padding: 0.25em 1.5em;
font-size: 1.5em;
height: 4.0em;
font-weight: 1050;
cursor: pointer;
transition: ease-in-out;
justify-content: flex-start;
text-align: left;
padding-right: 1.1em;
&:hover{
  background: black;
  color: white;
  /* box-shadow: 0 5px 50px 0 #15f4ee inset, 0 5px 50px 0 #15f4ee,
                0 5px 50px 0 #15f4ee inset, 0 5px 50px 0 #15f4ee; */
  text-shadow: 0 0 5px #15f4ee, 0 0 5px #15f4ee;
  transform: translate( 10%) scale(1);
}
@media (max-height: 800px) {
  padding: inherit;
  margin: inherit;
  font-size: 0.8em;
  transition: ease-in-out;
  width: 10.2em;
}
`

const Button = (props) => {
  return (
    <div style={{margin: "10px"}}>
    <Btn hidden = {props.hidden} onClick={props.onClick}>{props.buttonText}</Btn>
    </div>
  )
}

export default Button