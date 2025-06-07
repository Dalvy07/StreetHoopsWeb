// src/routes/court.routes.js
const express = require('express');
const router = express.Router();
const courtController = require('../controllers/court.controller');
const authenticate = require('../middleware/auth.middleware');
const verifiedEmail = require('../middleware/verifyEmail.middleware');
const checkRole = require('../middleware/checkRole.middleware');
const {
    createCourtSchema,
    updateCourtSchema,
    addReviewSchema,
    getCourtGamesSchema,
    checkAvailabilitySchema,
    getNearbySchema
} = require('../validators/court.validator');
const validate = require('../middleware/validate.middleware');

// Публичные маршруты
/**
 * @route GET /api/v1/courts
 * @desc Получение всех площадок с пагинацией и фильтрацией
 * @access Public
 */
router.get('/', courtController.getAllCourts);

/**
 * @route GET /api/v1/courts/nearby
 * @desc Получение площадок поблизости
 * @access Public
 */
router.get('/nearby', getNearbySchema, validate, courtController.getNearbyCourts);

/**
 * @route GET /api/v1/courts/:id
 * @desc Получение площадки по ID
 * @access Public
 */
router.get('/:id', courtController.getCourtById);

/**
 * @route GET /api/v1/courts/:id/games
 * @desc Получение игр на площадке
 * @access Public
 */
router.get('/:id/games', getCourtGamesSchema, validate, courtController.getCourtGames);

/**
 * @route GET /api/v1/courts/:id/availability
 * @desc Проверка доступности площадки
 * @access Public
 */
router.get('/:id/availability', checkAvailabilitySchema, validate, courtController.checkAvailability);

// Защищенные маршруты (требуют аутентификации)
/**
 * @route POST /api/v1/courts
 * @desc Создание новой площадки
 * @access Private (только администраторы)
 */
router.post('/', 
  authenticate, 
  checkRole(['admin']),
  verifiedEmail,
  createCourtSchema, 
  validate, 
  courtController.createCourt
);

/**
 * @route GET /api/v1/courts/my-courts
 * @desc Получение площадок, созданных пользователем
 * @access Private
 */
router.get('/my-courts', authenticate, courtController.getMyCourts);

/**
 * @route PUT /api/v1/courts/:id
 * @desc Обновление площадки
 * @access Private (только администраторы)
 */
router.put('/:id', 
  authenticate, 
  checkRole(['admin']),
  updateCourtSchema, 
  validate, 
  courtController.updateCourt
);

/**
 * @route DELETE /api/v1/courts/:id
 * @desc Удаление площадки
 * @access Private (только администраторы)
 */
router.delete('/:id', 
  authenticate, 
  checkRole(['admin']), 
  courtController.deleteCourt
);

/**
 * @route POST /api/v1/courts/:id/reviews
 * @desc Добавление отзыва к площадке
 * @access Private
 */
router.post('/:id/reviews', 
  authenticate, 
  verifiedEmail,
  addReviewSchema, 
  validate, 
  courtController.addReview
);

module.exports = router;