const BaseError = require('./BaseError');

class UnauthorizedError extends BaseError {
  constructor(code) {
    super(401, code);
  }
}

module.exports = UnauthorizedError;
