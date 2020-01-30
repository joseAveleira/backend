const express = require('express')
const ScoreboardController = require('../controllers/scoreboard')
const AdminAuthMiddleware = require('../middlewares/auth')

const router = express.Router()

router.get('/', AdminAuthMiddleware, ScoreboardController.index)
router.get('/refresh-tokens/:scoreboard_topic', ScoreboardController.refreshTokens)
router.post('/take-control/:scoreboard_topic', AdminAuthMiddleware, ScoreboardController.takeControl)

module.exports = router