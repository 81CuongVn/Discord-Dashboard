import * as AuthRoute from './auth'
import * as GuildRoute from './guild'

export const router: (props: any)=>void = (props: { fastify: any, discordClient: any, categories: any }) => {
    AuthRoute.router(props)
    GuildRoute.router(props)
    props.fastify.get('/api/*', async (request: any, reply: any) => {
        return { error: true, code: 404, message: 'Endpoint not found' }
    })
}