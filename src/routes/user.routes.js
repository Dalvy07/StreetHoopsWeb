// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');
const verifiedEmail = require('../middleware/verifyEmail.middleware');
const {
    updateProfileSchema,
    changePasswordSchema,
    updateNotificationSchema,
    updateAvatarSchema,
    getUserGamesSchema
} = require('../validators/user.validator');
const validate = require('../middleware/validate.middleware');


// Публичные маршруты
router.post('/', userController.registerUser);
router.post('/login', userController.loginUser);

// Защищенные маршруты профиля (требуют аутентификации)
router.get('/me', authenticate, userController.getMyProfile);
router.put('/me', authenticate, updateProfileSchema, validate, userController.updateMyProfile);
router.delete('/me', authenticate, userController.deleteMyProfile);

// Маршруты, требующие подтвержденный email
router.put('/me/password', 
  authenticate, 
  verifiedEmail, 
  changePasswordSchema, 
  validate, 
  userController.changePassword
);

// Настройки уведомлений
router.put('/me/notifications', 
  authenticate, 
  updateNotificationSchema, 
  validate, 
  userController.updateNotificationSettings
);

// Обновление аватара
router.put('/me/avatar', 
  authenticate, 
  updateAvatarSchema, 
  validate, 
  userController.updateAvatar
);

// Публичные маршруты для просмотра профилей
router.get('/:id', userController.getUserProfile);
router.get('/:id/games', getUserGamesSchema, validate, userController.getUserGames);

module.exports = router;