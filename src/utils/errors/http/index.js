// src/utils/errors/http/index.js
const BadRequestError = require('./BadRequestError');
const ValidationError = require('./ValidationError');
const UnauthorizedError = require('./UnauthorizedError');
const ForbiddenError = require('./ForbiddenError');
const NotFoundError = require('./NotFoundError');
const ConflictError = require('./ConflictError');

module.exports = {
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError
};