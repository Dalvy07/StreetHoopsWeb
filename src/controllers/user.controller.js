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