/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const path = require('path');
const fs = require('fs');

let mergedErrors = {};
const normalizedPath = path.join(__dirname, '../codes');

fs.readdirSync(normalizedPath).forEach((file) => {
  const errors = require(`../codes/${file}`);
  mergedErrors = { ...mergedErrors, ...errors };
});

class BaseError extends Error {
  constructor(status, code) {
    super(mergedErrors[code]);

    this.status = status;
    this.code = code;
  }
}

module.exports = BaseError;
