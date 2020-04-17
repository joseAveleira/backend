
exports.up = (knex) => knex.schema
  .createTable('Scoreboard', (table) => {
    table
      .string('topic')
      .primary();

    table
      .string('name')
      .notNullable();

    table
      .string('publishToken');

    table
      .string('refreshToken');

    table
      .string('staticToken');

    table
      .integer('matchId')
      .references('id')
      .inTable('Match');
  });

exports.down = (knex) => knex.schema
  .dropTable('Scoreboard');
