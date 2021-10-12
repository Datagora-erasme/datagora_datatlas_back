/**
 * Management of the data from notion.so.
 */

const request = require('request')
module.exports.TIGAtoGEOjson = function(rawData) {
  const notionFields = [
    {
      "name": "date-ajout",
      "format": "",
      "type": "string"
    },
    {
      "name": "saisie interne ou externe ?",
      "format": "",
      "type": "string"
    },
    {
      "name": "statut",
      "format": "",
      "type": "string"
    },
    {
      "name": "nom-structure",
      "format": "",
      "type": "string"
    },
    {
      "name": "description",
      "format": "",
      "type": "string"
    },
    {
      "name": "site-web",
      "format": "",
      "type": "string"
    },
    {
      "name": "adresse",
      "format": "",
      "type": "string"
    },
    {
      "name": "email-structure",
      "format": "",
      "type": "string"
    },
    {
      "name": "telephone-structure",
      "format": "",
      "type": "string"
    },
    {
      "name": "reseau-social_principal",
      "format": "",
      "type": "string"
    },
    {
      "name": "type_structure",
      "format": "",
      "type": "string"
    },
    {
      "name": "activites",
      "format": "",
      "type": "string"
    },
    {
      "name": "expertise",
      "format": "",
      "type": "string"
    },
    {
      "name": "public-cible",
      "format": "",
      "type": "string"
    },
    {
      "name": "echelle-territoriale",
      "format": "",
      "type": "string"
    },
    {
      "name": "image du lieu",
      "format": "",
      "type": "string"
    },
    {
      "name": "contributeur-membre-structure ?",
      "format": "",
      "type": "string"
    },
    {
      "name": "nom-contributeur",
      "format": "",
      "type": "string"
    },
    {
      "name": "email-contributeur",
      "format": "",
      "type": "string"
    },
    {
      "name": "commentaire-private",
      "format": "",
      "type": "string"
    },
    {
      "name": "latitude",
      "format": "",
      "type": "number"
    },
    {
      "name": "longitude",
      "format": "",
      "type": "number"
    },
    {
      "name": "icon",
      "format": "",
      "type": "string"
    }
  ]
  let rows = []

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
        "11":datum.properties["activites"]["multi_select"],
        "12":datum.properties["expertise"]["multi_select"],
        "13":datum.properties["public-cible"]["multi_select"],
        "14":datum.properties["echelle-territoriale"]["multi_select"],
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
      //console.log(datum.properties["type-structure"]["select"])
    }
  });

  return {
    "fields": notionFields,
    "rows": rows
  };
}

/**
 * Gets data from https://www.notion.so/8dc9e3a344f54e4db756917acf047af3?v=c9f6d89dc7334b8c9f9c94f45f53e386
 * and send it back to the requester.
 * @param rawData
 * @returns {{fields: [{name: string, format: string, type: string}, {name: string, format: string, type: string}, {name: string, format: string, type: string}, {name: string, format: string, type: string}, {name: string, format: string, type: string}, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], rows: *[]}}
 */
module.exports.mediationtoGEOjson = function(rawData) {
  const notionFields = [
    {
      "name": "date-ajout",
      "format": "",
      "type": "string"
    },
    {
      "name": "saisie interne ou externe ?",
      "format": "",
      "type": "string"
    },
    {
      "name": "statut",
      "format": "",
      "type": "string"
    },
    {
      "name": "nom-evenement",
      "format": "",
      "type": "string"
    },
    {
      "name": "description",
      "format": "",
      "type": "string"
    },
    {
      "name": "site-web",
      "format": "",
      "type": "string"
    },
    {
      "name": "adresse",
      "format": "",
      "type": "string"
    },
    {
      "name": "email-event",
      "format": "",
      "type": "string"
    },
    {
      "name": "telephone-event",
      "format": "",
      "type": "string"
    },
    {
      "name": "type_event",
      "format": "",
      "type": "string"
    },
    {
      "name": "publics",
      "format": "",
      "type": "string"
    },
    {
      "name": "date-debut",
      "format": "",
      "type": "string"
    },
    {
      "name": "date-fin",
      "format": "",
      "type": "string"
    },
    {
      "name": "image-event",
      "format": "",
      "type": "string"
    },
    {
      "name": "contributeur-membre-structure ?",
      "format": "",
      "type": "string"
    },
    {
      "name": "nom-contributeur",
      "format": "",
      "type": "string"
    },
    {
      "name": "email-contributeur",
      "format": "",
      "type": "string"
    },
    {
      "name": "latitude",
      "format": "",
      "type": "number"
    },
    {
      "name": "longitude",
      "format": "",
      "type": "number"
    },
    {
      "name": "icon",
      "format": "",
      "type": "string"
    }
  ]
  let rows = []

  rawData.forEach((datum) => {
    // We only keep rows which « statut » field is equal to « Validé »
    if(datum.properties['statut']["select"]!=null && datum.properties['statut']["select"]["name"]==='Validé'){
      const newDatum = {
        "0":datum.properties["date-ajout"]["created_time"],
        "1":datum.properties['saisie interne ou externe ?']["select"]==null ? '' : datum.properties['saisie interne ou externe ?']["select"]["name"],
        "2":datum.properties['statut']["select"]==null ? '' : datum.properties['statut']["select"]["name"],
        "3":datum.properties['nom-evenement']["title"][0]==null ? '' : datum.properties['nom-evenement']["title"][0]["text"]["content"],
        "4":datum.properties['description']["rich_text"][0]==null ? '' : datum.properties['description']["rich_text"][0]["text"]["content"],
        "5":datum.properties["site-web"]["url"],
        "6":datum.properties['adresse']["rich_text"][0]==null ? '' : datum.properties['adresse']["rich_text"][0]["plain_text"],
        "7":datum.properties["email-event"]["email"],
        "8":datum.properties["telephone-event"]["phone_number"],
        "9":datum.properties['type-event']["multi_select"]==null ? '' : datum.properties['type-event']["multi_select"],
        "10":datum.properties['publics']["multi_select"]==null ? '' : datum.properties['publics']["multi_select"],
        "11":datum.properties['date-debut']["start"]==null ? '' : datum.properties['date-debut']["date"]["start"],
        "12":datum.properties['date-fin']["start"]==null ? '' : datum.properties['date-fin']["date"]["start"],
        "13":datum.properties['image-event']["files"]==null ? '' : datum.properties['image-event']["files"][0]["file"]["url"],
        "14":datum.properties["contributeur-membre-structure ?"]["select"],
        "15":datum.properties["nom-contributeur"]["rich_text"],
        "16":datum.properties["email-contributeur"]["email"],
        "17":datum.properties["latitude"]["number"],
        "18":datum.properties["longitude"]["number"],
        "19":datum.properties['icon']["rich_text"][0]==null ? '' : datum.properties['icon']["rich_text"][0]["plain_text"],
      }
      rows.push(newDatum)
    }
  });

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
