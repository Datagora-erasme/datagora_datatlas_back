/**
 * Management of the data from notion.so.
 */

const request = require('request')

module.exports.treesToGeoJson = async function (url) {
  const wordpressFields = []
  const wordpressRows = []

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
  const newFieldTitre = {
    name: 'titre',
    format: '',
    type: 'string'
  }
  wordpressFields.push(newFieldTitre)
  const newFieldNbArbres = {
    name: 'nb_arbres',
    format: '',
    type: 'real'
  }
  wordpressFields.push(newFieldNbArbres)
  const newFieldImg = {
    name: 'img',
    format: '',
    type: 'string'
  }
  wordpressFields.push(newFieldImg)
  const newFieldUrl = {
    name: 'url',
    format: '',
    type: 'string'
  }
  wordpressFields.push(newFieldUrl)

  return await wordpressRequest(url).then(async function (WPContent) {
    for (const data of Object.keys(WPContent)) {
      const newDatum = {}
      const address = WPContent[data].acf.place_address + ' ' + WPContent[data].acf.place_zipcode + ' ' + WPContent[data].acf.place_city
      let idPhoto

      // COMMON DATA
      for (const column of Object.keys(WPContent[data])) {
        if (column === 'title') {
          newDatum[2] = WPContent[data][column].rendered
        } else if (column === 'acf') {
          newDatum[3] = WPContent[data][column].trees
          idPhoto = WPContent[data][column].photo
        } else if (column === 'link') {
          newDatum[5] = WPContent[data][column]
        }
      }
      // COORDINATES
      const coordinates = await getCoordinatesFromRawAddress(address)
      newDatum[0] = coordinates[1]
      newDatum[1] = coordinates[0]
      // IMAGES
      const imgWPContent = await wordpressRequest('canographia.datagora.erasme.org/wp-json/wp/v2/media/' + idPhoto)
      newDatum[4] = imgWPContent.guid.rendered

      // MISSION COMPLETE !
      wordpressRows.push(newDatum)
    }
    return {
      fields: wordpressFields,
      rows: wordpressRows
    }
  })
}

module.exports.canographiaToGeoJson = async function (url) {
  const wordpressFields = []
  const wordpressRows = []

  // FIELDS
  const newFieldIcon = {
    name: 'icon',
    format: '',
    type: 'string'
  }
  wordpressFields.push(newFieldIcon)
  const newFieldPlaceLabel = {
    name: 'place_label',
    format: '',
    type: 'string'
  }
  wordpressFields.push(newFieldPlaceLabel)
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
  const newFieldPlaceCity = {
    name: 'place_city',
    format: '',
    type: 'string'
  }
  wordpressFields.push(newFieldPlaceCity)

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

  return await wordpressRequest(url).then(async function (WPContent) {
    for (const data of Object.keys(WPContent)) {
      const newDatum = {}
      newDatum[0] = 'location-dot'
      for (const column of Object.keys(WPContent[data])) {
        if (column === 'acf') {
          newDatum[1] = WPContent[data][column].place_label
          newDatum[3] = WPContent[data][column].contact
          newDatum[6] = allMyStatus[WPContent[data][column].status]
          newDatum[8] = WPContent[data][column].trees
          newDatum[9] = allProjectTypes[WPContent[data][column].type]
        } else if (column === 'content') {
          newDatum[2] = WPContent[data][column].rendered.replace(/(<([^>]+)>)/gi, '')
        } else if (column === '_links') {
          if (
            Object.prototype.hasOwnProperty.call(WPContent[data][column], 'acf:attachment') &&
            Object.prototype.hasOwnProperty.call(WPContent[data][column]['acf:attachment'][0], 'href')
          ) {
            const imgWPContent = await wordpressRequest(WPContent[data][column]['acf:attachment'][0].href.replace('https://', '').replace('http://', ''))
            newDatum[4] = imgWPContent.guid.rendered
          } else {
            newDatum[4] = ''
          }

          // We want the tags too. How do we get them ? We could either call WPContent[data][tags] which contains
          // all ids of the post tag. This will require a curl request for each id. Or we can get
          // WPContent[data][column]['wp:term'][0].href which contains all ids in a single page.
          // The last solution is not the prettiest, but it is way faster than the first one.
          if (
            Object.prototype.hasOwnProperty.call(WPContent[data][column], 'wp:term') &&
            Object.prototype.hasOwnProperty.call(WPContent[data][column]['wp:term'][0], 'href')
          ) {
            const tagWPContent = await wordpressRequest(WPContent[data][column]['wp:term'][0].href.replace('https://', '').replace('http://', ''))
            const tagList = []
            for (const singleTagWPContent of tagWPContent) {
              tagList.push(singleTagWPContent.name)
            }
            newDatum[7] = tagList
          } else {
            newDatum[7] = ''
          }
        } else if (column === 'type') {
          newDatum[5] = WPContent[data][column]
        }
      }
      wordpressRows.push(newDatum)
    }
    return {
      fields: wordpressFields,
      rows: wordpressRows
    }
    /*
    for (const datum of Object.keys(rawData)) {
      const newDatum = {}
      newDatum[2] = 'location-dot'
      let count = 13
      for (const column of Object.keys(rawData[datum])) {
        if (column === 'title') {
          newDatum[count] = rawData[datum][column].rendered
        } else if (column === 'acf') {
          newDatum[0] = rawData[datum][column].place.lat
          newDatum[1] = rawData[datum][column].place.lng
          newDatum[3] = rawData[datum][column].place_label
          newDatum[5] = rawData[datum][column].contact
          newDatum[8] = allMyStatus[rawData[datum][column].status]
          newDatum[10] = rawData[datum][column].trees
          newDatum[11] = allProjectTypes[rawData[datum][column].type]
          newDatum[13] = rawData[datum][column].place_city
        } else if (column === 'content') {
          newDatum[4] = rawData[datum][column].rendered.replace(/(<([^>]+)>)/gi, '')
        } else if (column === 'type') {
          newDatum[7] = rawData[datum][column]
        } else if (column === '_links') {
          if (
            Object.prototype.hasOwnProperty.call(rawData[datum][column], 'acf:attachment') &&
            Object.prototype.hasOwnProperty.call(rawData[datum][column]['acf:attachment'][0], 'href')
          ) {
            newDatum[6] = rawData[datum][column]['acf:attachment'][0].href
          } else {
            newDatum[6] = ''
          }
          if (
            Object.prototype.hasOwnProperty.call(rawData[datum][column], 'wp:term') &&
            Object.prototype.hasOwnProperty.call(rawData[datum][column]['wp:term'][0], 'href')
          ) {
            newDatum[9] = rawData[datum][column]['wp:term'][0].href
          } else {
            newDatum[9] = ''
          }
        } else {
          newDatum[count] = rawData[datum][column]
        }
     */

  })
}

/* REUSABLE METHODS */

/**
 * Sends the back the raw content of a json webpage.
 * @param wordpressPostUrl
 * @returns {Promise<unknown>}
 */
function wordpressRequest (wordpressPostUrl) {
  return new Promise(function (resolve, reject) {
    request({
      url: 'https://' + wordpressPostUrl,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (error, response, body) {
      if (error) {
        reject(new Error(error.stack))
      }
      if (body) {
        const rawDataFromWordpress = JSON.parse(body)
        if (rawDataFromWordpress !== null) {
          resolve(rawDataFromWordpress)
        } else {
          reject(new Error('error from wordpress request'))
        }
      }
    })
  })
}

/**
 * Sends the coordinates {long,lat} for a given address (using french government API).
 * @param adresse
 * @returns {Promise<unknown>}
 */
function getCoordinatesFromRawAddress (adresse = '') {
  return new Promise(function (resolve, reject) {
    const urlAPI = 'https://api-adresse.data.gouv.fr/search/?q=' + normalizeAddress(adresse) + '&limit=1' + '&lat=45.5&lon=4.7'
    request({
      url: urlAPI,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (error, response, body) {
      if (error) {
        reject(new Error(error.stack))
      }
      if (body) {
        const rawDataFromAPI = JSON.parse(body)
        resolve(rawDataFromAPI.center)
      } else {
        reject(new Error('error from wordpress request'))
      }
    })
  })
}

/**
 * Normalizes the content of a string (representing an address) for a proper use in a url during an API call.
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

/** TODO REFACTORING !!! **/

/**
 * Sort data from a WordPress table into a coherent GEOjson format.
 * @param rawData The data from the WP page.
 * @param rawData[][].rendered
 * @param rawData[][].place_label
 * @param rawData[][].contact
 * @param rawData[][].trees
 * @param rawData[][].guid
 * @param rawData[][].geometry
 * @param rawData[][].coordinates
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
    const newFieldPlaceLabel = {
      name: 'place_label',
      format: '',
      type: 'string'
    }
    wordpressFields.push(newFieldPlaceLabel)
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
    const newFieldPlaceCity = {
      name: 'place_city',
      format: '',
      type: 'string'
    }
    wordpressFields.push(newFieldPlaceCity)

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
      newDatum[2] = 'location-dot'
      let count = 13
      for (const column of Object.keys(rawData[datum])) {
        if (column === 'title') {
          newDatum[count] = rawData[datum][column].rendered
        } else if (column === 'acf') {
          newDatum[0] = rawData[datum][column].place.lat
          newDatum[1] = rawData[datum][column].place.lng
          newDatum[3] = rawData[datum][column].place_label
          newDatum[5] = rawData[datum][column].contact
          newDatum[8] = allMyStatus[rawData[datum][column].status]
          newDatum[10] = rawData[datum][column].trees
          newDatum[11] = allProjectTypes[rawData[datum][column].type]
          newDatum[13] = rawData[datum][column].place_city
        } else if (column === 'content') {
          newDatum[4] = rawData[datum][column].rendered.replace(/(<([^>]+)>)/gi, '')
        } else if (column === 'type') {
          newDatum[7] = rawData[datum][column]
        } else if (column === '_links') {
          if (
            Object.prototype.hasOwnProperty.call(rawData[datum][column], 'acf:attachment') &&
            Object.prototype.hasOwnProperty.call(rawData[datum][column]['acf:attachment'][0], 'href')
          ) {
            newDatum[6] = rawData[datum][column]['acf:attachment'][0].href
          } else {
            newDatum[6] = ''
          }
          if (
            Object.prototype.hasOwnProperty.call(rawData[datum][column], 'wp:term') &&
            Object.prototype.hasOwnProperty.call(rawData[datum][column]['wp:term'][0], 'href')
          ) {
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

/*        ABOUT IMAGES              */
module.exports.insertWPImages = function (WPData) {
  return new Promise(function (resolve) {
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
        if (error) {
          reject(new Error(error.stack))
        }
        if (body) {
          const rawDataFromWordpress = JSON.parse(body)
          if (rawDataFromWordpress !== null) {
            WPitem[6] = rawDataFromWordpress.guid.rendered
            resolve(WPitem)
          } else {
            reject(new Error('error from wordpress request'))
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
  return Promise.all(promises).then(() => {
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
        if (error) {
          reject(new Error(error.stack))
        }
        if (body) {
          const rawDataFromWordpress = JSON.parse(body)
          for (const rowNumber in rawDataFromWordpress) {
            arrayTags.push(rawDataFromWordpress[rowNumber].name)
          }
          WPitem[9] = arrayTags
          resolve(WPitem)
        } else {
          reject(new Error('error from wordpress request'))
        }
      })
    })
  }
}

/*          ABOUT COORDINATES           */
/**
 * NO LONGER USED. This method injects geographical coordinates in each object (using french government API)
 * @param WPData
 * @returns {Promise<Awaited<unknown>[]>}
 */
module.exports.insertWPCoordinates = function (WPData) {
  const promises = []
  for (const rowNumber in WPData.rows) {
    promises.push(getCoordinatesFromAddress(WPData.rows[rowNumber]))
  }
  return Promise.all(promises).then(() => {
    return WPData
  })
}

/**
 * @param WPitem
 * @returns {Promise<unknown>}
 */
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
      if (error) {
        reject(new Error(error.stack))
      }
      if (body) {
        const rawDataFromAPI = JSON.parse(body)
        WPitem[0] = rawDataFromAPI.features[0].geometry.coordinates[1]
        WPitem[1] = rawDataFromAPI.features[0].geometry.coordinates[0]
        resolve(WPitem)
      } else {
        reject(new Error('error from wordpress request'))
      }
    })
  })
}
