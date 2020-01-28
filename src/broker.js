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

server.on('ready', () => {
    console.log("Broker executando")
})
