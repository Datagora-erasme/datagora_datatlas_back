/**
 * Management of the Kepler configuration.
 */

const fs = require('fs')

/**
 * Reads the Kepler configuration file and sends its content back.
 */
module.exports.getKeplerConfiguration = () => {
  if (fs.existsSync('data/KeplerConfiguration.json')) {
    return [200, JSON.parse(readConfFile('data/KeplerConfiguration.json'))]
  } else {
    return [500, 'Fichier de configuration inaccessible.']
  }
}

/**
 * Reads the layers configuration file and sends its content back.
 * @returns {(number|any)[]}
 */
module.exports.getLayersConfiguration = () => {
  if (fs.existsSync('data/LayersConfiguration.json')) {
    return [200, JSON.parse(readConfFile('data/LayersConfiguration.json'))]
  } else {
    return [500, 'Fichier de configuration inaccessible.']
  }
}

/**
 * Stores Kepler configuration in a file.
 * @param {string} content
 */
module.exports.storeConfigurationKepler = (content) => {
  fs.writeFile('data/KeplerConfiguration.json', content, err => {
    if (err) {
      console.error(err)
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
      console.error(err)
      return err
    }
  })
}

/*                                          METHODS                                                                   */

const readConfFile = (configFile) => { return fs.readFileSync(configFile, 'utf8') }
