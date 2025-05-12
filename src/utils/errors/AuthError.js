// src/utils/errors/AuthError.js
const UnauthorizedError = require('./UnauthorizedError');
const ForbiddenError = require('./ForbiddenError');

/**
 * Ошибки, связанные с аутентификацией и авторизацией
 */
class AuthError {
  /**
   * Неверные учетные данные при входе
   * @param {string} [message='Invalid email or password'] - Сообщение об ошибке
   * @returns {UnauthorizedError} Ошибка "Неверные учетные данные"
   */
  static invalidCredentials(message = 'Invalid email or password') {
    return new UnauthorizedError(message);
  }

  /**
   * Недействительный или истекший токен
   * @param {string} [message='Invalid or expired token'] - Сообщение об ошибке
   * @returns {UnauthorizedError} Ошибка "Недействительный токен"
   */
  static invalidToken(message = 'Invalid or expired token') {
    return new UnauthorizedError(message);
  }

  /**
   * Токен истек
   * @returns {UnauthorizedError} Ошибка "Токен истек"
   */
  static tokenExpired() {
    return new UnauthorizedError('Token has expired');
  }

  /**
   * Недостаточно прав для выполнения операции
   * @param {string} [message='Insufficient permissions'] - Сообщение об ошибке
   * @param {string} [requiredRole='admin'] - Требуемая роль
   * @returns {ForbiddenError} Ошибка "Недостаточно прав"
   */
  static insufficientPermissions(message = 'Insufficient permissions', requiredRole = 'admin') {
    return new ForbiddenError(message);
  }

  /**
   * Аккаунт деактивирован или заблокирован
   * @param {string} [message='Account is inactive or suspended'] - Сообщение об ошибке
   * @returns {ForbiddenError} Ошибка "Аккаунт неактивен"
   */
  static accountInactive(message = 'Account is inactive or suspended') {
    return new ForbiddenError(message);
  }
}

module.exports = AuthError;