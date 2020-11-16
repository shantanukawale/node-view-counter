const mongo = require('../../../databases/mongo.js')
module.exports = () => {
  const getViewCountByParams = async params => {
    const db = await mongo.get();
    return db.collection('views').count(params)
  }

  const getViewsByParams = async params => {
    const db = await mongo.get();
    return db.collection('views').find(params, { "_id": 0 }).toArray()
  }

  const addView = async params => {
    const db = await mongo.get();
    const existingView =  await db.collection('views').count(params)

    // if exists increment viewCount or insert
    if (existingView) await db.collection('views').findOneAndUpdate( params, { $inc: { viewCount: 1 } }, { upsert: true, new: true } )
    else await db.collection('views').insert({...params, viewCount: 1 })

    return getViewsByParams(params)
  }

  return  {
    getViewCountByParams,
    getViewsByParams,
    addView
  }
}