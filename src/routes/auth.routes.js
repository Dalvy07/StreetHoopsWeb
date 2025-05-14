const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

// Публичные маршруты
router.post('/register', authController.registerUserMinimal);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);
router.get('/refresh', authController.refreshToken);

router.get('/activate/:link', authController.activateEmail);


module.exports = router;