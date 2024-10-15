import Select from 'react-dropdown-select'
import React, { useState } from 'react';

function Gender({onGender}) {
    const [options, setOptions] = useState([
        { id: 1, Gender: "Male" },
        { id: 2, Gender: "Female" },

    ])

    const [selectedOptions, setSelectedOptions] = useState([])

    return (
        <>
            <div style={{ width: '250px', margin: '15px' }} >
                <Select options={options.map((item, index) => {
                    return { value: item.id, label: item.Gender }
                })} values={selectedOptions} 
                    onChange={(values) => { setSelectedOptions([...values]); onGender(values) }} />
            </div>
        </>
    );
}

export default Gender;