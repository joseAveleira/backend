const mosca = require('mosca')

const server = new mosca.Server({
    port: 1883,
    http: {
        port: 81,
        bundle: true,
        static: './'
    }
})

server.on('ready', () => {
    console.log("Broker executando")
})