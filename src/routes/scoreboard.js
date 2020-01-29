const express = require('express')
const ScoreboardController = require('../controllers/scoreboard')
const AdminAuthMiddleware = require('../middlewares/auth')

const router = express.Router()

router.get('/', AdminAuthMiddleware, ScoreboardController.index)

module.exports = router