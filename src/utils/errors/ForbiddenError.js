// src/utils/errors/ForbiddenError.js
const AppError = require('./AppError');

/**
 * Ошибка доступа (у пользователя нет прав на выполнение операции)
 * @extends AppError
 */
class ForbiddenError extends AppError {
  /**
   * Создает экземпляр ошибки доступа
   * @param {string} message - Сообщение об ошибке
   */
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

module.exports = ForbiddenError;