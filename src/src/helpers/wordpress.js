/**
 * Management of the data from our custom WP API
 */

const decode = require('html-entities')
const request = require('request')

module.exports.treesToGeoJson = async function (url) {
  const wordpressFields = [
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
      name: 'titre',
      format: '',
      type: 'string'
    },
    {
      name: 'nb_arbres',
      format: '',
      type: 'real'
    },
    {
      name: 'img',
      format: '',
      type: 'string'
    },
    {
      name: 'url',
      format: '',
      type: 'string'
    },
    {
      name: 'icon',
      format: '',
      type: 'string'
    },
    {
      name: 'address',
      format: '',
      type: 'string'
    }
  ]

  const wordpressRows = []
  return await wordpressRequest(url).then(async function (WPContent) {
    for (const data of Object.keys(WPContent)) {
      const newDatum = {}
      newDatum[6] = 'location-dot'
      const address = WPContent[data].acf.place_address + ' ' + WPContent[data].acf.place_zipcode + ' ' + WPContent[data].acf.place_city
      newDatum[7] = address
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
  // FIELDS
  const wordpressFields = [
    {
      name: 'icon',
      format: '',
      type: 'string'
    },
    {
      name: 'place_label',
      format: '',
      type: 'string'
    },
    {
      name: 'description',
      format: '',
      type: 'string'
    },
    {
      name: 'contact',
      format: '',
      type: 'string'
    },
    {
      name: 'img',
      format: '',
      type: 'string'
    },
    {
      name: 'type',
      format: '',
      type: 'string'
    },
    {
      name: 'status_projets',
      format: '',
      type: 'string'
    },
    {
      name: 'tags',
      format: '',
      type: 'string'
    },
    {
      name: 'trees',
      format: '',
      type: 'integer'
    },
    {
      name: 'types_projet',
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
    }
  ]

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
  const wordpressRows = []
  return await wordpressRequest(url).then(async function (WPContent) {
    for (const data of Object.keys(WPContent)) {
      const newDatum = {}
      newDatum[0] = 'location-dot'
      for (const column of Object.keys(WPContent[data])) {
        if (column === 'acf') {
          // todo renvoyer adresse aussi complète
          newDatum[1] = decode.decode(WPContent[data][column].place_label, { level: 'html5' })
          newDatum[3] = decode.decode(WPContent[data][column].contact, { level: 'html5' })
          newDatum[6] = allMyStatus[WPContent[data][column].status]
          newDatum[8] = WPContent[data][column].trees
          newDatum[9] = allProjectTypes[WPContent[data][column].type]
          newDatum[10] = WPContent[data][column].place.lat
          newDatum[11] = WPContent[data][column].place.lng
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
          // The last solution is not the prettiest, but it is way faster than the first one (one curl request against
          // one for each tag).
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
    },
    {
      name: 'icon',
      format: '',
      type: 'string'
    }
  ]

  // ROWS
  const wordpressRows = []

  return await wordpressRequest(url).then(async function (WPContent) {
    for (const data of Object.keys(WPContent)) {
      const newDatum = {}
      newDatum[6] = 'location-dot'
      for (const column of Object.keys(WPContent[data])) {
        if (column === 'title') {
          newDatum[0] = decode.decode(WPContent[data][column].rendered, { level: 'html5' })
        } else if (column === 'link') {
          newDatum[5] = WPContent[data][column]
        } else if (column === 'acf') {
          newDatum[1] = WPContent[data][column].time
          newDatum[3] = WPContent[data][column].place.lat
          newDatum[4] = WPContent[data][column].place.lng
          newDatum[2] = ''
          const imgId = WPContent[data][column].photos
          if (imgId!==''){
            const imgWPContent = await wordpressRequest('canographia.datagora.erasme.org/wp-json/wp/v2/media/' + imgId[0])
            newDatum[2] = imgWPContent.guid.rendered
          }
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
