const tokenRepository = require('../repositories/refreshToken.repository');
const userRepository = require('../repositories/user.repository');
const { AuthError } = require('../utils/errors');
const jwt = require('jsonwebtoken');

class TokenServise {
    async generateTokens(payload) {
        const accessToken = jwt.sign(
            payload, 
            process.env.JWT_ACCESS_SECRET, 
            { expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRE_SEC) }
        );
        const refreshToken = jwt.sign(
            payload, 
            process.env.JWT_REFRESH_SECRET, 
            { expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRE_SEC) }
        );

        return { accessToken, refreshToken };
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenRepository.findByUserId(userId);
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return await tokenData.save();
        }
        return await tokenRepository.create(userId, refreshToken);
    }
}

module.exports = new TokenServise();