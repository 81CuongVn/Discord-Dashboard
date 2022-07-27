import React from 'react'
import GuildsList from "../components/GuildsList"

/*
    This is the main page of the application.
    It displays the list of guilds.

    Guilds Object is an array of guilds:
    [
        {
            id: '111222333444123321',
            name: 'ABC',
            icon: 'a1c11da11af1e1111a1f111111db111',
            owner: false/true,
            permissions: '8',
            features: [
              'COMMUNITY',
              ...
            ],
            onGuild: false/true
        },
    ]
 */

export async function getServerSideProps ({ query }) {
    return {
        props: {
            user: query.user || null,
            navigation: query.navigation || [],
            guilds: query.guilds || [],
        }
    }
}

export default function Index({ user, navigation, guilds }) {
    if(!user){ // this only checks if query is ready, for redirecting user to login please use preHandler in theme module pages.
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1>Hello, {user.username}</h1>
            <GuildsList guilds={guilds} />
        </div>
    )
}