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
// todo : check security : anyone can send data...
app.get('/api/conf/:confWanted/', (req, res) => {
  if (req.params.confWanted === 'kepler') {
    res.status(200).send(KeplerConfiguration.getKeplerConfiguration())
  } else if (req.params.confWanted === 'instance') {
    res.status(200).send(KeplerConfiguration.getLayersConfiguration())
  } else {
    res.send('Unknown conf.') // todo place a proper status code
  }
})
// todo : check security : anyone can send data...
app.post('/api/conf/:confWanted/', (req, res) => {
  const form = formidable({ multiples: true })
  form.parse(req, (err, fields) => {
    if (err) {
      return
    }
    if (req.params.confWanted === 'kepler' && has.call(fields, 'configuration_kepler')) {
      KeplerConfiguration.storeConfigurationKepler(fields.configuration_kepler)
      res.status(200).send()
    } else if (req.params.confWanted === 'instance' && has.call(fields, 'configuration_instance')) {
      KeplerConfiguration.storeConfigurationLayers(fields.configuration_instance)
      res.status(200).send()
    } else {
      res.send('unknown data') // todo place a proper status code
    }
  })
})
// todo : check security : anyone can send data...
app.get('/api/data/:dataType/:dataWanted/', function (req, res, next) {
  if (req.params.dataType === 'notion') {
    DataNotion.notionRequest(req.params.dataWanted).then(function (response) {
      res.send(DataNotion.toGeoJson(response, req.query))
    })
  } else if (req.params.dataType === 'wordpress') {
    DataWordpress.wordpressRequest(req.params.dataWanted).then(function (rawData) {
      return DataWordpress.toGeoJson(rawData)
    }).then(function (data) {
      const promises = [
        DataWordpress.insertWPImages(data),
        DataWordpress.insertWPKeywords(data),
        DataWordpress.insertWPCoordinates(data)
      ]
      return Promise.all(promises).then((values) => {
        return data
      })
    }).then(function (rawData) {
      res.send(rawData)
    })
  }
})
app.get('/api/upload/', (req, res) => {
  const files = []
  fs.readdirSync(path.join(__dirname, '/public/img/')).forEach(file => {
    files.push(file)
  })
  res.status(200).json(files)
})
// todo : check security : anyone can send data...
app.post('/api/upload/', (req, res, next) => {
  const form = formidable({ multiples: true })
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    const tempFileLocation = files.file.filepath
    const publicFileLocation = path.join(__dirname, '/public/img/', files.file.originalFilename)
    moveFile(tempFileLocation, publicFileLocation).then(r => res.send(publicFileLocation))
  })
})
