import React from 'react'

export default function GuildsList({ guilds }) {
    return (
        <div>
            <h1>Guilds</h1>
            <ul>
                {guilds.map(guild => {
                    if(guild.onGuild){
                        return <li key={guild.id}>Manage {guild.name}</li>
                    }else{
                        return <li key={guild.id}>Add to {guild.name}</li>
                    }
                })}
            </ul>
        </div>
    )
}