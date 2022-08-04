/**
 * Management of the data from our custom WP API
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
  })
}

module.exports.eventsToGeoJson = async function (url) {
  // FIELDS
  const wordpressFields = [
    {
      name: 'titre',
      format: '',
      type: 'string'
    },
    {
      name: 'date',
      format: '',
      type: 'string'
    },
    {
      name: 'img',
      format: '',
      type: 'string'
    },
    {
      name: 'latitude',
      format: '',
      type: 'real'
    },
    {
      name: 'longitude',
      format: '',
      type: 'real'
    },
    {
      name: 'url',
      format: '',
      type: 'integer'
    }
  ]

  // ROWS
  const wordpressRows = []

  return await wordpressRequest(url).then(async function (WPContent) {
    for (const data of Object.keys(WPContent)) {
      const newDatum = {}
      for (const column of Object.keys(WPContent[data])) {
        if (column === 'title') {
          newDatum[0] = WPContent[data][column].rendered
        } else if (column === 'link') {
          newDatum[5] = WPContent[data][column]
        } else if (column === 'acf') {
          newDatum[1] = WPContent[data][column].time
          newDatum[3] = WPContent[data][column].place.lat
          newDatum[4] = WPContent[data][column].place.lng
        }
      }

      // todo : images are supposed to be stored in newDatum[2] but can't get them for now.
      newDatum[2] = ''
      wordpressRows.push(newDatum)
    }
    return {
      fields: wordpressFields,
      rows: wordpressRows
    }
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
