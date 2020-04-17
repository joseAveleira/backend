const BaseError = require('./BaseError');

class PreconditionFailedError extends BaseError {
  constructor(code) {
    super(412, code);
  }
}

module.exports = PreconditionFailedError;
