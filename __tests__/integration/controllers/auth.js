const bcrypt = require('bcryptjs');
const supertest = require('supertest');
const app = require('../../../src/app');
const knex = require('../../../src/database');

const request = supertest(app);

describe('signIn', () => {
  test('It returns error 1000 if admin doesnt exists', async () => {
    const response = await request
      .post('/auth/signIn')
      .send({
        userName: 'john',
        password: '123456',
      });

    expect(response.status).toStrictEqual(401);
    expect(response.body.code).toStrictEqual(1000);
  });

  test('It returns error 1000 if password is incorrect', async () => {
    const admin = {
      userName: 'john',
      name: 'John Doe',
      password: '123456',
    };

    await knex('Admin')
      .insert({
        userName: admin.userName,
        name: admin.name,
        password: await bcrypt.hash(admin.password, 10),
      });

    const response = await request
      .post('/auth/signIn')
      .send({
        userName: admin.userName,
        password: `${admin.password}x`,
      });

    expect(response.status).toStrictEqual(401);
    expect(response.body.code).toStrictEqual(1000);
  });

  test('It returns a JWT if password is correct', async () => {
    const admin = {
      userName: 'john',
      name: 'John Doe',
      password: '123456',
    };

    await knex('Admin')
      .insert({
        userName: admin.userName,
        name: admin.name,
        password: await bcrypt.hash(admin.password, 10),
      });

    const response = await request
      .post('/auth/signIn')
      .send({
        userName: admin.userName,
        password: admin.password,
      });

    expect(response.status).toStrictEqual(200);
    expect(response.body).toHaveProperty('token');
  });
});
