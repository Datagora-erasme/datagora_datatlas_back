/**
 * Management of the data from notion.so.
 */

const request = require('request')

/**
 * Sort data from a notion table into a coherent GEOjson format.
 * @param rawData The data from the notion table.
 * @param queryParameters
 * @param queryParameters.pastevent
 * @returns {{fields: *[], rows: *[]}}
 */
module.exports.toGeoJson = function (rawData, queryParameters) {
  const notionFields = []
  const rows = []

  if (rawData) {
    // N UNKNOWN VARIOUS COLUMN NAMES IN THE NOTION TABLE
    Object.keys(rawData[0].properties).forEach((datum) => {
      let typeData
      if (datum === 'latitude' || datum === 'longitude') {
        typeData = 'real'
      } else {
        typeData = 'string'
      }
      const newField = {
        name: datum,
        format: '',
        type: typeData
      }
      notionFields.push(newField)
    })

    rawData.forEach((line) => {
      const newDatum = {}
      let count = 0
      let isExcluded = false // We might need to exclude some iterations (ex : past events in some cases)

      Object.keys(rawData[0].properties).forEach((datum) => {
        // ******* GET LAT AND LONG *********
        if (line.properties[datum].type === 'number') { // Latitude and longitude (mostly)
          newDatum[count] = line.properties[datum].number
          // ******* GET TITLE *********
        } else if (line.properties[datum].type === 'title') {
          newDatum[count] = line.properties[datum].title[0].plain_text
        } else if (line.properties[datum].type === 'select') {
          let value = ''
          if (line.properties[datum].select !== null && line.properties[datum].select.name !== null) {
            value = line.properties[datum].select.name
            if (datum === 'statut' && value !== 'Validé') {
              isExcluded = true
            }
          } else if (datum === 'statut') {
            if (line.properties[datum].select == null) {
              isExcluded = true
            }
          }
          newDatum[count] = value
          // ******* GET MULTISELECT *********
        } else if (line.properties[datum].type === 'multi_select') {
          const multiSelect = []
          line.properties[datum].multi_select.forEach((item) => {
            multiSelect.push(item.name)
          })
          /* Comment one of the two below */
          newDatum[count] = multiSelect // If we want all the items in an array.
          // newDatum[count] = multiSelect[0] // If we only want the first item.
          // ******* GET URL *********
        } else if (line.properties[datum].type === 'url') {
          newDatum[count] = line.properties[datum].url
        } else if (line.properties[datum].type === 'rich_text') {
          if (
            line.properties[datum].rich_text !== [] &&
            line.properties[datum].rich_text[0] !== null &&
            line.properties[datum].rich_text[0] !== undefined &&
            line.properties[datum].rich_text[0].plain_text !== null
          ) {
            newDatum[count] = line.properties[datum].rich_text[0].plain_text
          }
        } else if (line.properties[datum].type === 'email') {
          newDatum[count] = line.properties[datum].email
        } else if (line.properties[datum].type === 'phone_number') {
          newDatum[count] = line.properties[datum].phone_number
        } else if (line.properties[datum].type === 'created_time') {
          newDatum[count] = line.properties[datum].created_time
        } else if (line.properties[datum].type === 'date') {
          newDatum[count] = Date.parse(line.properties[datum].date.start)
          // We need to check if past items are said to be ignored (using the parameter ?pastevent=false in the url)
          if (
            datum === 'Date-fin' &&
            queryParameters.pastevent === 'false' &&
            Date.parse(line.properties[datum].date.start) < Date.now()
          ) {
            isExcluded = true
          }
        } else {
          newDatum[count] = ''
          console.log('unknown type of notion data' + line.properties[datum])
        }
        if (!newDatum[count]) {
          newDatum[count] = ''
        }
        count++
      })
      if (!isExcluded) {
        rows.push(newDatum)
      }
    })

    return {
      fields: notionFields,
      rows: rows
    }
  }
}

/**
 * Requests a notion page (its id is in the parameter) and returns a raw json result.
 * @param idNotionTable
 * @returns {Promise<unknown>}
 */
module.exports.notionRequest = function (idNotionTable) {
  return new Promise(function (resolve, reject) {
    request({
      url: 'https://api.notion.com/v1/databases/' + idNotionTable + '/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Notion-Version': '2021-08-16',
        Authorization: 'Bearer ' + process.env.NOTION_API_KEY
      }
    }, function (error, response, body) {
      if (error) {
        reject(new Error(error.stack))
      }
      if (body) {
        const rawDataFromNotion = JSON.parse(body).results
        if (rawDataFromNotion !== null) {
          resolve(rawDataFromNotion)
        } else {
          reject(new Error(error.stack))
        }
      }
    })
  })
}
