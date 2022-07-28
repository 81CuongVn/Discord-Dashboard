import React, {useState, useEffect} from 'react'

export default function TextInput({ category_id, option: { themeOptions, name, description, type, id, allowed, reason, value }, UpdateOptionValue }) {
    const [optionValue, setOptionValue] = useState(value) // optionValue is the value of the option (initial value = value from API endpoint [returned in option get function])

    useEffect(()=>{
        UpdateOptionValue({category_id, option_id: id, newData: optionValue})
    }, [optionValue])

    const handleChange = (e) => {
        const CSR = eval(type.clientSideValidation)(e.target.value)
        if(CSR != null)
            return alert(CSR)
        setOptionValue(e.target.value)
    }
    
    return (
        <div style={Object.assign(themeOptions?.customStyles?.optionContainer || { backgroundColor: 'none' }, {})}> {/* optionContainer */}
            <h1>{name}</h1>
            <p>({type.name})</p>
            <input disabled={allowed===false} type="text" name={name} id={id} value={optionValue} onChange={handleChange} />
            {
                allowed===false?
                    <p>{reason}</p>
                :null
            }
            {themeOptions?.emojiPicker ? <div>Seems like you want us to display emoji picker, but that's not possible as it's only Sample!</div> : null}
        </div>
    )
}
