const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors');

const knex = require('../database');

async function signIn(req, res) {
  const { userName, password } = req.body;

  const admin = await knex('Admin')
    .select('password')
    .where({ userName })
    .first();

  if (!admin) {
    throw new UnauthorizedError(1000);
  }

  const isPasswordCorrect = await bcrypt.compare(password, admin.password);

  if (!isPasswordCorrect) {
    throw new UnauthorizedError(1000);
  }

  const token = await jwt.sign({ userName }, process.env.JWT_SECRET || 'secret');

  return res
    .status(200)
    .json({ token });
}

module.exports = { signIn };
