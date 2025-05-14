const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'false',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Account Activation',
            text: '',
            html: `
                <div>
                    <h1>Welcome to our service!</h1>
                    <p>To activate your account, please click the link below:</p>
                    <a href="${link}">${link}</a>
                </div>
            `,
        });
    }
}

module.exports = new MailService();