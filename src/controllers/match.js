const crypto = require('crypto');
const knex = require('../database');
const { broker } = require('../broker');

async function addLog(req, res) {
  return res.status(200).json({});
}

async function getLogs(req, res) {
  const { matchId } = req.params;

  const match = await knex('Match')
    .select('id')
    .where({ id: matchId })
    .first();

  if (!match) {
    return res
      .status(412)
      .json({
        code: 2000,
        message: 'Match not found',
      });
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
    return res
      .status(412)
      .json({
        code: 3000,
        message: 'Scoreboard not found',
      });
  }

  if (scoreboard.matchId) {
    return res
      .status(412)
      .json({
        code: 3001,
        message: 'Scoreboard already has a match',
      });
  }

  const [matchId] = await knex('Match')
    .insert({
      player1,
      player2,
      tieBreakType,
      hasAdvantage,
      scoreType,
    })
    .returning('id');

  const publishToken = crypto.randomBytes(16).toString('hex');
  const refreshToken = crypto.randomBytes(16).toString('hex');

  await knex('Scoreboard')
    .where({ topic: scoreboardTopic })
    .update({
      matchId,
      publishToken,
      refreshToken,
    });

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
    .json({ publishToken, refreshToken });
}

async function finishMatch(req, res) {
  const { matchId } = req.params;

  const match = await knex('Match')
    .select('id', 'scheduledToDeletion', { scoreboardTopic: 'Scoreboard.topic' })
    .where({ id: matchId })
    .join('Scoreboard', { 'Match.id': 'Scoreboard.matchId' })
    .first();

  if (!match) {
    return res
      .status(412)
      .json({
        code: 2000,
        message: 'Match not found',
      });
  }

  if (match.scheduledToDeletion) {
    return res
      .status(412)
      .json({
        code: 2001,
        message: 'Match is already being deleted, please wait',
      });
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
