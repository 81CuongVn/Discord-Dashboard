const {TextInput} = require('../../../dist/index').FormTypes

module.exports = {
    name: 'Prefix',
    description: 'Change bot prefix easily',
    type: new TextInput()
        .setPlaceholder('Prefix')
        .setDefaultValue('!')
        .setGlobalDisabled(false, ''),
    // dont display at all
    shouldBeDisplayed: async ({member, guild}) => {
        return true
    },
    // display with error
    prePermissionsCheck: async ({ member }) => {
        const blacklisted = true
        if(blacklisted)return "You are blacklisted from this option"

        return null
    },
    // validate after submit before saving
    serverSideValidation: async ({ newData }) => {
        if(newData=='kurwa')return "Prefix cannot be 'kurwa'"
        return null
    },
    get: async ({ member, guild })=>{
        return "ac!"
    },
    set: async ({ member, guild, newData })=>{
        console.log('got data', newData)
    }
}