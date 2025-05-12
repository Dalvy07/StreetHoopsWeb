// src/utils/errors/index.js
/**
 * Главный индексный файл для экспорта всех ошибок приложения
 */

// Константы
const { ErrorType, ErrorCode } = require('./constants');

// Базовые ошибки
const { AppError } = require('./core');

// HTTP ошибки
const { 
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError
} = require('./http');

// Ошибки базы данных
const {
  DatabaseError,
  ConnectionError,
  QueryError,
  TransactionError,
  MigrationError
} = require('./database');

// Бизнес-ошибки
const {
  BusinessError,
  AuthError,
  GameError
} = require('./business');

// Системные ошибки
const {
  SystemError,
  ConfigError,
  FileSystemError,
  NetworkError
} = require('./system');

module.exports = {
  // Константы
  ErrorType,
  ErrorCode,
  
  // Базовые ошибки
  AppError,
  
  // HTTP ошибки
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  
  // Ошибки базы данных
  DatabaseError,
  ConnectionError,
  QueryError,
  TransactionError,
  MigrationError,
  
  // Бизнес-ошибки
  BusinessError,
  AuthError,
  GameError,
  
  // Системные ошибки
  SystemError,
  ConfigError,
  FileSystemError,
  NetworkError
};