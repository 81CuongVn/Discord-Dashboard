const {TextInput} = require('../../../dist/index').FormTypes
const {TextInputManager, TextInputObjects} = require('../../../Themes/KardexTheme').ThemeOptions

let temp = null

module.exports = {
    name: 'Prefix but music!',
    description: 'Change bot prefix easily',
    type: new TextInput()
        .setPlaceholder('Prefix')
        .setDefaultValue('!')
        .setGlobalDisabled(false, '')
        .setClientSideValidation((value)=>{
            if(value == 'x')return "Value cannot be 'x'"
        })
        .setMinLength(1)
        .setMaxLength(10),
    themeOptions: new TextInputManager()
        .useEmojiPicker(true)
        .useCustomStyle(TextInputObjects.optionContainer, {
            /*backgroundColor: '#ff0000',*/
        })
        .useIconLeft('bi bi-person')
        .useColMd(12),
    // dont display at all
    shouldBeDisplayed: async ({member, guild}) => {
        return true
    },
    // display with error
    permissionsValidate: async ({ member }) => {
        const blacklisted = false
        if(blacklisted)return "You are blacklisted from this option"

        return null
    },
    // validate after submit before saving
    serverSideValidation: async ({ newData }) => {
        if(newData=='kurwa')return "Prefix cannot be 'kurwa'"
        return null
    },
    get: async ({ member, guild })=>{
        return temp
    },
    set: async ({ member, guild, newData })=>{
        temp = newData
    }
}