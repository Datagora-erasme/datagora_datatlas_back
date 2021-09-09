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
let app = express()

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
app.get('/api/test/', (req, res) => {
  res.send('test')
});

//  /api/conf
app.post('/api/conf/', (req, res) => {
  if (has.call(req.query, "new_configuration")){
    KeplerConfiguration.storeConfiguration(req.query.new_configuration)
  } else {
    res.send({ "data":DataSources.getDataSources(), "KeplerConfiguration":KeplerConfiguration.getConfiguration()})
  }
});

//  /api/data/${DataType}/${Datum}
app.get('/api/data/:dataType/:dataWanted/', async function(req, res) {
  if(req.params.dataType==='notion'){ // todo must be automatically done : if == notion,
    const asynchronousFunction = async () => {
      const notionContent = DataNotion.getData()
      res.send(notionContent)
    }



  }
  // Access userId via: req.params.userId
  // Access bookId via: req.params.bookId
  //res.send(req.params);
});

app.listen(3000); // todo port in env variable