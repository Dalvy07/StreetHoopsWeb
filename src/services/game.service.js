// src/services/game.service.js
const gameRepository = require('../repositories/game.repository');
const courtRepository = require('../repositories/court.repository');
const notificationRepository = require('../repositories/notification.repository');
const { AuthError, ValidationError, NotFoundError, GameError } = require('../utils/errors');

/**
 * Сервис для работы с играми
 */
class GameService {
  /**
   * Создание новой игры
   * @param {Object} gameData - Данные игры
   * @returns {Promise<Object>} - Созданная игра
   */
  async createGame(gameData) {
    // Валидация данных игры
    await this.validateGameData(gameData);

    // Проверяем доступность площадки
    const court = await courtRepository.findById(gameData.court);
    const gameDate = new Date(gameData.dateTime);
    const endTime = new Date(gameDate.getTime() + gameData.duration * 60000);

    const startTimeStr = this.formatTimeFromDate(gameDate);
    const endTimeStr = this.formatTimeFromDate(endTime);

    const isAvailable = await courtRepository.checkAvailability(
      gameData.court,
      gameDate,
      startTimeStr,
      endTimeStr
    );

    if (!isAvailable) {
      throw new ValidationError('Court is not available at the selected time');
    }

    // Создаем игру
    const newGame = await gameRepository.create(gameData);

    // Создаем напоминания для создателя игры
    await notificationRepository.createGameReminders(newGame, 60); // За час до игры

    return newGame;
  }

  /**
   * Получение всех игр с пагинацией
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @param {Object} filter - Фильтры
   * @returns {Promise<Object>} - Игры с пагинацией
   */
  async getAllGames(page = 1, limit = 10, filter = {}) {
    return await gameRepository.findAll(page, limit, filter);
  }

  /**
   * Получение игры по ID
   * @param {string} gameId - ID игры
   * @returns {Promise<Object>} - Игра
   */
  async getGameById(gameId) {
    return await gameRepository.findById(gameId);
  }

  /**
   * Удаление игры (только создатель)
   * @param {string} gameId - ID игры
   * @param {string} userId - ID пользователя
   * @param {string} reason - Причина удаления
   * @returns {Promise<Object>} - Удаленная игра
   */
  async deleteGame(gameId, userId, reason = 'Game deleted by creator') {
    const game = await gameRepository.findById(gameId);

    // Проверяем права на удаление
    if (game.creator._id.toString() !== userId) {
      throw AuthError.insufficientPermissions('Only game creator can delete this game');
    }

    // Проверяем, что игра еще не началась
    if (game.status !== 'scheduled') {
      throw new ValidationError('Can only delete scheduled games');
    }

    // Отменяем игру вместо полного удаления для сохранения истории
    const deletedGame = await gameRepository.cancelGame(gameId, reason);

    // Уведомляем всех участников об удалении
    await notificationRepository.notifyGameParticipants(
      deletedGame,
      'game_cancelled',
      'Игра удалена',
      `Игра ${deletedGame.sportType} была удалена создателем. Причина: ${reason}`,
      { reason, deletedByCreator: true },
      userId
    );

    return deletedGame;
  }

  /**
   * Присоединение к игре
   * @param {string} gameId - ID игры
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Обновленная игра
   */
  async joinGame(gameId, userId) {
    const updatedGame = await gameRepository.joinGame(gameId, userId);

    // Уведомляем создателя игры о новом участнике
    await notificationRepository.create({
      recipient: updatedGame.creator._id,
      sender: userId,
      game: gameId,
      court: updatedGame.court._id,
      type: 'player_joined',
      title: 'Новый игрок присоединился',
      message: `К вашей игре ${updatedGame.sportType} присоединился новый игрок`,
      data: { gameId, userId }
    });

    // Создаем напоминание для нового участника
    await notificationRepository.createGameReminders(updatedGame, 60);

    return updatedGame;
  }

  /**
   * Покидание игры
   * @param {string} gameId - ID игры
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Обновленная игра
   */
  async leaveGame(gameId, userId) {
    const game = await gameRepository.findById(gameId);
    const updatedGame = await gameRepository.leaveGame(gameId, userId);

    // Уведомляем создателя игры о том, что игрок покинул игру
    await notificationRepository.create({
      recipient: updatedGame.creator._id,
      sender: userId,
      game: gameId,
      court: updatedGame.court._id,
      type: 'player_left',
      title: 'Игрок покинул игру',
      message: `Игрок покинул вашу игру ${updatedGame.sportType}`,
      data: { gameId, userId }
    });

    // Если освободилось место, уведомляем других о доступности
    if (updatedGame.currentPlayers.length < updatedGame.maxPlayers) {
      // Здесь можно добавить логику уведомления заинтересованных пользователей
    }

    return updatedGame;
  }

  /**
   * Получение предстоящих игр
   * @param {Date} fromDate - Начальная дата
   * @param {Date} toDate - Конечная дата
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @param {Object} filter - Дополнительные фильтры
   * @returns {Promise<Object>} - Предстоящие игры
   */
  async getUpcomingGames(fromDate, toDate, page = 1, limit = 10, filter = {}) {
    const gameFilter = {
      status: 'scheduled',
      dateTime: {
        $gte: fromDate,
        $lte: toDate
      },
      ...filter
    };

    // Убираем undefined значения из фильтра
    Object.keys(gameFilter).forEach(key =>
      gameFilter[key] === undefined && delete gameFilter[key]
    );

    return await gameRepository.findAll(page, limit, gameFilter);
  }

  /**
   * Получение игр по типу спорта
   * @param {string} sportType - Тип спорта
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @returns {Promise<Object>} - Игры по типу спорта
   */
  async getGamesBySportType(sportType, page = 1, limit = 10) {
    return await gameRepository.findBySportType(sportType, page, limit);
  }

  /**
   * Получение игр, созданных пользователем
   * @param {string} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @returns {Promise<Object>} - Игры пользователя
   */
  async getGamesByCreator(userId, page = 1, limit = 10) {
    return await gameRepository.findByCreator(userId, page, limit);
  }

  /**
   * Получение игр, в которых участвует пользователь
   * @param {string} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @returns {Promise<Object>} - Игры пользователя
   */
  async getGamesByParticipant(userId, page = 1, limit = 10) {
    return await gameRepository.findByParticipant(userId, page, limit);
  }

  // /**
  //  * Получение всех игр пользователя (созданных и присоединенных)
  //  * @param {string} userId - ID пользователя
  //  * @param {number} page - Номер страницы
  //  * @param {number} limit - Количество на странице
  //  * @returns {Promise<Object>} - Все игры пользователя
  //  */
  // async getUserAllGames(userId, page = 1, limit = 10) {
  //   // Получаем созданные и присоединенные игры
  //   const [createdGames, joinedGames] = await Promise.all([
  //     gameRepository.findByCreator(userId, 1, 1000),
  //     gameRepository.findByParticipant(userId, 1, 1000)
  //   ]);

  //   // Объединяем и удаляем дубликаты
  //   const allGames = [...createdGames.games, ...joinedGames.games];
  //   const uniqueGames = Array.from(
  //     new Map(allGames.map(game => [game._id.toString(), game])).values()
  //   );

  //   // Сортируем по дате
  //   uniqueGames.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  //   // Применяем пагинацию
  //   const start = (page - 1) * limit;
  //   const paginatedGames = uniqueGames.slice(start, start + limit);

  //   return {
  //     games: paginatedGames,
  //     total: uniqueGames.length,
  //     page: parseInt(page),
  //     limit: parseInt(limit)
  //   };
  // }

  /**
 * Получение всех игр пользователя (созданных и присоединенных)
 * @param {string} userId - ID пользователя
 * @param {number} page - Номер страницы
 * @param {number} limit - Количество на странице
 * @returns {Promise<Object>} - Все игры пользователя
 */
  async getUserAllGames(userId, page = 1, limit = 10) {
    return await gameRepository.getUserAllGames(userId, page, limit);
  }

  /**
   * Поиск игр рядом с координатами
   * @param {number} longitude - Долгота
   * @param {number} latitude - Широта
   * @param {number} distance - Расстояние в метрах
   * @param {Date} fromDate - Начальная дата
   * @param {Date} toDate - Конечная дата
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @param {Object} filter - Дополнительные фильтры
   * @returns {Promise<Object>} - Игры поблизости
   */
  async getNearbyGames(longitude, latitude, distance, fromDate, toDate, page = 1, limit = 10, filter = {}) {
    // Сначала находим площадки поблизости
    const nearbyCourts = await courtRepository.findNearby(longitude, latitude, distance, {}, 1, 1000);

    if (nearbyCourts.courts.length === 0) {
      return {
        games: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    }

    // Получаем ID площадок
    const courtIds = nearbyCourts.courts.map(court => court._id);

    // Фильтр для игр
    const gameFilter = {
      court: { $in: courtIds },
      status: 'scheduled',
      dateTime: {
        $gte: fromDate,
        $lte: toDate
      },
      ...filter
    };

    // Убираем undefined значения из фильтра
    Object.keys(gameFilter).forEach(key =>
      gameFilter[key] === undefined && delete gameFilter[key]
    );

    return await gameRepository.findAll(page, limit, gameFilter);
  }

  /**
   * Получение статистики игр
   * @param {string} timeframe - Временной период ('day', 'week', 'month')
   * @returns {Promise<Object>} - Статистика игр
   */
  async getGamesStats(timeframe = 'week') {
    const now = new Date();
    let fromDate;

    switch (timeframe) {
      case 'day':
        fromDate = new Date(now);
        fromDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        fromDate = new Date(now);
        fromDate.setMonth(now.getMonth() - 1);
        break;
      default:
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
    }

    // Получаем все игры за период
    const allGames = await gameRepository.findAll(1, 1000, {
      dateTime: { $gte: fromDate, $lte: now }
    });

    // Группируем статистику
    const stats = {
      total: allGames.total,
      by_status: {},
      by_sport: {},
      by_skill_level: {},
      timeframe,
      from_date: fromDate,
      to_date: now
    };

    allGames.games.forEach(game => {
      // По статусу
      stats.by_status[game.status] = (stats.by_status[game.status] || 0) + 1;

      // По типу спорта
      stats.by_sport[game.sportType] = (stats.by_sport[game.sportType] || 0) + 1;

      // По уровню мастерства
      stats.by_skill_level[game.skillLevel] = (stats.by_skill_level[game.skillLevel] || 0) + 1;
    });

    return stats;
  }

  // Вспомогательные методы

  /**
   * Валидация данных игры
   * @param {Object} gameData - Данные игры
   */
  async validateGameData(gameData) {
    // Проверяем обязательные поля
    if (!gameData.court) {
      throw new ValidationError('Court is required');
    }

    if (!gameData.sportType) {
      throw new ValidationError('Sport type is required');
    }

    if (!gameData.dateTime) {
      throw new ValidationError('Date and time are required');
    }

    if (!gameData.duration || gameData.duration < 30) {
      throw new ValidationError('Duration must be at least 30 minutes');
    }

    if (!gameData.format) {
      throw new ValidationError('Game format is required');
    }

    if (!gameData.maxPlayers || gameData.maxPlayers < 2) {
      throw new ValidationError('Maximum players must be at least 2');
    }

    // Проверяем дату игры
    const gameDate = new Date(gameData.dateTime);
    const now = new Date();

    if (gameDate <= now) {
      throw new ValidationError('Game date must be in the future');
    }

    // Проверяем, что игра не слишком далеко в будущем (например, не более чем на год)
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);

    if (gameDate > maxFutureDate) {
      throw new ValidationError('Game date cannot be more than 1 year in the future');
    }

    // Проверяем существование площадки
    const court = await courtRepository.findById(gameData.court);

    // Проверяем, поддерживает ли площадка этот тип спорта
    if (!court.sportTypes.includes(gameData.sportType)) {
      throw new ValidationError(`Court does not support ${gameData.sportType}`);
    }

    // Валидация формата игры
    const validFormats = ['3x3', '5x5', 'freestyle', 'training', 'other'];
    if (!validFormats.includes(gameData.format)) {
      throw new ValidationError('Invalid game format');
    }

    // Валидация уровня мастерства
    if (gameData.skillLevel) {
      const validSkillLevels = ['beginner', 'intermediate', 'advanced', 'any'];
      if (!validSkillLevels.includes(gameData.skillLevel)) {
        throw new ValidationError('Invalid skill level');
      }
    }
  }

  /**
   * Форматирование даты в строку времени
   * @param {Date} date - Дата
   * @returns {string} - Время в формате HH:MM
   */
  formatTimeFromDate(date) {
    return date.toTimeString().slice(0, 5);
  }
}

module.exports = new GameService();