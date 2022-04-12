// IMPORTS
const express = require('express');
const cors = require('cors')
const formidableMiddleware = require('express-formidable');
require('dotenv').config();
const KeplerConfiguration = require('./KeplerConfiguration')
const DataNotion = require('./src/helpers/notion')
const DataWordpress = require('./src/helpers/wordpress')

// SERVER CONFIGURATION
const app = express();
app.listen(process.env.DATATLAS_BACK_END_PORT);
console.log("Listening on this port :", process.env.DATATLAS_BACK_END_PORT)
app.use(formidableMiddleware());
app.use(cors())

// INTERNAL TOOLS
const has = Object.prototype.hasOwnProperty;

// ROUTES
app.route('/api/test/')
  .get(function(req, res) {
    res.status(200).send('test')
  });

// todo : check security : anyone can send data...
app.get('/api/conf/:confWanted/', (req, res) => {
  if (req.params.confWanted === 'kepler') {
    res.status(200).send(KeplerConfiguration.getKeplerConfiguration())
  } else if (req.params.confWanted === 'instance') {
    res.status(200).send( KeplerConfiguration.getLayersConfiguration())
  } else {
    res.send('Unknown conf.'); // todo place a proper status code
  }
});
// todo : check security : anyone can send data...
app.post('/api/conf/:confWanted/', (req, res) => {
  if (req.params.confWanted === 'kepler' && has.call(req.fields, 'configuration_kepler')){
    KeplerConfiguration.storeConfigurationKepler(req.fields.configuration_kepler)
    res.status(200).send();
  } else if (req.params.confWanted === 'instance' && has.call(req.fields, 'configuration_instance')){
    KeplerConfiguration.storeConfigurationLayers(req.fields.configuration_instance)
    res.status(200).send();
  } else{
    res.send('unknown data'); // todo place a proper status code
  }
});

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
      return DataWordpress.insertWPImages(data)
      //return data
    }).then(function (rawData) {
      console.log('renvoi des données complètes')
      res.send(rawData)
    })
  }
});