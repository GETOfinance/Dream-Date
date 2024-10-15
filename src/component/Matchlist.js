import React from 'react'
import { useNavigate } from 'react-router-dom';
import Matchelement from './MatchElement/Matchelement';
import "./Matchlist.css"


const Matchlist = (props) => {
    const navigate = useNavigate();
    const handleOnClick = (matchData) => {
        navigate('/Matchprofile', { state: {matchData: matchData, userDetails: props.userDetails, imageSrc: props.imageSrc} })

    }

    return (
        <div style= {{overflowY: "scroll"}}>
            <div className='match' style={{overflowY: "scroll"}}>
            <h1>Matches</h1>
                {console.log(props.matches)}
                {props.matches.map(c => <Matchelement key={c.id} name={c.name} src={c.src} lastseen={c.lastseen} onClick={[c, handleOnClick]} />)}
            </div>

        </div>
    );


}

export default Matchlist