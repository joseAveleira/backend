const crypto = require('crypto')
const knex = require('../database')

class ScoreboardController {

    async index(req, res) {
        try {
            let scoreboards = await knex('scoreboards')
                .leftJoin('matches', 'scoreboards.match_id', '=', 'matches.id')
                .orderBy('scoreboards.topic')

            scoreboards = scoreboards.map(it => ({
                topic: it.topic,
                name: it.name,
                match: it.match_id ? {
                    player1_name: it.player1_name,
                    player2_name: it.player2_name,
                    start_time: new Date(it.start_time)
                } : null
            }))

            return res.status(200).json({ message: 'scoreboards found', data: scoreboards })
        } catch (error) {
            res.status(500).json({ message: error.toString() })
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

    async takeControl(req, res) {
        try {
            const { scoreboard_topic: scoreboardTopic } = req.params

            if (!scoreboardTopic) {
                return res.status(400).json({ message: 'invalid_scoreboard_topic' })
            }

            const scoreboard = await knex('scoreboards')
                .where({ topic: scoreboardTopic })
                .first()

            if (!scoreboard) {
                return res.status(400).json({ message: 'scoreboard_not_found' })
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
            res.status(500).json({ message: error.toString() })
        }
    }

}

module.exports = new ScoreboardController()