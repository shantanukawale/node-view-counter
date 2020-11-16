const { MongoClient } = require('mongodb')
require('dotenv').config()

const DbConnection = function () {
  let db;

  async function mongoConnect() {
    try {
      const mongoUrl = _getMongoUrl()
      const client = await MongoClient.connect(mongoUrl)

      return client.db(process.env.MONGO_DB)
    } catch (e) {
      console.log(e.toString())
    }
  }

  async function get() {
    if(!db) db = await mongoConnect()

    return db
  }

  return {
    get
  }
}

const _getMongoUrl = () => {
  let connString = "mongodb://"
  connString += process.env.MONGO_USER ? process.env.MONGO_USER + ":" : "" 
  connString += process.env.MONGO_PASS ? process.env.MONGO_PASS + "@" : "" 
  connString += process.env.MONGO_HOST
  connString += process.env.MONGO_PORT ? ":" + process.env.MONGO_PORT : ""

  return connString
}

module.exports = DbConnection()