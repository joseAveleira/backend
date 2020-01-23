
exports.up = function (knex) {
    return knex.schema
        .createTable('matches', table => {
            table.increments('id').primary()
            table.string('player1_name').notNullable()
            table.string('player2_name').notNullable()
            table.enu('tiebreak_type', ['REGULAR', 'TEN_POINTS']).notNullable().defaultTo('REGULAR')
            table.boolean('advantage').notNullable().defaultTo(true)
            table.enu('score_type', ['BASIC', 'ADVANCED']).notNullable().defaultTo('BASIC')
            table.datetime('start_time').defaultTo(knex.fn.now())
        })
        .createTable('scoreboards', table => {
            table.string('topic').primary()
            table.string('name').notNullable()
            table.integer('match_id').references('id').inTable('matches')
        })
};

exports.down = function (knex) {
    return knex.schema
        .dropTable('scoreboards')
        .dropTable('matches')
};
