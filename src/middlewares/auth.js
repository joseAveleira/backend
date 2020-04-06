const jwt = require('jsonwebtoken');
const knex = require('../database');

function AdminAuthMiddleware(req, res, next) {
  try {
    const token = req.headers['x-access-token'];
    res.locals.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch (error) {
    res.status(401).json({ message: 'invalid_token' });
  }
}

async function PublishTokenAuthMiddleware(req, res, next) {
  try {
    const publishToken = req.headers['x-publish-token'];
    const scoreboardTopic = req.params.scoreboard_topic;

    if (!publishToken) {
      return res.status(401).json({ message: 'publish_token_required' });
    }

    if (!scoreboardTopic) {
      return res.status(401).json({ message: 'scoreboard_topic_required' });
    }

    const scoreboard = await knex('scoreboards')
      .where({ topic: scoreboardTopic, publish_token: publishToken })
      .first();

    if (!scoreboard) {
      return res.status(401).json({ message: 'invalid_token' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'invalid_token' });
  }
}

function UniversalAuthMiddleware(req, res, next) {
  const token = req.headers['x-access-token'];

  if (token) {
    return AdminAuthMiddleware(req, res, next);
  }
  return PublishTokenAuthMiddleware(req, res, next);
}

module.exports = { AdminAuthMiddleware, PublishTokenAuthMiddleware, UniversalAuthMiddleware };
