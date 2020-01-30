const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

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

    async refreshTokens(req, res) {
        try {
            const { scoreboard_topic: scoreboardTopic } = req.params
            const { refresh_token: refreshToken } = req.query

            if (!scoreboardTopic) {
                return res.status(400).json({ message: 'invalid_scoreboard_topic' })
            }

            if (!refreshToken) {
                return res.status(400).json({ message: 'invalid_refresh_token' })
            }

            const scoreboard = await knex('scoreboards')
                .where({ topic: scoreboardTopic })
                .first()

            if (!scoreboard) {
                return res.status(400).json({ message: 'scoreboard_not_found' })
            }

            if (scoreboard.refresh_token !== refreshToken) {
                return res.status(401).json({ message: 'wrong_refresh_token' })
            }

            const newPublishToken = crypto.randomBytes(16).toString('hex');
            const newRefreshToken = crypto.randomBytes(16).toString('hex');

            await knex('scoreboards')
                .where({ topic: scoreboardTopic })
                .update({
                    publish_token: newPublishToken,
                    refresh_token: newRefreshToken
                })

            res.json({ message: 'tokens_refreshed', publish_token: newPublishToken, refresh_token: newRefreshToken })

        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

}

module.exports = new AuthController()