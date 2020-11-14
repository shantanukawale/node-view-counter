module.exports = (db) => {
  const views = db.collection('views')
  const getViewCountByParams = params => views.count(params)

  const getViewsByParams = params => views.find(params, { "_id": 0 }).toArray()

  const addView = async params => {
    const existingView = await views.count(params)

    // if exists increment viewCount or insert
    if (existingView)  await views.findOneAndUpdate( params, { $inc: { viewCount: 1 } }, { upsert: true, new: true } )
    else await views.insert({...params, viewCount: 1 })

    return getViewsByParams(params)
  }

  return  {
    getViewCountByParams,
    getViewsByParams,
    addView
  }
}