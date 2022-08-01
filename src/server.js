// IMPORTS
const express = require('express')
const formidable = require('formidable')
const cors = require('cors')
require('dotenv').config()
const KeplerConfiguration = require('./KeplerConfiguration')
const DataNotion = require('./src/helpers/notion')
const DataWordpress = require('./src/helpers/wordpress')
const path = require('path')
const fs = require('fs')

// SERVER CONFIGURATION
const app = express()
app.listen(process.env.DATATLAS_BACK_END_PORT)
console.log('Listening on this port :', process.env.DATATLAS_BACK_END_PORT)
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

  return new Promise((resolve, reject) => {
    source.on('end', resolve)
    source.on('error', reject)
    source.pipe(dest)
  })
}

// ROUTES
app.route('/api/test/')
  .get(function (req, res) {
    res.status(200).send('test')
  })

/**
 * @param req.params.confWanted
 */
app.get('/api/conf/:confWanted/', (req, res) => {
  if (req.params.confWanted === 'kepler') {
    res.status(200).send(KeplerConfiguration.getKeplerConfiguration())
  } else if (req.params.confWanted === 'instance') {
    res.status(200).send(KeplerConfiguration.getLayersConfiguration())
  } else {
    res.status(400).send('Unknown conf.')
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
        res.status(400).send('incoherent data')
      }
      if (req.params.confWanted === 'kepler' && has.call(fields, 'configuration_kepler')) {
        KeplerConfiguration.storeConfigurationKepler(fields.configuration_kepler)
        res.status(200).send()
      } else if (req.params.confWanted === 'instance' && has.call(fields, 'configuration_instance')) {
        KeplerConfiguration.storeConfigurationLayers(fields.configuration_instance)
        res.status(200).send()
      } else {
        res.status(400).send('unknown data')
      }
    })
  } else {
    res.status(401).send('Unauthorized')
  }
})

/**
 * @param req.params.dataWanted
 */
app.get('/api/data/:dataType/:dataWanted/', function (req, res) {
  if (req.params.dataType === 'notion') {
    DataNotion.notionRequest(req.params.dataWanted).then(function (response) {
      res.status(200).send(DataNotion.toGeoJson(response, req.query))
    })
  } else if (req.params.dataType === 'wordpress') {
    // These urls have to be harcoded because they are humanly picked. :/
    if (req.params.dataWanted === 'canographia.datagora.erasme.org/wp-json/wp/v2/trees_hotspot/') {
      DataWordpress.treesToGeoJson(req.params.dataWanted).then(function (properGEOjsonData) {
        res.status(200).send(properGEOjsonData)
      })
    } else {
      DataWordpress.wordpressRequest(req.params.dataWanted).then(function (rawData) {
        return DataWordpress.toGeoJson(rawData)
      }).then(function (data) {
        const promises = [
          DataWordpress.insertWPImages(data),
          DataWordpress.insertWPKeywords(data)
        ]
        return Promise.all(promises).then(() => {
          return data
        })
      }).then(function (rawData) {
        res.status(200).send(rawData)
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
      }
      const tempFileLocation = files.file.filepath
      const publicFileLocation = path.join(__dirname, '/public/img/', files.file.originalFilename)
      moveFile(tempFileLocation, publicFileLocation).then(() => res.send(publicFileLocation))
      res.status(200)
    })
  } else {
    res.status(401).send('Unauthorized')
  }
})
