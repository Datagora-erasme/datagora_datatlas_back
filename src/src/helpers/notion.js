/**
 * Management of the data from notion.so.
 */

module.exports.toGEOjson = function(rawData) {
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
    }
  ]
  let rows = []

  rawData.forEach((datum) => {
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
      "15":datum.properties['image du lieu']["files"][0]==null ? '' : datum.properties['image du lieu']["files"][0]["file"]["url"],
      "16":datum.properties["contributeur-membre-structure ?"]["select"],
      "17":datum.properties["nom-contributeur"]["rich_text"],
      "18":datum.properties["email-contributeur"]["email"],
      "20":datum.properties["latitude"]["number"],
      "21":datum.properties["longitude"]["number"]
    }
    rows.push(newDatum)
    console.log(datum.properties["type-structure"]["select"])
    console.log('toto')
  });

  return {
    "fields": notionFields,
    "rows": rows
  };
}