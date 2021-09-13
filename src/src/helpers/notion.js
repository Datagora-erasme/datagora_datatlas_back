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
    }
    rows.push(newDatum)
    //console.log(datum.properties["description"]["rich_text"][0]["text"]["content"])
    console.log('toto')
  });

  return {
    "fields": notionFields,
    "rows": rows
  };
}