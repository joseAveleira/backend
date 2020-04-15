const jwt = require('jsonwebtoken');
const { isAdmin, isAdminOrHasPublishToken, hasPublishToken } = require('../../../src/middlewares/auth');
const midlewares = require('../../../src/middlewares/auth');
const { UnauthorizedError } = require('../../../src/errors');
const knex = require('../../../src/database');
const { createAdminAndSignIn } = require('../../utils/auth');

describe('isAdmin', () => {
  it('Returns error 1002 if token is not sent on headers', async () => {
    const req = {
      headers: {},
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(isAdmin(req, res, callback))
      .rejects
      .toThrowError(new UnauthorizedError(1002));

    expect(callback).not.toHaveBeenCalled();
  });

  it('Returns error 1002 if admin doesnt exists', async () => {
    const req = {
      headers: {
        'x-access-token': await jwt.sign({ userName: 'admin' }, process.env.JWT_SECRET || 'secret'),
      },
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(isAdmin(req, res, callback))
      .rejects
      .toThrowError(new UnauthorizedError(1002));

    expect(callback).not.toHaveBeenCalled();
  });

  it('Returns error 1002 if token is inválid', async () => {
    const admin = await createAdminAndSignIn();

    const req = {
      headers: {
        'x-access-token': `${admin.token}x`,
      },
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(isAdmin(req, res, callback))
      .rejects
      .toThrowError(new UnauthorizedError(1002));

    expect(callback).not.toHaveBeenCalled();
  });

  it('Calls next if token is valid', async () => {
    const admin = await createAdminAndSignIn();

    const req = {
      headers: {
        'x-access-token': admin.token,
      },
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(isAdmin(req, res, callback))
      .resolves
      .not
      .toThrow();

    expect(callback).toHaveBeenCalled();
  });
});

describe('hasPublishToken', () => {
  it('Returns error 1003 is publishToken is not sent on headers', async () => {
    const req = {
      headers: {},
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(hasPublishToken(req, res, callback))
      .rejects
      .toThrowError(new UnauthorizedError(1003));

    expect(callback).not.toHaveBeenCalled();
  });

  it('Returns error 1003 if matchId nor scoreboardTopic are sent', async () => {
    const req = {
      headers: {
        'x-publish-token': 'blabla',
      },
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(hasPublishToken(req, res, callback))
      .rejects
      .toThrowError(new UnauthorizedError(1003));

    expect(callback).not.toHaveBeenCalled();
  });

  it('Returns error 1003 if matchId is passed but token is invalid', async () => {
    const scoreboard = {
      topic: 'scoreboard1',
      name: 'Scoreboard 1',
      publishToken: 'valid token',
    };

    await knex('Scoreboard')
      .insert(scoreboard);

    const match = {
      id: 1,
      scoreboardTopic: 'scoreboard1',
      player1: 'John Doe',
      player2: 'Jane Doe',
      tieBreakType: 'REGULAR',
      hasAdvantage: true,
      scoreType: 'BASIC',
    };

    await knex('Match')
      .insert({
        id: match.id,
        player1: match.player1,
        player2: match.player2,
        tieBreakType: match.tieBreakType,
        hasAdvantage: match.hasAdvantage,
        scoreType: match.scoreType,
      });

    await knex('Scoreboard')
      .where({ topic: scoreboard.topic })
      .update({ matchId: match.id });

    const req = {
      headers: {
        'x-publish-token': `${scoreboard.publishToken}x`,
      },
      params: {
        matchId: 1,
      },
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(hasPublishToken(req, res, callback))
      .rejects
      .toThrowError(new UnauthorizedError(1003));

    expect(callback).not.toHaveBeenCalled();
  });

  it('Calls next if matchId is passed and token is valid', async () => {
    const scoreboard = {
      topic: 'scoreboard1',
      name: 'Scoreboard 1',
      publishToken: 'valid token',
    };

    await knex('Scoreboard')
      .insert(scoreboard);

    const match = {
      id: 1,
      scoreboardTopic: 'scoreboard1',
      player1: 'John Doe',
      player2: 'Jane Doe',
      tieBreakType: 'REGULAR',
      hasAdvantage: true,
      scoreType: 'BASIC',
    };

    await knex('Match')
      .insert({
        id: match.id,
        player1: match.player1,
        player2: match.player2,
        tieBreakType: match.tieBreakType,
        hasAdvantage: match.hasAdvantage,
        scoreType: match.scoreType,
      });

    await knex('Scoreboard')
      .where({ topic: scoreboard.topic })
      .update({ matchId: match.id });

    const req = {
      headers: {
        'x-publish-token': scoreboard.publishToken,
      },
      params: {
        matchId: 1,
      },
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(hasPublishToken(req, res, callback))
      .resolves
      .not
      .toThrow();

    expect(callback).toHaveBeenCalled();
  });

  it('Returns error 1003 if scoreboardTopic is passed but token is invalid', async () => {
    const scoreboard = {
      topic: 'scoreboard1',
      name: 'Scoreboard 1',
      publishToken: 'valid token',
    };

    await knex('Scoreboard')
      .insert(scoreboard);

    const match = {
      id: 1,
      scoreboardTopic: 'scoreboard1',
      player1: 'John Doe',
      player2: 'Jane Doe',
      tieBreakType: 'REGULAR',
      hasAdvantage: true,
      scoreType: 'BASIC',
    };

    await knex('Match')
      .insert({
        id: match.id,
        player1: match.player1,
        player2: match.player2,
        tieBreakType: match.tieBreakType,
        hasAdvantage: match.hasAdvantage,
        scoreType: match.scoreType,
      });

    await knex('Scoreboard')
      .where({ topic: scoreboard.topic })
      .update({ matchId: match.id });

    const req = {
      headers: {
        'x-publish-token': `${scoreboard.publishToken}x`,
      },
      params: {
        scoreboardTopic: scoreboard.topic,
      },
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(hasPublishToken(req, res, callback))
      .rejects
      .toThrowError(new UnauthorizedError(1003));

    expect(callback).not.toHaveBeenCalled();
  });

  it('Calls next if scoreboardTopic is passed and token is valid', async () => {
    const scoreboard = {
      topic: 'scoreboard1',
      name: 'Scoreboard 1',
      publishToken: 'valid token',
    };

    await knex('Scoreboard')
      .insert(scoreboard);

    const match = {
      id: 1,
      scoreboardTopic: 'scoreboard1',
      player1: 'John Doe',
      player2: 'Jane Doe',
      tieBreakType: 'REGULAR',
      hasAdvantage: true,
      scoreType: 'BASIC',
    };

    await knex('Match')
      .insert({
        id: match.id,
        player1: match.player1,
        player2: match.player2,
        tieBreakType: match.tieBreakType,
        hasAdvantage: match.hasAdvantage,
        scoreType: match.scoreType,
      });

    await knex('Scoreboard')
      .where({ topic: scoreboard.topic })
      .update({ matchId: match.id });

    const req = {
      headers: {
        'x-publish-token': scoreboard.publishToken,
      },
      params: {
        scoreboardTopic: scoreboard.topic,
      },
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(hasPublishToken(req, res, callback))
      .resolves
      .not
      .toThrow();

    expect(callback).toHaveBeenCalled();
  });
});

describe('isAdminOrHasPublishToken', () => {
  it('Calls isAdmin if x-access-token is sent on headers', async () => {
    const req = {
      headers: {
        'x-access-token': await jwt.sign({ userName: 'admin' }, process.env.JWT_SECRET || 'secret'),
      },
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(isAdminOrHasPublishToken(req, res, callback))
      .rejects
      .toThrowError(new UnauthorizedError(1002));

    expect(callback).not.toHaveBeenCalled();
  });

  it('Calls hasPublishToken if x-access-token is not sent on headers', async () => {
    const req = {
      headers: {},
    };

    const res = {
      locals: {},
    };

    const callback = jest.fn();

    await expect(isAdminOrHasPublishToken(req, res, callback))
      .rejects
      .toThrowError(new UnauthorizedError(1003));

    expect(callback).not.toHaveBeenCalled();
  });
});
