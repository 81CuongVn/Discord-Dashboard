import React from 'react'

import TextInput from './formtypes/TextInput'

export default function CategoryOptions({ category }) {
    return (
        <div>
            <h1>{category.name}</h1>
            <ul>
                {
                    category.options.map(option => {
                        if(option.type.name == 'TextInput'){
                            return <TextInput key={option.id} option={{...option}} />
                        }
                    })
                }
            </ul>
        </div>
    )
}
