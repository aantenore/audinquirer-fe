
const defaultConfigPath = '../../configs/config.json'
const jsonData = require(defaultConfigPath)

var configurator = {
    getConfigJson: (callback = (json) => { console.log('[configurator.getConfigJson] Json read: ', json) }, errorCallback = (err) => { console.error('[configurator.getConfigJson] Error reading configuration file', err) }) => {
        callback(JSON.parse(jsonData))
        return JSON.parse(jsonData)
    }
}


export default configurator