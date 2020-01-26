const mosca = require('mosca')

const server = new mosca.Server({
    port: 1883,
    backend: {
        type: 'redis',
        redis: require('redis'),
        db: 12,
        port: 6379,
        return_buffers: true,
        host: 'redis'
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