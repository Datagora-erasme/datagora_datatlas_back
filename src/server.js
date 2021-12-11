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
let multer = require('multer');
let upload = multer();

require('dotenv').config();


const KeplerConfiguration = require('./KeplerConfiguration')
const DataSources = require('./DataSources')
app.use(upload.array());
app.use(express.static('public'));

const DataNotion = require('./src/helpers/notion')

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const has = Object.prototype.hasOwnProperty;

/*
    Routes
GET   /api/test/          -> request to check connection                                          -> send back « test »                     DONE
GET   /api/conf/:confWanted/ -> request for a conf data.                                                                                          DONE
POST  /api/conf/:confWanted/ -> request for storing a conf data.                                                                                  DONE


    /api/conf/retrieve/ -> request for default configuration                                    -> send back the recorded Kepler configuration
    /api/conf/store/    -> request for storing a new default configuration (new_configuration)  -> send back the two recorded Kepler configuration
    /api/data/${DataType}/${Datum}  -> request to get the data of a dataset (in a geojson Kepler style)
 */

//  /api/test
app.get('/api/test/', (req, res, next) => {
  res.send('test')
  next();
});


//  /api/conf/:confWanted/
// todo : check security : anyone can send data...
app.get('/api/conf/:confWanted/', function (req, res, next) {
  if (req.params.confWanted === 'kepler') {
    res.send(KeplerConfiguration.getKeplerConfiguration())
  } else if (req.params.confWanted === 'instance') {
    res.send( KeplerConfiguration.getLayersConfiguration())
  } else {
    res.send('Unknown conf.');
  }
  next();
});


//  /api/conf/store
// todo : check security : anyone can send data...
app.post('/api/conf/:confWanted/', (req, res, next) => {
  if (req.params.confWanted === 'kepler' && has.call(req.body, 'configuration_kepler')){
    KeplerConfiguration.storeConfigurationKepler(req.body.configuration_kepler)
    res.send();
  } else if (req.params.confWanted === 'instance' && has.call(req.body, 'configuration_instance')){
    KeplerConfiguration.storeConfigurationLayers(req.body.configuration_instance)
    res.send();
  } else{
    res.send('unknown data');
  }
});



















//  /api/data/${DataType}/${Datum}
app.get('/api/data/:dataType/:dataWanted/', function (req, res, next) {
  //console.log(window[req.params.dataType])
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
console.log("Server started on port :", process.env.DATATLAS_BACK_END_PORT )