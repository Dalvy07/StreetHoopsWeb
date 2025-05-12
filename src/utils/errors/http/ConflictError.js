// src/utils/errors/http/ConflictError.js
const AppError = require('../core/AppError');
const { ErrorType, ErrorCode } = require('../constants');

/**
 * Ошибка конфликта (409)
 * @extends AppError
 */
class ConflictError extends AppError {
  /**
   * Создает экземпляр ошибки конфликта
   * @param {string} [message='Conflict error'] - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   */
  constructor(message = 'Conflict error', errors = null) {
    super(
      message, 
      409, 
      errors,
      ErrorCode.CONFLICT,
      ErrorType.HTTP
    );
  }
}

module.exports = ConflictError;