import DiscordOauth2 from "discord-oauth2"
const oauth = new DiscordOauth2()

import AuthorizeUser from "../utils/AuthorizeUser"

export const router: (props: any)=>void = (props: { requiredPermissions: [string,number][], fastify: any, discordClient: any, categories: any }) => {
    props.fastify.register((instance: any, opts: any, next: any)=>{
        instance.get('/callback', async (request: any, reply: any) => {
            const token = await props.fastify.discordOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
            await AuthorizeUser({oauth, props, token, request, reply})
        })

        next()
    }, { prefix: '/api/auth' })
}