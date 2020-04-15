const express = require('express');
const scoreboardController = require('../controllers/scoreboard');
const validate = require('../middlewares/validation');
const { isAdmin } = require('../middlewares/auth');
const validations = require('../validations/scoreboard');

const router = express.Router();

router.get('/', scoreboardController.listScoreboards);

router.get('/:scoreboardTopic',
  validate(validations.getScoreboard),
  scoreboardController.getScoreboard);

router.post('/:scoreboardTopic/refreshTokens',
  validate(validations.refreshTokens),
  scoreboardController.refreshTokens);

router.post('/:scoreboardTopic/takeControl',
  isAdmin,
  validate(validations.takeControl),
  scoreboardController.takeControl);

module.exports = router;
