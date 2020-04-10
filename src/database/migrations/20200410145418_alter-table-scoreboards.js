
exports.up = function (knex) {
  return knex.schema
    .alterTable('scoreboards', (table) => {
      table
        .string('static_token');
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('scoreboards', (table) => {
      table.dropColumn('static_token');
    });
};
