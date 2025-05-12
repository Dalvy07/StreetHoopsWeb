// src/utils/ApiResponse.js
/**
 * Класс для формирования стандартных ответов API
 */
class ApiResponse {
  /**
   * Конструктор базового ответа
   * @param {Object} options - Параметры ответа
   * @param {boolean} [options.success=true] - Флаг успешности операции
   * @param {*} [options.data=null] - Данные ответа
   * @param {string} [options.message='Success'] - Сообщение ответа
   * @param {Array|Object|null} [options.errors=null] - Детали ошибок (если есть)
   * @param {Object} [options.meta={}] - Дополнительные метаданные
   */
  constructor({ success = true, data = null, message = 'Success', errors = null, meta = {} } = {}) {
    this.success = success;
    this.message = message;
    this.timestamp = new Date().toISOString();
    
    if (data !== null) {
      this.data = data;
    }
    
    if (errors !== null) {
      this.errors = errors;
    }
    
    if (Object.keys(meta).length > 0) {
      // Добавляем все метаданные в корень объекта
      Object.assign(this, meta);
    }
  }

  /**
   * Создает стандартный успешный ответ
   * @param {*} data - Данные ответа
   * @param {string} [message='Success'] - Сообщение ответа
   * @param {Object} [meta={}] - Дополнительные метаданные
   * @returns {ApiResponse} Новый экземпляр ApiResponse
   */
  static success(data, message = 'Success', meta = {}) {
    return new ApiResponse({ data, message, meta, success: true });
  }

  /**
   * Создает ответ с пагинацией
   * @param {Array} data - Массив данных
   * @param {number} page - Текущая страница
   * @param {number} limit - Количество элементов на странице
   * @param {number} total - Общее количество элементов
   * @param {string} [message='Success'] - Сообщение ответа
   * @returns {ApiResponse} Новый экземпляр ApiResponse с метаданными пагинации
   */
  static paginated(data, page, limit, total, message = 'Success') {
    const pagination = {
      total,
      total_pages: Math.ceil(total / limit),
      current_page: parseInt(page, 10),
      per_page: parseInt(limit, 10),
      has_next: page < Math.ceil(total / limit),
      has_prev: page > 1
    };
    
    return new ApiResponse({ 
      data, 
      message, 
      meta: { pagination },
      success: true 
    });
  }

  /**
   * Создает ответ для созданного ресурса
   * @param {*} data - Созданный ресурс
   * @param {string} [message='Resource created successfully'] - Сообщение ответа
   * @returns {ApiResponse} Новый экземпляр ApiResponse
   */
  static created(data, message = 'Resource created successfully') {
    return new ApiResponse({ data, message, success: true });
  }

  /**
   * Создает ответ для обновленного ресурса
   * @param {*} data - Обновленный ресурс
   * @param {string} [message='Resource updated successfully'] - Сообщение ответа
   * @returns {ApiResponse} Новый экземпляр ApiResponse
   */
  static updated(data, message = 'Resource updated successfully') {
    return new ApiResponse({ data, message, success: true });
  }

  /**
   * Создает ответ для успешного удаления
   * @param {string} [message='Resource deleted successfully'] - Сообщение ответа
   * @returns {ApiResponse} Новый экземпляр ApiResponse
   */
  static deleted(message = 'Resource deleted successfully') {
    return new ApiResponse({ message, success: true });
  }

  /**
   * Создает ответ с ошибкой
   * @param {string} message - Сообщение об ошибке
   * @param {number} statusCode - HTTP-статус ошибки
   * @param {Array|Object|null} [errors=null] - Детали ошибок
   * @param {Object} [meta={}] - Дополнительные метаданные
   * @returns {ApiResponse} Новый экземпляр ApiResponse с ошибкой
   */
  static error(message, statusCode = 500, errors = null, meta = {}) {
    return new ApiResponse({
      success: false,
      message,
      errors,
      meta: { statusCode, ...meta }
    });
  }

  /**
   * Создает ответ с ошибкой Bad Request (400)
   * @param {string} [message='Bad request'] - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Детали ошибок
   * @returns {ApiResponse} Новый экземпляр ApiResponse с ошибкой
   */
  static badRequest(message = 'Bad request', errors = null) {
    return ApiResponse.error(message, 400, errors);
  }

  /**
   * Создает ответ с ошибкой валидации (400)
   * @param {string} [message='Validation failed'] - Сообщение об ошибке
   * @param {Array|Object} [errors] - Детали ошибок валидации
   * @returns {ApiResponse} Новый экземпляр ApiResponse с ошибкой
   */
  static validationFailed(message = 'Validation failed', errors) {
    return ApiResponse.error(message, 400, errors);
  }

  /**
   * Создает ответ с ошибкой Unauthorized (401)
   * @param {string} [message='Unauthorized'] - Сообщение об ошибке
   * @returns {ApiResponse} Новый экземпляр ApiResponse с ошибкой
   */
  static unauthorized(message = 'Unauthorized') {
    return ApiResponse.error(message, 401);
  }

  /**
   * Создает ответ с ошибкой Forbidden (403)
   * @param {string} [message='Forbidden'] - Сообщение об ошибке
   * @returns {ApiResponse} Новый экземпляр ApiResponse с ошибкой
   */
  static forbidden(message = 'Forbidden') {
    return ApiResponse.error(message, 403);
  }

  /**
   * Создает ответ с ошибкой Not Found (404)
   * @param {string} [message='Resource not found'] - Сообщение об ошибке
   * @returns {ApiResponse} Новый экземпляр ApiResponse с ошибкой
   */
  static notFound(message = 'Resource not found') {
    return ApiResponse.error(message, 404);
  }

  /**
   * Создает ответ с ошибкой Conflict (409)
   * @param {string} [message='Conflict'] - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Детали ошибок
   * @returns {ApiResponse} Новый экземпляр ApiResponse с ошибкой
   */
  static conflict(message = 'Conflict', errors = null) {
    return ApiResponse.error(message, 409, errors);
  }

  /**
   * Создает ответ с ошибкой Internal Server Error (500)
   * @param {string} [message='Internal server error'] - Сообщение об ошибке
   * @returns {ApiResponse} Новый экземпляр ApiResponse с ошибкой
   */
  static internal(message = 'Internal server error') {
    return ApiResponse.error(message, 500);
  }

  /**
   * Создает ответ с ошибкой Service Unavailable (503)
   * @param {string} [message='Service unavailable'] - Сообщение об ошибке
   * @returns {ApiResponse} Новый экземпляр ApiResponse с ошибкой
   */
  static serviceUnavailable(message = 'Service unavailable') {
    return ApiResponse.error(message, 503);
  }
}

module.exports = ApiResponse;