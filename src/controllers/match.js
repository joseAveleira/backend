const knex = require('../database');
const { broker } = require('../broker');
const { PreconditionFailedError } = require('../errors');
const { refreshTokensAndUpdatePublisher } = require('../services/scoreboard');

async function addLog(req, res) {
  const { matchId } = req.params;

  const match = await knex('Match')
    .select('id')
    .where({ id: matchId })
    .first();

  if (!match) {
    throw new PreconditionFailedError(2000);
  }
}

async function getLogs(req, res) {
  const { matchId } = req.params;

  const match = await knex('Match')
    .select('id')
    .where({ id: matchId })
    .first();

  if (!match) {
    throw new PreconditionFailedError(2000);
  }

  const logs = await knex('Log')
    .select('id', 'logType', 'message')
    .where({ matchId })
    .orderBy('id', 'asc');

  return res
    .status(200)
    .json(logs);
}

async function createMatch(req, res) {
  const {
    scoreboardTopic,
    player1,
    player2,
    tieBreakType,
    hasAdvantage,
    scoreType,
  } = req.body;

  const scoreboard = await knex('Scoreboard')
    .where({ topic: scoreboardTopic })
    .first();

  if (!scoreboard) {
    throw new PreconditionFailedError(3000);
  }

  if (scoreboard.matchId) {
    throw new PreconditionFailedError(3001);
  }

  await knex('Match')
    .insert({
      player1,
      player2,
      tieBreakType,
      hasAdvantage,
      scoreType,
    });

  const newTokens = await refreshTokensAndUpdatePublisher(scoreboardTopic, false);

  const topics = [
    'Set1_A',
    'Set1_B',
    'Set2_A',
    'Set2_B',
    'Set3_A',
    'Set3_B',
    'Score_A',
    'Score_B',
    'Current_Set',
    'SetsWon_A',
    'SetsWon_B',
    'Player_Serving'];

  topics.forEach((topic) => broker.publish({
    topic: `${scoreboardTopic}/${topic}`,
    payload: Buffer.from('0'),
    qos: 1,
    retain: true,
  }));

  broker.publish({
    topic: `${scoreboardTopic}/Match_Winner`,
    payload: Buffer.from('null'),
    retain: true,
  });

  broker.publish({
    topic: `${scoreboardTopic}/Current_State`,
    payload: Buffer.from('GAME'),
    retain: true,
  });

  broker.publish({
    topic: 'Scoreboards_Changed',
    payload: Buffer.from(''),
  });

  return res
    .status(200)
    .json(newTokens);
}

async function finishMatch(req, res) {
  const { matchId } = req.params;

  const match = await knex('Match')
    .select('id', 'scheduledToDeletion', { scoreboardTopic: 'Scoreboard.topic' })
    .where({ id: matchId })
    .join('Scoreboard', { 'Match.id': 'Scoreboard.matchId' })
    .first();

  if (!match) {
    throw new PreconditionFailedError(2000);
  }

  if (match.scheduledToDeletion) {
    throw new PreconditionFailedError(2001);
  }

  await knex('Match')
    .where({ id: matchId })
    .update({ scheduledToDeletion: true });

  setTimeout(async () => {
    try {
      await knex.transaction(async (trx) => {
        await trx('Log')
          .where({ matchId })
          .del();

        await trx('Scoreboard')
          .where({ topic: match.scoreboardTopic })
          .update({
            publishToken: null,
            refreshToken: null,
            matchId: null,
          });

        await trx('Match')
          .where({ id: matchId })
          .del();

        const topics = [
          'Set1_A',
          'Set1_B',
          'Set2_A',
          'Set2_B',
          'Set3_A',
          'Set3_B',
          'Score_A',
          'Score_B',
          'Current_Set',
          'Current_State',
          'SetsWon_A',
          'SetsWon_B',
          'Match_Winner',
          'Player_Serving',
          'publisher'];

        topics.forEach((topic) => broker.publish({
          topic: `${match.scoreboardTopic}/${topic}`,
          payload: '',
          qos: 1,
          retain: true,
        }));

        broker.publish({
          topic: 'Scoreboards_Changed',
          payload: Buffer.from(''),
        });
      });
    } catch (error) {
      await knex('Match')
        .where({ id: matchId })
        .update({ scheduledToDeletion: false });
    }
  }, 1000 * 30 * 1);

  return res
    .status(200)
    .send();
}

module.exports = {
  addLog, getLogs, createMatch, finishMatch,
};
