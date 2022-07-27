import React, {useState, useEffect} from 'react'
import GuildsList from "../components/GuildsList"

import FetchOptions from "../utils/FetchOptions"
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
    useEffect(() => {
        FetchOptions(guild.id).then(setSettings)
    }, [])

    return (
        <div>
            <h1>Hello, {user.username}</h1>
            <p>This is manage page for {guild.name} guild.</p>

            {
                settings.length > 0 ?
                <div>
                    {
                        settings.map(category=>{
                            return <CategoryOptions key={category.id} category={category} />
                        })
                    }
                </div>
                    :
                <div>
                    <p>Loading...</p>
                </div>
            }
        </div>
    )
}