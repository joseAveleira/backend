
exports.up = function (knex) {
  return knex.schema
    .createTable('scoreboards', (table) => {
      table
        .string('topic')
        .primary();

      table
        .string('name')
        .notNullable();

      table
        .string('publish_token');

      table
        .string('refresh_token');

      table
        .integer('match_id')
        .references('id')
        .inTable('matches');
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('scoreboards');
};
