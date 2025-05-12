// src/utils/errors/system/FileSystemError.js
const SystemError = require('./SystemError');
const { ErrorCode } = require('../constants');

/**
 * Ошибка файловой системы
 * @extends SystemError
 */
class FileSystemError extends SystemError {
  /**
   * Создает экземпляр ошибки файловой системы
   * @param {string} [message='File system error'] - Сообщение об ошибке
   * @param {string} [path=null] - Путь к файлу/директории
   * @param {string} [operation=null] - Операция (read, write, delete, etc.)
   * @param {Array|Object|null} [details=null] - Дополнительные детали
   */
  constructor(
    message = 'File system error', 
    path = null, 
    operation = null, 
    details = null
  ) {
    const errors = { ...(details || {}) };
    if (path) {
      errors.path = path;
    }
    if (operation) {
      errors.operation = operation;
    }
    super(message, errors, ErrorCode.FILE_SYSTEM_ERROR);
  }
}

module.exports = FileSystemError;