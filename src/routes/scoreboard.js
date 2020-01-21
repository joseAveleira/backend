const express = require('express')
const ScoreboardController = require('../controllers/scoreboard')

const router = express.Router()

router.get('/', ScoreboardController.index)

module.exports = router