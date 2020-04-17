const knex = require('../../src/database');

beforeEach(async () => { await knex.migrate.latest(); });

afterEach(async () => { await knex.migrate.rollback(); });

afterAll(async () => {
  await knex.destroy();
});
