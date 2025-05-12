// src/utils/errors/NotFoundError.js
const AppError = require('./AppError');

/**
 * Ошибка "Ресурс не найден"
 * @extends AppError
 */
class NotFoundError extends AppError {
  /**
   * Создает экземпляр ошибки "Ресурс не найден"
   * @param {string} message - Сообщение об ошибке
   */
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

module.exports = NotFoundError;