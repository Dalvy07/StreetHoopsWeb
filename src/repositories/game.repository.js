// src/repositories/game.repository.js
const Game = require('../models/Game');
const User = require('../models/User');
const { NotFoundError, GameError } = require('../utils/errors');

/**
 * Репозиторий для работы с играми
 */
class GameRepository {
  /**
   * Создание новой игры
   * @param {Object} gameData - Данные игры
   * @returns {Promise<Game>} - Созданная игра
   */
  async create(gameData) {
    // Проверка даты игры (не в прошлом)
    const gameTime = new Date(gameData.dateTime);
    if (gameTime < new Date()) {
      throw new GameError.gameTimeInPast(gameTime);
    }
    
    // Создаем игру
    const game = new Game(gameData);
    
    // Добавляем создателя в список игроков
    game.currentPlayers.push({
      user: gameData.creator,
      status: 'confirmed'
    });
    
    // Сохраняем игру
    const savedGame = await game.save();
    
    // Обновляем массив createdGames у пользователя-создателя
    await User.findByIdAndUpdate(
      gameData.creator,
      { $push: { createdGames: savedGame._id } }
    );
    
    return savedGame;
  }

  /**
   * Получение игры по ID
   * @param {string} gameId - ID игры
   * @returns {Promise<Game>} - Найденная игра
   * @throws {NotFoundError} - Если игра не найдена
   */
  async findById(gameId) {
    const game = await Game.findById(gameId)
      .populate('court', 'name location photos features')
      .populate('creator', 'username fullName avatar')
      .populate('currentPlayers.user', 'username fullName avatar');
    
    if (!game) {
      throw new NotFoundError('Game not found', 'Game', gameId);
    }
    
    return game;
  }

  /**
   * Получение всех игр с пагинацией
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество игр на странице
   * @param {Object} filter - Фильтры
   * @returns {Promise<{games: Game[], total: number, page: number, limit: number}>}
   */
  async findAll(page = 1, limit = 10, filter = {}) {
    const skip = (page - 1) * limit;
    
    // По умолчанию показываем только предстоящие игры
    if (!filter.status) {
      filter.status = 'scheduled';
      filter.dateTime = { $gt: new Date() };
    }
    
    const [games, total] = await Promise.all([
      Game.find(filter)
        .populate('court', 'name location photos')
        .populate('creator', 'username fullName avatar')
        .skip(skip)
        .limit(limit)
        .sort({ dateTime: 1 }),
      Game.countDocuments(filter)
    ]);
    
    return {
      games,
      total,
      page,
      limit
    };
  }

  /**
   * Обновление игры
   * @param {string} gameId - ID игры
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Game>} - Обновленная игра
   * @throws {NotFoundError} - Если игра не найдена
   * @throws {GameError} - Если возникли ошибки, связанные с логикой игры
   */
  async update(gameId, updateData) {
    const game = await this.findById(gameId);
    
    // Проверка статуса игры
    if (game.status !== 'scheduled') {
      throw new GameError.invalidStatus(
        gameId,
        game.status,
        'scheduled'
      );
    }
    
    // Проверка даты игры, если она обновляется
    if (updateData.dateTime) {
      const gameTime = new Date(updateData.dateTime);
      if (gameTime < new Date()) {
        throw new GameError.gameTimeInPast(gameTime);
      }
    }
    
    // Обновляем игру
    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('court', 'name location photos features')
      .populate('creator', 'username fullName avatar')
      .populate('currentPlayers.user', 'username fullName avatar');
    
    if (!updatedGame) {
      throw new NotFoundError('Game not found', 'Game', gameId);
    }
    
    return updatedGame;
  }

  /**
   * Отмена игры
   * @param {string} gameId - ID игры
   * @param {string} reason - Причина отмены
   * @returns {Promise<Game>} - Отмененная игра
   * @throws {NotFoundError} - Если игра не найдена
   * @throws {GameError} - Если возникли ошибки, связанные с логикой игры
   */
  async cancelGame(gameId, reason) {
    const game = await this.findById(gameId);
    
    // Проверка статуса игры
    if (game.status !== 'scheduled') {
      throw new GameError.invalidStatus(
        gameId,
        game.status,
        'scheduled'
      );
    }
    
    // Отменяем игру
    game.status = 'cancelled';
    game.cancelReason = reason;
    
    return await game.save();
  }

  /**
   * Присоединение игрока к игре
   * @param {string} gameId - ID игры
   * @param {string} userId - ID пользователя
   * @returns {Promise<Game>} - Обновленная игра
   * @throws {NotFoundError} - Если игра не найдена
   * @throws {GameError} - Если возникли ошибки, связанные с логикой игры
   */
  async joinGame(gameId, userId) {
    const game = await this.findById(gameId);
    
    // Проверка возможности присоединения
    const canJoin = game.canJoin(userId);
    if (!canJoin.canJoin) {
      if (canJoin.reason === 'Game is full') {
        throw new GameError.gameFull(gameId);
      } else if (canJoin.reason === 'User already joined this game') {
        throw new GameError.alreadyJoined(gameId, userId);
      } else {
        throw new GameError.invalidStatus(
          gameId,
          game.status,
          'scheduled'
        );
      }
    }
    
    // Добавляем игрока
    game.currentPlayers.push({
      user: userId,
      status: 'confirmed'
    });
    
    // Добавляем игру в список игр пользователя
    await User.findByIdAndUpdate(
      userId,
      { $push: { joinedGames: gameId } }
    );
    
    return await game.save();
  }

  /**
   * Покидание игры игроком
   * @param {string} gameId - ID игры
   * @param {string} userId - ID пользователя
   * @returns {Promise<Game>} - Обновленная игра
   * @throws {NotFoundError} - Если игра не найдена
   * @throws {BusinessError} - Если возникли ошибки, связанные с бизнес-логикой
   */
  async leaveGame(gameId, userId) {
    const game = await this.findById(gameId);
    
    // Проверка статуса игры
    if (game.status !== 'scheduled') {
      throw new GameError.invalidStatus(
        gameId,
        game.status,
        'scheduled'
      );
    }
    
    // Проверка, является ли пользователь создателем игры
    if (game.creator._id.toString() === userId) {
      // Создатель не может покинуть игру, но может отменить её
      throw new Error('Game creator cannot leave the game, use cancelGame instead');
    }
    
    // Проверяем, участвует ли пользователь в игре
    const playerIndex = game.currentPlayers.findIndex(
      player => player.user._id.toString() === userId
    );
    
    if (playerIndex === -1) {
      throw new Error('User is not a participant of this game');
    }
    
    // Удаляем игрока из списка участников
    game.currentPlayers.splice(playerIndex, 1);
    
    // Удаляем игру из списка игр пользователя
    await User.findByIdAndUpdate(
      userId,
      { $pull: { joinedGames: gameId } }
    );
    
    return await game.save();
  }

  /**
   * Получение игр на площадке
   * @param {string} courtId - ID площадки
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество игр на странице
   * @returns {Promise<{games: Game[], total: number, page: number, limit: number}>}
   */
  async findByCourt(courtId, page = 1, limit = 10) {
    const filter = {
      court: courtId,
      status: 'scheduled',
      dateTime: { $gt: new Date() }
    };
    
    return await this.findAll(page, limit, filter);
  }

  /**
   * Получение игр, созданных пользователем
   * @param {string} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество игр на странице
   * @returns {Promise<{games: Game[], total: number, page: number, limit: number}>}
   */
  async findByCreator(userId, page = 1, limit = 10) {
    const filter = { creator: userId };
    return await this.findAll(page, limit, filter);
  }

  /**
   * Получение игр, в которых участвует пользователь
   * @param {string} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество игр на странице
   * @returns {Promise<{games: Game[], total: number, page: number, limit: number}>}
   */
  async findByParticipant(userId, page = 1, limit = 10) {
    const filter = {
      'currentPlayers.user': userId
    };
    
    return await this.findAll(page, limit, filter);
  }
  
  /**
   * Поиск предстоящих игр
   * @param {Date} fromDate - Начальная дата поиска (по умолчанию - текущая дата)
   * @param {Date} toDate - Конечная дата поиска (по умолчанию - неделя от начальной даты)
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество игр на странице
   * @returns {Promise<{games: Game[], total: number, page: number, limit: number}>}
   */
  async findUpcoming(fromDate = new Date(), toDate = null, page = 1, limit = 10) {
    if (!toDate) {
      // По умолчанию ищем на неделю вперед
      toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 7);
    }
    
    const filter = {
      status: 'scheduled',
      dateTime: {
        $gte: fromDate,
        $lte: toDate
      }
    };
    
    return await this.findAll(page, limit, filter);
  }

  /**
   * Поиск игр по типу спорта
   * @param {string} sportType - Тип спорта
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество игр на странице
   * @returns {Promise<{games: Game[], total: number, page: number, limit: number}>}
   */
  async findBySportType(sportType, page = 1, limit = 10) {
    const filter = {
      sportType,
      status: 'scheduled',
      dateTime: { $gt: new Date() }
    };
    
    return await this.findAll(page, limit, filter);
  }
}

module.exports = new GameRepository();