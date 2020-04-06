const express = require('express');

const auth = require('./auth');
const scoreboard = require('./scoreboard');
const match = require('./match');

const router = express.Router();

router.use('/auth', auth);
router.use('/scoreboard', scoreboard);
router.use('/match', match);

module.exports = router;
