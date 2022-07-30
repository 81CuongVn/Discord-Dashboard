const path = require('path')
const next = require('next')

class Theme {
    codename = 'krdx'
    name = 'Kardex Theme'
    description = 'Kardex theme for Discord Dashboard v3'
    public_path = path.join(__dirname, 'public')
    next_app
    next_handler

    customPages=[]
    #navigation=[]

    engine = 'next'

    /**
     * Register the next app inside fastify.
     * @param fastify - The fastify instance.
     * @param {Boolean} dev - Whether the app is in development mode.
     */
    registerFastifyNext = (fastify, dev) => {
        fastify.register(require('@fastify/nextjs'), { dev, dir: dev ? path.join(__dirname, './src') : __dirname })
        return
    }

    /**
     * Add custom page to the dashboard.
     *  @param url - The url of the page.
     *  @param components - The components of the page.
     */
    addCustomPage({ url, components, icon, name, section}) {
        this.customPages.push({
            url,
            icon,
            name,
            components,
            section
        })

        return this
    }

    /**
     * Get theme pages.
     * @param fastify - The fastify instance.
     */
    getPages = ({ fastify, discordClient, categories }) => {
        const next_app = this.next_app
        let pages = [
            {
                method: 'get',
                url: '/',
                name: 'Home',
                icon: 'home',
                section: '',
                preHandler: async (request, reply) => {
                    /*if(!request.session.user) {
                        return reply.redirect('/auth')
                    }*/
                },
                handler: async (request, reply) => {
                    return next_app.render(request.raw, reply.raw, '/index', { user: request.session.user, navigation: this.#navigation })
                },
            },
            {
                method: 'get',
                url: '/dashboard',
                name: 'Manage Guilds',
                icon: 'tachometer-alt',
                section: 'Dashboard',
                preHandler: async (request, reply) => {
                    if(!request.session.user) {
                        return reply.redirect('/auth')
                    }
                },
                handler: async (request, reply) => {
                    const guilds = request.session.guilds;
                    return next_app.render(request.raw, reply.raw, '/dashboard', { user: request.session.user, navigation: this.#navigation, guilds })
                },
            },
            {
                method: 'get',
                url: '/guild/:id',
                name: 'Manage Guild',
                preHandler: async (request, reply) => {
                    if(!request.session.user) {
                        return reply.redirect('/auth')
                    }

                    const id = request.params.id
                    const guild = discordClient.guilds.cache.get(id)

                    if(!guild)
                        return reply.redirect('/dashboard?error=Guild not found')

                    const memberOnGuild = await guild.members.fetch(request.session.user.id)
                    if(!memberOnGuild)
                        return reply.redirect('/dashboard?error=You are not on this guild')

                    if(!memberOnGuild.permissions.has('ADMINISTRATOR'))
                        return reply.redirect('/dashboard?error=You are not an administrator')

                    const guild_emoji_list = guild.emojis.cache.map(emoji => {
                        return {
                            id: emoji.id,
                            name: emoji.name,
                            url: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}?size=32`,
                            animated: emoji.animated,
                        }
                    })

                    guild.guild_emoji_list = guild_emoji_list
                    request.guild = guild
                },
                handler: async (request, reply) => {
                    return next_app.render(request.raw, reply.raw, '/guild', { guild: request.guild, user: request.session.user, navigation: this.#navigation })
                },
            },
            {
                method: 'get',
                url: '/commands',
                name: 'Commands',
                icon: 'book-open',
                section: 'Dashboard',
                preHandler: async (request, reply) => {
                    /*if(!request.session.user) {
                        return reply.redirect('/auth')
                    }*/
                },
                handler: async (request, reply) => {
                    return next_app.render(request.raw, reply.raw, '/dashboard', { user: request.session.user, navigation: this.#navigation })
                },
            },
            {
                method: 'get',
                url: '/privacy-policy',
                name: 'Privacy Policy',
                icon: 'lock',
                section: 'Legal',
                preHandler: async (request, reply) => {
                    /*if(!request.session.user) {
                        return reply.redirect('/auth')
                    }*/
                },
                handler: async (request, reply) => {
                    return next_app.render(request.raw, reply.raw, '/dashboard', { user: request.session.user, navigation: this.#navigation })
                },
            },
            {
                method: 'get',
                url: '*',
                preHandler: async (request, reply) => {
                    /*if(!request.session.user) {
                        return reply.redirect('/auth')
                    }*/
                },
                handler: async (request, reply) => {
                    return next_app.render(request.raw, reply.raw, '/test', { hello: '404', user: request.session.user, navigation: this.#navigation })
                },
            },
        ]

        pages.forEach(page=>{
            if(page.icon){
                this.#navigation.push({
                    url: page.url,
                    icon: page.icon,
                    name: page.name,
                    section: page.section,
                })
            }
        })

        this.customPages.forEach(page=>{
            if(page.icon){
                this.#navigation.push({
                    url: page.url,
                    icon: page.icon,
                    name: page.name,
                    section: page.section,
                    components: page.components,
                })
            }
        })
        return pages
    }

    /**
     * Init and return the next app.
     * @param {Boolean} dev - If true, the next app will be in development mode.
     * @returns {{next_handler: RequestHandler, next_app: NextServer}} - The next app and the next handler.
     */
    initNext = (dev) => {
        const next_app = next({ dir: dev ? path.join(__dirname, './src') : __dirname, dev })
        const next_handler = next_app.getRequestHandler()
        this.next_app = next_app
        this.next_handler = next_handler
        return { next_app, next_handler }
    }
}

const ThemeOptions = {
    TextInputManager: require('./themeoptionsmanagers/TextInput'),
    TextInputObjects: {
        optionContainer: 'optionContainer',
        optionName: 'optionName',
        optionDescription: 'optionDescription',
        optionInput: 'optionInput',
        optionNotAllowedText: 'optionNotAllowedText',
    }
}

module.exports.Provider = Theme
module.exports.ThemeOptions = ThemeOptions