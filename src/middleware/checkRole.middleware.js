const { AuthError } = require('../utils/errors');

/**
 * Middleware для проверки роли пользователя
 * @param {string|string[]} roles - Роль или массив ролей, которые имеют доступ
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(AuthError.invalidToken('Authentication required'));
        }
        
        if (!Array.isArray(roles)) {
            roles = [roles];
        }
        
        if (!roles.includes(req.user.role)) {
            return next(AuthError.insufficientPermissions(
                `Access denied. Required role: ${roles.join(' or ')}`
            ));
        }
        
        next();
    };
};

module.exports = checkRole;