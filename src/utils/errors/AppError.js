// src/utils/errors/AppError.js
/**
 * Базовый класс для всех ошибок приложения StreetBall
 * @extends Error
 */
class AppError extends Error {
  /**
   * Создает экземпляр базовой ошибки приложения
   * @param {string} message - Сообщение об ошибке
   * @param {number} statusCode - HTTP статус-код ошибки
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   */
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    
    // Захватывает стек вызовов
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;