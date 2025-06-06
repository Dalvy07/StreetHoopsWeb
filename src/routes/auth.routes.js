const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const checkRole = require('../middleware/checkRole.middleware');


const authController = require('../controllers/auth.controller');

const {
    registerMinimalSchema,
    loginSchema,
    logoutSchema,
    refreshTokenSchema,
    activateEmailSchema
} = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');

// Публичные маршруты после регестрации на сервере будут доступны по /auth
router.post('/register', registerMinimalSchema, validate, authController.registerUserMinimal);
router.post('/login', loginSchema, validate, authController.loginUser);
router.post('/logout', logoutSchema, validate, authController.logoutUser);
router.get('/refresh', refreshTokenSchema, validate, authController.refreshToken);

router.get('/activate/:link', authController.activateEmail);
router.post('/resend-verification', authenticate, authController.resendVerificationEmail);

module.exports = router;
