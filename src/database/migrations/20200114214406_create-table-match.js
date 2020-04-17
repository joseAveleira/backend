
exports.up = (knex) => knex.schema
  .createTable('Match', (table) => {
    table
      .increments('id')
      .primary();

    table
      .string('player1')
      .notNullable();

    table
      .string('player2')
      .notNullable();

    table
      .enu('tieBreakType', ['REGULAR', 'TEN_POINTS'])
      .notNullable()
      .defaultTo('REGULAR');

    table
      .boolean('hasAdvantage')
      .notNullable()
      .defaultTo(true);

    table
      .enu('scoreType', ['BASIC', 'ADVANCED'])
      .notNullable()
      .defaultTo('BASIC');

    table
      .boolean('scheduledToDeletion')
      .notNullable()
      .defaultTo(false);

    table
      .datetime('createdAt')
      .defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema
  .dropTable('Match');
