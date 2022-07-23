import DiscordOauth2 from "discord-oauth2"
const oauth = new DiscordOauth2()

export const router: any = (props: { fastify:any, client:any }) => {
    props.fastify.register((instance: any, opts: any, next: any)=>{
        instance.get('/callback', async (request: any, reply: any) => {
            const token = await props.fastify.discordOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
            const User = await oauth.getUser(token.access_token)
            request.session.user = {
                id: User.id,
                username: User.username,
                discriminator: User.discriminator,
                avatar: User.avatar,
                email: User.email,
                verified: User.verified,
                // @ts-ignore
                avatarURL: User.avatar ? `https://cdn.discordapp.com/avatars/${User.id}/${User.avatar}.png?size=1024` : `https://cdn.discord.com/embed/avatars/${User.discriminator%5}.png`
            }
            const Guilds = await oauth.getUserGuilds(token.access_token)
            let returnGuild = []
            for(const guild of Guilds){
                returnGuild.push({
                    ...guild,
                    onGuild: Boolean(props.client.guilds.cache.get(guild.id))
                })
            }
            request.session.guilds = returnGuild.sort(e=>e.onGuild?-1:1)
            return reply.redirect('/')
        })

        next()
    }, { prefix: '/api/auth' })
}