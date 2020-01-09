const { Router } = require('express')
const authController = require('./controllers/auth')

const router = Router()

router.use('/auth', authController)

module.exports = router