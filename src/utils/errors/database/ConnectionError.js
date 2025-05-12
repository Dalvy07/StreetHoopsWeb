// src/utils/errors/database/ConnectionError.js
const DatabaseError = require('./DatabaseError');
const { ErrorCode } = require('../constants');

/**
 * Ошибка соединения с базой данных
 * @extends DatabaseError
 */
class ConnectionError extends DatabaseError {
  /**
   * Создает экземпляр ошибки соединения с БД
   * @param {string} [message='Database connection error'] - Сообщение об ошибке
   * @param {Array|Object|null} [details=null] - Детали ошибки
   */
  constructor(message = 'Database connection error', details = null) {
    super(message, details, ErrorCode.DB_CONNECTION_ERROR);
    this.statusCode = 503; // Service Unavailable
  }
}

module.exports = ConnectionError;