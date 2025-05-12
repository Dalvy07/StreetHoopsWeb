// src/middleware/errorHandler.js
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const { 
  AppError, ValidationError, NotFoundError, BusinessError, 
  ConflictError, ForbiddenError, UnauthorizedError 
} = require('../utils/errors');

/**
 * Глобальный обработчик ошибок
 */
const errorHandler = (err, req, res, next) => {
  // Формируем контекст ошибки для логирования
  const errorContext = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    ip: req.ip,
    requestId: req.id,
    user: req.user ? req.user._id : 'unauthenticated'
  };

  // Если это не production, добавляем тело запроса в логи
  if (process.env.NODE_ENV !== 'production') {
    errorContext.body = req.body;
  }

  // Логируем ошибку
  logger.error('Error occurred:', errorContext);

  // 1. Обработка кастомных ошибок приложения
  if (err instanceof AppError) {
    // Обработка ошибок валидации с дополнительными деталями
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json(
        ApiError.validationFailed(err.message, err.errors)
      );
    }

    // NotFoundError -> 404
    if (err instanceof NotFoundError) {
      return res.status(err.statusCode).json(
        ApiError.notFound(err.message)
      );
    }

    // BusinessError -> 400
    if (err instanceof BusinessError) {
      return res.status(err.statusCode).json(
        ApiError.badRequest(err.message)
      );
    }

    // ConflictError -> 409
    if (err instanceof ConflictError) {
      return res.status(err.statusCode).json(
        ApiError.conflict(err.message)
      );
    }

    // ForbiddenError -> 403
    if (err instanceof ForbiddenError) {
      return res.status(err.statusCode).json(
        ApiError.forbidden(err.message)
      );
    }

    // UnauthorizedError -> 401
    if (err instanceof UnauthorizedError) {
      return res.status(err.statusCode).json(
        ApiError.unauthorized(err.message)
      );
    }

    // Для других кастомных ошибок используем информацию из самой ошибки
    return res.status(err.statusCode || 500).json(
      new ApiError({
        message: err.message,
        errors: err.errors
      })
    );
  }

  // 2. Обработка ошибок MongoDB / Mongoose
  if (err.name === 'ValidationError') {
    // Преобразуем ошибки валидации Mongoose в понятный формат
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json(
      ApiError.validationFailed('Validation failed', errors)
    );
  }

  if (err.name === 'CastError') {
    return res.status(400).json(
      ApiError.badRequest(`Invalid ${err.path}: ${err.value}`)
    );
  }

  if (err.code === 11000) {
    // Извлекаем название дублирующегося поля
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    return res.status(409).json(
      ApiError.conflict(`Duplicate value: '${value}' for field '${field}'`)
    );
  }

  // 3. Обработка ошибок JWT / аутентификации
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ApiError.unauthorized('Invalid token')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      ApiError.unauthorized('Token expired')
    );
  }

  // 4. Обработка ошибок Express и парсеров
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(
      ApiError.badRequest('Invalid JSON payload')
    );
  }

  // 5. Обработка файловых ошибок Node.js
  if (err.code === 'ENOENT') {
    return res.status(404).json(
      ApiError.notFound('File not found')
    );
  }

  if (err.code === 'EACCES') {
    return res.status(403).json(
      ApiError.forbidden('Access denied to file')
    );
  }

  // 6. Обработка неизвестных ошибок
  // В production скрываем детали
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong' 
    : err.message || 'Unknown error';
    
  res.status(err.statusCode || 500).json(
    ApiError.internal(message)
  );
};

module.exports = errorHandler;