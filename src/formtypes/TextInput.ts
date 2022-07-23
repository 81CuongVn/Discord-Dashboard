/**
 * Text input form type.
 * @class TextInput
 * @example
 * module.exports = {
 *      id: 'lang',
 *      name: 'Language',
 *      description: 'The language of the bot.',
 *      type: DBD.FormTypes.TextInput('a'),
 *      set: ()=>{},
 *      get: ()=>{}
 * }
 */
export class TextInput {
    public settings: {
        type: string,
        defaultValue: string,
        placeholder: string,
        disabled: boolean
    } = {
        type: 'TextInput',
        defaultValue: '',
        placeholder: '',
        disabled: false,
    };

    /**
     * Set the default value of the input.
     * @param {string} value - The default value of the input.
     */
    public setDefaultValue(value: string) {
        this.settings.defaultValue = value
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
     * Set the disabled state of the input.
     * @param {boolean} value - The disabled state of the input.
     */
    public setDisabled(value: boolean) {
        this.settings.disabled = value
        return this
    }
}