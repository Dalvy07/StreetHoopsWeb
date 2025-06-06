// src/controllers/user.controller.js
const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middleware/asyncHandler');

/**
 * Контроллер для работы с пользователями
 */
const userController = {
  /**
   * Получение профиля пользователя
   * @route GET /api/v1/users/:id
   * @access Public
   */
  getUserProfile: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);

    res.json(ApiResponse.success(user, 'User profile retrieved successfully'));
  }),

  /**
   * Получение собственного профиля
   * @route GET /api/v1/users/me
   * @access Private
   */
  getMyProfile: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const user = await userService.getUserById(userId);

    res.json(ApiResponse.success(user, 'Profile retrieved successfully'));
  }),

  /**
   * Обновление собственного профиля
   * @route PUT /api/v1/users/me
   * @access Private
   */
  updateMyProfile: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;

    const updatedUser = await userService.updateUserProfile(userId, updateData);

    res.cookie('refreshToken', updatedUser.refreshToken, {
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRE_SEC) * 1000, // Need to be in milliseconds
      httpOnly: true
      // secure: process.env.NODE_ENV === 'production',
    });

    res.json(ApiResponse.updated(updatedUser, 'Profile updated successfully'));
  }),

  /**
   * Удаление собственного профиля
   * @route DELETE /api/v1/users/me
   * @access Private
   */
  deleteMyProfile: asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await userService.deleteUser(userId);

    res.json(ApiResponse.deleted('Profile deleted successfully'));
  }),

  /**
   * Обновление настроек уведомлений
   * @route PUT /api/v1/users/me/notifications
   * @access Private
   */
  updateNotificationSettings: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const settings = req.body;

    const updatedUser = await userService.updateNotificationSettings(userId, settings);

    res.json(ApiResponse.updated(
      updatedUser.notifications,
      'Notification settings updated successfully'
    ));
  }),

  /**
   * Смена пароля
   * @route PUT /api/v1/users/me/password
   * @access Private
   */
  changePassword: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const updatedUser = await userService.changePassword(userId, currentPassword, newPassword);
    res.cookie('refreshToken', updatedUser.refreshToken, {
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRE_SEC) * 1000, // Need to be in milliseconds
      httpOnly: true
      // secure: process.env.NODE_ENV === 'production',
    });

    res.json(ApiResponse.success(updatedUser, 'Password changed successfully'));
  }),

  /**
   * Загрузка аватара
   * @route PUT /api/v1/users/me/avatar
   * @access Private
   */
  updateAvatar: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { avatar } = req.body;

    const updatedUser = await userService.updateAvatar(userId, avatar);

    res.json(ApiResponse.updated(
      { avatar: updatedUser.avatar },
      'Avatar updated successfully'
    ));
  }),

  /**
   * Получение игр пользователя
   * @route GET /api/v1/users/:id/games
   * @access Public
   */
  getUserGames: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { page = 1, limit = 10, type = 'all' } = req.query;

    const games = await userService.getUserGames(userId, page, limit, type);

    res.json(ApiResponse.paginated(
      games.games,
      games.page,
      games.limit,
      games.total,
      'User games retrieved successfully'
    ));
  }),

  /**
   * Регистрация нового пользователя
   * @route POST /api/v1/users
   * @access Public
   */
  registerUser: asyncHandler(async (req, res) => {
    const userData = req.body;
    const newUser = await userService.registerUser(userData);

    res.status(201).json(ApiResponse.created(newUser, 'User registered successfully'));
  }),

  /**
   * Базовая аутентификация пользователя
   * @route POST /api/v1/users/login
   * @access Public
   */
  loginUser: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await userService.authenticateUser(email, password);

    res.json(ApiResponse.success(user, 'User authenticated successfully'));
  })
};

module.exports = userController;