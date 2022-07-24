/**
 * Text input form type.
 * @class TextInput
 * @example
 * const {TextInput} = require('discord-dashboard').FormTypes
 * const {TextInputOptions} = require('theme-module').ThemeOptions
 *
 * module.exports = {
 *      name: 'Language',
 *      description: 'The language of the bot.',
 *      type: new TextInput()
 *                  .setDefaultValue('!')
 *                  .setPlaceholder('Bot prefix...')
 *                  .setMaxLength(4)
 *                  .setMinLength(1)
 *                  .setRequired(true)
 *                  .setGlobalDisabled(false, '')
 *                  .setClientSideValidation((value)=>{
 *                      const fine = value.regex(`/^[a-z]{4}$/`)
 *                      if(!fine)return "Invalid prefix"
 *                      return null
 *                   }),
 *      themeOptions: new TextInputOptions()
 *                          .setColor('#ff0000')
 *                          .setBackgroundColor('#ff0000'),
 *    // dont display at all
 *     shouldBeDisplayed: async ({member, guild}) => {
 *         return true
 *     },
 *     // display with error
 *     prePermissionsCheck: async ({ member }) => {
 *         const blacklisted = false
 *         if(blacklisted)return "You are blacklisted from this option"
 *
 *         return null
 *     },
 *     // validate after submit before saving
 *     serverSideValidation: async ({ newData }) => {
 *         if(newData=='kurwa')return "Easy, man!"
 *         return null
 *     },
 *     get: async ({ member, guild })=>{
 *         return "ac!"
 *     },
 *     set: async ({ member, guild, newData })=>{
 *         console.log('got data', newData)
 *     }
 * }
 */
export class TextInput {
    public settings: {
        name: string,
        defaultValue: string,
        placeholder: string,
        maxLength: number,
        minLength: number,
        required: boolean,
        disabled: {
            bool: boolean,
            reason: string
        }
        clientSideValidation: string
    } = {
        name: 'TextInput',
        defaultValue: '',
        placeholder: '',
        maxLength: 100,
        minLength: 0,
        required: false,
        disabled: {
            bool: false,
            reason: ''
        },
        clientSideValidation: '()=>{return null}'
    };

    /**
     * Set the default value of the input.
     * @param {string} value - The default value of the input.
     */
    public setDefaultValue(value: string) {
        this.settings.defaultValue = value
        return this
    }

    /**
     * Set the placeholder of the input.
     * @param {string} value - The placeholder of the input.
     */
    public setPlaceholder(value: string) {
        this.settings.placeholder = value
        return this
    }

    /**
     * Set the max length of the input.
     * @param {number} value - The max length of the input.
     */

    public setMaxLength(value: number) {
        this.settings.maxLength = value
        return this
    }

    /**
     * Set the min length of the input.
     * @param {number} value - The min length of the input.
     */

    public setMinLength(value: number) {
        this.settings.minLength = value
        return this
    }

    /**
     * Set the required state of the input.
     * @param {boolean} value - The required state of the input.
     */

    public setRequired(value: boolean) {
        this.settings.required = value
        return this
    }

    /**
     * Set the disabled state of the input.
     * @param {boolean} value - The disabled state of the input.
     * @param {string} reason - The reason why the input is disabled.
     */
    public setGlobalDisabled(value: boolean, reason: string) {
        this.settings.disabled = {
            bool: value,
            reason: reason
        }
        return this
    }

    /**
     * Validate the TextInput value on Client-Side.
     * Please note that this is not a Server-Side validator, but a function that will be called on the client side.
     * Don't use any libraries or anything else that is not natively supported by the browser.
     * Value to validate is passed as a parameter.
     *
     * @callback TextInput~ClientSideValidation
     * @param {string} value - The value to validate.
     */

    /**
     * Set the client side validation of the input.
     * Please note that this is not a Server-Side validator, but a function that will be called on the client side.
     * Don't use any libraries or anything else that is not natively supported by the browser.
     * Value to validate is passed as a parameter.
     *
     * @param {TextInput~ClientSideValidation} func - The client side validation of the input.
     */
    public setClientSideValidation(func: (value: string)=>any) {
        this.settings.clientSideValidation = func.toString()
        return this
    }
}