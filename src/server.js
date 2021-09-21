/**
 * Server entrypoint.
 */

/*
    Configs.
    TODO : put those configs in the env variables for deployments.
 */
// const port

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
    /api/test/        -> request to check connection                                          -> send back « test »                     DONE
    /api/conf/        -> request for default configuration                                    -> send back the recorded Kepler configuration  DONE
    /api/conf/(POST)  -> request for storing a new default configuration (new_configuration)  -> send back the recorded Kepler configuration  DONE
    /api/data/${DataType}/${Datum}  -> request to get the data of a dataset (in a geojson Kepler style)
 */

//  /api/test
app.get('/api/test/', (req, res, next) => {
  res.send('test')
});

//  /api/conf
app.post('/api/conf/', (req, res, next) => {
  if (has.call(req.query, "new_configuration")){
    KeplerConfiguration.storeConfiguration(req.query.new_configuration)
  } else {
    res.send({ "data":DataSources.getDataSources(), "KeplerConfiguration":KeplerConfiguration.getConfiguration()})
  }
});

//  /api/data/${DataType}/${Datum}
app.get('/api/data/:dataType/:dataWanted/', function (req, res, next) {
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

app.listen(3000); // todo port in env variable
