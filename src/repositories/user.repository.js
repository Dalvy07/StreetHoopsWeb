// src/repositories/user.repository.js
const User = require('../models/User');
const { NotFoundError } = require('../utils/errors');

/**
 * Репозиторий для работы с пользователями
 */
class UserRepository {
  /**
   * Создание нового пользователя
   * @param {Object} userData - Данные пользователя для создания
   * @returns {Promise<User>} - Созданный пользователь
   */
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Получение пользователя по ID
   * @param {string} userId - ID пользователя
   * @param {string} [projection] - Поля для выборки
   * @returns {Promise<User>} - Найденный пользователь
   * @throws {NotFoundError} - Если пользователь не найден
   */
  async findById(userId, projection = '') {
    const user = await User.findById(userId, projection);
    if (!user) {
      throw new NotFoundError('User not found', 'User', userId);
    }
    return user;
  }

  /**
   * Получение пользователя по email
   * @param {string} email - Email пользователя
   * @returns {Promise<User|null>} - Найденный пользователь или null
   */
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  /**
   * Получение пользователя по имени
   * @param {string} username - Имя пользователя
   * @returns {Promise<User|null>} - Найденный пользователь или null
   */
  async findByUsername(username) {
    return await User.findOne({ username });
  }

  /**
   * Получение всех пользователей с пагинацией
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество пользователей на странице
   * @param {Object} filter - Фильтры
   * @returns {Promise<{users: User[], total: number, page: number, limit: number}>}
   */
  async findAll(page = 1, limit = 10, filter = {}) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);
    
    return {
      users,
      total,
      page,
      limit
    };
  }

  /**
   * Обновление пользователя
   * @param {string} userId - ID пользователя
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<User>} - Обновленный пользователь
   * @throws {NotFoundError} - Если пользователь не найден
   */
  async update(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new NotFoundError('User not found', 'User', userId);
    }
    
    return user;
  }

  /**
   * Удаление пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<boolean>} - true если удаление успешно
   * @throws {NotFoundError} - Если пользователь не найден
   */
  async delete(userId) {
    const result = await User.findByIdAndDelete(userId);
    
    if (!result) {
      throw new NotFoundError('User not found', 'User', userId);
    }
    
    return true;
  }

  /**
   * Обновление времени последнего входа пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<User>} - Обновленный пользователь
   */
  async updateLastLogin(userId) {
    const user = await this.findById(userId);
    user.lastLogin = new Date();
    return await user.save();
  }

  /**
   * Получение списка игр, созданных пользователем
   * @param {string} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество игр на странице
   * @returns {Promise<{games: Array, total: number, page: number, limit: number}>}
   */
  async getUserCreatedGames(userId, page = 1, limit = 10) {
    const user = await User.findById(userId)
      .populate({
        path: 'createdGames',
        options: {
          skip: (page - 1) * limit,
          limit: limit,
          sort: { dateTime: 1 }
        },
        populate: {
          path: 'court',
          select: 'name location'
        }
      });
    
    if (!user) {
      throw new NotFoundError('User not found', 'User', userId);
    }
    
    return {
      games: user.createdGames,
      total: user.createdGames.length,
      page,
      limit
    };
  }

  /**
   * Получение списка игр, в которых участвует пользователь
   * @param {string} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество игр на странице
   * @returns {Promise<{games: Array, total: number, page: number, limit: number}>}
   */
  async getUserJoinedGames(userId, page = 1, limit = 10) {
    const user = await User.findById(userId)
      .populate({
        path: 'joinedGames',
        options: {
          skip: (page - 1) * limit,
          limit: limit,
          sort: { dateTime: 1 }
        },
        populate: [
          {
            path: 'court',
            select: 'name location'
          },
          {
            path: 'creator',
            select: 'username'
          }
        ]
      });
    
    if (!user) {
      throw new NotFoundError('User not found', 'User', userId);
    }
    
    return {
      games: user.joinedGames,
      total: user.joinedGames.length,
      page,
      limit
    };
  }

  /**
   * Обновление настроек уведомлений пользователя
   * @param {string} userId - ID пользователя
   * @param {Object} notificationSettings - Настройки уведомлений
   * @returns {Promise<User>} - Обновленный пользователь
   */
  async updateNotificationSettings(userId, notificationSettings) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { notifications: notificationSettings } },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new NotFoundError('User not found', 'User', userId);
    }
    
    return user;
  }
}

module.exports = new UserRepository();