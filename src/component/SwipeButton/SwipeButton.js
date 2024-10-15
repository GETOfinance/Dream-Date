import React from 'react'
import "./SwipeButton.css"
const SwipeButton = (props) => {
  return (
    <>
<div className="btn-star" onClick={props.onClick}>
  <span className="top_left"></span>
  <span className="top_right"></span>
      <span className="title">
        {props.text}
      </span>
  <span className="bottom_left"></span>
  <span className="bottom_right"></span>
</div>
 </>
  )
}

export default SwipeButton