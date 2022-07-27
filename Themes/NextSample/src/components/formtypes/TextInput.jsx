import React from 'react'

export default function TextInput({ option: { name, description, type, id, allowed, reason, value }}) {
    return (
        <div>
            <h1>{name}</h1>
            <p>({type.name})</p>
            <input type="text" name={name} id={id} value={value} />
        </div>
    )
}
