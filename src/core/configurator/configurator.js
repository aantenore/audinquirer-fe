
import jsonData from '../../configs/config.json'

var configurator = {
    getConfigJson: async (callback = (json) => { console.log('[configurator.getConfigJson] Json read: ', json) }, errorCallback = (err) => { console.error('[configurator.getConfigJson] Error reading configuration file', err) }) => {
        callback(jsonData)
        return jsonData
    }
}


export default configurator