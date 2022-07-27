const axios = require('axios')
const PostOptions = async (guild_id, options) => {
    const res = await axios.post(`/api/guild/${guild_id}/settings`, {settings: options})
    return res.data
}
export default PostOptions