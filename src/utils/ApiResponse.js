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
   * @param {Object} [options.meta={}] - Дополнительные метаданные
   */
  constructor({ success = true, data = null, message = 'Success', meta = {} } = {}) {
    this.success = success;
    this.message = message;
    this.timestamp = new Date().toISOString();
    
    if (data !== null) {
      this.data = data;
    }
    
    if (Object.keys(meta).length > 0) {
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

  /* 
  // Для будущей реализации WebSocket
  static ws(event, data = null, message = 'Success', meta = {}) {
    return new ApiResponse({ 
      data, 
      message, 
      meta: { event, ...meta },
      success: true 
    });
  }

  // Для будущей реализации batch-операций
  static batch(results, message = 'Batch processing completed') {
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    return new ApiResponse({
      data: results,
      message,
      meta: {
        stats: {
          total: results.length,
          successful,
          failed
        }
      },
      success: failed === 0 // Считаем успешным, если все подоперации успешны
    });
  }
  */
}

module.exports = ApiResponse;