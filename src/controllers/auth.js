const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const knex = require('../database');

async function signIn(req, res) {
  const { userName, password } = req.body;

  const admin = await knex('Admin')
    .select('password')
    .where({ userName })
    .first();

  if (!admin) {
    return res
      .status(401)
      .json({
        code: 1000,
        message: 'Wrong credentials',
      });
  }

  const isPasswordCorrect = await bcrypt.compare(password, admin.password);

  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json({
        code: 1000,
        message: 'Wrong credentials',
      });
  }

  const token = await jwt.sign({ userName }, process.env.JWT_SECRET || 'secret');

  return res
    .status(200)
    .json({ token });
}

module.exports = { signIn };
