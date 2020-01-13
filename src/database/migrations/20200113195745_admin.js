
exports.up = function (knex) {
    return knex.schema
        .createTable('admins', table => {
            table.string('username').primary()
            table.string('name')
            table.string('password')
        })

};

exports.down = function (knex) {
    return knex.schema
        .dropTable('admins')
};
