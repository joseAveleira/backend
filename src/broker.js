/* eslint-disable no-console */
const aedes = require('aedes');
const http = require('http');
const ws = require('websocket-stream');
const net = require('net');
const mongoPersistence = require('aedes-persistence-mongodb');
const knex = require('./database');

const broker = aedes({
  persistence: mongoPersistence({
    url: `mongodb://${process.env.NODE_ENV === 'production' ? 'mongodb' : 'localhost'}:27017/mqtt`,
  }),
});

const httpServer = http.createServer();

ws.createServer({
  server: httpServer,
}, broker.handle);

const server = net.createServer(broker.handle);

async function listen() {
  httpServer.listen(8081, () => {
    console.log('Aedes server (WebSocket) running');
  });

  server.listen(1883, () => {
    console.log('Aedes server (Standalone) running');
  });
}

async function checkPublishToken(scoreboardTopic, publishToken) {
  try {
    const scoreboard = await knex('Scoreboard')
      .where({ topic: scoreboardTopic })
      .andWhere((q) => q.where({ publishToken })
        .orWhere({ staticToken: publishToken }))
      .first();

    return scoreboard !== undefined;
  } catch (error) {
    return false;
  }
}

broker.authorizePublish = async (client, packet, callback) => {
  try {
    const [scoreboardTopic, field] = packet.topic.split('/');

    if (!scoreboardTopic || !field) {
      return callback(new Error('unauthorized'));
    }

    if (field === 'Publisher') {
      return callback(new Error('unauthorized'));
    }

    const data = JSON.parse(packet.payload.toString());

    if (!data || !data.publishToken) {
      return callback(new Error('unauthorized'));
    }

    if (!await checkPublishToken(scoreboardTopic, data.publishToken)) {
      return callback(new Error('unauthorized'));
    }

    // eslint-disable-next-line no-param-reassign
    packet.payload = Buffer.from(data.payload);

    return callback(null);
  } catch (error) {
    return callback(new Error('unauthorized'));
  }
};

module.exports = { broker, checkPublishToken, listen };
