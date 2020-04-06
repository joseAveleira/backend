
exports.up = function (knex) {
  return knex.schema
    .createTable('admins', (table) => {
      table
        .string('username')
        .primary();

      table
        .string('name')
        .notNullable();

      table
        .string('password')
        .notNullable();

      table
        .datetime('created_at')
        .defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('admins');
};
