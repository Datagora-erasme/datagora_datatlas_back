/**
 * Management of the Kepler configuration.
 */

const fs = require('fs');

/**
 * Reads the Kepler configuration file and sends its content back.
 * @returns {string}
 */
module.exports.getConfiguration = () => {
    return readConfFile('data/KeplerConfiguration.json');
};


module.exports.storeConfiguration = (content) => {
    fs.writeFile('data/KeplerConfiguration.json', content, err => {
        if (err) {
            console.error(err)
        }
    });
};

/*                                          METHODS                                                                   */

const readConfFile = (configFile) => {return  fs.readFileSync(configFile, 'utf8');};