const Joi = require('@hapi/joi');

module.exports = {
  signIn: Joi.object()
    .keys({
      body: Joi.object()
        .keys({
          userName: Joi.string()
            .alphanum()
            .min(1)
            .max(150)
            .required(),

          password: Joi.string()
            .min(6)
            .max(150)
            .required(),
        })
        .required(),
    })
    .required(),
};
