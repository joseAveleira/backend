
exports.up = (knex) => knex.schema
  .createTable('Log', (table) => {
    table
      .increments('id')
      .primary();

    table
      .integer('matchId')
      .notNullable()
      .references('id')
      .inTable('Match');

    table
      .enu('logType', [
        'SCORE',
        'ACE',
        'WINNER',
        'DOUBLE_FAULT',
        'GAME',
        'SET',
        'MATCH',
        'ACTION'])
      .notNullable();

    table
      .string('message')
      .notNullable();

    table
      .datetime('createdAt')
      .defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema
  .dropTable('Log');
