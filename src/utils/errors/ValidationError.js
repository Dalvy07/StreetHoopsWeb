// src/utils/errors/ValidationError.js
const AppError = require('./AppError');

/**
 * Ошибка валидации данных
 * @extends AppError
 */
class ValidationError extends AppError {
  /**
   * Создает экземпляр ошибки валидации
   * @param {string} message - Сообщение об ошибке
   * @param {Array|Object} errors - Детали ошибок валидации
   */
  constructor(message = 'Validation error', errors) {
    super(message, 400, errors);
  }
}

module.exports = ValidationError;