import Select from 'react-dropdown-select'
import React, { useState } from 'react';

function Dropdown( {onInterest}) {
    const [options, setOptions] = useState([
        { id: 1, Interest: "Nightclubs" },
        { id: 2, Interest: "Whiskey" },
        { id: 3, Interest: "Indie" },
        { id: 4, Interest: "Hiking" },
    ])



    const [selectedOptions, setSelectedOptions] = useState([])

    return (
        <>
            <div style={{ width: '250px', margin: '15px' }} >
                <Select options={options.map((item, index) => {
                    return { value: item.id, label: item.Interest }
                })}
                multi= "true"
                    values={selectedOptions} onChange={(values) => { setSelectedOptions([...values]); onInterest(values)}} />
            </div>
        </>
    );
}

export default Dropdown;