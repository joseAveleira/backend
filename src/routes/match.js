const express = require('express');
const matchController = require('../controllers/match');
const validate = require('../middlewares/validation');
const { isAdmin, hasPublishToken, isAdminOrHasPublishToken } = require('../middlewares/auth');
const validations = require('../validations/match');

const router = express.Router();

router.get('/:matchId/logs',
  validate(validations.getLogs),
  matchController.getLogs);

router.post('/',
  isAdmin,
  validate(validations.createMatch),
  matchController.createMatch);

router.delete('/:matchId',
  isAdminOrHasPublishToken,
  validate(validations.finishMatch),
  matchController.finishMatch);

router.post('/:match_id/logs',
  hasPublishToken,
  validate(validations.addLog),
  matchController.addLog);

module.exports = router;
