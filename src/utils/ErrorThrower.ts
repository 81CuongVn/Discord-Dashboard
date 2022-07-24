import colors from 'colors'
colors.enable()

export function ErrorThrower(ErrorText: string) {
    const version = require('../../package.json').version
    const ErrorInfo = `Discord-Dashboard v${version} Error: `;
    const DoYouNeedHelp = `\n       Do you need help? Join our Discord support server: https://discord.gg/6Yv5U9V3ux\n`
    // @ts-ignore
    throw new Error(ErrorInfo.red.bold + ErrorText.bold+ DoYouNeedHelp.blue.italic);
}