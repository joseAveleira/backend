const crypto = require('crypto')
const knex = require('../database')
const broker = require('../broker')

class MatchController {
    async create(req, res) {
        try {

            const {
                scoreboard_topic: scoreboardTopic,
                player1_name: player1Name,
                player2_name: player2Name,
                tiebreak_type: tiebreakType,
                advantage,
                score_type: scoreType
            } = req.body

            if (!scoreboardTopic) {
                return res.status(400).json({ message: 'invalid_scoreboard_topic' })
            }

            if (!['REGULAR', 'TEN_POINTS'].includes(tiebreakType)) {
                return res.status(400).json({ message: 'invalid_tiebreak_type' })
            }

            if (advantage !== true && advantage !== false) {
                return res.status(400).json({ message: 'invalid_advantage' })
            }

            if (!['BASIC', 'ADVANCED'].includes(scoreType)) {
                return res.status(400).json({ message: 'invalid_score_type' })
            }

            const scoreboard = await knex('scoreboards')
                .where({ topic: scoreboardTopic })
                .first()

            if (!scoreboard) {
                return res.status(400).json({ message: 'scoreboard_not_found' })
            }

            if (scoreboard.match_id) {
                return res.status(400).json({ message: 'scoreboard_not_free' })
            }


            const [matchId] = await knex('matches')
                .insert({
                    player1_name: player1Name,
                    player2_name: player2Name,
                    tiebreak_type: tiebreakType,
                    advantage, score_type: scoreType
                })
                .returning('id')

            const publishToken = crypto.randomBytes(16).toString('hex');
            const refreshToken = crypto.randomBytes(16).toString('hex');

            await knex('scoreboards')
                .where({ topic: scoreboardTopic })
                .update({
                    match_id: matchId,
                    publish_token: publishToken,
                    refresh_token: refreshToken
                })

            const topics = ['Set1_A', 'Set1_B', 'Set2_A', 'Set2_B', 'Set3_A', 'Set3_B', 'Score_A', 'Score_B']

            topics.forEach(topic => broker.publish({
                topic: `${scoreboardTopic}/${topic}`,
                payload: Buffer.from('0'),
                retain: true
            }))

            res.json({ message: 'match_created', publish_token: publishToken, refresh_token: refreshToken })

        } catch (error) {
            res.status(500).json({ message: error.toString() })
        }
    }
}

module.exports = new MatchController()