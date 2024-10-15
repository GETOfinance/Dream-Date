import React from "react";
import "./Matchelement.css";

const Matchelement = (props) => {
  const handleOnClick = (e) => {
    e.preventDefault();
    props.onClick[1](props.onClick[0]);
  };

  return (
    <div onClick={handleOnClick} className="matches" style={{margin: "100px"}}>
      <div className="card">
        <img
          className={props.className}
          src={props.src}
        />
        <h5 id = "whiteHover" hidden={props.lastseen === "" ? true : false}>{props.lastseen}</h5>
        <h3 id = "purpleHover">{props.name}</h3>
        <div className="card">
        </div>
      </div>
    </div>
  );
};

export default Matchelement;
