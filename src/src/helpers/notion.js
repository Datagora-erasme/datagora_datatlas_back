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
  ];
  let rows = []; // todo try to use the spread operator

  return {
    "fields": notionFields,
    "rows": [
      {
        "0": 7024,
        "1": "Bancel / Chevreul",
        "2": "Rue Bancel",
        "3": "Rue Chevreul",
        "4": "Lyon 7 ème",
        "5": 24,
        "6": 21,
        "7": "",
        "8": "Itinéraire cyclable",
        "9": "Oui",
        "10": "",
        "11": 1,
        "12": "69387",
        "13": 45.74852028673056,
        "14": 4.840524571672513
      },
      {
        "0": 7024,
        "1": "Bancel / Chevreul",
        "2": "Rue Bancel",
        "3": "Rue Chevreul",
        "4": "Lyon 7 ème",
        "5": 24,
        "6": 21,
        "7": "",
        "8": "Itinéraire cyclable",
        "9": "Oui",
        "10": "",
        "11": 1,
        "12": "69387",
        "13": 45.74852028673056,
        "14": 4.840524571672513
      }
    ]
  };
}