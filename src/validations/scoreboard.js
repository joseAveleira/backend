const Joi = require('@hapi/joi');

module.exports = {
  getScoreboard: Joi.object()
    .keys({
      params: Joi.object()
        .keys({
          scoreboardTopic: Joi.string()
            .alphanum()
            .min(1)
            .max(150)
            .required(),
        })
        .required(),
    })
    .required(),

  refreshTokens: Joi.object()
    .keys({
      params: Joi.object()
        .keys({
          scoreboardTopic: Joi.string()
            .alphanum()
            .min(1)
            .max(150)
            .required(),
        })
        .required(),

      query: Joi.object()
        .keys({
          refreshToken: Joi.string()
            .min(1)
            .max(150)
            .required(),
        })
        .required(),
    })
    .required(),

  takeControl: Joi.object()
    .keys({
      params: Joi.object()
        .keys({
          scoreboardTopic: Joi.string()
            .alphanum()
            .min(1)
            .max(150)
            .required(),
        })
        .required(),
    })
    .required(),
};
