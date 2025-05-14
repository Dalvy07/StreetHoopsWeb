const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const userRepository = require('../repositories/user.repository');

// Настройка опций для JWT стратегии
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_ACCESS_SECRET,
    ignoreExpiration: false
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        try {
            // const user = await User.findById(payload.id);   // Better use userRepository.findById(payload.id)
            const user = await userRepository.findById(payload.id);
            
            if (user) {
                return done(null, user);
            }
            
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

module.exports = passport;