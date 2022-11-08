// IMPORTS
const express = require('express')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
require('dotenv').config()
const log4js = require("log4js");
const logger = log4js.getLogger();
const KeplerConfiguration = require('./KeplerConfiguration')
const DataNotion = require('./helpers/notion')
const DataWordpress = require('./helpers/wordpress')

// Configuring the logger
log4js.configure({
  appenders: {
    out: { type: "stdout" },
    app: { type: "file", filename: "backend.log" },
  },
  categories: {
    default: { appenders: ["out", "app"], level: "debug" },
  }
});

// get env var LOG_LEVEL
logger.level = process.env.LOG_LEVEL || 'debug'


// SERVER CONFIGURATION
const app = express()
app.listen(process.env.DATATLAS_BACK_END_PORT)
console.log('Listening on this port :', process.env.DATATLAS_BACK_END_PORT)
logger.info('Listening on this port :', process.env.DATATLAS_BACK_END_PORT);
app.use(cors())

// INTERNAL TOOLS
/**
 * Checks if object has a property.
 * @type {(v: PropertyKey) => boolean}
 */
const has = Object.prototype.hasOwnProperty

/**
 * Move a file from a place to another one.
 * @param from
 * @param to
 * @returns {Promise<unknown>}
 */
function moveFile (from, to) {
  const source = fs.createReadStream(from)
  const dest = fs.createWriteStream(to)
  logger.debug('Moving file from', from, 'to', to)

  return new Promise((resolve, reject) => {
    source.on('end', resolve)
    source.on('error', reject)
    source.pipe(dest)
    logger.debug('File moved')
  })
}

// ROUTES
app.route('/api/test/')
  .get(function (req, res) {
    res.status(200).send('test')
    logger.debug('/api/test/ GET request returned 200')
  })

/**
 * @param req.params.confWanted
 */
app.get('/api/conf/:confWanted/', (req, res) => {
  if (req.params.confWanted === 'kepler') {
    const [code, content] = KeplerConfiguration.getKeplerConfiguration()
    res.status(code).send(content)
    logger.info('/api/conf/kepler/ GET request returned', code)
  } else if (req.params.confWanted === 'instance') {
    const [code, content] = KeplerConfiguration.getLayersConfiguration()
    res.status(code).send(content)
    logger.info('/api/conf/instance/ GET request returned', code)
  } else {
    res.status(400).send('Unknown conf.')
    logger.warn('/api/conf/ GET request returned 400')
  }
})

/**
 * @param req
 * @param rq.fields
 * @param req.fields.configuration_kepler
 * @param req.fields.configuration_instance
 */
app.post('/api/conf/:confWanted/', (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer' &&
    req.headers.authorization.split(' ')[1] === process.env.BEARER_TOKEN
  ) {
    const form = formidable({ multiples: true })
    form.parse(req, (err, fields) => {
      if (err) {
        res.status(400).send('Incoherent data')
        logger.warn('/api/conf/ POST request returned 400 - Incoherent data')
      }
      if (req.params.confWanted === 'kepler' && has.call(fields, 'configuration_kepler')) {
        const [code, content] = KeplerConfiguration.storeConfigurationKepler(fields.configuration_kepler)
        res.status(code).send(content)
        logger.info('/api/conf/kepler/ POST request returned', code)
      } else if (req.params.confWanted === 'instance' && has.call(fields, 'configuration_instance')) {
        const [code, content] = KeplerConfiguration.storeConfigurationLayers(fields.configuration_instance)
        res.status(code).send(content)
        logger.info('/api/conf/instance/ POST request returned', code)
      } else {
        res.status(400).send('Unknown data')
        logger.warn('/api/conf/ POST request returned 400 - Unknown data')
      }
    })
  } else {
    res.status(401).send('Unauthorized')
    logger.warn('/api/conf/ POST request returned 401 - Unauthorized')
  }
})

/**
 * @param req.params.dataWanted
 */
app.get('/api/data/:dataType/:dataWanted/', function (req, res) {
  if (req.params.dataType === 'notion') {
    DataNotion.notionRequest(req.params.dataWanted).then(function (response) {
      res.status(200).send(DataNotion.toGeoJson(response, req.query))
      logger.info('/api/data/notion/ GET request returned 200')
    })
  } else if (req.params.dataType === 'wordpress') {
    // These urls have to be harcoded because they are humanly picked. :/
    if (req.params.dataWanted === 'canographia.datagora.erasme.org/wp-json/wp/v2/trees_hotspot/') {
      DataWordpress.treesToGeoJson(req.params.dataWanted).then(function (properGEOjsonData) {
        res.status(200).send(properGEOjsonData)
        logger.info('/api/data/wordpress/canographia.datagora.erasme.org/wp-json/wp/v2/trees_hotspot/ GET request returned 200')
      })
    } else if (req.params.dataWanted === 'canographia.datagora.erasme.org/wp-json/wp/v2/evenement/') {
      DataWordpress.eventsToGeoJson(req.params.dataWanted).then(function (properGEOjsonData) {
        res.status(200).send(properGEOjsonData)
        logger.info('/api/data/wordpress/canographia.datagora.erasme.org/wp-json/wp/v2/evenement/ GET request returned 200')

      })
    } else {
      DataWordpress.canographiaToGeoJson(req.params.dataWanted).then(function (properGEOjsonData) {
        res.status(200).send(properGEOjsonData)
        logger.info('/api/data/wordpress/canographiaToGeoJson GET request returned 200')
      })
    }
  }
})

app.get('/api/upload/', (req, res) => {
  const files = []
  fs.readdirSync(path.join(__dirname, '/public/img/')).forEach(file => {
    files.push(file)
  })
  res.status(200).json(files)
  logger.info('/api/upload/ GET request returned 200')
})

app.post('/api/upload/', (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer' &&
    req.headers.authorization.split(' ')[1] === process.env.BEARER_TOKEN
  ) {
    const form = formidable({ multiples: true })
    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err)
        res.status(400).send('incoherent data')
        logger.warn('/api/upload/ POST request returned 400 - Incoherent data')
      }
      const tempFileLocation = files.file.filepath
      const publicFileLocation = path.join(__dirname, '/public/img/', files.file.originalFilename)
      moveFile(tempFileLocation, publicFileLocation).then(() => res.send(publicFileLocation))
      res.status(200)
      logger.info('/api/upload/ POST request returned 200')
    })
  } else {
    res.status(401).send('Unauthorized')
    logger.warn('/api/upload/ POST request returned 401 - Unauthorized')
  }
})

module.exports = app