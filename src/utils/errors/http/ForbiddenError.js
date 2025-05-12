// src/utils/errors/http/ForbiddenError.js
const AppError = require('../core/AppError');
const { ErrorType, ErrorCode } = require('../constants');

/**
 * Ошибка доступа (403)
 * @extends AppError
 */
class ForbiddenError extends AppError {
  /**
   * Создает экземпляр ошибки доступа
   * @param {string} [message='Access forbidden'] - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   */
  constructor(message = 'Access forbidden', errors = null) {
    super(
      message, 
      403, 
      errors,
      ErrorCode.FORBIDDEN,
      ErrorType.AUTH
    );
  }
}

module.exports = ForbiddenError;