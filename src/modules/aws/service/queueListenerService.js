const viewsEventService = require('../../views/service/viewsEventService')
const logSpanId = 'queueListenerService'

module.exports = () => {
  const handleEventAppEventQueue = async (messageObj) => {
    console.log(`${logSpanId} :: =====AppEventReceived=====::${JSON.stringify(messageObj)}`)
    return _processMessage(messageObj)
  }

  const _processMessage = async (messageObj) => {
    const eventName = messageObj.eventName
    const data = messageObj.data

    if (data && EVENT_HANDLER[eventName]) await EVENT_HANDLER[eventName](data)
    else throw new Error(`${logSpanId} :: Event execution for event: ${eventName} was successful`)

    console.log(`Event execution for event: ${eventName} was successful`)
  }

  const EVENT_HANDLER = {}

  EVENT_HANDLER['AddView'] = async (data) => viewsEventService().handleAddViewEvent(data)

  return {
    handleEventAppEventQueue
  }
}