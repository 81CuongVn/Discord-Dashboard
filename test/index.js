const path = require('path')

const dotenv = require('dotenv').config({path: path.join(__dirname, './.env')})

const { Client, Intents } = require('discord.js')
const client = new Client({ intents: [ Intents.FLAGS.GUILDS ] })

const helmet = require('@fastify/helmet')

client.login(process.env.BOT_TOKEN)

const { Dashboard } = require('../dist/index')
const DefaultTheme = require('../Themes/KardexTheme')
const Theme = new DefaultTheme()
    .addCustomPage({
        url: '/test',
        components: [],
        icon: 'home',
        name: 'Test',
        section: 'LoL',
    });

new Dashboard()
    .setDev(true)
    .registerProject({
        accountToken: process.env.ASSISTANTS_SERVICES_ACCOUNT_TOKEN,
        projectId: process.env.DISCORD_DASHBOARD_PROJECT_ID
    })
    .setTheme(Theme)
    .setOptionsFolder(path.join(__dirname, './DiscordDashboardCategories'))
    .setPort(process.env.PORT)
    .setDiscordClient(client)
    .setClientCredentials({
        id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
    })
    .setStatic({
        url: '/cdn',
        path: path.join(__dirname, './static')
    })
    .setSession({
        secret: process.env.SESSION_SECRET,
        expires: 1000 * 60 * 60 * 24 * 7,
        saveUninitialized: false,
        store: (session) => {
            const FileStore = require('session-file-store')(session)
            return new FileStore({})
        }
    })
    .setAdministrators(['778685361014046780'])
    .setFastifyUtilities([
        [helmet, { contentSecurityPolicy: false, global: true }],
    ])
    .start()
    .then((instance) => {
        /*console.log(
            `Dashboard started on ${instance.port} port with ${instance.theme.name} ` +
            `(codename: ${instance.theme.codename}) theme in ${instance.dev ? 'development' : 'production'} mode.`
        )
        console.log(JSON.stringify(instance.categories, null, 2))*/
    })
    .catch((err) => {
        console.error(err)
    })
