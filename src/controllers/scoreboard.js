const crypto = require('crypto');
const knex = require('../database');
const { broker, checkPublishToken } = require('../broker');

class ScoreboardController {
  async index(req, res) {
    try {
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
    } catch (error) {
      res.status(500).json({ message: error.toString() });
    }
  }

  async get(req, res) {
    try {
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
    } catch (error) {
      res.status(500).json({ message: error.toString() });
    }
  }

  async refreshTokens(req, res) {
    try {
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

      res.json({ message: 'tokens_refreshed', publish_token: newPublishToken, refresh_token: newRefreshToken });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async takeControl(req, res) {
    try {
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

      res.json({ message: 'tokens_refreshed', publish_token: newPublishToken, refresh_token: newRefreshToken });
    } catch (error) {
      res.status(500).json({ message: error.toString() });
    }
  }

  async finishMatch(req, res) {
    try {
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

      await knex('scoreboards')
        .where({ topic: scoreboardTopic })
        .update({ publish_token: null, refresh_token: null, match_id: null });

      await knex('logs')
        .where({ match_id: scoreboard.match_id })
        .del();

      await knex('matches')
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
        'Is_Set_Tiebreak',
        'Is_Match_Tiebreak',
        'Match_Winner',
        'Player_Serving'];

      topics.forEach((topic) => broker.publish({
        topic: `${scoreboardTopic}/${topic}`,
        payload: '',
        qos: 1,
        retain: true,
      }));

      res.status(200).json({ message: 'match_finished' });
    } catch (error) {
      res.status(500).json({ message: error.toString() });
    }
  }
}

module.exports = new ScoreboardController();
