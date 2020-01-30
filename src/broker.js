const mosca = require('mosca')

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

// server.authorizePublish = (client, topic, payload, callback) => {
//     console.log('[authorizePublish]', topic, payload)

//     callback(null, true)
// }

server.on('ready', () => {
    console.log("Broker executando")
})

module.exports = server
