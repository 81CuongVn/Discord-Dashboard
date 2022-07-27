const axios = require('axios')
const FetchOptions = async (guild_id) => {
    const res = await axios.get(`/api/guild/${guild_id}/settings`)
    return res.data
}
export default FetchOptions