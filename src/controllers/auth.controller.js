const userService = require('../services/user.service');
const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middleware/asyncHandler');


const authController = {
    registerUserMinimal: asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;
        const newUser = await authService.registerUserMinimal({ username, email, password });

        res.cookie('refreshToken', newUser.refreshToken, {
            maxAge: parseInt(process.env.JWT_REFRESH_EXPIRE_SEC) * 1000, // Need to be in milliseconds
            httpOnly: true
            // secure: process.env.NODE_ENV === 'production',
        });
        res.status(201).json(ApiResponse.created(newUser, 'User registered successfully'));
    }),

    activateEmail: asyncHandler(async (req, res) => {
        const activationLink = req.params.link;
        await authService.activateEmail(activationLink);

        res.redirect(process.env.CLIENT_URL);
    }),

    loginUser: asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const user = await authService.loginUser(email, password);

        res.cookie('refreshToken', user.refreshToken, {
            maxAge: parseInt(process.env.JWT_REFRESH_EXPIRE_SEC) * 1000,
            httpOnly: true
            // secure: process.env.NODE_ENV === 'production',
        });
        res.status(200).json(ApiResponse.success(user, 'User logged in successfully'));
    }),

    logoutUser: asyncHandler(async (req, res) => {
        const { refreshToken } = req.cookies;
        const token = await authService.logoutUser(refreshToken);

        res.clearCookie('refreshToken');
        res.status(200).json(ApiResponse.success(null, 'User logged out successfully'));
    }),

    refreshToken: asyncHandler(async (req, res) => {
        const { refreshToken } = req.cookies;
        const user = await authService.refreshToken(refreshToken);

        res.cookie('refreshToken', user.refreshToken, {
            maxAge: parseInt(process.env.JWT_REFRESH_EXPIRE_SEC) * 1000,
            httpOnly: true
            // secure: process.env.NODE_ENV === 'production',
        });
        res.status(200).json(ApiResponse.success(user, 'Tokens refreshed successfully'));
    })
}

module.exports = authController;