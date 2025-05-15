const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Middleware для проверки результатов валидации express-validator
 * Собирает ошибки валидации и передает их в единый обработчик ошибок
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    return next(new ValidationError('Validation failed', formattedErrors));
  }
  
  next();
};

module.exports = validate;