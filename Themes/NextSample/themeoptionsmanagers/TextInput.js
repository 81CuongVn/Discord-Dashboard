module.exports = class TextInput {
    emojiPicker = false
    customStyles = {}
    iconLeft = null
    iconRight = null

    resolveType = 'getSettings'
    // you need to return .getSettings() in each manager
    // use 'direct' to use what's returned without calling getSettings() - but still be stringified and parsed to get rid of javascript functions


    useEmojiPicker = (value) => {
        this.emojiPicker = value
        return this
    }

    useCustomStyle = (object, value) => {
        this.customStyles[object] = value
        return this
    }

    useIconLeft = (value) => {
        this.iconLeft = value
        return this
    }

    useIconRight = (value) => {
        this.iconRight = value
        return this
    }

    getSettings = () => {
        return {
            emojiPicker: this.emojiPicker,
            customStyles: this.customStyles,
            iconLeft: this.iconLeft,
            iconRight: this.iconRight,
        }
    }
}