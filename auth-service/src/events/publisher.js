
const amqp = require("amqplib")
const env = require("../config/env")
const logger = require("../utils/logger")

let channel = null
const connection = null


async function getChannel(){

    if(channel) return channel

    connection = await amqp.connect(env.rabbitmq.url)
    connection.on('error', (err) => logger.error('RabbitMQ Connection Error', {
        error:err.message
    }))

    connection.on('close', () =>{
            logger.warn('RabbitMQ connection closed — will reconnect on next publish');
            channel = null;
            connection = null;
    })

    channel = await connection.createChannel()
    await channel.assertExchange(env.rabbitmq.exchange, 'topic', { durable: true });
    return channel;


}


async function publishEvent(routingKey, payload) {
    try {


    const ch = await getChannel()
    const message = Buffer.from(JSON.stringify({
        eventId: require('crypto').randomUUID(),
      occurredAt: new Date().toISOString(),
      data: payload,
    }))
    ch.publish(env.rabbitmq.exchange, routingKey, message, { persistent: true, contentType: 'application/json' })

     logger.info(`Published event: ${routingKey}`);

        
    } catch (err) {
        logger.error(`Failed to publish Event to ${routingKey}`, {
            error:err.message
        })
        
    }

    
}


async function publishUserRegistered(user) {
    return publishEvent('auth.user_registered', {
    userId: user.id,
    email: user.email,
    role: user.role,
  });


    
}


module.exports = {
    publishEvent, publishUserRegistered
}