const redis = require('ioredis') 
require('dotenv').config()

const defaultExpiryInSeconds = 60 * 60 * 24 * 90

module.exports = () => {
  if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
    console.error('Redis config file not found, disabling Redis.')
    return false
  }

  const client = new redis({ port: process.env.REDIS_PORT, host: process.env.REDIS_HOST })

  client.on('error', function (err) {
      console.error('Redis Connection Error ', err)
  })

  const getKey = async (cacheName, key) => {
    const res = await client.get(_constructKey(cacheName, key))
    if (!res || !res.length) return null

    try {
      return JSON.parse(res)
    } catch (e) {
      return null
    }
  }

  const setKey = (cacheName, key, json, expiryInSeconds) => {
    if (expiryInSeconds) {
        client.set(_constructKey(cacheName, key), JSON.stringify(json), 'EX', expiryInSeconds)
    } else {
        client.set(_constructKey(cacheName, key), JSON.stringify(json),'EX', defaultExpiryInSeconds)
    }
  }

  const _constructKey = (cacheName, key) => `${cacheName}_${key}`

  return {
    getKey,
    setKey
  }
}