// src/validators/game.validator.js
const { body, param, query } = require('express-validator');

// Список поддерживаемых видов спорта
const supportedSports = [
  'basketball', 'football', 'tennis', 'volleyball', 'badminton', 
  'table_tennis', 'hockey', 'futsal', 'handball', 'other'
];

// Список поддерживаемых форматов игр
const supportedFormats = ['3x3', '5x5', 'freestyle', 'training', 'other'];

// Список уровней мастерства
const skillLevels = ['beginner', 'intermediate', 'advanced', 'any'];

// Список статусов игр
const gameStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];

// Схема валидации для создания игры
exports.createGameSchema = [
  body('court')
    .notEmpty().withMessage('Court is required')
    .isMongoId().withMessage('Invalid court ID'),

  body('sportType')
    .notEmpty().withMessage('Sport type is required')
    .isIn(supportedSports).withMessage(`Sport type must be one of: ${supportedSports.join(', ')}`),

  body('dateTime')
    .notEmpty().withMessage('Date and time are required')
    .isISO8601().withMessage('Date and time must be in valid format')
    .custom((value) => {
      const gameDate = new Date(value);
      const now = new Date();
      
      if (gameDate <= now) {
        throw new Error('Game date must be in the future');
      }
      
      // Проверяем, что игра не слишком далеко в будущем (1 год)
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
      
      if (gameDate > maxFutureDate) {
        throw new Error('Game date cannot be more than 1 year in the future');
      }
      
      return true;
    }),

  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 30, max: 480 }).withMessage('Duration must be between 30 and 480 minutes'),

  body('format')
    .notEmpty().withMessage('Game format is required')
    .isIn(supportedFormats).withMessage(`Format must be one of: ${supportedFormats.join(', ')}`),

  body('maxPlayers')
    .notEmpty().withMessage('Maximum players is required')
    .isInt({ min: 2, max: 50 }).withMessage('Maximum players must be between 2 and 50'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('skillLevel')
    .optional()
    .isIn(skillLevels).withMessage(`Skill level must be one of: ${skillLevels.join(', ')}`),

  body('isPrivate')
    .optional()
    .isBoolean().withMessage('Is private must be a boolean'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      
      const validTags = tags.every(tag => 
        typeof tag === 'string' && tag.length >= 2 && tag.length <= 20
      );
      
      if (!validTags) {
        throw new Error('Each tag must be a string between 2 and 20 characters');
      }
      
      return true;
    })
];

// Схема валидации для обновления игры
exports.updateGameSchema = [
  param('id')
    .isMongoId().withMessage('Invalid game ID'),

  body('dateTime')
    .optional()
    .isISO8601().withMessage('Date and time must be in valid format')
    .custom((value) => {
      const gameDate = new Date(value);
      const now = new Date();
      
      if (gameDate <= now) {
        throw new Error('Game date must be in the future');
      }
      
      return true;
    }),

  body('duration')
    .optional()
    .isInt({ min: 30, max: 480 }).withMessage('Duration must be between 30 and 480 minutes'),

  body('format')
    .optional()
    .isIn(supportedFormats).withMessage(`Format must be one of: ${supportedFormats.join(', ')}`),

  body('maxPlayers')
    .optional()
    .isInt({ min: 2, max: 50 }).withMessage('Maximum players must be between 2 and 50'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('skillLevel')
    .optional()
    .isIn(skillLevels).withMessage(`Skill level must be one of: ${skillLevels.join(', ')}`),

  body('isPrivate')
    .optional()
    .isBoolean().withMessage('Is private must be a boolean'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      
      const validTags = tags.every(tag => 
        typeof tag === 'string' && tag.length >= 2 && tag.length <= 20
      );
      
      if (!validTags) {
        throw new Error('Each tag must be a string between 2 and 20 characters');
      }
      
      return true;
    }),

  // Запрещаем изменение системных полей
  body(['court', 'creator', 'sportType', 'currentPlayers', 'status', 'createdAt', 'updatedAt', '_id'])
    .not()
    .exists()
    .withMessage('This field cannot be updated')
];

// Схема валидации для отмены игры
exports.cancelGameSchema = [
  param('id')
    .isMongoId().withMessage('Invalid game ID'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Cancellation reason cannot exceed 200 characters')
];

// Схема валидации для получения игр
exports.getGamesSchema = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

  query('sportType')
    .optional()
    .isIn(supportedSports).withMessage(`Sport type must be one of: ${supportedSports.join(', ')}`),

  query('skillLevel')
    .optional()
    .isIn(skillLevels).withMessage(`Skill level must be one of: ${skillLevels.join(', ')}`),

  query('status')
    .optional()
    .isIn(gameStatuses).withMessage(`Status must be one of: ${gameStatuses.join(', ')}`),

  query('fromDate')
    .optional()
    .isISO8601().withMessage('From date must be a valid date')
    .toDate(),

  query('toDate')
    .optional()
    .isISO8601().withMessage('To date must be a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (req.query.fromDate && value < new Date(req.query.fromDate)) {
        throw new Error('To date must be after from date');
      }
      return true;
    })
];

// Схема валидации для поиска игр поблизости
exports.getNearbyGamesSchema = [
  query('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),

  query('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

  query('distance')
    .optional()
    .isInt({ min: 100, max: 50000 }).withMessage('Distance must be between 100 and 50000 meters'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

  query('sportType')
    .optional()
    .isIn(supportedSports).withMessage(`Sport type must be one of: ${supportedSports.join(', ')}`),

  query('skillLevel')
    .optional()
    .isIn(skillLevels).withMessage(`Skill level must be one of: ${skillLevels.join(', ')}`),

  query('days')
    .optional()
    .isInt({ min: 1, max: 30 }).withMessage('Days must be between 1 and 30')
];

// Схема валидации для получения игр пользователя
exports.getMyGamesSchema = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

  query('type')
    .optional()
    .isIn(['created', 'joined', 'all']).withMessage('Type must be one of: created, joined, all')
];

// Схема валидации для получения предстоящих игр
exports.getUpcomingGamesSchema = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

  query('days')
    .optional()
    .isInt({ min: 1, max: 30 }).withMessage('Days must be between 1 and 30'),

  query('sportType')
    .optional()
    .isIn(supportedSports).withMessage(`Sport type must be one of: ${supportedSports.join(', ')}`),

  query('skillLevel')
    .optional()
    .isIn(skillLevels).withMessage(`Skill level must be one of: ${skillLevels.join(', ')}`)
];

// Схема валидации для получения игр по типу спорта
exports.getGamesBySportSchema = [
  param('sportType')
    .isIn(supportedSports).withMessage(`Sport type must be one of: ${supportedSports.join(', ')}`),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];

// Схема валидации для статистики игр
exports.getStatsSchema = [
  query('timeframe')
    .optional()
    .isIn(['day', 'week', 'month']).withMessage('Timeframe must be one of: day, week, month')
];