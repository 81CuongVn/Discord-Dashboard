module.exports = class TextInput {
    emojiPicker = false
    customStyles = {}
    iconLeft = null
    iconRight = null
    colMd = 12

    resolveType = 'getSettings'
    // you need to return .getSettings() in each manager
    // use 'direct' to use what's returned without calling getSettings() - but still be stringified and parsed to get rid of javascript functions


    useEmojiPicker = (value) => {
        if(this.iconLeft || this.iconRight)console.log('You cannot use emoji picker with iconLeft or iconRight. We will take just emoji picker then.')
        this.emojiPicker = value
        return this
    }

    useCustomStyle = (object, value) => {
        this.customStyles[object] = value
        return this
    }

    useIconLeft = (value) => {
        if(this.iconRight)console.log('You cannot use iconLeft and iconRight. We will take just iconLeft then.')
        if(this.emojiPicker)console.log('You cannot use emoji picker and iconLeft. We will take just emoji picker then.')
        this.iconLeft = value
        return this
    }

    useIconRight = (value) => {
        if(this.iconLeft)console.log('You cannot use iconLeft and iconRight. We will take just iconLeft then.')
        if(this.emojiPicker)console.log('You cannot use emoji picker and iconRight. We will take just emoji picker then.')
        this.iconRight = value
        return this
    }

    useColMd = (value) => {
        // value 1-12
        this.colMd = value
        return this
    }

    getSettings = () => {
        return {
            emojiPicker: this.emojiPicker,
            customStyles: this.customStyles,
            iconLeft: this.iconLeft,
            iconRight: this.iconRight,
            colMd: this.colMd,
        }
    }
}