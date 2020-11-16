const viewsRepository = require('../repository/viewsRepository')
const awsService = require('../../aws/service/awsService')

module.exports = () => {
  const getViewCountForPostId = async postId => {
    if (!postId) throw new Error('Missing postId in request body')

    return {
      postId,
      count: await viewsRepository().getViewCountByParams({ postId })
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

    awsService().publishEvent('AddView', params)
  }

  return  {
    getViewCountForPostId,
    getViews,
    addView
  }
}