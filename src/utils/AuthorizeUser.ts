export default async function AuthorizeUser(_props: {oauth:any, props: any, token: any, request: any, reply: any}) {
    const {oauth, props, token, request, reply} = _props
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
        let doIt = true
        for(let perm of props.requiredPermissions){
            if(guild.permissions==null)guild.permissions = 0;
            if((guild.permissions & perm[1]) != perm[1]){
                doIt = false
                break
            }
        }
        if(doIt){
            returnGuild.push({
                ...guild,
                onGuild: Boolean(props.discordClient.guilds.cache.get(guild.id))
            })
        }
    }async function AuthorizeUser(props: any, token: any, request: any, reply: any) {
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
            let doIt = true
            for(let perm of props.requiredPermissions){
                if(guild.permissions==null)guild.permissions = 0;
                if((guild.permissions & perm[1]) != perm[1]){
                    doIt = false
                    break
                }
            }
            if(doIt){
                returnGuild.push({
                    ...guild,
                    onGuild: Boolean(props.discordClient.guilds.cache.get(guild.id))
                })
            }
        }
        request.session.guilds = returnGuild.sort(e=>e.onGuild?-1:1)
        return reply.redirect('/')
    }
    request.session.guilds = returnGuild.sort(e=>e.onGuild?-1:1)
    return reply.redirect('/')
}