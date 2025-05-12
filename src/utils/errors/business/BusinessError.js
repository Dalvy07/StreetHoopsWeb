// src/utils/errors/business/BusinessError.js
const AppError = require('../core/AppError');
const { ErrorType, ErrorCode } = require('../constants');

/**
 * Базовый класс для ошибок бизнес-логики
 * @extends AppError
 */
class BusinessError extends AppError {
  /**
   * Создает экземпляр ошибки бизнес-логики
   * @param {string} message - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   * @param {string} [errorCode=ErrorCode.BUSINESS_ERROR] - Код ошибки
   */
  constructor(
    message, 
    errors = null, 
    errorCode = ErrorCode.BUSINESS_ERROR
  ) {
    super(
      message, 
      400, 
      errors,
      errorCode,
      ErrorType.BUSINESS
    );
  }
}

module.exports = BusinessError;