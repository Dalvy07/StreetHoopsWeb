// src/services/auth.service.js
const userRepository = require('../repositories/user.repository');

const TokenServise = require('./token.servise');

const { AuthError } = require('../utils/errors');

const UserDTO = require('../utils/dtos/UserDTO');

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
        const userDTO = new UserDTO(newUser);
        
        // TODO: Generate JWT token here 
        const tokens = await TokenServise.generateTokens({ id: userDTO.id, username: userDTO.username, email: userDTO.email, role: userDTO.role });
        await TokenServise.saveToken(userDTO.id, tokens.refreshToken);

        return {
            user: userDTO,
            ... tokens
        };
    }
}

module.exports = new AuthServise();