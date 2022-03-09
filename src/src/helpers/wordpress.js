/**
 * Management of the data from notion.so.
 */

const request = require('request')

/**
 * Sort data from a wordpress table into a coherent GEOjson format.
 * @param rawData The data from the notion table.
 * @returns {{fields: *[], rows: *[]}}
 */
module.exports.toGeoJson = function(rawData) {
  let wordpressFields = []
  let rows = []

  if (rawData) {
    // TODO ! REWRITE THIS ENTIRE METHOD. Data are poorly recorded (and missing columns) in our current WP table.

    // FIELDS
    const newFieldLat = {
      "name": "latitude",
      "format": "",
      "type": "real"
    }
    wordpressFields.push(newFieldLat)
    const newFieldLon = {
      "name": "longitude",
      "format": "",
      "type": "real"
    }
    wordpressFields.push(newFieldLon)

    // Other proper columns
    Object.keys(rawData[0]).forEach((datum) => {
      const newField = {
        "name": datum,
        "format": "",
        "type": 'string'
      }
      wordpressFields.push(newField)
    })

    // ROWS
    Object.keys(rawData).forEach((datum) => {
      let newDatum = {}
      // js is a bi
      newDatum[0] = Math.random() * (45.9 - 45.5) + 45.5
      rows.push(newDatum)
      newDatum[1] = Math.random() * (4.95 - 4.75) + 4.7
      rows.push(newDatum)
      let count = 2
      console.log('-------------------------------------nouvel item------------------------------------')
      Object.keys(rawData[datum]).forEach((column) => {
        console.log(column)
        newDatum[count]='toto'
        count++
      })
      rows.push(newDatum)
    })
  }

  return {
    "fields": wordpressFields,
    "rows": rows
  };
}

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
        const rawDataFromWordpress = JSON.parse(body)
        if (rawDataFromWordpress !== null){
          resolve(rawDataFromWordpress)
        } else {
          reject("error from wordpress request")
        }
      }
    });
  })
}