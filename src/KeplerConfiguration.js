/**
 * Management of the Kepler configuration.
 */

const fs = require('fs')

/**
 * Reads the Kepler configuration file and sends its content back.
 * @returns {string}
 */
module.exports.getKeplerConfiguration = () => {
  return JSON.parse(readConfFile('data/KeplerConfiguration.json'))
}

/**
 * Reads the layers configuration file and sends its content back.
 * @returns {string}
 */
module.exports.getLayersConfiguration = () => {
  return JSON.parse(readConfFile('data/LayersConfiguration.json'))
}

/**
 * Stores Kepler configuration in a file.
 * @param {string} content
 */
module.exports.storeConfigurationKepler = (content) => {
  fs.writeFile('data/KeplerConfiguration.json', content, err => {
    if (err) {
      //console.error(err)
      return err
    }
  })
}

/**
 * Stores the layers configuration in a file.
 * @param {string} content
 */
module.exports.storeConfigurationLayers = (content) => {
  fs.writeFile('data/LayersConfiguration.json', content, err => {
    if (err) {
      //console.error(err)
      return err
    }
  })
}

/*                                          METHODS                                                                   */

const readConfFile = (configFile) => { return fs.readFileSync(configFile, 'utf8') }
