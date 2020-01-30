const mosca = require('mosca')
const knex = require('./database')

const server = new mosca.Server({
    port: 1883,
    backend: {
        type: 'mongo',
        url: `mongodb://${process.env.NODE_ENV === 'production' ? 'mongodb' : 'localhost'}:27017/mqtt`,
        pubsubCollection: 'scoreboard',
        mongo: {}
    },
    http: {
        port: 81,
        bundle: true,
        static: './'
    },
    persistence: {
        factory: mosca.persistence.Mongo,
        url: `mongodb://${process.env.NODE_ENV === 'production' ? 'mongodb' : 'localhost'}:27017/mqtt`,
    }
})

server.authorizePublish = async (client, topic, payload, callback) => {
    try {
        const [scoreboardTopic, field] = topic.split('/')

        if (!scoreboardTopic || !field) {
            return callback(null, false)
        }

        const data = JSON.parse(payload.toString())

        if (!data || !data.publish_token) {
            return callback(null, false)
        }

        const scoreboard = await knex('scoreboards')
            .where({ topic: scoreboardTopic })
            .first()

        if (!scoreboard) {
            return callback(null, false)
        }

        if (scoreboard.publish_token !== data.publish_token) {
            return callback(null, false)
        }

        return callback(null, Buffer.from(data.payload))

    } catch (error) {
        return callback(null, false)
    }
}

server.on('ready', () => {
    console.log("Broker executando")
})

module.exports = server
