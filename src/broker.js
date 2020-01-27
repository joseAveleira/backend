const mosca = require('mosca')

console.log('#debug', process.env.NODE_ENV)

const server = new mosca.Server({
    port: 1883,
    backend: {
        type: 'redis',
        redis: require('redis'),
        db: 12,
        port: 6379,
        return_buffers: true,
        host: process.env.NODE_ENV === 'production' ? 'redis' : 'localhost'
    },
    http: {
        port: 81,
        bundle: true,
        static: './'
    },
    persistence: {
        factory: mosca.persistence.Redis
    }
})

server.on('ready', () => {
    console.log("Broker executando")
})
