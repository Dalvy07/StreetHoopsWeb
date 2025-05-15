// src/validators/auth.validator.js
const { body, param, cookie, header } = require('express-validator');
const userRepository = require('../repositories/user.repository');

// Вспомогательные функции
const usernameIsUnique = async (username) => {
  const existingUser = await userRepository.findByUsername(username);
  if (existingUser) {
    throw new Error('Username is already taken');
  }
  return true;
};

const emailIsUnique = async (email) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('Email is already registered');
  }
  return true;
};

// Схема валидации для минимальной регистрации
exports.registerMinimalSchema = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores')
    .custom(usernameIsUnique),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(emailIsUnique),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Схема валидации для входа
exports.loginSchema = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
];

// Схема валидации для выхода
exports.logoutSchema = [
  cookie('refreshToken')
    .notEmpty().withMessage('Refresh token is required')
];

// Схема валидации для обновления токена
exports.refreshTokenSchema = [
  cookie('refreshToken')
    .notEmpty().withMessage('Refresh token is required')
];

// Схема валидации для активации email
exports.activateEmailSchema = [
  param('link')
    .notEmpty().withMessage('Activation link is required')
    .isUUID().withMessage('Invalid activation link format')
];

// Схема валидации токена доступа
exports.accessTokenSchema = [
  header('authorization')
    .notEmpty().withMessage('Authorization header is required')
    .custom((value) => {
      if (!value.startsWith('Bearer ')) {
        throw new Error('Authorization header must start with "Bearer "');
      }
      return true;
    })
];
