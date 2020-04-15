const supertest = require('supertest');
const app = require('../../../src/app');
const knex = require('../../../src/database');
const { createAdminAndSignIn } = require('../../utils/auth');

const request = supertest(app);

describe('getLogs', () => {
  test('It returns error 2000 if match doesnt exists', async () => {
    const response = await request
      .get('/match/1/logs');

    expect(response.status).toStrictEqual(412);
    expect(response.body.code).toStrictEqual(2000);
  });

  test('It returns logs', async () => {
    await knex('Match')
      .insert({
        id: 1,
        player1: 'John Doe',
        player2: 'Jane Doe',
      });

    await knex('Log')
      .insert({
        id: 1,
        matchId: 1,
        logType: 'SCORE',
        message: 'test log',
      });

    const response = await request
      .get('/match/1/logs');

    expect(response.status).toStrictEqual(200);
    expect(response.body).toStrictEqual([
      {
        id: 1,
        logType: 'SCORE',
        message: 'test log',
      },
    ]);
  });
});

describe('createMatch', () => {
  test('It returns error 1002 if admin is not authenticated', async () => {
    const scoreboard = {
      scoreboardTopic: 'scoreboard1',
      player1: 'John Doe',
      player2: 'Jane Doe',
      tieBreakType: 'REGULAR',
      hasAdvantage: true,
      scoreType: 'BASIC',
    };

    const response = await request
      .post('/match')
      .set('x-access-token', 'blabla')
      .send(scoreboard);

    expect(response.status).toStrictEqual(401);
    expect(response.body.code).toStrictEqual(1002);
  });

  test('It returns error 3000 if scoreboard doesnt exists', async () => {
    const admin = await createAdminAndSignIn();

    const match = {
      scoreboardTopic: 'scoreboard1',
      player1: 'John Doe',
      player2: 'Jane Doe',
      tieBreakType: 'REGULAR',
      hasAdvantage: true,
      scoreType: 'BASIC',
    };

    const response = await request
      .post('/match')
      .set('x-access-token', admin.token)
      .send(match);

    expect(response.status).toStrictEqual(412);
    expect(response.body.code).toStrictEqual(3000);
  });

  test('It returns error 3001 if scoreboard already has a match', async () => {
    const admin = await createAdminAndSignIn();

    const scoreboard = {
      topic: 'scoreboard1',
      name: 'Scoreboard 1',
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

    const response = await request
      .post('/match')
      .set('x-access-token', admin.token)
      .send({
        scoreboardTopic: match.scoreboardTopic,
        player1: match.player1,
        player2: match.player2,
        tieBreakType: match.tieBreakType,
        hasAdvantage: match.hasAdvantage,
        scoreType: match.scoreType,
      });

    expect(response.status).toStrictEqual(412);
    expect(response.body.code).toStrictEqual(3001);
  });

  test('It creates match and update topics', async () => {
    const admin = await createAdminAndSignIn();

    const scoreboard = {
      topic: 'scoreboard1',
      name: 'Scoreboard 1',
    };

    const match = {
      scoreboardTopic: 'scoreboard1',
      player1: 'John Doe',
      player2: 'Jane Doe',
      tieBreakType: 'REGULAR',
      hasAdvantage: true,
      scoreType: 'BASIC',
    };

    await knex('Scoreboard')
      .insert(scoreboard);

    const response = await request
      .post('/match')
      .set('x-access-token', admin.token)
      .send(match);

    expect(response.status).toStrictEqual(200);
    expect(response.body).toHaveProperty('publishToken');
    expect(response.body).toHaveProperty('refreshToken');

    const matchCount = await knex('Match')
      .count('id')
      .first();

    expect(matchCount.count).toStrictEqual('1');

    const updatedScoreboard = await knex('Scoreboard')
      .where({ topic: scoreboard.topic })
      .first();

    expect(updatedScoreboard.publishToken).toStrictEqual(response.body.publishToken);
    expect(updatedScoreboard.refreshToken).toStrictEqual(response.body.refreshToken);
  });
});

describe.skip('finishMatch', () => {
  test('It returns error 2000 if match doesnt exists', async () => {
    const response = await request
      .delete('/match/1');

    expect(response.status).toStrictEqual(412);
    expect(response.body.code).toStrictEqual(2000);
  });

  test('Ir returns error 2001 if match is alredy in process of deletion', async () => {
    const scoreboard = {
      topic: 'scoreboard1',
      name: 'Scoreboard 1',
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
        scheduledToDeletion: true,
      });

    await knex('Scoreboard')
      .where({ topic: scoreboard.topic })
      .update({ matchId: match.id });

    const response = await request
      .delete('/match/1');

    expect(response.status).toStrictEqual(412);
    expect(response.body.code).toStrictEqual(2001);
  });
});
