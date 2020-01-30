const express = require('express')
const MatchController = require('../controllers/match')
const AdminAuthMiddleware = require('../middlewares/auth')

const router = express.Router()

router.post('/', AdminAuthMiddleware, MatchController.create)

module.exports = router