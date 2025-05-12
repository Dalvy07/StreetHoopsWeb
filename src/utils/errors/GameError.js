// src/utils/errors/GameError.js
const BusinessError = require('./BusinessError');

/**
 * Ошибки, связанные с играми
 * @extends BusinessError
 */
class GameError extends BusinessError {
  /**
   * Создает экземпляр ошибки, связанной с играми
   * @param {string} message - Сообщение об ошибке
   * @param {Array|Object|null} [errors=null] - Дополнительные детали ошибки
   */
  constructor(message, errors = null) {
    super(message, errors);
  }

  /**
   * Игра заполнена (достигнуто максимальное количество игроков)
   * @param {string} gameId - ID игры
   * @returns {GameError} Ошибка "Игра заполнена"
   */
  static gameFull(gameId) {
    return new ConflictError(`Game is full (ID: ${gameId})`);
  }

  /**
   * Пользователь уже участвует в игре
   * @param {string} gameId - ID игры
   * @param {string} userId - ID пользователя
   * @returns {GameError} Ошибка "Уже участвует"
   */
  static alreadyJoined(gameId, userId) {
    return new BusinessError(`User (ID: ${userId}) is already part of the game (ID: ${gameId})`);
  }

  /**
   * Некорректный статус игры для выполнения операции
   * @param {string} gameId - ID игры
   * @param {string} currentStatus - Текущий статус игры
   * @param {string|Array<string>} expectedStatus - Ожидаемый статус(ы) игры
   * @returns {GameError} Ошибка "Некорректный статус"
   */
  static invalidStatus(gameId, currentStatus, expectedStatus) {
    const expected = Array.isArray(expectedStatus) 
      ? expectedStatus.join(', ') 
      : expectedStatus;
    
    return new BusinessError(
      `Cannot perform this operation on a game with status "${currentStatus}". Expected status: ${expected}.`,
      { gameId, currentStatus, expectedStatus }
    );
  }

  /**
   * Некорректное время игры (в прошлом)
   * @param {Date} gameTime - Время игры
   * @returns {GameError} Ошибка "Время в прошлом"
   */
  static gameTimeInPast(gameTime) {
    return new BusinessError(
      'Game time cannot be in the past',
      { gameTime: gameTime.toISOString(), currentTime: new Date().toISOString() }
    );
  }
}

module.exports = GameError;