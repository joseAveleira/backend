const express = require('express');
const authController = require('../controllers/auth');
const validate = require('../middlewares/validation');
const validations = require('../validations/auth');

const router = express.Router();

router.post('/signIn',
  validate(validations.signIn),
  authController.signIn);

module.exports = router;
