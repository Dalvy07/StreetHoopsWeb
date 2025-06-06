const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    // async sendActivationMail(to, link) {
    //     await this.transporter.sendMail({
    //         from: process.env.EMAIL_USER,
    //         to,
    //         subject: 'Account Activation',
    //         text: '',
    //         html: `
    //             <div>
    //                 <h1>Welcome to our service!</h1>
    //                 <p>To activate your account, please click the link below:</p>
    //                 <a href="${link}">${link}</a>
    //             </div>
    //         `,
    //     });
    // }

    /**
     * Отправляет письмо с подтверждением email
     * @param {string} to - Email получателя
     * @param {string} link - Токен для верификации
     * @param {string} username - Имя пользователя
     * @returns {Promise<boolean>} - Успешность отправки письма
     */
    async sendActivationMail(to, link, username) {
        try {
            const activationLink = `${process.env.API_URL}/auth/activate/${link}`;

            const result = await this.transporter.sendMail({
                from: `"Dalvy07" <${process.env.EMAIL_FROM}>`,
                to,
                subject: 'Подтверждение email в StreetBall App',
                text: `Здравствуйте, ${username}! Для подтверждения вашего email перейдите по ссылке: ${activationLink}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333; text-align: center;">Добро пожаловать в StreetBall App!</h2>
                        <p style="font-size: 16px;">Здравствуйте, <strong>${username}</strong>!</p>
                        <p style="font-size: 16px;">Спасибо за регистрацию в нашем приложении. Чтобы активировать ваш аккаунт, пожалуйста, подтвердите ваш email:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${activationLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Подтвердить email</a>
                        </div>
                        <p style="font-size: 14px; color: #777;">Если вы не регистрировались в StreetBall App, просто проигнорируйте это письмо.</p>
                        <p style="font-size: 14px; color: #777;">Ссылка действительна в течение 24 часов.</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} StreetBall App. Все права защищены.</p>
                    </div>
                `,
            });

            logger.info(`Verification email sent to ${to}`);
            return true;
        } catch (error) {
            logger.error('Error sending verification email:', {
                message: error.message,
                to,
                stack: error.stack
            });
            return false;
        }
    }

    /**
     * Отправляет письмо с успешным подтверждением email
     * @param {string} to - Email получателя
     * @param {string} username - Имя пользователя
     */
    async sendEmailVerifiedNotification(to, username) {
        try {
            await this.transporter.sendMail({
                from: `"Dalvy07" <${process.env.EMAIL_FROM}>`,
                to,
                subject: 'Ваш email успешно подтвержден',
                text: `Здравствуйте, ${username}! Ваш email успешно подтвержден. Теперь вы можете полноценно пользоваться StreetBall App.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333; text-align: center;">Email успешно подтвержден!</h2>
                        <p style="font-size: 16px;">Здравствуйте, <strong>${username}</strong>!</p>
                        <p style="font-size: 16px;">Ваш email успешно подтвержден. Теперь вы можете полноценно пользоваться StreetBall App.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Перейти в приложение</a>
                        </div>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} StreetBall App. Все права защищены.</p>
                    </div>
                `,
            });

            logger.info(`Verification success email sent to ${to}`);
            return true;
        } catch (error) {
            logger.error('Error sending verification success email:', {
                message: error.message,
                to,
                stack: error.stack
            });
            return false;
        }
    }
}

module.exports = new MailService();
