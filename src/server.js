const express = require("express");
const router = express();
const routes = require('./router');
const bodyParser = require("body-parser");
require('dotenv').config();
const logSpanId = `server.js`

function REST() {
  this.startServer(router)
  this.configureExpress(router)
};

REST.prototype.configureExpress = function (router) {
  router.use(bodyParser.urlencoded({ extended: true }))
  router.use(bodyParser.json())
  routes(router)
}

REST.prototype.startServer = function (router) {
  const port = process.env.PORT || 8121

  try {
    router.listen(port, function () {
      console.log(`All right ! I am alive at Port ${port}.`)
    })
  } catch (err) {
    console.log(`${logSpanId} :: error ${JSON.stringify(err.toString())}`)
    throw err
  }
}

new REST()