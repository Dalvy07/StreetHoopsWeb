// src/utils/errors/http/BadRequestError.js
const AppError = require('../core/AppError');
const { ErrorType, ErrorCode } = require('../constants');

/**
 * Ошибка Bad Request (400)
 * @extends AppError
 */
class BadRequestError extends AppError {
  /**
   * Создает экземпляр ошибки Bad Request
   * @param {string} [message='Bad request'] - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   */
  constructor(message = 'Bad request', errors = null) {
    super(
      message, 
      400, 
      errors,
      ErrorCode.BAD_REQUEST,
      ErrorType.HTTP
    );
  }
}

module.exports = BadRequestError;