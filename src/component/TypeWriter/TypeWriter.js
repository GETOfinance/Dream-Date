import React from 'react'
import "./TypeWriter.css"
const TypeWriter = (props) => {
  return (
    <>
        <div class="typewriter">
            <h1>{props.text}</h1>
        </div>

    </>
  )
}

export default TypeWriter