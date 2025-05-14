const userService = require('../services/user.service');
const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middleware/asyncHandler');


const authController = {
    registerUserMinimal: asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;
        const newUser = await authService.registerUserMinimal({ username, email, password });
        res.status(201).json(ApiResponse.created(newUser, 'User registered successfully'));
    })
}

module.exports = authController;