const mosca = require('mosca')

try {
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
    })

    server.on('ready', () => {
        console.log("Broker executando")
    })

} catch (error) {
    console.log('pei', error)
}    
