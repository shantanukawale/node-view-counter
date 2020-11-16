const viewsRepository = require('../repository/viewsRepository')

module.exports = () => {
  const handleAddViewEvent = async params => viewsRepository().addView(params)

  return  {
    handleAddViewEvent
  }
}