const crypto = require('crypto');
const knex = require('../database');
const { broker, checkPublishToken } = require('../broker');

async function index(req, res) {
  let scoreboards = await knex('scoreboards')
    .leftJoin('matches', 'scoreboards.match_id', '=', 'matches.id')
    .orderBy('scoreboards.topic');

  scoreboards = scoreboards.map((it) => ({
    topic: it.topic,
    name: it.name,
    match: it.match_id ? {
      player1_name: it.player1_name,
      player2_name: it.player2_name,
      start_time: new Date(it.start_time),
    } : null,
  }));

  return res.status(200).json({ message: 'scoreboards found', data: scoreboards });
}

async function get(req, res) {
  const { scoreboard_topic: scoreboardTopic } = req.params;
  const { 'publish-token': publishToken } = req.headers;

  if (!scoreboardTopic) {
    return res.status(400).json({ message: 'invalid_scoreboard_topic' });
  }

  let scoreboard = await knex('scoreboards')
    .where({ topic: scoreboardTopic })
    .leftJoin('matches', 'scoreboards.match_id', '=', 'matches.id')
    .first();

  if (!scoreboard) {
    return res.status(400).json({ message: 'scoreboard_not_found' });
  }

  scoreboard = {
    topic: scoreboard.topic,
    name: scoreboard.name,
    match: scoreboard.match_id ? {
      id: scoreboard.match_id,
      player1_name: scoreboard.player1_name,
      player2_name: scoreboard.player2_name,
      tiebreak_type: scoreboard.tiebreak_type,
      advantage: scoreboard.advantage,
      score_type: scoreboard.score_type,
      start_time: new Date(scoreboard.start_time),
    } : null,
    has_control: await checkPublishToken(scoreboardTopic, publishToken),
  };

  return res.status(200).json({ message: 'scoreboard found', data: scoreboard });
}

async function refreshTokens(req, res) {
  const { scoreboard_topic: scoreboardTopic } = req.params;
  const { refresh_token: refreshToken } = req.query;

  if (!scoreboardTopic) {
    return res.status(400).json({ message: 'invalid_scoreboard_topic' });
  }

  if (!refreshToken) {
    return res.status(400).json({ message: 'invalid_refresh_token' });
  }

  const scoreboard = await knex('scoreboards')
    .where({ topic: scoreboardTopic })
    .first();

  if (!scoreboard) {
    return res.status(400).json({ message: 'scoreboard_not_found' });
  }

  if (scoreboard.refresh_token !== refreshToken) {
    return res.status(401).json({ message: 'wrong_refresh_token' });
  }

  const newPublishToken = crypto.randomBytes(16).toString('hex');
  const newRefreshToken = crypto.randomBytes(16).toString('hex');

  await knex('scoreboards')
    .where({ topic: scoreboardTopic })
    .update({
      publish_token: newPublishToken,
      refresh_token: newRefreshToken,
    });

  await broker.publish({
    topic: `${scoreboardTopic}/publisher`,
    payload: `${Math.floor(Math.random() * (1000000 + 1))}`,
    qos: 1,
  });

  return res.json({ message: 'tokens_refreshed', publish_token: newPublishToken, refresh_token: newRefreshToken });
}

async function takeControl(req, res) {
  const { scoreboard_topic: scoreboardTopic } = req.params;

  if (!scoreboardTopic) {
    return res.status(400).json({ message: 'invalid_scoreboard_topic' });
  }

  const scoreboard = await knex('scoreboards')
    .where({ topic: scoreboardTopic })
    .first();

  if (!scoreboard) {
    return res.status(400).json({ message: 'scoreboard_not_found' });
  }

  const newPublishToken = crypto.randomBytes(16).toString('hex');
  const newRefreshToken = crypto.randomBytes(16).toString('hex');

  await knex('scoreboards')
    .where({ topic: scoreboardTopic })
    .update({
      publish_token: newPublishToken,
      refresh_token: newRefreshToken,
    });

  await broker.publish({
    topic: `${scoreboardTopic}/publisher`,
    payload: `${Math.floor(Math.random() * (1000000 + 1))}`,
    qos: 1,
  });

  return res.json({ message: 'tokens_refreshed', publish_token: newPublishToken, refresh_token: newRefreshToken });
}

async function finishMatch(req, res) {
  const { scoreboard_topic: scoreboardTopic } = req.params;

  if (!scoreboardTopic) {
    return res.status(400).json({ message: 'invalid_scoreboard_topic' });
  }

  const scoreboard = await knex('scoreboards')
    .where({ topic: scoreboardTopic })
    .first();

  if (!scoreboard) {
    return res.status(400).json({ message: 'scoreboard_not_found' });
  }

  if (!scoreboard.match_id) {
    return res.status(400).json({ message: 'match_not_found' });
  }

  setTimeout(async () => {
    await knex.transaction(async (trx) => {
      await trx('logs')
        .where({ match_id: scoreboard.match_id })
        .del();

      await trx('scoreboards')
        .where({ topic: scoreboardTopic })
        .update({ publish_token: null, refresh_token: null, match_id: null });

      await trx('matches')
        .where({ id: scoreboard.match_id })
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
        topic: `${scoreboardTopic}/${topic}`,
        payload: '',
        qos: 1,
        retain: true,
      }));

      broker.publish({
        topic: 'Scoreboards_Changed',
        payload: Buffer.from(''),
      });
    });
  }, 1000 * 10 * 1);

  return res.status(200).json({ message: 'match_finish_scheduled' });
}
module.exports = {
  index, get, refreshTokens, takeControl, finishMatch,
};
