// src/validators/court.validator.js
const { body, param, query } = require('express-validator');

// Список поддерживаемых видов спорта
const supportedSports = [
  'basketball', 'football', 'tennis', 'volleyball', 'badminton', 
  'table_tennis', 'hockey', 'futsal', 'handball', 'other'
];

// Список поддерживаемых покрытий
const supportedSurfaces = [
  'asphalt', 'concrete', 'rubber', 'grass', 'artificial_grass', 
  'parquet', 'clay', 'sand', 'other'
];

// Схема валидации для создания площадки
exports.createCourtSchema = [
  body('name')
    .trim()
    .notEmpty().withMessage('Court name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Court name must be between 3 and 100 characters'),

  body('location.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]')
    .custom((coordinates) => {
      const [longitude, latitude] = coordinates;
      if (typeof longitude !== 'number' || typeof latitude !== 'number') {
        throw new Error('Coordinates must be numbers');
      }
      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),

  body('location.address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 10, max: 255 }).withMessage('Address must be between 10 and 255 characters'),

  body('sportTypes')
    .isArray({ min: 1 }).withMessage('At least one sport type is required')
    .custom((sports) => {
      const invalidSports = sports.filter(sport => !supportedSports.includes(sport));
      if (invalidSports.length > 0) {
        throw new Error(`Unsupported sport types: ${invalidSports.join(', ')}`);
      }
      return true;
    }),

  body('photos')
    .optional()
    .isArray().withMessage('Photos must be an array')
    .custom((photos) => {
      if (photos.length > 10) {
        throw new Error('Maximum 10 photos allowed');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('features.covered')
    .optional()
    .isBoolean().withMessage('Covered feature must be a boolean'),

  body('features.lighting')
    .optional()
    .isBoolean().withMessage('Lighting feature must be a boolean'),

  body('features.surface')
    .optional()
    .isIn(supportedSurfaces).withMessage(`Surface must be one of: ${supportedSurfaces.join(', ')}`),

  body('features.changingRooms')
    .optional()
    .isBoolean().withMessage('Changing rooms feature must be a boolean'),

  // Валидация рабочих часов (опционально)
  body('workingHours.*.open')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Opening time must be in HH:MM format'),

  body('workingHours.*.close')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Closing time must be in HH:MM format')
    .custom((value, { req, path }) => {
      // Получаем день недели из пути (например, workingHours.monday.close)
      const dayPath = path.replace('.close', '.open');
      const openTime = req.body.workingHours && req.body.workingHours[path.split('.')[1]]?.open;
      
      if (openTime && value) {
        const openMinutes = timeToMinutes(openTime);
        const closeMinutes = timeToMinutes(value);
        
        if (openMinutes >= closeMinutes) {
          throw new Error('Closing time must be after opening time');
        }
      }
      return true;
    })
];

// Схема валидации для обновления площадки
exports.updateCourtSchema = [
  param('id')
    .isMongoId().withMessage('Invalid court ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Court name must be between 3 and 100 characters'),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]')
    .custom((coordinates) => {
      const [longitude, latitude] = coordinates;
      if (typeof longitude !== 'number' || typeof latitude !== 'number') {
        throw new Error('Coordinates must be numbers');
      }
      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),

  body('location.address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 255 }).withMessage('Address must be between 10 and 255 characters'),

  body('sportTypes')
    .optional()
    .isArray({ min: 1 }).withMessage('At least one sport type is required')
    .custom((sports) => {
      const invalidSports = sports.filter(sport => !supportedSports.includes(sport));
      if (invalidSports.length > 0) {
        throw new Error(`Unsupported sport types: ${invalidSports.join(', ')}`);
      }
      return true;
    }),

  body('photos')
    .optional()
    .isArray().withMessage('Photos must be an array')
    .custom((photos) => {
      if (photos.length > 10) {
        throw new Error('Maximum 10 photos allowed');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('features.covered')
    .optional()
    .isBoolean().withMessage('Covered feature must be a boolean'),

  body('features.lighting')
    .optional()
    .isBoolean().withMessage('Lighting feature must be a boolean'),

  body('features.surface')
    .optional()
    .isIn(supportedSurfaces).withMessage(`Surface must be one of: ${supportedSurfaces.join(', ')}`),

  body('features.changingRooms')
    .optional()
    .isBoolean().withMessage('Changing rooms feature must be a boolean'),

  // Запрещаем изменение системных полей
  body(['createdBy', 'createdAt', 'updatedAt', '_id'])
    .not()
    .exists()
    .withMessage('This field cannot be updated')
];

// Схема валидации для добавления отзыва
exports.addReviewSchema = [
  param('id')
    .isMongoId().withMessage('Invalid court ID'),

  body('text')
    .trim()
    .notEmpty().withMessage('Review text is required')
    .isLength({ min: 10, max: 500 }).withMessage('Review text must be between 10 and 500 characters'),

  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
];

// Схема валидации для получения игр на площадке
exports.getCourtGamesSchema = [
  param('id')
    .isMongoId().withMessage('Invalid court ID'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),

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

// Схема валидации для проверки доступности
exports.checkAvailabilitySchema = [
  param('id')
    .isMongoId().withMessage('Invalid court ID'),

  query('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        throw new Error('Date cannot be in the past');
      }
      return true;
    }),

  query('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),

  query('endTime')
    .notEmpty().withMessage('End time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format')
    .custom((value, { req }) => {
      if (req.query.startTime) {
        const startMinutes = timeToMinutes(req.query.startTime);
        const endMinutes = timeToMinutes(value);
        
        if (startMinutes >= endMinutes) {
          throw new Error('End time must be after start time');
        }
        
        // Проверяем минимальную продолжительность (30 минут)
        if (endMinutes - startMinutes < 30) {
          throw new Error('Minimum duration is 30 minutes');
        }
      }
      return true;
    })
];

// Схема валидации для поиска площадок поблизости
exports.getNearbySchema = [
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
    .isIn(supportedSports).withMessage(`Sport type must be one of: ${supportedSports.join(', ')}`)
];

// Вспомогательная функция для преобразования времени в минуты
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}