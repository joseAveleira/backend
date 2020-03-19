const express = require('express')
const ScoreboardController = require('../controllers/scoreboard')
const { AdminAuthMiddleware, PublishTokenAuthMiddleware, UniversalAuthMiddleware } = require('../middlewares/auth')

const router = express.Router()

router.get('/', AdminAuthMiddleware, ScoreboardController.index)
router.get('/:scoreboard_topic', ScoreboardController.get)
router.get('/refresh-tokens/:scoreboard_topic', ScoreboardController.refreshTokens)
router.post('/take-control/:scoreboard_topic', AdminAuthMiddleware, ScoreboardController.takeControl)
router.delete('/:scoreboard_topic/match/', UniversalAuthMiddleware, ScoreboardController.finishMatch)

module.exports = router