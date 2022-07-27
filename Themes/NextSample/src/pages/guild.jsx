import React, {useState, useEffect} from 'react'
import GuildsList from "../components/GuildsList"

import FetchOptions from "../utils/FetchOptions"
import PostOptions from "../utils/PostOptions"

import CategoryOptions from "../components/CategoryOptions"

export async function getServerSideProps ({ query }) {
    return {
        props: {
            user: query.user || null,
            navigation: query.navigation || [],
            guild: query.guild ? JSON.parse(JSON.stringify(query.guild)) : null,
        }
    }
}

export default function Index({ user, navigation, guild }) {
    if(!user || !guild){ // this only checks if query is ready, for redirecting user to login please use preHandler in theme module pages.
        return <div>Loading...</div>
    }

    const [settings, setSettings] = useState([])
    const [displaySave, setDisplaySave] = useState(false) // displaySave is a boolean to show/hide the save button
    const [saving, setSaving] = useState(false) // saving is a boolean to show/hide the saving indicator

    useEffect(() => {
        FetchOptions(guild.id).then(setSettings)
    }, [])

    const [settingsUpdated, setSettingsUpdated] = useState([])

    const UpdateOptionValue = ({category_id, option_id, newData}) => {
        setDisplaySave(true)
        if(!settingsUpdated.find(category=>category.id===category_id)){
            settingsUpdated.push({id: category_id, options: []})
        }
        if(!settingsUpdated.find(category=>category.id===category_id).options.find(option=>option.id===option_id)){
            settingsUpdated.find(category=>category.id===category_id).options.push({id: option_id, value: newData})
        }else{
            settingsUpdated.find(category=>category.id===category_id).options.find(option=>option.id===option_id).value = newData
        }
    }

    const SaveClicked = async () => {
        setSaving(true)
        const res = await PostOptions(guild.id, settingsUpdated)
        console.log(res)
        setSaving(false)
        setDisplaySave(false)
    }

    return (
        <div>
            <h1>Hello, {user.username}</h1>
            <p>This is manage page for {guild.name} guild.</p>

            {
                settings.length > 0 ?
                <div>
                    {
                        settings.map(category=>{
                            return <CategoryOptions key={category.id} category={category} UpdateOptionValue={UpdateOptionValue} />
                        })
                    }
                </div>
                    :
                <div>
                    <p>Loading...</p>
                </div>
            }
            {
                displaySave ?
                <a href={"#post"} onClick={SaveClicked}>Save your settings!</a>
                    :
                <div>Not updated yet.</div>
            }
        </div>
    )
}