/**
 * Management of the data from notion.so.
 */

const request = require('request')
const { wordpressRequest } = require('./wordpress')

/**
 * Sort data from a wordpress table into a coherent GEOjson format.
 * @param rawData The data from the notion table.
 * @returns {{fields: *[], rows: *[]}}
 */
module.exports.toGeoJson = function (rawData) {
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
    for (const datum of Object.keys(rawData)) {
      let newDatum = {}
      newDatum[0] = Math.random() * (45.9 - 45.5) + 45.5
      newDatum[1] = Math.random() * (4.95 - 4.75) + 4.7
      newDatum[2] = 'location-dot'
      let count = 7
      for (const column of Object.keys(rawData[datum])) {
        if (column === 'title') {
          newDatum[count] = rawData[datum][column].rendered
        } else if (column === 'acf') {
          newDatum[3] = rawData[datum][column].place_label
          newDatum[5] = rawData[datum][column].contact
        } else if (column === 'content') {
          newDatum[4] = rawData[datum][column].rendered.replace(/(<([^>]+)>)/gi, "")
        } else if (column === '_links') {
          if (rawData[datum][column].hasOwnProperty('acf:attachment') && rawData[datum][column]['acf:attachment'][0].hasOwnProperty('href')) {
            //console.log(getImageFromWPUrl(rawData[datum][column]['acf:attachment'][0]['href']))
            //newDatum[6] = getImageFromWPUrl(rawData[datum][column]['acf:attachment'][0]['href'])
            //newDatum[6] = await test(rawData[datum][column]['acf:attachment'][0]['href'])
            newDatum[6] = 'todo'
            /*
            getImageFromWPUrl(rawData[datum][column]['acf:attachment'][0]['href']).then((result)=>function (){
              console.log('titi')
              newDatum[6] = result
            })
            */
          }

        } else {
          newDatum[count] = rawData[datum][column]
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
      }
      rows.push(newDatum)
    }
  }

  return {
    "fields": wordpressFields,
    "rows": rows
  };
}

/**
 *
 * @param wordpressPostUrl
 * @returns {Promise<unknown>}
 */
/*
solutions pourries à explorer : faire sortir l'extraction de l'image ailleurs (une deuxième boucle)
 */
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
const getImageFromWPUrl = async (WPUrl) => {
  return await new Promise(function (resolve, reject) {
    request({
      url: WPUrl,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }, function (error, response, body) {
      if (body) {
        const rawDataFromWordpress = JSON.parse(body)
        if (rawDataFromWordpress !== null) {
          resolve(rawDataFromWordpress)
        } else {
          reject("error from wordpress request")
        }
      }
    });
  })
}

async function test(WPUrl) {
  try {
    const url = await WPUrl.replace('https://', '')
    const WPContentPage = await this.wordpressRequest(url)
    const desiredContent = await extractImageURL(WPContentPage)
    console.log(desiredContent)
/*
    const reposResponse = await fetch(`${url}/${userName}/repos`);
    const userRepos = await reposResponse.json();

    console.log(userRepos);*/
  } catch (error) {
    console.log(error);
  }
}

function extractImageURL(content){
  return 'tagada tsoin tsoin'
}










const getImageFromWPUrl__ = async (WPUrl) => {
  const url = await WPUrl.replace('https://', '')
  //console.log(url)
  const WPContentPage = await this.wordpressRequest(url)
  //console.log(WPContentPage)
  if (
    Object.prototype.hasOwnProperty.call(WPContentPage, 'guid') &&
    Object.prototype.hasOwnProperty.call(WPContentPage.guid, 'rendered')
  ) {
    //console.log(WPContentPage.guid.rendered)
    return WPContentPage.guid.rendered
  } else {
    //console.log('pas d image')
    return ''
  }
}









const getImageFromWPUrl_ = async (WPUrl) => {
  return await new Promise((resolve, reject) => {
    this.wordpressRequest(WPUrl.replace('https://', '')).then(function (response) {
      if (
        Object.prototype.hasOwnProperty.call(response, 'guid') &&
        Object.prototype.hasOwnProperty.call(response.guid, 'rendered')
      ) {
        //console.log(response.guid.rendered)
        resolve(response.guid.rendered)
      } else {
        resolve('')
      }
    })
  })
}