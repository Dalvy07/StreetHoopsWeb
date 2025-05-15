const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

const {
    registerMinimalSchema,
    loginSchema,
    logoutSchema,
    refreshTokenSchema,
    activateEmailSchema
} = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');

// Публичные маршруты
router.post('/register', registerMinimalSchema, validate, authController.registerUserMinimal);
router.post('/login', loginSchema, validate, authController.loginUser);
router.post('/logout', logoutSchema, validate, authController.logoutUser);
router.get('/refresh', refreshTokenSchema, validate, authController.refreshToken);

router.get('/activate/:link', activateEmailSchema, validate, authController.activateEmail);


module.exports = router;