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
    const newFieldIcon = {
      "name": "icon",
      "format": "",
      "type": "string"
    }
    wordpressFields.push(newFieldIcon)
    const newFieldAdr = {
      "name": "address",
      "format": "",
      "type": "string"
    }
    wordpressFields.push(newFieldAdr)
    const newFieldDesc = {
      "name": "description",
      "format": "",
      "type": "string"
    }
    wordpressFields.push(newFieldDesc)
    const newFieldContact = {
      "name": "contact",
      "format": "",
      "type": "string"
    }
    wordpressFields.push(newFieldContact)
    const newFieldImg = {
      "name": "img",
      "format": "",
      "type": "string"
    }
    wordpressFields.push(newFieldImg)

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
      newDatum[0] = Math.random() * (45.9 - 45.5) + 45.5
      newDatum[1] = Math.random() * (4.95 - 4.75) + 4.7
      newDatum[2] = 'location-dot'
      let count = 7
      Object.keys(rawData[datum]).forEach((column) => {
        if (column==='title'){
          newDatum[count]=rawData[datum][column].rendered
        } else if (column==='acf'){
          newDatum[3]=rawData[datum][column].place_label
          newDatum[5]=rawData[datum][column].contact
        } else if (column==='content'){
          newDatum[4]=rawData[datum][column].rendered
        } else if (column==='_links'){
          if (
            rawData[datum][column].hasOwnProperty('acf:attachment') &&
            rawData[datum][column]['acf:attachment'][0].hasOwnProperty('href')
          ) {
            newDatum[6] = getImageFromWPUrl(rawData[datum][column]['acf:attachment'][0]['href'])
          }
        }
        else {
          newDatum[count]=rawData[datum][column]
        }
        /*
          WE WANT :
         Filtre etat / type_de_projet = Dans ma rue / Dans mon truc -
          image => placeholder 1
          mots clefs :
          photos secondaire (bonus)

         */
        //console.log(column)

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

// METHODS

/**
 * Explores a WP API url (related to a picture) and tries to extract the picture direct url.
 * @param WPUrl
 * @returns {string}
 */
const getImageFromWPUrl = (WPUrl) => {
  this.wordpressRequest(WPUrl.replace('https://', '')).then(function (response) {
    if (
      Object.prototype.hasOwnProperty.call(response, 'guid') &&
      Object.prototype.hasOwnProperty.call(response.guid, 'rendered')
    ){
      return response.guid.rendered
    } else {
      return ''
    }
  })
}