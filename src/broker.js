const mosca = require('mosca')
const knex = require('./database')

const broker = new mosca.Server({
    port: 1883,
    backend: {
        type: 'mongo',
        url: `mongodb://${process.env.NODE_ENV === 'production' ? 'mongodb' : 'localhost'}:27017/mqtt`,
        pubsubCollection: 'scoreboard',
        mongo: {}
    },
    http: {
        port: 8081,
        bundle: true,
        static: './'
    },
    persistence: {
        factory: mosca.persistence.Mongo,
        url: `mongodb://${process.env.NODE_ENV === 'production' ? 'mongodb' : 'localhost'}:27017/mqtt`,
    }
})

checkPublishToken = async (scoreboardTopic, publishToken) => {
    try {
        const scoreboard = await knex('scoreboards')
            .where({ topic: scoreboardTopic, publish_token: publishToken })
            .first()

        return scoreboard != null
    } catch (error) {
        return false
    }
}

broker.authorizePublish = async (client, topic, payload, callback) => {
    try {
        const [scoreboardTopic, field] = topic.split('/')

        if (!scoreboardTopic || !field) {
            return callback(null, false)
        }

        const data = JSON.parse(payload.toString())

        if (!data || !data.publish_token) {
            return callback(null, false)
        }

        if (!checkPublishToken(scoreboardTopic, data.publish_token)) {
            return callback(null, false)
        }

        return callback(null, Buffer.from(data.payload))

    } catch (error) {
        return callback(null, false)
    }
}

broker.on('ready', () => {
    console.log("Broker executando")
})

module.exports = { broker, checkPublishToken }
