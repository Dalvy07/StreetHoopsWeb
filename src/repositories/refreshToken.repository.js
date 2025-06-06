const RefreshToken = require('../models/RefreshToken');
const { NotFoundError } = require('../utils/errors');

class RefreshTokenRepository {
    /**
     * Создание нового refresh токена
     * @param {string} userId - ID пользователя
     * @param {string} refreshToken - refresh токен
     * @returns {Promise<RefreshToken>} - Созданный refresh токен
     */
    async create(userId, refreshToken) {
        const token = new RefreshToken({ userId, refreshToken });
        return await token.save();
    }

    /**
     * Получение refresh токена по ID пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<RefreshToken|null>} - Найденный refresh токен или null
     */
    async findByUserId(userId) {
        return await RefreshToken.findOne({ userId });
    }

    /**
     * Получение refresh токена по токену
     * @param {string} token - refresh токен
     * @returns {Promise<RefreshToken|null>} - Найденный refresh токен или null
     */
    async findByToken(token) {
        return await RefreshToken.findOne({ refreshToken: token });
    }

    /**
     * Удаление refresh токена
     * @param {string} tokenId - ID refresh токена
     * @returns {Promise<RefreshToken>} - Удаленный refresh токен
     * @throws {NotFoundError} - Если refresh токен не найден
     */
    async deleteById(tokenId) {
        const token = await RefreshToken.findByIdAndDelete(tokenId);
        if (!token) {
            throw new NotFoundError('Refresh token not found', 'RefreshToken', tokenId);
        }
        return token;
    }

    async delete(refreshTokenToDelete) {
        const tokenData = await RefreshToken.findOneAndDelete({ refreshToken: refreshTokenToDelete });
        if (!tokenData) {
            throw new NotFoundError('Refresh token not found', 'RefreshToken', refreshTokenToDelete);
        }
        return tokenData;
    }

    /**
     * Удаление всех refresh токенов пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise<Object>} - Результат удаления
     */
    async deleteByUserId(userId) {
        const result = await RefreshToken.deleteMany({ userId });
        return {
            success: true,
            deletedCount: result.deletedCount
        };
    }
}

module.exports = new RefreshTokenRepository();