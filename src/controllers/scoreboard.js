const crypto = require('crypto');
const knex = require('../database');
const { broker, checkPublishToken } = require('../broker');

async function listScoreboards(req, res) {
  const scoreboards = await knex('Scoreboard')
    .select('topic', 'name', 'matchId', 'Match.player1', 'Match.player2', 'Match.createdAt')
    .leftJoin('Match', { 'Match.id': 'Scoreboard.matchId' })
    .orderBy('Scoreboard.topic');

  const processedScoreboards = scoreboards.map((scoreboard) => ({
    topic: scoreboard.topic,
    name: scoreboard.name,
    match: scoreboard.matchId ? {
      player1: scoreboard.player1,
      player2: scoreboard.player2,
      createdAt: scoreboard.createdAt,
    } : null,
  }));

  return res
    .status(200)
    .json(processedScoreboards);
}

async function getScoreboard(req, res) {
  const { scoreboardTopic } = req.params;
  const { 'publish-token': publishToken } = req.headers;

  const scoreboard = await knex('Scoreboard')
    .select('topic',
      'name',
      'matchId',
      'Match.player1',
      'Match.player2',
      'Match.tieBreakType',
      'Match.hasAdvantage',
      'Match.scoreType',
      'Match.createdAt')
    .where({ topic: scoreboardTopic })
    .leftJoin('Match', { 'Match.id': 'Scoreboard.matchId' })
    .first();

  if (!scoreboard) {
    return res
      .status(412)
      .json({
        code: 3000,
        message: 'Scoreboard not found',
      });
  }

  const processedScoreboard = {
    topic: scoreboard.topic,
    name: scoreboard.name,
    match: scoreboard.matchId ? {
      id: scoreboard.matchId,
      player1: scoreboard.player1,
      player2: scoreboard.player2,
      tieBreakType: scoreboard.tieBreakType,
      hasAdvantage: scoreboard.hasAdvantage,
      scoreType: scoreboard.scoreType,
      createdAt: new Date(scoreboard.createdAt),
    } : null,
    hasControl: await checkPublishToken(scoreboardTopic, publishToken),
  };

  return res
    .status(200)
    .json(processedScoreboard);
}

async function refreshTokens(req, res) {
  const { scoreboardTopic } = req.params;
  const { refreshToken } = req.query;

  const scoreboard = await knex('Scoreboard')
    .select('matchId', 'refreshToken')
    .where({ topic: scoreboardTopic })
    .first();

  if (!scoreboard) {
    return res
      .status(412)
      .json({
        code: 3000,
        message: 'Scoreboard not found',
      });
  }

  if (!scoreboard.matchId) {
    return res
      .status(412)
      .json({
        code: 3002,
        message: 'Scoreboard doesnt have a match',
      });
  }

  if (scoreboard.refreshToken !== refreshToken) {
    return res
      .status(401)
      .json({
        code: 1001,
        message: 'Invalid refresh token',
      });
  }

  const newPublishToken = crypto.randomBytes(16).toString('hex');
  const newRefreshToken = crypto.randomBytes(16).toString('hex');

  await knex('Scoreboard')
    .where({ topic: scoreboardTopic })
    .update({
      publishToken: newPublishToken,
      refreshToken: newRefreshToken,
    });

  await broker.publish({
    topic: `${scoreboardTopic}/publisher`,
    payload: `${Math.floor(Math.random() * (1000000 + 1))}`,
    qos: 1,
  });

  return res
    .status(200)
    .json({
      publishToken: newPublishToken,
      refreshToken: newRefreshToken,
    });
}

async function takeControl(req, res) {
  const { scoreboardTopic } = req.params;

  const scoreboard = await knex('Scoreboard')
    .select('topic', 'matchId')
    .where({ topic: scoreboardTopic })
    .first();

  if (!scoreboard) {
    return res
      .status(412)
      .json({
        code: 3000,
        message: 'Scoreboard not found',
      });
  }


  if (!scoreboard.matchId) {
    return res
      .status(412)
      .json({
        code: 3002,
        message: 'Scoreboard doesnt have a match',
      });
  }

  const newPublishToken = crypto.randomBytes(16).toString('hex');
  const newRefreshToken = crypto.randomBytes(16).toString('hex');

  await knex('Scoreboard')
    .where({ topic: scoreboardTopic })
    .update({
      publishToken: newPublishToken,
      refreshToken: newRefreshToken,
    });

  await broker.publish({
    topic: `${scoreboardTopic}/publisher`,
    payload: `${Math.floor(Math.random() * (1000000 + 1))}`,
    qos: 1,
  });

  return res
    .status(200)
    .json({
      publishToken: newPublishToken,
      refreshToken: newRefreshToken,
    });
}


module.exports = {
  listScoreboards, getScoreboard, refreshTokens, takeControl,
};
