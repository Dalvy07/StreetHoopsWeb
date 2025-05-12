// src/utils/errors/BusinessError.js
const AppError = require('./AppError');

/**
 * Ошибка бизнес-логики (неверные действия пользователя)
 * @extends AppError
 */
class BusinessError extends AppError {
  /**
   * Создает экземпляр ошибки бизнес-логики
   * @param {string} message - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   */
  constructor(message, errors = null) {
    super(message, 400, errors);
  }
}

module.exports = BusinessError;