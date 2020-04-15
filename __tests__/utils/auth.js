const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('../../src/database');

async function createAdminAndSignIn() {
  const admin = {
    userName: 'john',
    name: 'John Doe',
    password: '123456',
  };

  await knex('Admin')
    .insert({
      userName: admin.userName,
      name: admin.name,
      password: await bcrypt.hash(admin.password, 10),
    });

  const token = await jwt.sign({ userName: admin.userName },
    process.env.JWT_SECRET || 'secret');

  return { ...admin, token };
}

module.exports = { createAdminAndSignIn };
