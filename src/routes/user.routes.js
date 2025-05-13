// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Публичные маршруты
router.post('/', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/:id', userController.getUserProfile);

module.exports = router;