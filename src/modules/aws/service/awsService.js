const AWS = require('aws-sdk')
const cls = require('cls-hooked')
require('dotenv').config()

const listenerService = require('./queueListenerService')
const logSpanId = 'awsService'
const nsid = 'nsid'

module.exports = () => {
  AWS.config.update({ region: 'ap-south-1' })

  const sendSQSMessage = async(message, queueName = process.env.QUEUE_NAME) => {
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

    const queueUrl = await _getQueueUrl(queueName)

    const params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: queueUrl
    }

    return sqs.sendMessage(params).promise()
  }

  const subscribeQueue = (queueName = process.env.QUEUE_NAME, eventMethod) => {
    _listenerConfig[queueName] = listenerService
    _registerLongPolling(listenerService, queueName, eventMethod)
  }

  const publishEvent  = async (eventName, data) => {
    try {
      console.log(`${logSpanId} :: Pushing to app event queue ${eventName} ${JSON.stringify(data)}`)
      await _sendToQueue(process.env.QUEUE_NAME, { eventName, data })
    } catch (err) {
      console.error(`${logSpanId} :: SQS push error', ${err.toString()}`)
    }
  }

  const _sendToQueue = async (queueName, message) => {
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })
    const queueUrl = await _getQueueUrl(queueName)

    const params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: queueUrl
    }

    return sqs.sendMessage(params).promise()
  }

  const _queueUrlConfig = {}
  const _listenerConfig = {}

  const _getQueueUrlFromName = async (queueName) => {
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })
    const params = { QueueName: queueName }
    let queueUrl, queueResult
    try {
      queueResult = await sqs.getQueueUrl(params).promise()
      queueUrl = queueResult.QueueUrl
      return queueUrl
    } catch (e) {
      await _createQueue(queueName, { 'ReceiveMessageWaitTimeSeconds': '5' })
      queueResult = await sqs.getQueueUrl(params).promise()

      return queueResult.QueueUrl
    }
  }

  const _registerLongPolling = async (listener, queueName) => {
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })
    if (!_queueUrlConfig[queueName]) _queueUrlConfig[queueName] = await _getQueueUrlFromName(queueName)

    const queueUrl = _queueUrlConfig[queueName]

    const params = {
      AttributeNames: ['SentTimestamp'],
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ['All'],
      QueueUrl: queueUrl,
      WaitTimeSeconds: 5,
      VisibilityTimeout: 60
    }

    console.log(`${logSpanId} :: Subscribing to queue ====> ${queueName}`)

    while (true) {
      const data = await sqs.receiveMessage(params).promise()

      if (data.Messages && data.Messages.length) {
        const processed = []

        for (const message of data.Messages) {
          await _sqsMiddleware(message, async function (message) {
            try {
              const messageObj = JSON.parse(message.Body)
              if (messageObj.data) {
                messageObj.awsSQSMessageId = message.MessageId
                console.log(`${logSpanId} :: message queue info ${queueName} ${JSON.stringify(messageObj)}`)
                await listener().handleEventAppEventQueue(messageObj)

                processed.push(message)
              }
            } catch (err) {
              console.error(err)
              const messageBody = JSON.parse(message.Body)
              console.error(`${logSpanId} :: Error in message queue info ${queueName} ${messageBody.notificationName} ${JSON.stringify(message)}`, err.toString())
            }
          })
        }

        if (processed.length) {
          const result = await _deleteMessage(sqs, processed, queueUrl)
          console.log(`${logSpanId} :: Deleting message queue info ${queueName} ${JSON.stringify(processed)} ${JSON.stringify(result)}`)
        }

      }
    }
  }

  const _getQueueUrl = async queueName => {
    if(!_queueUrlConfig[queueName]) _queueUrlConfig[queueName] = await _getQueueUrlFromName(queueName)
    return _queueUrlConfig[queueName]
  }
  const _sqsMiddleware = (message, next) => {
    const ns = cls.getNamespace(nsid) || cls.createNamespace(nsid)
    return ns.runAndReturn(() => next(message))
  }

  const _deleteMessage = async (sqs, messages, queueURL) => {
    try {
      const deleteParams = {
        QueueUrl: queueURL,
        Entries: messages.map((item, index) => ({ Id: String(index), ReceiptHandle: item.ReceiptHandle }))
      }
      
      return sqs.deleteMessageBatch(deleteParams).promise()
    } catch (err) {
      console.log(`${logSpanId} :: Error in deleting message from queue' + queueURL ${err.toString()}`)
    }
  }

  const _createQueue = (queueName, attributes) => {
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })
    const params = { QueueName: queueName, Attributes: attributes }

    return sqs.createQueue(params).promise()
  }

  return {
    sendSQSMessage,
    subscribeQueue,
    publishEvent
  }
}