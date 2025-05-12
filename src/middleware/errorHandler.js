// src/middleware/errorHandler.js
const logger = require('../utils/logger');
const ApiResponse = require('../utils/ApiResponse');
const { 
  ErrorCode, ErrorType,
  AppError, ValidationError, NotFoundError, BusinessError, 
  ConflictError, ForbiddenError, UnauthorizedError,
  DatabaseError, ConnectionError, QueryError, TransactionError,
  SystemError
} = require('../utils/errors');

/**
 * Глобальный обработчик ошибок
 * @param {Error} err - Объект ошибки
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 * @param {Function} next - Функция next
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

  // Добавляем специфические поля ошибки в контекст логирования
  if (err.errorCode) {
    errorContext.errorCode = err.errorCode;
  }
  
  if (err.errorType) {
    errorContext.errorType = err.errorType;
  }
  
  if (err.errors) {
    errorContext.errors = err.errors;
  }

  // Если это не production, добавляем тело запроса в логи
  if (process.env.NODE_ENV !== 'production') {
    errorContext.body = req.body;
  }

  // Логируем ошибку с соответствующим уровнем
  if (err.statusCode && err.statusCode < 500) {
    // Для 4xx ошибок логируем как предупреждение
    logger.warn('Client error:', errorContext);
  } else {
    // Для 5xx и прочих ошибок логируем как ошибку
    logger.error('Server error:', errorContext);
  }

  // 1. Обработка кастомных ошибок приложения
  if (err instanceof AppError) {
    // Обработка ошибок валидации с дополнительными деталями
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json(
        ApiResponse.validationFailed(err.message, err.errors)
      );
    }

    // NotFoundError -> 404
    if (err instanceof NotFoundError) {
      return res.status(err.statusCode).json(
        ApiResponse.notFound(err.message)
      );
    }

    // BusinessError -> 400
    if (err instanceof BusinessError) {
      return res.status(err.statusCode).json(
        ApiResponse.badRequest(err.message, err.errors)
      );
    }

    // ConflictError -> 409
    if (err instanceof ConflictError) {
      return res.status(err.statusCode).json(
        ApiResponse.conflict(err.message, err.errors)
      );
    }

    // ForbiddenError -> 403
    if (err instanceof ForbiddenError) {
      return res.status(err.statusCode).json(
        ApiResponse.forbidden(err.message)
      );
    }

    // UnauthorizedError -> 401
    if (err instanceof UnauthorizedError) {
      return res.status(err.statusCode).json(
        ApiResponse.unauthorized(err.message)
      );
    }

    // DatabaseError -> 500 или 503
    if (err instanceof DatabaseError) {
      // ConnectionError -> 503 (Service Unavailable)
      if (err instanceof ConnectionError) {
        return res.status(err.statusCode).json(
          ApiResponse.serviceUnavailable(err.message)
        );
      }
      
      // Для других ошибок БД возвращаем 500 с безопасным сообщением
      const safeMessage = process.env.NODE_ENV === 'production' 
        ? 'Database operation failed' 
        : err.message;
        
      return res.status(err.statusCode).json(
        ApiResponse.internal(safeMessage)
      );
    }

    // Для других кастомных ошибок используем информацию из самой ошибки
    return res.status(err.statusCode || 500).json(
      ApiResponse.error(
        err.message,
        err.statusCode || 500,
        err.errors,
        { errorCode: err.errorCode }
      )
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
      ApiResponse.validationFailed('Validation failed', errors)
    );
  }

  if (err.name === 'CastError') {
    return res.status(400).json(
      ApiResponse.badRequest(`Invalid ${err.path}: ${err.value}`)
    );
  }

  if (err.code === 11000) {
    // Извлекаем название дублирующегося поля
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    return res.status(409).json(
      ApiResponse.conflict(`Duplicate value: '${value}' for field '${field}'`, 
        { field, value })
    );
  }

  // 3. Обработка ошибок JWT / аутентификации
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ApiResponse.unauthorized('Invalid token')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      ApiResponse.unauthorized('Token expired')
    );
  }

  // 4. Обработка ошибок Express и парсеров
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(
      ApiResponse.badRequest('Invalid JSON payload')
    );
  }

  // 5. Обработка файловых ошибок Node.js
  if (err.code === 'ENOENT') {
    return res.status(404).json(
      ApiResponse.notFound('File not found')
    );
  }

  if (err.code === 'EACCES') {
    return res.status(403).json(
      ApiResponse.forbidden('Access denied to file')
    );
  }

  // 6. Обработка неизвестных ошибок
  // В production скрываем детали
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong' 
    : err.message || 'Unknown error';
    
  res.status(err.statusCode || 500).json(
    ApiResponse.internal(message)
  );
};

module.exports = errorHandler;