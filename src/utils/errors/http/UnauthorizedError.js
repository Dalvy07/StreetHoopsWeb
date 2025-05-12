// src/utils/errors/http/UnauthorizedError.js
const AppError = require('../core/AppError');
const { ErrorType, ErrorCode } = require('../constants');

/**
 * Ошибка авторизации (401)
 * @extends AppError
 */
class UnauthorizedError extends AppError {
  /**
   * Создает экземпляр ошибки авторизации
   * @param {string} [message='Authentication required'] - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   */
  constructor(message = 'Authentication required', errors = null) {
    super(
      message, 
      401, 
      errors,
      ErrorCode.UNAUTHORIZED,
      ErrorType.AUTH
    );
  }
}

module.exports = UnauthorizedError;