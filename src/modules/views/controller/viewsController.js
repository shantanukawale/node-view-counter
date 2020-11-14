const { Router } = require('express')
const logSpanId = 'viewsController'
const viewsService = require('../service/viewsService')
module.exports = ({ db: mongo }) => {
  const router = Router()

  router.get('/count/:postId', async (req, res) => {
    try {
      const result = await viewsService(mongo).getViewCountForPostId(req.params.postId)
      res.status(200).json(result)
    } catch (err) {
      console.log(`${logSpanId} :: error ${err.toString()}`)
      res.status(500).send(err.toString())
    }
  })

  router.get('/', async (req, res) => {
    try {
      const result = await viewsService(mongo).getViews(req.query)
      res.status(200).json(result)
    } catch (err) {
      console.log(`${logSpanId} :: error ${err.toString()}`)
      res.status(500).json(err.toString())
    }
  })

  router.post('/', async (req, res) => {
    try {
      const result = await viewsService(mongo).addView(req.body)
      res.status(200).json(result)
    } catch (err) {
      console.log(`${logSpanId} :: error ${err.toString()}`)
      res.status(500).json(err.toString())
    }
  })
  
  return router
}