const viewsRepository = require('../repository/viewsRepository')
const awsService = require('../../aws/service/awsService')

const redis = require('../../../databases/redis')()
const cacheName = 'postsViewCountCache'
module.exports = () => {
  const getViewCountForPostId = async postId => {
    if (!postId) throw new Error('Missing postId in request body')

    let count
    const cachedPostViews = await redis.getKey(cacheName, postId)
    if (cachedPostViews) {
      const currCount = cachedPostViews.count
      const countAfterLastUpdated = await viewsRepository().getViewCountByParams({ postId, createdAt: { $gt: cachedPostViews.lastUpdatedAt } })
      count = currCount + countAfterLastUpdated
      await redis.setKey(cacheName, postId, { count, lastUpdatedAt: Date.now() })
    } else {
      count = await viewsRepository().getViewCountByParams({ postId })
      await redis.setKey(cacheName, postId, { count, lastUpdatedAt: Date.now() })
    }

    return {
      postId,
      count
    }
  }

  const getViews = async params => {
    const { userId, postId } = params
    if (!postId && !userId) throw new Error('Missing postId and userId in request body')

    return viewsRepository().getViewsByParams(params)
  }

  const addView = async params => {
    const { userId, postId } = params
    if (!userId && !postId) throw new Error('Missing userId or postId in request body')

    await awsService().publishEvent('AddView', params)
    return { 'success': true }
  }

  return  {
    getViewCountForPostId,
    getViews,
    addView
  }
}