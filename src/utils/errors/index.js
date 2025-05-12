// src/utils/errors/index.js
const AppError = require('./AppError');
const ValidationError = require('./ValidationError');
const NotFoundError = require('./NotFoundError');
const BusinessError = require('./BusinessError');
const ConflictError = require('./ConflictError');
const UnauthorizedError = require('./UnauthorizedError');
const ForbiddenError = require('./ForbiddenError');
const GameError = require('./GameError');
const AuthError = require('./AuthError');

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  BusinessError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  GameError,
  AuthError
};