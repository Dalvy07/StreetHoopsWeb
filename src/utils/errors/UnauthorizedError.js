// src/utils/errors/UnauthorizedError.js
const AppError = require('./AppError');

/**
 * Ошибка авторизации (пользователь не аутентифицирован)
 * @extends AppError
 */
class UnauthorizedError extends AppError {
  /**
   * Создает экземпляр ошибки авторизации
   * @param {string} message - Сообщение об ошибке
   */
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

module.exports = UnauthorizedError;