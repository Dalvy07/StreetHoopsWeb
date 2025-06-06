const refreshTokenRepository = require('../repositories/refreshToken.repository');
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
        const tokenData = await refreshTokenRepository.findByUserId(userId);
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return await tokenData.save();
        }
        return await refreshTokenRepository.create(userId, refreshToken);
    }

    async removeToken(refreshToken) {
        const tokenData =  await refreshTokenRepository.delete(refreshToken);
        return tokenData;
    }

    async validateAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        } catch (e) {
            return null;
        }
    }

    async validateRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (e) {
            return null;
        }
    }

    async findToken(refreshToken) {
        const tokenData = await refreshTokenRepository.findByToken(refreshToken);
        return tokenData;
    }

    /**
     * Поиск токена по ID пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Object|null>} - Данные токена или null
     */
    async findTokenByUserId(userId) {
        const tokenData = await refreshTokenRepository.findByUserId(userId);
        return tokenData;
    }
}

module.exports = new TokenServise();