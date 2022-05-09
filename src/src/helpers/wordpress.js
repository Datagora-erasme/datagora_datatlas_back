/**
 * Management of the data from notion.so.
 */

const request = require('request')

/**
 * Sort data from a wordpress table into a coherent GEOjson format.
 * @param rawData The data from the notion table.
 * @returns {{fields: *[], rows: *[]}}
 */
module.exports.toGeoJson = function (rawData) {
  const wordpressFields = []
  const rows = []

  if (rawData) {
    // TODO ! REWRITE THIS ENTIRE METHOD. Data are poorly recorded (and missing columns) in our current WP table.

    // FIELDS
    const newFieldLat = {
      name: 'latitude',
      format: '',
      type: 'real'
    }
    wordpressFields.push(newFieldLat)
    const newFieldLon = {
      name: 'longitude',
      format: '',
      type: 'real'
    }
    wordpressFields.push(newFieldLon)
    const newFieldIcon = {
      name: 'icon',
      format: '',
      type: 'string'
    }
    wordpressFields.push(newFieldIcon)
    const newFieldAdr = {
      name: 'address',
      format: '',
      type: 'string'
    }
    wordpressFields.push(newFieldAdr)
    const newFieldDesc = {
      name: 'description',
      format: '',
      type: 'string'
    }
    wordpressFields.push(newFieldDesc)
    const newFieldContact = {
      name: 'contact',
      format: '',
      type: 'string'
    }
    wordpressFields.push(newFieldContact)
    const newFieldImg = {
      name: 'img',
      format: '',
      type: 'string'
    }
    wordpressFields.push(newFieldImg)
    const newFieldType = {
      name: 'type',
      format: '',
      type: 'string'
    }
    wordpressFields.push(newFieldType)
    const newFieldStatus = {
      name: 'status_projets',
      format: '',
      type: 'string'
    }
    wordpressFields.push(newFieldStatus)
    const newFieldTags = {
      name: 'tags',
      format: '',
      type: 'string'
    }
    wordpressFields.push(newFieldTags)
    const newFieldTrees = {
      name: 'trees',
      format: '',
      type: 'integer'
    }
    wordpressFields.push(newFieldTrees)
    const newFieldTypesProjets = {
      name: 'types_projet',
      format: '',
      type: 'string'
    }
    wordpressFields.push(newFieldTypesProjets)


    // Other proper columns
    Object.keys(rawData[0]).forEach((datum) => {
      const newField = {
        name: datum,
        format: '',
        type: 'string'
      }
      wordpressFields.push(newField)
    })

    const allMyStatus = {
      status2: "J'ai envie de réaliser ce projet",
      status3: "J'ai déjà commencé ce projet",
      status4: "J'ai terminé ce projet"
    }
    const allProjectTypes = {
      immeuble: 'Dans mon immeuble',
      rue: 'Dans ma rue',
      ecole: 'Dans mon école',
      entreprise: 'Dans mon entreprise',
      chantier: 'Sur mon chantier'
    }

    // ROWS
    for (const datum of Object.keys(rawData)) {
      const newDatum = {}
      newDatum[0] = 0
      newDatum[1] = 0
      newDatum[2] = 'location-dot'
      let count = 12
      for (const column of Object.keys(rawData[datum])) {
        if (column === 'title') {
          newDatum[count] = rawData[datum][column].rendered
        } else if (column === 'acf') {
          newDatum[3] = rawData[datum][column].place_label
          newDatum[5] = rawData[datum][column].contact
          newDatum[8] = allMyStatus[rawData[datum][column].status]
          newDatum[11] = allProjectTypes[rawData[datum][column].type]
        } else if (column === 'content') {
          newDatum[4] = rawData[datum][column].rendered.replace(/(<([^>]+)>)/gi, '')
        } else if (column === 'type') {
          newDatum[7] = rawData[datum][column]
        } else if (column === '_links') {
          if (rawData[datum][column].hasOwnProperty('acf:attachment') && rawData[datum][column]['acf:attachment'][0].hasOwnProperty('href')) {
            newDatum[6] = rawData[datum][column]['acf:attachment'][0].href
          } else {
            newDatum[6] = ''
          }
          if (rawData[datum][column].hasOwnProperty('wp:term') && rawData[datum][column]['wp:term'][0].hasOwnProperty('href')) {
            newDatum[9] = rawData[datum][column]['wp:term'][0].href
          } else {
            newDatum[9] = ''
          }
        } else {
          newDatum[count] = rawData[datum][column]
        }
        count++
      }
      rows.push(newDatum)
    }
  }
  return {
    fields: wordpressFields,
    rows: rows
  }
}

/**
 *
 * @param wordpressPostUrl
 * @returns {Promise<unknown>}
 */
module.exports.wordpressRequest = function (wordpressPostUrl) {
  return new Promise(function (resolve, reject) {
    request({
      url: 'https://' + wordpressPostUrl,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (error, response, body) {
      if (body) {
        const rawDataFromWordpress = JSON.parse(body)
        if (rawDataFromWordpress !== null) {
          resolve(rawDataFromWordpress)
        } else {
          reject('error from wordpress request')
        }
      }
    })
  })
}

/*        ABOUT IMAGES              */
module.exports.insertWPImages = function (WPData) {
  return new Promise(function (resolve, reject) {
    resolve(extractImageUrl(WPData.rows, WPData.fields))
  })
}

function extractImageUrl (rows, fields) {
  const promises = []
  for (const rowNumber in rows) {
    promises.push(getImageFromUrl(rows[rowNumber]))
  }
  return Promise.all(promises).then((values) => {
    return {
      fields: fields,
      rows: values
    }
  })
}

function getImageFromUrl (WPitem) {
  if (WPitem[6] === '') { // Pictures are not always present.
    return WPitem
  } else {
    return new Promise(function (resolve, reject) {
      request({
        url: WPitem[6],
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }, function (error, response, body) {
        if (body) {
          const rawDataFromWordpress = JSON.parse(body)
          if (rawDataFromWordpress !== null) {
            WPitem[6] = rawDataFromWordpress.guid.rendered
            resolve(WPitem)
          } else {
            reject('error from wordpress request')
          }
        }
      })
    })
  }
}

/*          ABOUT KEYWORDS           */
module.exports.insertWPKeywords = function (WPData) {
  const promises = []
  for (const rowNumber in WPData.rows) {
    promises.push(getTagsFromUrl(WPData.rows[rowNumber]))
  }
  return Promise.all(promises).then((values) => {
    return WPData
  })
}

function getTagsFromUrl (WPitem) {
  const arrayTags = []
  if (WPitem[9] === '') { // Tags are not always present.
    return WPitem
  } else {
    return new Promise(function (resolve, reject) {
      request({
        url: WPitem[9],
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }, function (error, response, body) {
        if (body) {
          const rawDataFromWordpress = JSON.parse(body)
          for (const rowNumber in rawDataFromWordpress) {
            arrayTags.push(rawDataFromWordpress[rowNumber].name)
          }
          WPitem[9] = arrayTags
          resolve(WPitem)
        } else {
          reject('error from wordpress request')
        }
      })
    })
  }
}

/*          ABOUT COORDINATES           */
module.exports.insertWPCoordinates = function (WPData) {
  const promises = []
  for (const rowNumber in WPData.rows) {
    promises.push(getCoordinatesFromAddress(WPData.rows[rowNumber]))
  }
  return Promise.all(promises).then((values) => {
    return WPData
  })
}

function getCoordinatesFromAddress (WPitem) {
  return new Promise(function (resolve, reject) {
    const urlAPI = 'https://api-adresse.data.gouv.fr/search/?q=' + normalizeAddress(WPitem[3]) + '&limit=1' + '&lat=45.5&lon=4.7'
    request({
      url: urlAPI,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (error, response, body) {
      if (body) {
        const rawDataFromAPI = JSON.parse(body)
        WPitem[0] = rawDataFromAPI.features[0].geometry.coordinates[1]
        WPitem[1] = rawDataFromAPI.features[0].geometry.coordinates[0]
        resolve(WPitem)
      } else {
        reject('error from wordpress request')
      }
    })
  })
}

/**
 *
 * @param rawAddress
 * @returns {string}
 */
function normalizeAddress (rawAddress = '') {
  /*
  It appears that we need to :
  - replace white spaces with +
  - lowercase ?
   */
  return rawAddress.replace(' ', '+')
}
