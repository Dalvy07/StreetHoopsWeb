// src/services/auth.service.js
const userRepository = require('../repositories/user.repository');
const TokenServise = require('./token.servise');
const { AuthError } = require('../utils/errors');
const UserDTO = require('../utils/dtos/UserDTO');
const uuid = require('uuid');

class AuthServise {
    async registerUser(userData) {
        // Проверяем, существует ли пользователь с таким username
        const existingUsername = await userRepository.findByUsername(userData.username);
        if (existingUsername) {
            throw AuthError.invalidCredentials('Username already taken');
        }

        // Проверяем, существует ли пользователь с таким email
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw AuthError.invalidCredentials('Email already in use');
        }

        // Создаем нового пользователя
        const newUser = await userRepository.create(userData);
        const userDTO = new UserDTO(newUser);
        
        // TODO: Generate JWT token here 
        const tokens = await TokenServise.generateTokens({ id: userDTO.id, username: userDTO.username, email: userDTO.email, role: userDTO.role });
        await TokenServise.saveToken(userDTO.id, tokens.refreshToken);

        return {
            user: userDTO,
            ... tokens
        };
    }

    async registerUserMinimal({ username, email, password }) {
        // Проверяем, существует ли пользователь с таким username
        const existingUsername = await userRepository.findByUsername(username);
        if (existingUsername) {
            throw AuthError.invalidCredentials('Username already taken');
        }

        // Проверяем, существует ли пользователь с таким email
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw AuthError.invalidCredentials('Email already in use');
        }

        // Создаем нового пользователя
        const newUser = await userRepository.createMinimal(username, email, password);

        // const activationLink = uuid.v4();
        // await mailServise.sendActivationMail(email, `${process.env.API_URL}/auth/activate${activationLink}`);   // TODO: CHECK URL!!! I Dont have SMTP now to test it

        const userDTO = new UserDTO(newUser);
        const tokens = await TokenServise.generateTokens({ id: userDTO.id, username: userDTO.username, email: userDTO.email, role: userDTO.role });
        await TokenServise.saveToken(userDTO.id, tokens.refreshToken);

        return {
            user: userDTO,
            ... tokens
        };
    }

    async activateEmail(activationLink) {
        const user = await userRepository.findByActivationLink(activationLink);
        if (!user) {
            throw AuthError.invalidCredentials('Invalid activation link');
        }
        user.isActivated = true;
        await user.save();
    }

    async loginUser(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw AuthError.invalidCredentials('Invalid email or password');
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw AuthError.invalidCredentials('Invalid email or password');
        }

        const userDTO = new UserDTO(user);
        const tokens = await TokenServise.generateTokens({ id: userDTO.id, username: userDTO.username, email: userDTO.email, role: userDTO.role });
        await TokenServise.saveToken(userDTO.id, tokens.refreshToken);

        return {
            user: userDTO,
            ... tokens
        };
    }

    async logoutUser(refreshToken) {
        const tokenData = await TokenServise.removeToken(refreshToken);
        return tokenData;
    }

    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw AuthError.invalidCredentials('Refresh token is missing');
        }

        const userData = await TokenServise.validateRefreshToken(refreshToken);
        const tokenFromDB = await TokenServise.findToken(refreshToken);
        if (!userData || !tokenFromDB) {
            throw AuthError.invalidCredentials('Invalid refresh token');
        }

        const user = await userRepository.findById(userData.id);
        const userDTO = new UserDTO(user);
        const tokens = await TokenServise.generateTokens({ id: userDTO.id, username: userDTO.username, email: userDTO.email, role: userDTO.role });
        await TokenServise.saveToken(userDTO.id, tokens.refreshToken);

        return {
            user: userDTO,
            ... tokens
        };
    }
}

module.exports = new AuthServise();