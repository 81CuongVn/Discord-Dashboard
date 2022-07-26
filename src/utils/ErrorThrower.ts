import colors from 'colors'
colors.enable()

export function ErrorThrower(ErrorText: string) {
    const version = require('../../package.json').version
    const ErrorInfo = `Discord-Dashboard v${version} Error:`
    const DoYouNeedHelp = `Do you need help? Join our Discord support server: https://discord.gg/6Yv5U9V3ux\n`
    throw new Error(`${ErrorInfo.red.bold} ${ErrorText.bold}\n       ${DoYouNeedHelp.blue.italic}`)
}