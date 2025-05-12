// src/utils/errors/system/NetworkError.js
const SystemError = require('./SystemError');
const { ErrorCode } = require('../constants');

/**
 * Ошибка сетевого взаимодействия
 * @extends SystemError
 */
class NetworkError extends SystemError {
  /**
   * Создает экземпляр ошибки сети
   * @param {string} [message='Network error'] - Сообщение об ошибке
   * @param {string} [host=null] - Хост, с которым возникла проблема
   * @param {string} [service=null] - Сервис (HTTP, FTP, SMTP, и т.д.)
   * @param {Array|Object|null} [details=null] - Дополнительные детали
   */
  constructor(
    message = 'Network error', 
    host = null, 
    service = null, 
    details = null
  ) {
    const errors = { ...(details || {}) };
    if (host) {
      errors.host = host;
    }
    if (service) {
      errors.service = service;
    }
    super(message, errors, ErrorCode.NETWORK_ERROR);
  }
}

module.exports = NetworkError;