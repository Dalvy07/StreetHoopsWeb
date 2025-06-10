// src/services/auth.service.js
const userRepository = require('../repositories/user.repository');
const TokenService = require('./token.servise');
const { AuthError } = require('../utils/errors');
const UserDTO = require('../utils/dtos/UserDTO');
const uuid = require('uuid');
const Mail = require('nodemailer/lib/mailer');
const mailServise = require('./mail.servise');

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
        const tokens = await TokenService.generateTokens({ id: userDTO.id, username: userDTO.username, email: userDTO.email, role: userDTO.role });
        await TokenService.saveToken(userDTO.id, tokens.refreshToken);

        return {
            user: userDTO,
            ...tokens
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

        const activationLink = uuid.v4();

        // Создаем нового пользователя
        const newUser = await userRepository.createMinimal({
            username: username,
            email: email,
            password: password,
            emailVerificationLink: activationLink,
            isEmailVerified: false
        });

        const userDTO = new UserDTO(newUser);
        const tokens = await TokenService.generateTokens({
            id: userDTO.id,
            username: userDTO.username,
            email: userDTO.email,
            role: userDTO.role,
            isEmailVerified: false
        });
        await TokenService.saveToken(userDTO.id, tokens.refreshToken);

        await mailServise.sendActivationMail(
            newUser.email,
            newUser.emailVerificationLink,  //
            newUser.username
        );

        return {
            user: userDTO,
            ...tokens
        };
    }

    async registerAdmin({ username, email, password}) {
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

        const activationLink = uuid.v4();

        // Создаем нового администратора
        const newAdmin = await userRepository.createAdmin({
            username: username,
            email: email,
            password: password,
            emailVerificationLink: activationLink,
            isEmailVerified: false,
            role: 'admin'
        });

        const adminDTO = new UserDTO(newAdmin);
        const tokens = await TokenService.generateTokens({
            id: adminDTO.id,
            username: adminDTO.username,
            email: adminDTO.email,
            role: adminDTO.role,
            isEmailVerified: false
        });
        await TokenService.saveToken(adminDTO.id, tokens.refreshToken);

        await mailServise.sendActivationMail(
            newAdmin.email,
            newAdmin.emailVerificationLink,
            newAdmin.username
        );

        return {
            user: adminDTO,
            ...tokens
        };
    }

    async activateEmail(activationLink) {
        const user = await userRepository.findByActivationLink(activationLink);
        if (!user) {
            throw AuthError.invalidCredentials('Invalid activation link');
        }

        if (user.isEmailVerified) {
            // return { 
            //     success: true, 
            //     message: 'Email already verified',
            //     alreadyVerified: true
            // };
            throw AuthError.invalidCredentials('Email already verified');
        }

        user.isEmailVerified = true;
        user.emailVerificationLink = null;
        await user.save();

        const userDTO = new UserDTO(user);

        await mailServise.sendEmailVerifiedNotification(user.email, user.username);

        return {
            success: true,
            message: 'Email successfully verified',
            user: userDTO
        };
    }

    async resendVerificationEmail(userId) {
        const user = await userRepository.findById(userId);

        // Проверяем, не подтвержден ли уже email
        if (user.isEmailVerified) {
            // return {
            //     success: false,
            //     message: 'Email already verified'
            // };
            throw AuthError.invalidCredentials('Email already verified');
        }

        // Генерируем новый токен для верификации
        const newVerificationLink = uuid.v4();
        user.emailVerificationLink = newVerificationLink;
        await user.save();

        // Отправляем новое письмо
        const emailSent = await mailServise.sendActivationMail(
            user.email,
            user.newVerificationLink,
            user.username
        );

        if (!emailSent) {
            // return {
            //     success: false,
            //     message: 'Failed to send verification email'
            // };
            throw AuthError.invalidCredentials('Failed to send verification email');
        }

        return {
            success: true,
            message: 'Verification email sent successfully'
        };
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
        const tokens = await TokenService.generateTokens({
            id: userDTO.id,
            username: userDTO.username,
            email: userDTO.email,
            role: userDTO.role,
            isEmailVerified: userDTO.isEmailVerified
        });
        await TokenService.saveToken(userDTO.id, tokens.refreshToken);

        return {
            user: userDTO,
            ...tokens
        };
    }

    async logoutUser(refreshToken) {
        const tokenData = await TokenService.removeToken(refreshToken);
        return tokenData;
    }

    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw AuthError.invalidCredentials('Refresh token is missing');
        }

        const userData = await TokenService.validateRefreshToken(refreshToken);
        const tokenFromDB = await TokenService.findToken(refreshToken);
        if (!userData || !tokenFromDB) {
            throw AuthError.invalidCredentials('Invalid refresh token');
        }

        const user = await userRepository.findById(userData.id);
        const userDTO = new UserDTO(user);
        const tokens = await TokenService.generateTokens({
            id: userDTO.id,
            username: userDTO.username,
            email: userDTO.email,
            role: userDTO.role,
            isEmailVerified: userDTO.isEmailVerified
        });
        await TokenService.saveToken(userDTO.id, tokens.refreshToken);

        return {
            user: userDTO,
            ...tokens
        };
    }
}

module.exports = new AuthServise();
