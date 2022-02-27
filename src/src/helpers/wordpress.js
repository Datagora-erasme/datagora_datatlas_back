/**
 * Management of the data from notion.so.
 */

 const request = require('request')

 /**
  * Sort data from a notion table into a coherent GEOjson format.
  * @param rawData The data from the notion table.
  * @returns {{fields: *[], rows: *[]}}
  */
 module.exports.toGeoJson = function(rawData) {
     return rawData
   
 }

// http://localhost:8080/wp-json/wp/v2/projet/1509
module.exports.wordpressRequest = function (wordpressPostUrl) {
    return new Promise(function (resolve, reject) {
      request({
        url: 'https://' + wordpressPostUrl,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }, function (error, response, body) {
        if(body) {
          const rawDataFromWordpress = JSON.parse(body).results
          if (rawDataFromWordpress !== null){
            resolve(rawDataFromWordpress)
          } else {
            reject("error from notion request")
          }
        }
      });
    })
  }
  
  