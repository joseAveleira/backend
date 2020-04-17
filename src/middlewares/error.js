const { BaseError } = require('../errors');

module.exports = (err, req, res, next) => {
  if (err instanceof BaseError) {
    return res
      .status(err.status)
      .json({
        code: err.code,
        message: err.message,
      });
  }

  res
    .status(500)
    .json({ message: err.toString() });
};
