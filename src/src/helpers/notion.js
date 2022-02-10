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
  let notionFields = []
  let rows = []

  // N UNKNOWN VARIOUS COLUMN NAMES IN THE NOTION TABLE
  Object.keys(rawData[0].properties).forEach((datum) => {
    let typeData
    if (datum==='latitude' || datum==='longitude'){
      typeData='number'
    } else{
      typeData='string';
    }
    const newField = {
      "name": datum,
      "format": "",
      "type": typeData
    }
    notionFields.push(newField)
  })

  rawData.forEach((line) => {
    let newDatum = {}
    let count = 0
    Object.keys(rawData[0].properties).forEach((datum) => {
      if (line['properties'][datum]['type']==='number'){ // Latitude and longitude (mostly)
        newDatum[count] = line['properties'][datum]['number']
      } else if (line['properties'][datum]['type']==='title'){
        newDatum[count] = line['properties'][datum]['title'][0]['plain_text']
      } else if (line['properties'][datum]['type']==='select'){
        let value = ''
        if (line['properties'][datum]['select']!==null && line['properties'][datum]['select']['name']!==null){
          value = line['properties'][datum]['select']['name']
        }
        newDatum[count] = value
      } else if (line['properties'][datum]['type']==='multi_select'){
        let multi_select = []
        line['properties'][datum]['multi_select'].forEach((item) => {
          multi_select.push(item['name'])
        })
        /* Comment one of the two below */ // TODO check with @ysiouda
        //newDatum[count] = multi_select // If we want all the items in an array.
        newDatum[count] = multi_select[0] // If we only want the first item.
      } else if (line['properties'][datum]['type']==='url'){
        newDatum[count] = line['properties'][datum]['url']
      } else if (line['properties'][datum]['type']==='rich_text'){
        if (
          line['properties'][datum]['rich_text']!==[]
          && line['properties'][datum]['rich_text'][0]!==null
          && line['properties'][datum]['rich_text'][0]!==undefined
          && line['properties'][datum]['rich_text'][0]['plain_text']!==null
        ) {
          newDatum[count] = line['properties'][datum]['rich_text'][0]['plain_text']
        }
      } else if (line['properties'][datum]['type']==='email'){
        newDatum[count] = line['properties'][datum]['email']
      } else if (line['properties'][datum]['type']==='phone_number'){
        newDatum[count] = line['properties'][datum]['phone_number']
      } else if (line['properties'][datum]['type']==='created_time'){
        newDatum[count] = line['properties'][datum]['created_time']
      }
      else {
        console.log('unknown type of notion data' + line['properties'][datum]);
      }
      count++;
    })
    rows.push(newDatum)
  })





  /*
  rawData.forEach((datum) => {
    // We only keep rows which « statut » field is equal to « Validé »
    if(datum.properties['statut']["select"]!=null && datum.properties['statut']["select"]["name"]==='Validé'){
      const newDatum = {
        "0":datum.properties["date-ajout"]["created_time"],
        "1":datum.properties['saisie interne ou externe ?']["select"]==null ? '' : datum.properties['saisie interne ou externe ?']["select"]["name"],
        "2":datum.properties['statut']["select"]==null ? '' : datum.properties['statut']["select"]["name"],
        "3":datum.properties['nom-structure']["title"][0]==null ? '' : datum.properties['nom-structure']["title"][0]["text"]["content"],
        "4":datum.properties['description']["rich_text"][0]==null ? '' : datum.properties['description']["rich_text"][0]["text"]["content"],
        "5":datum.properties["site-web"]["url"],
        "6":datum.properties['adresse']["rich_text"][0]==null ? '' : datum.properties['adresse']["rich_text"][0]["plain_text"],
        "7":datum.properties["email-structure"]["email"],
        "8":datum.properties["telephone-structure"]["phone_number"],
        "9":datum.properties["reseau-social_principal"]==null ? '' : datum.properties["reseau-social_principal"]["url"],
        "10":datum.properties['type-structure']["select"]==null ? '' : datum.properties['type-structure']["select"]["name"],
        "11":datum.properties['activites']["multi_select"][0]["name"]==null ? '' : datum.properties['activites']["multi_select"][0]["name"], // We only take the first occurency for now.,
        "12":datum.properties['expertise']["multi_select"][0]===undefined ? '' : datum.properties['expertise']["multi_select"][0]["name"], // We only take the first occurency for now.,
        "13":datum.properties['public-cible']["multi_select"][0]===undefined ? '' : datum.properties['public-cible']["multi_select"][0]["name"], // We only take the first occurency for now.,
        "14":datum.properties['echelle-territoriale']["multi_select"][0]===undefined ? '' : datum.properties['echelle-territoriale']["multi_select"][0]["name"], // We only take the first occurency for now.,
        "15":"",
        //"15":datum.properties['image du lieu']["files"][0]==null ? '' : datum.properties['image du lieu']["files"][0]["file"]["url"],
        "16":datum.properties["contributeur-membre-structure ?"]["select"],
        "17":datum.properties["nom-contributeur"]["rich_text"],
        "18":datum.properties["email-contributeur"]["email"],
        "20":datum.properties["latitude"]["number"],
        "21":datum.properties["longitude"]["number"],
        "22":datum.properties['icon']["rich_text"][0]==null ? '' : datum.properties['icon']["rich_text"][0]["plain_text"],
      }
      rows.push(newDatum)
      //console.log(datum.properties['expertise']["multi_select"][0])
    }
  });
   */

  return {
    "fields": notionFields,
    "rows": rows
  };
}

module.exports.notionRequest = function (id_notion_table) {
  return new Promise(function (resolve, reject) {
    request({
      url: 'https://api.notion.com/v1/databases/' + id_notion_table + '/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Notion-Version': '2021-08-16',
        'Authorization': 'Bearer ' + process.env.NOTION_API_KEY
      }
    }, function (error, response, body) {
      const rawDataFromNotion = JSON.parse(body).results
      if (rawDataFromNotion !== null){
        resolve(rawDataFromNotion)
      } else {
        reject("error from notion request")
      }
    });
  })
}




/*                                          METHODS                                                                   */

const convertJsonArrayToSimpleStringArray = (data) => {
  const arrayMS = [];
  for(const item of data) {
    if (item.name!==undefined){
      arrayMS.push(item.name)
    }
  }
  return arrayMS;
}