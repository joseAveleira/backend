
const bcrypt = require('bcryptjs');

exports.seed = (knex) => knex('Admin').del()
  .then(async () => knex('Admin').insert([
    {
      userName: 'jorge',
      name: 'Jorge',
      password: await bcrypt.hash('123456', 10),
    },
  ]));
