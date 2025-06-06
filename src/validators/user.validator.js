// src/validators/user.validator.js
const { body, param, query } = require('express-validator');
const userRepository = require('../repositories/user.repository');

// Вспомогательная функция для проверки уникальности username
const usernameIsUnique = async (username, { req }) => {
  const existingUser = await userRepository.findByUsername(username);
  if (existingUser && existingUser._id.toString() !== req.user.id) {
    throw new Error('Username is already taken');
  }
  return true;
};

// Схема валидации для обновления профиля
exports.updateProfileSchema = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores')
    .custom(usernameIsUnique),
  
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Please provide a valid phone number'),
  
  // Запрещаем обновление критичных полей
  body(['email', 'password', 'role', 'isEmailVerified', 'emailVerificationLink'])
    .not()
    .exists()
    .withMessage('This field cannot be updated through this endpoint')
];

// Схема валидации для смены пароля
exports.changePasswordSchema = [
  body('currentPassword')
    .trim()
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .trim()
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from current password')
];

// Схема валидации для настроек уведомлений
exports.updateNotificationSchema = [
  body('email')
    .optional()
    .isBoolean().withMessage('Email notification setting must be a boolean'),
  
  body('push')
    .optional()
    .isBoolean().withMessage('Push notification setting must be a boolean'),
  
  body('reminderTime')
    .optional()
    .isInt({ min: 0, max: 1440 }).withMessage('Reminder time must be between 0 and 1440 minutes'),
  
  // Проверяем, что хотя бы одно поле передано
  body()
    .custom((value) => {
      const validFields = ['email', 'push', 'reminderTime'];
      const hasValidField = validFields.some(field => field in value);
      if (!hasValidField) {
        throw new Error('At least one notification setting must be provided');
      }
      return true;
    })
];

// Схема валидации для обновления аватара
exports.updateAvatarSchema = [
  body('avatar')
    .notEmpty().withMessage('Avatar data is required')
    .isString().withMessage('Avatar must be a string')
    .custom((value) => {
      // Проверяем, является ли это URL или base64
      const isURL = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value);
      const isBase64 = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(value);
      
      if (!isURL && !isBase64) {
        throw new Error('Avatar must be a valid URL or base64 encoded image');
      }
      
      // Проверяем размер base64 (не более 5MB)
      if (isBase64) {
        const base64Data = value.split(',')[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        if (sizeInBytes > 5 * 1024 * 1024) {
          throw new Error('Avatar image size must not exceed 5MB');
        }
      }
      
      return true;
    })
];

// Схема валидации для получения игр пользователя
exports.getUserGamesSchema = [
  param('id')
    .isMongoId().withMessage('Invalid user ID'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('type')
    .optional()
    .isIn(['created', 'joined', 'all']).withMessage('Type must be one of: created, joined, all')
];