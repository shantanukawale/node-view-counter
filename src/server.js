const express = require("express");
const router = express();
const routes = require('./router');
const bodyParser = require("body-parser");
require('dotenv').config();
const { MongoClient } = require("mongodb");
const logSpanId = `server.js`

function REST() {
  this.startServer(router)
};

REST.prototype.configureExpress = function (router) {
  router.use(bodyParser.urlencoded({ extended: true }))
  router.use(bodyParser.json())
  routes(router)
}

REST.prototype.startServer = function (router) {
  const mongoUrl = (function(connString){
    connString += process.env.MONGO_USER ? process.env.MONGO_USER + ":" : "" 
    connString += process.env.MONGO_PASS ? process.env.MONGO_PASS + "@" : "" 
    connString += process.env.MONGO_HOST
    connString += process.env.MONGO_PORT ? ":" + process.env.MONGO_PORT : ""
    return connString
  }("mongodb://"))
  
  MongoClient.connect(mongoUrl, { promiseLibrary: Promise, useUnifiedTopology: true }, (err, client) => {
    if (err) throw err
    router.locals.db = client.db(process.env.MONGO_DB)
    this.configureExpress(router)

    const port = process.env.PORT || 8121

    try {
      router.listen(port, function () {
        console.log(`All right ! I am alive at Port ${port}.`)
      })
    } catch (err) {
      console.log(`${logSpanId} :: error in server.js`)
      throw err
    }
  })
}

new REST()