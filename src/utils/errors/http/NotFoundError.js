// src/utils/errors/http/NotFoundError.js
const AppError = require('../core/AppError');
const { ErrorType, ErrorCode } = require('../constants');

/**
 * Ошибка "Ресурс не найден" (404)
 * @extends AppError
 */
class NotFoundError extends AppError {
  /**
   * Создает экземпляр ошибки "Ресурс не найден"
   * @param {string} [message='Resource not found'] - Сообщение об ошибке
   * @param {string} [resource=null] - Название ресурса
   * @param {string|number} [id=null] - Идентификатор ресурса
   */
  constructor(message = 'Resource not found', resource = null, id = null) {
    const errors = resource ? { resource, id } : null;
    const specificMessage = resource && id 
      ? `${resource} with ID ${id} not found` 
      : message;
      
    super(
      specificMessage, 
      404, 
      errors,
      ErrorCode.NOT_FOUND,
      ErrorType.HTTP
    );
  }
}

module.exports = NotFoundError;