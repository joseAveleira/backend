
const bcrypt = require('bcryptjs')

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('admins').del()
    .then(async function () {
      // Inserts seed entries
      return knex('admins').insert([
        { username: 'jorge', name: 'Jorge', password: await bcrypt.hash('123456', 10) },
      ]);
    });
};
