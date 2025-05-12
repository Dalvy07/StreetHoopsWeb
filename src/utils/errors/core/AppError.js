// src/utils/errors/core/AppError.js
const { ErrorType, ErrorCode } = require('../constants');

/**
 * Базовый класс для всех ошибок приложения
 * @extends Error
 */
class AppError extends Error {
  /**
   * Создает экземпляр базовой ошибки приложения
   * @param {string} message - Сообщение об ошибке
   * @param {number} statusCode - HTTP статус-код ошибки
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   * @param {string} [errorCode=ErrorCode.APP_ERROR] - Код ошибки для идентификации
   * @param {string} [errorType=ErrorType.SYSTEM] - Тип ошибки для категоризации
   */
  constructor(
    message,
    statusCode = 500,
    errors = null,
    errorCode = ErrorCode.APP_ERROR,
    errorType = ErrorType.SYSTEM
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.errorCode = errorCode;
    this.errorType = errorType;
    
    // Захватывает стек вызовов
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;