
const passport = require('passport');
const { AuthError } = require('../utils/errors');

/**
 * Middleware для аутентификации пользователя с помощью JWT
 */
const authenticate = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        
        if (!user) {
            return next(AuthError.invalidToken('Authentication required'));
        }
        
        req.user = user;
        next();
    })(req, res, next);
};

module.exports = authenticate;