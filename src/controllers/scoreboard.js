const knex = require('../database')

class ScoreboardController {

    async index(req, res) {
        try {
            let scoreboards = await knex('scoreboards')
                .leftJoin('matches', 'scoreboards.match_id', '=', 'matches.id')

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

}

module.exports = new ScoreboardController()