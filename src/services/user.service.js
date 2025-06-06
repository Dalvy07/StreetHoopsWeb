// src/services/user.service.js
const userRepository = require('../repositories/user.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const gameRepository = require('../repositories/game.repository');
const { AuthError } = require('../utils/errors');
const UserDTO = require('../utils/dtos/UserDTO');
const TokenService = require('./token.servise');

/**
 * Сервис для работы с пользователями
 */
class UserService {
  /**
   * Получение пользователя по ID
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Данные пользователя без чувствительной информации
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);

    // Преобразуем Mongoose документ в обычный объект JavaScript
    const userData = user.toObject();

    // Удаляем чувствительные данные
    delete userData.password;
    delete userData.emailVerificationLink;

    return userData;
  }

  /**
   * Обновление профиля пользователя
   * @param {string} userId - ID пользователя
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<Object>} - Обновленный пользователь
   */
  async updateUserProfile(userId, updateData) {
    // Запрещаем обновление критичных полей
    const restrictedFields = ['password', 'email', 'role', 'isEmailVerified', 'emailVerificationLink'];
    restrictedFields.forEach(field => {
      if (field in updateData) {
        throw new ValidationError(`Cannot update field: ${field}`);
      }
    });

    // Проверяем, существует ли новый username
    if (updateData.username) {
      const existingUser = await userRepository.findByUsername(updateData.username);
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new BusinessError('Username already taken');
      }
    }

    const oldTokenData = await TokenService.findTokenByUserId(userId);

    // Обновляем пользователя
    const updatedUser = await userRepository.update(userId, updateData);

    // Генерируем токены для обновленного пользователя чтобы обновить payload
    const userDTO = new UserDTO(updatedUser);
    const tokens = await TokenService.generateTokens({
      id: userDTO.id,
      username: userDTO.username,
      email: userDTO.email,
      role: userDTO.role,
      isEmailVerified: userDTO.isEmailVerified
    });
    await TokenService.saveToken(userDTO.id, tokens.refreshToken);

    // Теперь удаляем старый refresh токен, если он был найден
    if (oldTokenData) {
      try {
        await TokenService.removeToken(oldTokenData.refreshToken);
      } catch (error) {
        // Логируем ошибку, но не прерываем процесс обновления
        console.warn('Failed to remove old refresh token:', error.message);
      }
    }

    return {
      user: userDTO,
      ...tokens
    };
  }

  /**
   * Удаление пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<boolean>} - Результат удаления
   */
  async deleteUser(userId) {
    // Удаляем все связанные данные
    // 1. Удаляем refresh токены
    await refreshTokenRepository.deleteByUserId(userId);

    // 2. Отменяем все будущие игры, созданные пользователем
    const createdGames = await gameRepository.findByCreator(userId, 1, 1000);
    for (const game of createdGames.games) {
      if (game.status === 'scheduled' && new Date(game.dateTime) > new Date()) {
        await gameRepository.cancelGame(game._id, 'Creator account deleted');
      }
    }

    // 3. Удаляем пользователя из участников игр
    const joinedGames = await gameRepository.findByParticipant(userId, 1, 1000);
    for (const game of joinedGames.games) {
      if (game.status === 'scheduled') {
        await gameRepository.leaveGame(game._id, userId);
      }
    }

    // 4. Удаляем самого пользователя
    return await userRepository.delete(userId);
  }

  /**
   * Обновление настроек уведомлений
   * @param {string} userId - ID пользователя
   * @param {Object} settings - Настройки уведомлений
   * @returns {Promise<Object>} - Обновленный пользователь
   */
  async updateNotificationSettings(userId, settings) {
    // Валидация настроек
    const validSettings = {};

    if (typeof settings.email === 'boolean') {
      validSettings['notifications.email'] = settings.email;
    }

    if (typeof settings.push === 'boolean') {
      validSettings['notifications.push'] = settings.push;
    }

    if (typeof settings.reminderTime === 'number' && settings.reminderTime >= 0) {
      validSettings['notifications.reminderTime'] = settings.reminderTime;
    }

    if (Object.keys(validSettings).length === 0) {
      throw new ValidationError('No valid notification settings provided');
    }

    return await userRepository.update(userId, validSettings);
  }

  /**
   * Смена пароля пользователя
   * @param {string} userId - ID пользователя
   * @param {string} currentPassword - Текущий пароль
   * @param {string} newPassword - Новый пароль
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Получаем пользователя с паролем
    const user = await userRepository.findById(userId);

    // Проверяем текущий пароль
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AuthError.invalidCredentials('Current password is incorrect');
    }

    // Валидация нового пароля
    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters');
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    const oldTokenData = await TokenService.findTokenByUserId(userId);

    // Обновляем пароль
    user.password = newPassword;
    const updatedUser = await user.save();

    // Создаем UserDTO
    const userDTO = new UserDTO(updatedUser);

    // Генерируем новые токены
    const tokens = await TokenService.generateTokens({
      id: userDTO.id,
      username: userDTO.username,
      email: userDTO.email,
      role: userDTO.role,
      isEmailVerified: userDTO.isEmailVerified
    });

    // Сначала сохраняем новый refresh токен
    await TokenService.saveToken(userDTO.id, tokens.refreshToken);

    // Теперь удаляем старый refresh токен, если он был найден
    if (oldTokenData) {
      try {
        await TokenService.removeToken(oldTokenData.refreshToken);
      } catch (error) {
        console.warn('Failed to remove old refresh token:', error.message);
      }
    }

    return {
      user: userDTO,
      ...tokens
    };
  }

  /**
   * Обновление аватара пользователя
   * @param {string} userId - ID пользователя
   * @param {string} avatar - URL или base64 аватара
   * @returns {Promise<Object>} - Обновленный пользователь
   */
  async updateAvatar(userId, avatar) {
    if (!avatar || typeof avatar !== 'string') {
      throw new ValidationError('Invalid avatar data');
    }

    return await userRepository.update(userId, { avatar });
  }

  /**
   * Получение игр пользователя
   * @param {string} userId - ID пользователя
   * @param {number} page - Номер страницы
   * @param {number} limit - Количество на странице
   * @param {string} type - Тип игр (created, joined, all)
   * @returns {Promise<Object>} - Игры пользователя
   */
  async getUserGames(userId, page = 1, limit = 10, type = 'all') {
    // Проверяем существование пользователя
    await userRepository.findById(userId);

    let games;

    switch (type) {
      case 'created':
        games = await gameRepository.findByCreator(userId, page, limit);
        break;
      case 'joined':
        games = await gameRepository.findByParticipant(userId, page, limit);
        break;
      case 'all':
      default:
        // Получаем и объединяем созданные и присоединенные игры
        const [createdGames, joinedGames] = await Promise.all([
          gameRepository.findByCreator(userId, 1, 1000),
          gameRepository.findByParticipant(userId, 1, 1000)
        ]);

        // Объединяем и удаляем дубликаты
        const allGames = [...createdGames.games, ...joinedGames.games];
        const uniqueGames = Array.from(
          new Map(allGames.map(game => [game._id.toString(), game])).values()
        );

        // Сортируем по дате
        uniqueGames.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

        // Применяем пагинацию
        const start = (page - 1) * limit;
        const paginatedGames = uniqueGames.slice(start, start + limit);

        games = {
          games: paginatedGames,
          total: uniqueGames.length,
          page: parseInt(page),
          limit: parseInt(limit)
        };
        break;
    }

    return games;
  }

  /**
   * Базовая регистрация пользователя
   * @param {Object} userData - Данные для создания пользователя
   * @returns {Promise<Object>} - Созданный пользователь без пароля
   */
  async registerUser(userData) {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AuthError.invalidCredentials('Email already in use');
    }

    // Проверяем, существует ли пользователь с таким username
    const existingUsername = await userRepository.findByUsername(userData.username);
    if (existingUsername) {
      throw new AuthError.invalidCredentials('Username already taken');
    }

    // Создаем нового пользователя
    const newUser = await userRepository.create(userData);

    // Возвращаем пользователя без пароля
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return userResponse;
  }

  /**
   * Простая проверка учетных данных пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<Object>} - Пользователь без пароля при успешной аутентификации
   */
  async authenticateUser(email, password) {
    // Находим пользователя по email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthError.invalidCredentials('Invalid email or password');
    }

    // Проверяем пароль
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthError.invalidCredentials('Invalid email or password');
    }

    // Обновляем время последнего входа
    await userRepository.updateLastLogin(user._id);

    // Возвращаем пользователя без пароля
    const userResponse = user.toObject();
    delete userResponse.password;

    return userResponse;
  }
}

module.exports = new UserService();