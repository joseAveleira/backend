const express = require('express');
const matchController = require('../controllers/match');
const validate = require('../middlewares/validation');
const validations = require('../validations/match');

const router = express.Router();

router.get('/:matchId/logs',
  validate(validations.getLogs),
  matchController.getLogs);

router.post('/',
  validate(validations.createMatch),
  matchController.createMatch);

router.delete('/:matchId',
  validate(validations.finishMatch),
  matchController.finishMatch);

router.post('/:match_id/logs', matchController.addLog);

module.exports = router;
