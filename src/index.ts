/**
 * @file index.ts
 * @title Discord-Dashboard Source Code
 * @author Assistants Center
 * @license CC BY-NC-SA 4.0
 * @version 3.0.0
 */

import {Client, ProjectInfo, SessionSettings, SSLOptions, UserStatic} from "./types/types"

import {fastify as fastifyModule} from 'fastify'

import fastifySession from '@fastify/session'
import fastifyCookie from "@fastify/cookie"
import fastifyOauth2 from "@fastify/oauth2"

import * as ApiRouter from './api/router'

import path from 'path'
import fs from 'fs'

import axios from 'axios'

import {ErrorThrower} from "./utils/ErrorThrower"

/**
 * Discord-Dashboard Class
 * @example
 * const DBD = require('discord-dashboard')
 *
 * const Dashboard = new DBD.Dashboard(DBD.Engines.NEXT)
 *      .setDev(true)
 *      .setPort(3000)
 *      // ...
 *      .start()
 */
export class Dashboard {
    public engine: 'ejs' | 'next'
    /**
     * Constructor does not require any parameters.
     * Optional parameter is engine to use ('next' by default). Theme engine must be the same as the dashboard engine.
     *
     * Perform all options to set in the Dashboard by adding functions to the class (before using the start method).
     */
    constructor(engine: 'ejs' | 'next') {
        if(!engine)
            ErrorThrower('Engine is required. Pass it as the first and only class constructor parameter (supported engines are accessible from DBD.Engines).')
        if(engine != 'ejs' && engine != 'next')
            ErrorThrower(`The engine must be either "ejs" or "next". Received "${engine}" which is not a valid supported engine.`)
        this.engine = engine
    }
    private fastify: any

    public port: number | undefined
    public dev: boolean = false
    private theme: any

    private project: ProjectInfo | undefined

    private sessionStore: any
    private sessionSecret: string | undefined
    private sessionExpires: number | undefined
    private saveUninitialized: boolean | undefined

    public administrators: string[] | undefined
    public fastifyUtilities: any[] = []

    public categories: any[] = []

    private client: Client = {
        id: '',
        secret: '',
    }

    public requiredPermissions: [string,number][] = [
        ['ADMINISTRATOR', 0x8],
    ]

    private discordClient: any

    public userStatic: UserStatic | undefined

    private SSL: SSLOptions | undefined

    public version: string = require('../package.json').version

    /**
     * @methodOf Dashboard
     * Define if it's a development environment. If it's a development environment, it will use the nextjs dev server and won't send statistics to Assistants Services.
     * @param {boolean} dev - If true, the dashboard will be in development mode.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setDev(dev: boolean) {
        this.dev = dev
        return this
    }

    /**
     * Set required permissions to use.
     * @param {Array<Array<String, Number>>} permissions - An array of permissions to use (see DBD.Permissions).
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setRequiredPermissions(permissions: [string,number][]) {
        this.requiredPermissions = permissions
        return this
    }

    /**
     * Set the Discord client OAuth2 credentials to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setClientCredentials (clientData: Client) {
        this.client = clientData
        return this
    }

    /**
     * Register the project with the Assistants Services Discord Dashboard Project.
     * @param {string} [info.accountToken] - The account token to use.
     * @param {string} [info.projectId] - The project id to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public registerProject(projectInfo: ProjectInfo) {
        this.project = projectInfo
        return this
    }

    /**
     * @methodOf Dashboard
     * @description Set the theme to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setTheme(theme: any) {
        if(theme.engine != this.engine)
            ErrorThrower(`${theme.name} doesn't support "${this.engine}" engine. Please use "${theme.engine}" engine.`)
        this.theme = theme
        return this
    }

    /**
     * @methodOf Dashboard
     * @description Set the port to use.
     * @param {number} port - The port to use for the dashboard.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setPort(port: number) {
        this.port = port
        return this
    }

    /**
     * Set the session config to use.
     *  @returns {Dashboard} - The Dashboard instance.
     */
    public setSession( sessionSettings: SessionSettings ) {
        sessionSettings = Object.assign({
            store: (fastifySession: any)=>fastifySession.memory,
            secret: 'ggt9j5093g5g595t65h0gi6gih5gih956054544gtg4t4gtrgt4gt6g',
            expires: 3600,
            saveUninitialized: true,
        }, sessionSettings)

        this.sessionStore = sessionSettings.store(fastifySession)
        this.sessionSecret = sessionSettings.secret
        this.sessionExpires = sessionSettings.expires
        this.saveUninitialized = sessionSettings.saveUninitialized
        return this
    }

    /**
     * Set the static config to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setStatic(staticConfig: UserStatic) {
        staticConfig = Object.assign({
            url: '/static',
            path: './static',
        }, staticConfig)

        this.userStatic = staticConfig
        return this
    }

    /**
     * Set the Discord.js client to use.
     * @param client - The Discord.js client.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setDiscordClient (client: any) {
        this.discordClient = client
        return this
    }

    /**
     * Set SSL options.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setSSL (sslInfo: SSLOptions) {
        this.SSL = sslInfo
        return this
    }

    /**
     * Set the options folder to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setOptionsFolder (path_src: string) {
        const categories = fs.readdirSync(path_src)
        for(const category of categories) {

            let categoryId = category
            while(categoryId.includes(' '))
                categoryId = categoryId.replace(' ', '_')

            const categoryData = {
                id: categoryId.toLowerCase(),
                name: category,
            }

            const categoryOptions = this.resolveOptions(path.join(path_src, category))
            this.categories.push({
                id: categoryData.id,
                name: categoryData.name,
                options: categoryOptions
            })
        }
        this.verifyOptions()
        return this
    }

    /**
     * Set the administrators to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setAdministrators (administrators: string[]) {
        this.administrators = administrators
        return this
    }

    /**
     * Set the fastify utilities to use.
     * @returns {Dashboard} - The Dashboard instance.
     */
    public setFastifyUtilities (fastifyUtilities: any[] = []) {
        this.fastifyUtilities = fastifyUtilities
        return this
    }

    /**
     * Start the dashboard.
     * @returns {Promise<Dashboard>} - The Dashboard instance.
     */
    public start = async () => {
        const res = await axios.get('https://registry.npmjs.org/discord-dashboard/latest')
        if(res.data?.version > this.version){
            console.log(`[Discord Dashboard v${this.version}] There is a new version of Discord Dashboard available. Please update.`)
            const this_version = await axios.get(`https://registry.npmjs.org/discord-dashboard/${this.version}`)
            if(this_version?.data?.deprecated){
                ErrorThrower(`This version is deprecated. Please update the module.`)
            }
        }

        if(this.engine == 'next') {
            if (this.dev) {
                console.log('Dashboard is in development mode. Please note that the dashboard will not send statistics to Assistants Services.')
                console.log('Also, each change in the theme pages source code will not be reflected in the dashboard after turning off development mode. You\'ll have to run the build command inside theme folder to build the changes into production environment.')
            }
            this.fastify = fastifyModule({logger: false})
            await this.prepareNext()
            this.registerFastifyEngine()
            this.registerFastifySession(this.fastify)
            for (const util of this.fastifyUtilities) {
                this.fastify.register(util[0], util[1] || {})
            }
            const FastifyApp = await this.prepareFastify()

            await FastifyApp.listen({
                port: this.port,
            })
            return this
        }else if(this.engine == 'ejs') {
            if (this.dev) {
                console.log('Running on EJS engine in development mode. Please note that the dashboard will not send statistics to Assistants Services.')
            }
            this.fastify = fastifyModule({logger: false})
            this.registerFastifyEngine()
            this.registerFastifySession(this.fastify)
            for (const util of this.fastifyUtilities) {
                this.fastify.register(util[0], util[1] || {})
            }
            const FastifyApp = await this.prepareFastify()

            await FastifyApp.listen({
                port: this.port,
            })
            return this
        }else{
            ErrorThrower(`Only "next" and "ejs" engines are officially supported (requested ${this.engine}).`)
        }
    }


    /*
     * Resolve the options to use.
     */
    private resolveOptions (optionsPath: string) {
        const files = fs.readdirSync(optionsPath).filter(file => !file.endsWith('.disabled.js') && file.endsWith('.js'))
        const options = []
        for(const Option of files) {
            let option = require(path.join(optionsPath, `./${Option}`))
            if(!option.type)
                return ErrorThrower(`Option ${Option} doesn't have a type defined.`)
            option.type = option.type.settings
            if(!option.name)
                return ErrorThrower(`Option ${Option} doesn't have a name defined.`)
            let optionId = option.name
            while(optionId.includes(' '))
                optionId = optionId.replace(' ', '_')
            optionId = optionId.toLowerCase()
            option.id = optionId

            // THEME OPTIONS
            //
            // resolveTypes:
            // getSettings - get the settings of the option after calling getSettings function
            // direct - get the settings of the option directly

            if(option.themeOptions && option.themeOptions.resolveType == 'getSettings'){
                option.themeOptions = JSON.parse(JSON.stringify(option.themeOptions.getSettings()))
            }else if(option.themeOptions && option.themeOptions.resolveType == 'direct'){
                option.themeOptions = JSON.parse(JSON.stringify(option.themeOptions))
            }

            option = Object.assign({
                themeOptions: {},
                shouldBeDisplayed: ()=>true,
                permissionsValidate: ()=>null,
                serverSideValidation: ()=>null,
            }, option)
            options.push(option)
        }
        return options
    }

    /*
     * Verify options list is unique and valid.
     */
    private verifyOptions () {
        const categories = this.categories
        let categoriesIds: string[] = []
        for(const category of categories) {
            if(categoriesIds.includes(category.id))
                ErrorThrower(`Category id ${category.id} is not unique.`)
            categoriesIds.push(category.id)
            const optionsIds: string[] = []
            for(const option of category.options) {
                if(!option.type)
                    ErrorThrower(`Option ${option.name} has no type.`)
                if(!option.name)
                    ErrorThrower(`An option in ${category.name} category with ${option.type.name} type has no name.`)
                if(!option.id)
                    ErrorThrower(`Option ${option.name} has no id.`)
                if(optionsIds.includes(option.id))
                    ErrorThrower(`Option id ${option.id} of ${option.name} option is not unique.`)
                if(!option.get || typeof option.get !== 'function')
                    ErrorThrower(`Option ${option.name} in ${category.name} category has no get function or it's type isn't a function.`)
                if(!option.set || typeof option.set !== 'function')
                    ErrorThrower(`Option ${option.name} in ${category.name} category has no set function or it's type isn't a function.`)
                optionsIds.push(option.id)
            }
        }
    }

    /*
     * Prepare the next app.
     */
    private prepareNext = async () => {
        const { next_app, next_handler } = this.theme.initNext(this.dev)
        await next_app.prepare()
        return { next_app, next_handler }
    }

    /*
     * Register the engine inside fastify.
     */
    private registerFastifyEngine () {
        if(this.engine == 'next'){
            this.theme.registerFastifyNext(this.fastify, this.dev)
            return
        }else if(this.engine == 'ejs'){
            this.theme.registerFastifyEJS(this.fastify, this.dev)
            return
        }else{
            ErrorThrower(`Only "next" and "ejs" engines are officially supported (passed ${this.engine}).`)
        }
    }

    /*
     * Register the fastify session plugin with fastify cookies.
     */
    private registerFastifySession (fastify: any) {
        fastify.register(fastifyCookie)
        fastify.register(fastifySession, {
            secret: this.sessionSecret || `${this.discordClient.id}+${this.client.id}`,
            cookie: { secure: Boolean(this.SSL?.httpRedirect) },
            expires: this.sessionExpires || 1000*60*60*24*7, // 7 days
            saveUninitialized: this.saveUninitialized,
            store: this.sessionStore,
        })
    }

    /*
     * Register the fastify static (for module, theme, and user).
     */
    private registerFastifyStatic () {
        this.fastify.register(require('@fastify/static'), {
            root: path.join(__dirname, 'public'),
            prefix: '/module-content/',
        })

        this.fastify.register(require('@fastify/static'), {
            root: this.theme.public_path,
            prefix: '/theme-content/',
            decorateReply: false
        })

        if(this.userStatic) {
            this.fastify.register(require('@fastify/static'), {
                root: this.userStatic.path,
                prefix: this.userStatic.url+'/',
                decorateReply: false
            })
        }
    }

    /*
     * Register the fastify oauth2 plugin with the Discord client OAuth2 credentials.
     */
    private registerFastifyOAuth2 () {
        this.fastify.register(fastifyOauth2, {
            name: 'discordOAuth2',
            scope: ["identify", "guilds", "guilds.join"],
            credentials: {
                client: {
                    id: this.client.id,
                    secret: this.client.secret
                },
                auth: fastifyOauth2.DISCORD_CONFIGURATION
            },
            startRedirectPath: '/auth',
            callbackUri: 'http://localhost:3000/api/auth/callback',
        })
    }

    /*
     * Init Discord Dashboard API.
     */
    private initFastifyApi () {
        ApiRouter.router(this)
    }

    /*
     * Init theme pages.
     */
    private initFastifyThemePages = async () => {
        const ThemePages = await this.theme.getPages({ ...this })
        for (const page of ThemePages) {
            this.fastify.route({
                method: page.method.toUpperCase(),
                url: page.url,
                preHandler: async (request: any, reply: any) => await page.preHandler(request, reply),
                handler: async (request: any, reply: any) => await page.handler(request, reply),
            })
        }
    }

    /*
     * Prepare the fastify app.
     */
    private prepareFastify = async () => {
        const fastify = this.fastify

        this.registerFastifyStatic()
        this.registerFastifyOAuth2()
        this.initFastifyApi()
        await this.initFastifyThemePages()

        return fastify
    }
}

/**
 * @typedef OptionGetterOptions
 * @property {object} guild - The guild object.
 * @property {object} user - The user object.
 */

/**
 * @typedef OptionSetterOptions
 * @property {object} guild - The guild object.
 * @property {object} user - The user object.
 * @property newData - The new data to save.
 */

/**
 * Set the options for an option on a guild.
 *
 * @callback OptionSetter
 * @param {OptionSetterOptions} options - The options.
 */

/**
 * Get the options for an option on a guild.
 *
 * @callback OptionGetter
 * @param {OptionGetterOptions} - The options.
 */

/**
 * Discord-Dashboard option file structure.
 *
 * @example
 * const {TextInput} = require('discord-dashboard').FormTypes
 * const {TextInputOptions} = require('theme-module').ThemeOptions
 *
 * module.exports = {
 *      name: 'Language',
 *      description: 'The language of the bot.',
 *      type: new TextInput()
 *                  .setDefaultValue('!'),
 *      themeOptions: new TextInputOptions()
 *                          .setColor('#ff0000')
 *                          .setBackgroundColor('#ff0000'),
 *      set: async ()=>{},
 *      get: async ()=>{}
 * }
 *
 * @property {string} name - The name of the option.
 * @property {string} description - The description of the option.
 * @property {any} type - The type of the option.
 * @property {OptionSetter} set - The function to set the option value.
 * @property {OptionGetter} get - The function to get the option value.
 * @interface [Option Structure]
 */

import { TextInput } from './formtypes/TextInput'

export const FormTypes = {
    TextInput,
}

const EJS: 'ejs' = 'ejs'
const NEXT: 'next' = 'next'

export const Engines = {
    EJS,
    NEXT,
}

/**
 * @interface Permissions
 * @description Discord permissions flags.
 *
 * @prop CREATE_INSTANT_INVITE - Create instant invites.
 * @prop KICK_MEMBERS - Kick members.
 * @prop BAN_MEMBERS - Ban members.
 * @prop ADMINISTRATOR - Administrator permissions.
 * @prop MANAGE_CHANNELS - Manage channels.
 * @prop MANAGE_GUILD - Manage the guild.
 * @prop ADD_REACTIONS - Add reactions.
 * @prop VIEW_AUDIT_LOG - View audit logs.
 * @prop VIEW_CHANNEL - View channels.
 * @prop SEND_MESSAGES - Send messages.
 * @prop SEND_TTS_MESSAGES - Send TTS messages.
 * @prop MANAGE_MESSAGES - Manage messages.
 * @prop EMBED_LINKS - Embed links.
 * @prop ATTACH_FILES - Attach files.
 * @prop READ_MESSAGE_HISTORY - Read message history.
 * @prop MENTION_EVERYONE - Mention everyone.
 * @prop USE_EXTERNAL_EMOJIS - Use external emojis.
 * @prop CONNECT - Connect to voice.
 * @prop SPEAK - Speak in voice.
 * @prop MUTE_MEMBERS - Mute members.
 * @prop DEAFEN_MEMBERS - Deafen members.
 * @prop MOVE_MEMBERS - Move members.
 * @prop USE_VAD - Use voice activity detection.
 * @prop CHANGE_NICKNAME - Change nickname.
 * @prop MANAGE_NICKNAMES - Manage nicknames.
 * @prop MANAGE_ROLES - Manage roles.
 * @prop MANAGE_WEBHOOKS - Manage webhooks.
 * @prop MANAGE_EMOJIS_AND_STICKERS - Manage emojis and stickers.
 * @prop USE_APPLICATION_COMMANDS - Use application commands.
 * @prop REQUEST_TO_SPEAK - Request to speak.
 * @prop MANAGE_EVENTS - Manage events.
 * @prop MANAGE_THREADS - Manage threads.
 * @prop CREATE_PUBLIC_THREADS - Create public threads.
 * @prop CREATE_PRIVATE_THREADS - Create private threads.
 * @prop USE_EXTERNAL_STICKERS - Use external stickers.
 * @prop SEND_MESSAGES_IN_THREADS - Send messages in threads.
 * @prop START_EMBEDDED_ACTIVITIES - Start embedded activities.
 * @prop MODERATE_MEMBERS - Moderate members.
 */
export const DiscordPermissions = {
    CREATE_INSTANT_INVITE: ['CREATE_INSTANT_INVITE', 0x1],
    KICK_MEMBERS: ['KICK_MEMBERS', 0x2],
    BAN_MEMBERS: ['BAN_MEMBERS', 0x4],
    ADMINISTRATOR: ['ADMINISTRATOR', 0x8],
    MANAGE_CHANNELS: ['MANAGE_CHANNELS', 0x10],
    MANAGE_GUILD: ['MANAGE_GUILD', 0x20],
    ADD_REACTIONS: ['ADD_REACTIONS', 0x40],
    VIEW_AUDIT_LOG: ['VIEW_AUDIT_LOG', 0x80],
    PRIORITY_SPEAKER: ['PRIORITY_SPEAKER', 0x100],
    STREAM: ['STREAM', 0x200],
    VIEW_CHANNEL: ['VIEW_CHANNEL', 0x400],
    SEND_MESSAGES: ['SEND_MESSAGES', 0x800],
    SEND_TTS_MESSAGES: ['SEND_TTS_MESSAGES', 0x1000],
    MANAGE_MESSAGES: ['MANAGE_MESSAGES', 0x2000],
    EMBED_LINKS: ['EMBED_LINKS', 0x4000],
    ATTACH_FILES: ['ATTACH_FILES', 0x8000],
    READ_MESSAGE_HISTORY: ['READ_MESSAGE_HISTORY', 0x10000],
    MENTION_EVERYONE: ['MENTION_EVERYONE', 0x20000],
    USE_EXTERNAL_EMOJIS: ['USE_EXTERNAL_EMOJIS', 0x40000],
    VIEW_GUILD_INSIGHTS: ['VIEW_GUILD_INSIGHTS', 0x80000],
    CONNECT: ['CONNECT', 0x100000],
    SPEAK: ['SPEAK', 0x200000],
    MUTE_MEMBERS: ['MUTE_MEMBERS', 0x400000],
    DEAFEN_MEMBERS: ['DEAFEN_MEMBERS', 0x800000],
    MOVE_MEMBERS: ['MOVE_MEMBERS', 0x1000000],
    USE_VAD: ['USE_VAD', 0x2000000],
    CHANGE_NICKNAME: ['CHANGE_NICKNAME', 0x4000000],
    MANAGE_NICKNAMES: ['MANAGE_NICKNAMES', 0x8000000],
    MANAGE_ROLES: ['MANAGE_ROLES', 0x10000000],
    MANAGE_WEBHOOKS: ['MANAGE_WEBHOOKS', 0x20000000],
    MANAGE_EMOJIS_AND_STICKERS: ['MANAGE_EMOJIS_AND_STICKERS', 0x40000000],
    USE_APPLICATION_COMMANDS: ['USE_APPLICATION_COMMANDS', 0x80000000],
    REQUEST_TO_SPEAK: ['REQUEST_TO_SPEAK', 0x100000000],
    MANAGE_EVENTS: ['MANAGE_EVENTS', 0x200000000],
    MANAGE_THREADS: ['MANAGE_THREADS', 0x400000000],
    CREATE_PUBLIC_THREADS: ['CREATE_PUBLIC_THREADS', 0x800000000],
    CREATE_PRIVATE_THREADS: ['CREATE_PRIVATE_THREADS', 0x1000000000],
    USE_EXTERNAL_STICKERS: ['USE_EXTERNAL_STICKERS', 0x2000000000],
    SEND_MESSAGES_IN_THREADS: ['SEND_MESSAGES_IN_THREADS', 0x4000000000],
    START_EMBEDDED_ACTIVITIES: ['START_EMBEDDED_ACTIVITIES', 0x8000000000],
    MODERATE_MEMBERS: ['MODERATE_MEMBERS', 0x10000000000]
}