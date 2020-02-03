const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const knex = require('../database')

class AuthController {

    async signIn(req, res) {
        try {
            const { username, password } = req.body

            if (!username || !password)
                return res.status(400).json({ message: 'invalid_request' })

            const admin = await knex('admins')
                .where({ username })
                .first()

            if (!admin)
                return res.status(401).json({ message: 'wrong_credentials' })

            const isPasswordCorrect = await bcrypt.compare(password, admin.password)

            if (!isPasswordCorrect)
                return res.status(401).json({ message: 'wrong_credentials' })

            const token = await jwt.sign(username, process.env.JWT_SECRET || 'secret')

            return res.status(200).json({ message: 'authentiacated', token })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }



}

module.exports = new AuthController()