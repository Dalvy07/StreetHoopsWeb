// src/utils/errors/database/QueryError.js
const DatabaseError = require('./DatabaseError');
const { ErrorCode } = require('../constants');

/**
 * Ошибка запроса к базе данных
 * @extends DatabaseError
 */
class QueryError extends DatabaseError {
  /**
   * Создает экземпляр ошибки запроса к БД
   * @param {string} [message='Database query error'] - Сообщение об ошибке
   * @param {string} [query=null] - SQL запрос (без параметров)
   * @param {Array|Object|null} [details=null] - Дополнительные детали
   */
  constructor(message = 'Database query error', query = null, details = null) {
    const errors = { ...(details || {}) };
    if (query) {
      errors.query = query;
    }
    super(message, errors, ErrorCode.DB_QUERY_ERROR);
  }
}

module.exports = QueryError;