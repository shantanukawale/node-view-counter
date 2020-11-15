const viewsController = require('./modules/views/controller/viewsController')

module.exports = (router) =>  {
  router.get('/healthcheck', async (_req, res) => res.status(200).send('OK'))

  router.use('/views', viewsController())
}