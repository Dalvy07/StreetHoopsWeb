// src/utils/errors/business/GameError.js
const { ErrorCode } = require('../constants');
const BusinessError = require('./BusinessError');
const ConflictError = require('../http/ConflictError');

/**
 * Фабрика ошибок, связанных с играми
 */
class GameError {
  /**
   * Игра заполнена (достигнуто максимальное количество игроков)
   * @param {string} gameId - ID игры
   * @returns {ConflictError} Ошибка "Игра заполнена"
   */
  static gameFull(gameId) {
    const error = new ConflictError(
      `Game is full (ID: ${gameId})`, 
      { gameId }
    );
    error.errorCode = ErrorCode.GAME_FULL;
    return error;
  }

  /**
   * Пользователь уже участвует в игре
   * @param {string} gameId - ID игры
   * @param {string} userId - ID пользователя
   * @returns {BusinessError} Ошибка "Уже участвует"
   */
  static alreadyJoined(gameId, userId) {
    return new BusinessError(
      `User (ID: ${userId}) is already part of the game (ID: ${gameId})`,
      { gameId, userId },
      ErrorCode.GAME_ALREADY_JOINED
    );
  }

  /**
   * Некорректный статус игры для выполнения операции
   * @param {string} gameId - ID игры
   * @param {string} currentStatus - Текущий статус игры
   * @param {string|Array<string>} expectedStatus - Ожидаемый статус(ы) игры
   * @returns {BusinessError} Ошибка "Некорректный статус"
   */
  static invalidStatus(gameId, currentStatus, expectedStatus) {
    const expected = Array.isArray(expectedStatus) 
      ? expectedStatus.join(', ') 
      : expectedStatus;
    
    return new BusinessError(
      `Cannot perform this operation on a game with status "${currentStatus}". Expected status: ${expected}.`,
      { gameId, currentStatus, expectedStatus },
      ErrorCode.GAME_INVALID_STATUS
    );
  }

  /**
   * Некорректное время игры (в прошлом)
   * @param {Date} gameTime - Время игры
   * @returns {BusinessError} Ошибка "Время в прошлом"
   */
  static gameTimeInPast(gameTime) {
    return new BusinessError(
      'Game time cannot be in the past',
      { 
        gameTime: gameTime.toISOString(), 
        currentTime: new Date().toISOString() 
      },
      ErrorCode.GAME_TIME_IN_PAST
    );
  }
}

module.exports = GameError;