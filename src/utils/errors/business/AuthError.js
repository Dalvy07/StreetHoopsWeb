// src/utils/errors/business/AuthError.js
const { ErrorCode } = require('../constants');
const UnauthorizedError = require('../http/UnauthorizedError');
const ForbiddenError = require('../http/ForbiddenError');

/**
 * Фабрика ошибок, связанных с аутентификацией и авторизацией
 */
class AuthError {
  /**
   * Неверные учетные данные при входе
   * @param {string} [message='Invalid email or password'] - Сообщение об ошибке
   * @returns {UnauthorizedError} Ошибка "Неверные учетные данные"
   */
  static invalidCredentials(message = 'Invalid email or password') {
    const error = new UnauthorizedError(message);
    error.errorCode = ErrorCode.AUTH_INVALID_CREDENTIALS;
    return error;
  }

  /**
   * Недействительный или истекший токен
   * @param {string} [message='Invalid or expired token'] - Сообщение об ошибке
   * @returns {UnauthorizedError} Ошибка "Недействительный токен"
   */
  static invalidToken(message = 'Invalid or expired token') {
    const error = new UnauthorizedError(message);
    error.errorCode = ErrorCode.AUTH_INVALID_TOKEN;
    return error;
  }

  /**
   * Токен истек
   * @returns {UnauthorizedError} Ошибка "Токен истек"
   */
  static tokenExpired() {
    const error = new UnauthorizedError('Token has expired');
    error.errorCode = ErrorCode.AUTH_TOKEN_EXPIRED;
    return error;
  }

  /**
   * Недостаточно прав для выполнения операции
   * @param {string} [message='Insufficient permissions'] - Сообщение об ошибке
   * @param {string} [requiredRole=null] - Требуемая роль
   * @returns {ForbiddenError} Ошибка "Недостаточно прав"
   */
  static insufficientPermissions(
    message = 'Insufficient permissions', 
    requiredRole = null
  ) {
    const errors = requiredRole ? { requiredRole } : null;
    const error = new ForbiddenError(message, errors);
    error.errorCode = ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS;
    return error;
  }

  /**
   * Аккаунт деактивирован или заблокирован
   * @param {string} [message='Account is inactive or suspended'] - Сообщение об ошибке
   * @returns {ForbiddenError} Ошибка "Аккаунт неактивен"
   */
  static accountInactive(message = 'Account is inactive or suspended') {
    const error = new ForbiddenError(message);
    error.errorCode = ErrorCode.AUTH_ACCOUNT_INACTIVE;
    return error;
  }
}

module.exports = AuthError;