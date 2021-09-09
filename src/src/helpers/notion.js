/**
 * Management of the data from notion.so.
 */

//const { Client } = require('@notionhq/client')
var request = require('request');
require('dotenv').config();


export function getData () {
  request({
    url: 'https://api.notion.com/v1/databases/68a69714137041deb0112e541a9d12b3/query',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': '2021-08-16',
      'Authorization': 'Bearer ' + process.env.NOTION_API_KEY
    }
  }, function(error, response, body){
    if(error) {
      console.log(error);
      return {
        error
      };
    } else {
      console.log(body);
      return body;
    }
  });
}