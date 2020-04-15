const crypto = require('crypto');
const knex = require('../database');
const { broker } = require('../broker');

async function getLogs(req, res) {
  const { match_id: matchId } = req.params;

  const logs = await knex('logs')
    .select('id', 'log_type', 'message')
    .where('match_id', '=', matchId)
    .orderBy('id', 'asc');

  return res.status(200).json({ message: 'logs found', data: logs });
}


async function create(req, res) {
  const {
    scoreboard_topic: scoreboardTopic,
    player1_name: player1Name,
    player2_name: player2Name,
    tiebreak_type: tiebreakType,
    advantage,
    score_type: scoreType,
  } = req.body;

  if (!scoreboardTopic) {
    return res.status(400).json({ message: 'invalid_scoreboard_topic' });
  }

  if (!['REGULAR', 'TEN_POINTS'].includes(tiebreakType)) {
    return res.status(400).json({ message: 'invalid_tiebreak_type' });
  }

  if (advantage !== true && advantage !== false) {
    return res.status(400).json({ message: 'invalid_advantage' });
  }

  if (!['BASIC', 'ADVANCED'].includes(scoreType)) {
    return res.status(400).json({ message: 'invalid_score_type' });
  }

  const scoreboard = await knex('scoreboards')
    .where({ topic: scoreboardTopic })
    .first();

  if (!scoreboard) {
    return res.status(400).json({ message: 'scoreboard_not_found' });
  }

  if (scoreboard.match_id) {
    return res.status(400).json({ message: 'scoreboard_not_free' });
  }

  const [matchId] = await knex('matches')
    .insert({
      player1_name: player1Name,
      player2_name: player2Name,
      tiebreak_type: tiebreakType,
      advantage,
      score_type: scoreType,
    })
    .returning('id');

  const publishToken = crypto.randomBytes(16).toString('hex');
  const refreshToken = crypto.randomBytes(16).toString('hex');

  await knex('scoreboards')
    .where({ topic: scoreboardTopic })
    .update({
      match_id: matchId,
      publish_token: publishToken,
      refresh_token: refreshToken,
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

  return res.json({ message: 'match_created', publish_token: publishToken, refresh_token: refreshToken });
}

module.exports = { getLogs, create };
