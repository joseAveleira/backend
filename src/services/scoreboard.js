const crypto = require('crypto');
const { broker } = require('../broker');
const knex = require('../database');

async function refreshTokensAndUpdatePublisher(scoreboardTopic, updatePublisher = true) {
  const newPublishToken = crypto.randomBytes(16).toString('hex');
  const newRefreshToken = crypto.randomBytes(16).toString('hex');

  await knex('Scoreboard')
    .where({ topic: scoreboardTopic })
    .update({
      publishToken: newPublishToken,
      refreshToken: newRefreshToken,
    });

  if (updatePublisher) {
    await broker.publish({
      topic: `${scoreboardTopic}/publisher`,
      payload: `${Math.floor(Math.random() * (1000000 + 1))}`,
      qos: 1,
    });
  }

  return {
    publishToken: newPublishToken,
    refreshToken: newRefreshToken,
  };
}

module.exports = { refreshTokensAndUpdatePublisher };
