// src/utils/errors/database/DatabaseError.js
const AppError = require('../core/AppError');
const { ErrorType, ErrorCode } = require('../constants');

/**
 * Базовый класс для ошибок базы данных
 * @extends AppError
 */
class DatabaseError extends AppError {
  /**
   * Создает экземпляр ошибки базы данных
   * @param {string} [message='Database error'] - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   * @param {string} [errorCode=ErrorCode.DATABASE_ERROR] - Код ошибки
   */
  constructor(
    message = 'Database error', 
    errors = null, 
    errorCode = ErrorCode.DATABASE_ERROR
  ) {
    super(
      message, 
      500, 
      errors,
      errorCode,
      ErrorType.DATABASE
    );
  }
}

module.exports = DatabaseError;