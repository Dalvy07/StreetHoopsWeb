// src/utils/errors/ConflictError.js
const AppError = require('./AppError');

/**
 * Ошибка конфликта (например, нарушение уникальности)
 * @extends AppError
 */
class ConflictError extends AppError {
  /**
   * Создает экземпляр ошибки конфликта
   * @param {string} message - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   */
  constructor(message = 'Conflict error', errors = null) {
    super(message, 409, errors);
  }
}

module.exports = ConflictError;