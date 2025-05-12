// src/utils/errors/system/SystemError.js
const AppError = require('../core/AppError');
const { ErrorType, ErrorCode } = require('../constants');

/**
 * Базовый класс для системных ошибок
 * @extends AppError
 */
class SystemError extends AppError {
  /**
   * Создает экземпляр системной ошибки
   * @param {string} [message='System error'] - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   * @param {string} [errorCode=ErrorCode.SYSTEM_ERROR] - Код ошибки
   */
  constructor(
    message = 'System error', 
    errors = null, 
    errorCode = ErrorCode.SYSTEM_ERROR
  ) {
    super(
      message, 
      500, 
      errors,
      errorCode,
      ErrorType.SYSTEM
    );
  }
}

module.exports = SystemError;