const Joi = require('@hapi/joi');

module.exports = {
  getLogs: Joi.object()
    .keys({
      params: Joi.object()
        .keys({
          matchId: Joi.number()
            .min(1)
            .required(),
        })
        .required(),
    })
    .required(),

  createMatch: Joi.object()
    .keys({
      body: Joi.object()
        .keys({
          scoreboardTopic: Joi.string()
            .alphanum()
            .min(1)
            .max(150)
            .required(),

          player1: Joi.string()
            .alphanum()
            .min(1)
            .max(150)
            .required(),

          player2: Joi.string()
            .alphanum()
            .min(1)
            .max(150)
            .required(),

          tieBreakType: Joi.valid('REGULAR', 'TEN_POINTS')
            .required(),

          hasAdvantage: Joi.bool()
            .required(),

          scoreType: Joi.valid('BASIC', 'ADVANCED')
            .required(),
        })
        .required(),
    })
    .required(),

  finishMatch: Joi.object()
    .keys({
      params: Joi.object()
        .keys({
          matchId: Joi.number()
            .min(1)
            .required(),
        })
        .required(),
    })
    .required(),
};
