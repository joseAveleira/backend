const crypto = require('crypto');
const knex = require('../database');
const { broker, checkPublishToken } = require('../broker');
const { refreshTokensAndUpdatePublisher } = require('../services/scoreboard');
const { PreconditionFailedError } = require('../errors');

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
  const { 'x-publish-token': publishToken } = req.headers;

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
    throw new PreconditionFailedError(3000);
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
    throw new PreconditionFailedError(3000);
  }

  if (!scoreboard.matchId) {
    throw new PreconditionFailedError(3002);
  }

  if (scoreboard.refreshToken !== refreshToken) {
    throw new PreconditionFailedError(1001);
  }

  const newTokens = await refreshTokensAndUpdatePublisher(scoreboardTopic);

  return res
    .status(200)
    .json(newTokens);
}

async function takeControl(req, res) {
  const { scoreboardTopic } = req.params;

  const scoreboard = await knex('Scoreboard')
    .select('topic', 'matchId')
    .where({ topic: scoreboardTopic })
    .first();

  if (!scoreboard) {
    throw new PreconditionFailedError(3000);
  }

  if (!scoreboard.matchId) {
    throw new PreconditionFailedError(3002);
  }

  const newTokens = await refreshTokensAndUpdatePublisher(scoreboardTopic);

  return res
    .status(200)
    .json(newTokens);
}

module.exports = {
  listScoreboards, getScoreboard, refreshTokens, takeControl,
};
