// src/controllers/game.controller.js
const gameService = require('../services/game.service');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middleware/asyncHandler');

/**
 * Контроллер для работы с играми
 */
const gameController = {
  /**
   * Создание новой игры
   * @route POST /api/v1/games
   * @access Private
   */
  createGame: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const gameData = { ...req.body, creator: userId };

    const newGame = await gameService.createGame(gameData);

    res.status(201).json(ApiResponse.created(newGame, 'Game created successfully'));
  }),

  /**
   * Получение всех игр с пагинацией и фильтрацией
   * @route GET /api/v1/games
   * @access Public
   */
  getAllGames: asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      sportType, 
      skillLevel, 
      status = 'scheduled',
      fromDate,
      toDate 
    } = req.query;

    const filter = { status };
    
    if (sportType) {
      filter.sportType = sportType;
    }
    
    if (skillLevel) {
      filter.skillLevel = skillLevel;
    }

    // Добавляем фильтр по дате
    if (fromDate || toDate) {
      filter.dateTime = {};
      if (fromDate) {
        filter.dateTime.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.dateTime.$lte = new Date(toDate);
      }
    } else {
      // По умолчанию показываем только будущие игры
      filter.dateTime = { $gt: new Date() };
    }

    const games = await gameService.getAllGames(page, limit, filter);

    res.json(ApiResponse.paginated(
      games.games,
      games.page,
      games.limit,
      games.total,
      'Games retrieved successfully'
    ));
  }),

  /**
   * Получение игры по ID
   * @route GET /api/v1/games/:id
   * @access Public
   */
  getGameById: asyncHandler(async (req, res) => {
    const gameId = req.params.id;
    const game = await gameService.getGameById(gameId);

    res.json(ApiResponse.success(game, 'Game retrieved successfully'));
  }),

  /**
   * Удаление игры
   * @route DELETE /api/v1/games/:id
   * @access Private (только создатель)
   */
  deleteGame: asyncHandler(async (req, res) => {
    const gameId = req.params.id;
    const userId = req.user.id;
    const { reason } = req.body;

    const deletedGame = await gameService.deleteGame(gameId, userId, reason);

    res.json(ApiResponse.updated(deletedGame, 'Game deleted successfully'));
  }),

  /**
   * Присоединение к игре
   * @route POST /api/v1/games/:id/join
   * @access Private
   */
  joinGame: asyncHandler(async (req, res) => {
    const gameId = req.params.id;
    const userId = req.user.id;

    const updatedGame = await gameService.joinGame(gameId, userId);

    res.json(ApiResponse.updated(updatedGame, 'Successfully joined the game'));
  }),

  /**
   * Покидание игры
   * @route POST /api/v1/games/:id/leave
   * @access Private
   */
  leaveGame: asyncHandler(async (req, res) => {
    const gameId = req.params.id;
    const userId = req.user.id;

    const updatedGame = await gameService.leaveGame(gameId, userId);

    res.json(ApiResponse.updated(updatedGame, 'Successfully left the game'));
  }),

  /**
   * Получение предстоящих игр
   * @route GET /api/v1/games/upcoming
   * @access Public
   */
  getUpcomingGames: asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      days = 7,
      sportType,
      skillLevel 
    } = req.query;

    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + parseInt(days));

    const filter = { sportType, skillLevel };

    const games = await gameService.getUpcomingGames(
      fromDate, 
      toDate, 
      parseInt(page), 
      parseInt(limit),
      filter
    );

    res.json(ApiResponse.paginated(
      games.games,
      games.page,
      games.limit,
      games.total,
      'Upcoming games retrieved successfully'
    ));
  }),

  /**
   * Получение игр по типу спорта
   * @route GET /api/v1/games/sport/:sportType
   * @access Public
   */
  getGamesBySportType: asyncHandler(async (req, res) => {
    const sportType = req.params.sportType;
    const { page = 1, limit = 10 } = req.query;

    const games = await gameService.getGamesBySportType(
      sportType, 
      parseInt(page), 
      parseInt(limit)
    );

    res.json(ApiResponse.paginated(
      games.games,
      games.page,
      games.limit,
      games.total,
      `${sportType} games retrieved successfully`
    ));
  }),

  /**
   * Получение игр, созданных пользователем
   * @route GET /api/v1/games/my-games
   * @access Private
   */
  getMyGames: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, type = 'all' } = req.query;

    let games;
    
    switch (type) {
      case 'created':
        games = await gameService.getGamesByCreator(userId, parseInt(page), parseInt(limit));
        break;
      case 'joined':
        games = await gameService.getGamesByParticipant(userId, parseInt(page), parseInt(limit));
        break;
      case 'all':
      default:
        games = await gameService.getUserAllGames(userId, parseInt(page), parseInt(limit));
        break;
    }

    res.json(ApiResponse.paginated(
      games.games,
      games.page,
      games.limit,
      games.total,
      'Your games retrieved successfully'
    ));
  }),

  /**
   * Поиск игр рядом с пользователем
   * @route GET /api/v1/games/nearby
   * @access Public
   */
  getNearbyGames: asyncHandler(async (req, res) => {
    const { 
      longitude, 
      latitude, 
      distance = 10000, 
      page = 1, 
      limit = 10,
      sportType,
      skillLevel,
      days = 7
    } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json(ApiResponse.badRequest('Longitude and latitude are required'));
    }

    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + parseInt(days));

    const games = await gameService.getNearbyGames(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(distance),
      fromDate,
      toDate,
      parseInt(page),
      parseInt(limit),
      { sportType, skillLevel }
    );

    res.json(ApiResponse.paginated(
      games.games,
      games.page,
      games.limit,
      games.total,
      'Nearby games retrieved successfully'
    ));
  }),

  /**
   * Получение статистики игр
   * @route GET /api/v1/games/stats
   * @access Public
   */
  getGamesStats: asyncHandler(async (req, res) => {
    const { timeframe = 'week' } = req.query;
    
    const stats = await gameService.getGamesStats(timeframe);

    res.json(ApiResponse.success(stats, 'Game statistics retrieved successfully'));
  })
};

module.exports = gameController;