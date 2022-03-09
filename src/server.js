/**
 * Server entrypoint.
 */

/*
    Imports
 */
const multer  = require('multer')
const express = require('express') // Webserver
let cors = require('cors')
const upload = multer({ dest: 'uploads/' }).single('image')

let app = express()
app.use(cors())

require('dotenv').config();


const KeplerConfiguration = require('./KeplerConfiguration')
const DataSources = require('./DataSources')
//app.use(upload.array());
app.use(express.static('public'));

const DataNotion = require('./src/helpers/notion')
const DataWordpress = require('./src/helpers/wordpress')


app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const has = Object.prototype.hasOwnProperty;

/*
    Routes
GET   /api/test/          -> request to check connection                                          -> send back « test »                     DONE
GET   /api/conf/:confWanted/ -> request for a conf data.                                                                                          DONE
POST  /api/conf/:confWanted/ -> request for storing a conf data.                                                                                  DONE
POST  /api/upload/            -> request to store a file              -> NOT WORKING

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
  if (req.params.dataType === 'notion') {
    DataNotion.notionRequest(req.params.dataWanted).then(function (response) {
      res.send(DataNotion.toGeoJson(response, req.query))
    })
  } else if (req.params.dataType === 'wordpress') {
    DataWordpress.wordpressRequest(req.params.dataWanted).then(function (response) {
      res.send(DataWordpress.toGeoJson(response))
    })


  }
});


/*app.post('/api/upload', upload.single('image'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any

  // DOES NOT WORK ! req.file is ALWAYS undefined whatever i do.
  console.log(req.file)
  console.log(req.body)

})*/


app.listen(process.env.DATATLAS_BACK_END_PORT);
console.log("Server started on port :", process.env.DATATLAS_BACK_END_PORT )