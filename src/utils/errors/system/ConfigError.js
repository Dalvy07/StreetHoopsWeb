// src/utils/errors/system/ConfigError.js
const SystemError = require('./SystemError');
const { ErrorCode } = require('../constants');

/**
 * Ошибка конфигурации приложения
 * @extends SystemError
 */
class ConfigError extends SystemError {
  /**
   * Создает экземпляр ошибки конфигурации
   * @param {string} [message='Configuration error'] - Сообщение об ошибке
   * @param {string} [configKey=null] - Ключ конфигурации, вызвавший ошибку
   * @param {Array|Object|null} [details=null] - Дополнительные детали
   */
  constructor(
    message = 'Configuration error', 
    configKey = null, 
    details = null
  ) {
    const errors = { ...(details || {}) };
    if (configKey) {
      errors.configKey = configKey;
    }
    super(message, errors, ErrorCode.CONFIG_ERROR);
  }
}

module.exports = ConfigError;