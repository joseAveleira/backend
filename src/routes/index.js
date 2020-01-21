const express = require('express')

const auth = require('./auth')
const scoreboard = require('./scoreboard')

const router = express.Router()

router.use('/auth', auth)
router.use('/scoreboard', scoreboard)

module.exports = router