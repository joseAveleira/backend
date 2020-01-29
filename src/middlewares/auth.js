const jwt = require('jsonwebtoken')

function AdminAuthMiddleware(req, res, next) {
    try {
        const token = req.headers["x-access-token"]
        res.locals.user = jwt.verify(token, process.env.JWT_SECRET || 'secret')
        next()
    } catch (error) {
        res.status(401).json({ message: 'invalid_token' })
    }
}

module.exports = AdminAuthMiddleware 