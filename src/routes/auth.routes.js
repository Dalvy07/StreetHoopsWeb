const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

// Публичные маршруты
router.post('/register', authController.registerUserMinimal);
// router.post('/login');
// router.post('/logout');


// router.get('/activate/:link');
// router.get('/refresh');

module.exports = router;