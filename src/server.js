const app = require('./app');
const broker = require('./broker');

broker.listen();

// eslint-disable-next-line no-console
app.listen(8080, () => console.log('Servidor executando'));
