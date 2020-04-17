const jwt = require('jsonwebtoken');
const knex = require('../database');
const { PreconditionFailedError, UnauthorizedError } = require('../errors');

async function isAdmin(req, res, next) {
  try {
    const token = req.headers['x-access-token'];

    const { userName } = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const admin = await knex('Admin')
      .where({ userName })
      .first();

    if (!admin) {
      throw new UnauthorizedError(1002);
    }

    res.locals.user = admin;
    return next();
  } catch (error) {
    throw new UnauthorizedError(1002);
  }
}

async function hasPublishToken(req, res, next) {
  try {
    const publishToken = req.headers['x-publish-token'];
    const { matchId, scoreboardTopic } = req.params;

    if (!publishToken) {
      throw new PreconditionFailedError(1003);
    }

    if (matchId) {
      const match = await knex('Match')
        .select('id')
        .where({ id: matchId, 'Scoreboard.publishToken': publishToken })
        .join('Scoreboard', { 'Scoreboard.matchId': 'Match.id' })
        .first();

      if (!match) {
        throw new PreconditionFailedError(1003);
      }
    } else if (scoreboardTopic) {
      const scoreboard = await knex('Scoreboard')
        .select('topic')
        .where({ topic: scoreboardTopic, publishToken })
        .first();

      if (!scoreboard) {
        throw new PreconditionFailedError(1003);
      }
    } else {
      throw new PreconditionFailedError(1003);
    }


    return next();
  } catch (error) {
    throw new UnauthorizedError(1003);
  }
}

async function isAdminOrHasPublishToken(req, res, next) {
  const token = req.headers['x-access-token'];

  if (token) {
    return isAdmin(req, res, next);
  }

  return hasPublishToken(req, res, next);
}

module.exports = { isAdmin, hasPublishToken, isAdminOrHasPublishToken };
