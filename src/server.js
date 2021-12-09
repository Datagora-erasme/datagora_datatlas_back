/**
 * Server entrypoint.
 */

/*
    Imports
 */
const express = require('express') // Webserver
let cors = require('cors')
let app = express()
app.use(cors())

require('dotenv').config();


const KeplerConfiguration = require('./KeplerConfiguration')
const DataSources = require('./DataSources')

const DataNotion = require('./src/helpers/notion')

app.use(express.json())
const has = Object.prototype.hasOwnProperty;

/*
    Routes
    /api/test/          -> request to check connection                                          -> send back « test »                     DONE
    /api/conf/retrieve/ -> request for default configuration                                    -> send back the recorded Kepler configuration
    /api/conf/store/    -> request for storing a new default configuration (new_configuration)  -> send back the two recorded Kepler configuration
    /api/data/${DataType}/${Datum}  -> request to get the data of a dataset (in a geojson Kepler style)
 */

//  /api/test
app.get('/api/test/', (req, res, next) => {
  res.send('test')
});

//  /api/conf/store
// todo : check security : anyone can send data...
app.post('/api/conf/store/', (req, res, next) => {
  const body = req.body;
  const jsonified = res.json(body);
  if (has.call(req.body, 'configuration_kepler')){
    KeplerConfiguration.storeConfigurationKepler(req.query.configuration_kepler)
  }
  if (has.call(req.body, 'configuration_instance')){
    KeplerConfiguration.storeConfigurationLayers(req.body.configuration_layer)
  }

  /*else {
    res.send({ "data":DataSources.getDataSources(), "KeplerConfiguration":KeplerConfiguration.getConfiguration()})
  }
  */
});

//  /api/conf/retrieve
// todo : check security : anyone can send data...
app.get ('/api/conf/retrieve/', (req, res, next) => {
  if (has.call(req.query, 'configuration_kepler')){
    res.send({ "data":DataSources.getDataSources(), "KeplerConfiguration":KeplerConfiguration.getKeplerConfiguration()})
  }
  if (has.call(req.query, 'configuration_layer')){
    res.send({ "data":DataSources.getDataSources(), "LayersConfiguration":KeplerConfiguration.getLayersConfiguration()})
  }

  /*else {
    res.send({ "data":DataSources.getDataSources(), "KeplerConfiguration":KeplerConfiguration.getConfiguration()})
  }
  */
});

//  /api/data/${DataType}/${Datum}
app.get('/api/data/:dataType/:dataWanted/', function (req, res, next) {
  console.log(window[req.params.dataType])
  if (req.params.dataType === 'notion') { // todo must be automatically done : if == notion,
    if(req.params.dataWanted ==='notion_tiga'){
      DataNotion.notionRequest('68a69714137041deb0112e541a9d12b3').then(function (response) {
        res.send(DataNotion.TIGAtoGEOjson(response))
      })
    } else if(req.params.dataWanted ==='notion_mediation'){
      DataNotion.notionRequest('8dc9e3a344f54e4db756917acf047af3').then(function (response) {
        res.send(DataNotion.mediationtoGEOjson(response))
      })
    } else {
      res.send("unknown notion route")
    }
  }
});

// Temporary route for Camille's usage.
app.get('/api/data/camille/', function (req, res, next) {
  /*
    This route is used as an example. It has to read a notion page (in our case tiga) and prepare it including multi-selects
   */
  DataNotion.notionRequest('68a69714137041deb0112e541a9d12b3').then(function (response) {
    res.send(DataNotion.TIGAtoGEOjsonMS(response))
    })
});


app.listen(process.env.DATATLAS_BACK_END_PORT);
