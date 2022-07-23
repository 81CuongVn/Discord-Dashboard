import * as AuthRoute from './auth'

export const router: any = (props: { fastify: any, client: any }) => {
    AuthRoute.router(props);
    props.fastify.get('/api/*', async (request: any, reply: any) => {
        return { error: true, code: 404, message: 'Endpoint not found' }
    })
}