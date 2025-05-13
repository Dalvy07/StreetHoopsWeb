// src/services/user.service.js
const userRepository = require('../repositories/user.repository');
const { AuthError } = require('../utils/errors');

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
    
    return userData;
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