// src/utils/ApiError.js
/**
 * Класс для формирования стандартных ответов с ошибками
 */
class ApiError {
  /**
   * Конструктор ошибки API
   * @param {Object} options - Параметры ошибки
   * @param {boolean} [options.success=false] - Флаг успешности операции
   * @param {string} options.message - Сообщение об ошибке
   * @param {Array|Object|null} [options.errors=null] - Детали ошибок
   * @param {Object} [options.meta={}] - Дополнительные метаданные
   */
  constructor({ success = false, message, errors = null, meta = {} } = {}) {
    this.success = success;
    this.message = message;
    this.timestamp = new Date().toISOString();
    
    if (errors) {
      this.errors = errors;
    }
    
    if (Object.keys(meta).length > 0) {
      Object.assign(this, meta);
    }
  }

  /**
   * Создает ошибку Bad Request (400)
   * @param {string} message - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Детали ошибок
   * @returns {ApiError} Новый экземпляр ApiError
   */
  static badRequest(message = 'Bad request', errors = null) {
    return new ApiError({ message, errors });
  }

  /**
   * Создает ошибку Unauthorized (401)
   * @param {string} [message='Unauthorized'] - Сообщение об ошибке
   * @returns {ApiError} Новый экземпляр ApiError
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError({ message });
  }

  /**
   * Создает ошибку Forbidden (403)
   * @param {string} [message='Forbidden'] - Сообщение об ошибке
   * @returns {ApiError} Новый экземпляр ApiError
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError({ message });
  }

  /**
   * Создает ошибку Not Found (404)
   * @param {string} [message='Resource not found'] - Сообщение об ошибке
   * @returns {ApiError} Новый экземпляр ApiError
   */
  static notFound(message = 'Resource not found') {
    return new ApiError({ message });
  }

  /**
   * Создает ошибку Conflict (409)
   * @param {string} [message='Conflict'] - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Детали ошибок
   * @returns {ApiError} Новый экземпляр ApiError
   */
  static conflict(message = 'Conflict', errors = null) {
    return new ApiError({ message, errors });
  }

  /**
   * Создает ошибку Validation Failed (422)
   * @param {string} [message='Validation failed'] - Сообщение об ошибке
   * @param {Array|Object} errors - Детали ошибок валидации
   * @returns {ApiError} Новый экземпляр ApiError
   */
  static validationFailed(message = 'Validation failed', errors) {
    return new ApiError({ message, errors });
  }

  /**
   * Создает ошибку Internal Server Error (500)
   * @param {string} [message='Internal server error'] - Сообщение об ошибке
   * @returns {ApiError} Новый экземпляр ApiError
   */
  static internal(message = 'Internal server error') {
    return new ApiError({ message });
  }

  /**
   * Создает ошибку Service Unavailable (503)
   * @param {string} [message='Service unavailable'] - Сообщение об ошибке
   * @returns {ApiError} Новый экземпляр ApiError
   */
  static serviceUnavailable(message = 'Service unavailable') {
    return new ApiError({ message });
  }

  /* 
  // Для будущей реализации WebSocket
  static ws(event, message, errors = null, meta = {}) {
    return new ApiError({
      message,
      errors,
      meta: { event, ...meta }
    });
  }
  */
}

module.exports = ApiError;