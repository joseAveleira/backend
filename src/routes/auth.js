const express = require('express')
const AuthController = require('../controllers/auth')

const router = express.Router()

router.post('/signin', AuthController.signIn)
router.get('/refresh-tokens/:scoreboard_topic', AuthController.refreshTokens)

module.exports = router