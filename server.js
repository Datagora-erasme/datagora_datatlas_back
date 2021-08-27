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
const express = require('express'); // Webserver
let app = express();

const KeplerConfiguration = require('./src/KeplerConfiguration');
const DataSources = require('./src/DataSources');

/*
    Routes
    /api/conf/      -> request for default configuration    -> send back the recorded Kepler configuration
    /?todo          -> request for storing desired modifications/updates of the Kepler configuration
    /api/data/${nomData}    -> request to get the data of a dataset (in a geojson Kepler style)
 */

//  /api/conf
app.get('/api/conf/', (req, res) => {
    res.send({ "data":DataSources.getDataSources(), "KeplerConfiguration":KeplerConfiguration.getConfiguration()});
}); // TODO : test presence of a POST variable (an authorization token)


app.listen(3000); // todo port in env variable