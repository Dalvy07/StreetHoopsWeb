// src/routes/game.routes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const authenticate = require('../middleware/auth.middleware');
const verifiedEmail = require('../middleware/verifyEmail.middleware');
const {
    createGameSchema,
    updateGameSchema,
    cancelGameSchema,
    getGamesSchema,
    getNearbyGamesSchema
} = require('../validators/game.validator');
const validate = require('../middleware/validate.middleware');

// Публичные маршруты
/**
 * @route GET /api/v1/games
 * @desc Получение всех игр с пагинацией и фильтрацией
 * @access Public
 */
router.get('/', getGamesSchema, validate, gameController.getAllGames);

/**
 * @route GET /api/v1/games/upcoming
 * @desc Получение предстоящих игр
 * @access Public
 */
router.get('/upcoming', gameController.getUpcomingGames);

/**
 * @route GET /api/v1/games/nearby
 * @desc Получение игр поблизости
 * @access Public
 */
router.get('/nearby', getNearbyGamesSchema, validate, gameController.getNearbyGames);

/**
 * @route GET /api/v1/games/sport/:sportType
 * @desc Получение игр по типу спорта
 * @access Public
 */
router.get('/sport/:sportType', gameController.getGamesBySportType);

/**
 * @route GET /api/v1/games/stats
 * @desc Получение статистики игр
 * @access Public
 */
router.get('/stats', gameController.getGamesStats);

/**
 * @route GET /api/v1/games/:id
 * @desc Получение игры по ID
 * @access Public
 */
router.get('/:id', gameController.getGameById);

// Защищенные маршруты (требуют аутентификации)
/**
 * @route POST /api/v1/games
 * @desc Создание новой игры
 * @access Private
 */
router.post('/', 
  authenticate, 
  verifiedEmail,
  createGameSchema, 
  validate, 
  gameController.createGame
);

/**
 * @route GET /api/v1/games/my-games
 * @desc Получение игр пользователя (созданных и присоединенных)
 * @access Private
 */
router.get('/my-games', authenticate, gameController.getMyGames);

/**
 * @route DELETE /api/v1/games/:id
 * @desc Удаление игры
 * @access Private (только создатель)
 */
router.delete('/:id', 
  authenticate, 
  cancelGameSchema, 
  validate, 
  gameController.deleteGame
);

/**
 * @route POST /api/v1/games/:id/join
 * @desc Присоединение к игре
 * @access Private
 */
router.post('/:id/join', authenticate, verifiedEmail, gameController.joinGame);

/**
 * @route POST /api/v1/games/:id/leave
 * @desc Покидание игры
 * @access Private
 */
router.post('/:id/leave', authenticate, gameController.leaveGame);

module.exports = router;