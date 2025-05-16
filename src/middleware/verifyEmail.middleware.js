const { AuthError } = require('../utils/errors');


// src/middleware/verifiedEmail.middleware.js
const { AuthError } = require('../utils/errors');

/**
 * Middleware для проверки подтверждения email пользователя
 * Используется для маршрутов, требующих подтвержденный email
 */
const verifiedEmail = (req, res, next) => {
    // Убедимся, что пользователь аутентифицирован
    if (!req.user) {
        return next(AuthError.invalidToken('Authentication required'));
    }
    
    // Проверяем, подтвержден ли email
    if (!req.user.isEmailVerified) {
        return next(AuthError.accountInactive('Email verification required. Please check your email and verify your account.'));
    }
    
    next();
};

module.exports = verifiedEmail;