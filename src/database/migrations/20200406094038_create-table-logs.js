
exports.up = function (knex) {
  return knex.schema
    .createTable('logs', (table) => {
      table
        .increments('id')
        .primary();

      table
        .integer('match_id')
        .references('id')
        .inTable('matches');

      table
        .enu('log_type', [
          'SCORE',
          'ACE',
          'WINNER',
          'DOUBLE_FAULT',
          'GAME',
          'SET',
          'MATCH']);

      table
        .string('message')
        .notNullable();

      table
        .datetime('created_at')
        .defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('logs');
};
