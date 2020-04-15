function validate(schema) {
  return (req, res, next) => {
    try {
      const {
        body, params, query,
      } = req;

      let payload = {};

      if (Object.keys(body).length) {
        payload = { ...payload, body };
      }

      if (Object.keys(params).length) {
        payload = { ...payload, params };
      }

      if (Object.keys(query).length) {
        payload = { ...payload, query };
      }

      const { error } = schema.validate(payload, {
        allowUnknown: false,
      });

      if (error) {
        throw new Error(error.message);
      }

      next();
    } catch (error) {
      res
        .status(400)
        .json({ error: error.toString() });
    }
  };
}

module.exports = validate;
