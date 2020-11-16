const awsService = require('./awsService')
require('dotenv').config()

module.exports = () => {
  const init = () => awsService().subscribeQueue(process.env.QUEUE_NAME)

  return { init }
}