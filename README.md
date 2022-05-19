# DATAGORA - DATATLAS-back

This depot contains our work about the back-office of the project `DATATLAS`.

It proposes a simple API that can be requested by anyone who has been authorized in the options.

## Routes proposed

| Route                              | Method | Explanation                                                                                            |
|------------------------------------|--------|--------------------------------------------------------------------------------------------------------|
| `/api/test/`                       | GET    | A simple test route that shall returns the string `test` to the requester                              |
| `/api/conf/:confWanted/`           | GET    | A route to request a stored configuration file                                                         |
| `/api/conf/:confWanted/`           | POST   | A route to store a configuration file                                                                  |
| `/api/data/:dataType/:dataWanted/` | GET    | A route to get data of a certain type (ex:`notion` or `wordpress`) in a certain page (the `dataWanted) |
| `/api/upload/`                     | GET    | A route that sends a list of all stored file (pictures and logos mostly)                               |
| `/api/upload/`                     | POST   | A route that stores a file on the back-office                                                          |

## Installation

```bash
# Get the code
git clone https://github.com/datatlas-erasme/back.git
# Install dependencies
cd src
npm install
# Launch server
docker-compose up
```

Following the steps above will start a server o your localhost accessible on port 3000. You can already test if it works
using the [testing route]((http://localhost:3000/api/test))

But usually, this back-office is useless unless you use its counterpart front-office [here](https://github.com/datatlas-erasme/front).

## Options

TODO : Replace your notion API and datatlas port in the .env file.
TODO : How to restrict access to the backoffice.