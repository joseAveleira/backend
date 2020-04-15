const express = require('express');
const scoreboardController = require('../controllers/scoreboard');
const validate = require('../middlewares/validation');
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
  validate(validations.takeControl),
  scoreboardController.takeControl);

module.exports = router;
