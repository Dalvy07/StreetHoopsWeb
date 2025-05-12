// src/utils/errors/http/ValidationError.js
const BadRequestError = require('./BadRequestError');
const { ErrorType, ErrorCode } = require('../constants');

/**
 * Ошибка валидации данных (400)
 * @extends BadRequestError
 */
class ValidationError extends BadRequestError {
  /**
   * Создает экземпляр ошибки валидации
   * @param {string} [message='Validation error'] - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Детали ошибок валидации
   */
  constructor(message = 'Validation error', errors = null) {
    super(message, errors);
    this.errorCode = ErrorCode.VALIDATION_ERROR;
    this.errorType = ErrorType.VALIDATION;
  }
}

module.exports = ValidationError;