
exports.up = (knex) => knex.schema
  .createTable('Admin', (table) => {
    table
      .string('userName')
      .primary();

    table
      .string('name')
      .notNullable();

    table
      .string('password')
      .notNullable();

    table
      .datetime('createdAt')
      .defaultTo(knex.fn.now());

    table
      .datetime('deletedAt');
  });

exports.down = (knex) => knex.schema
  .dropTable('Admin');
