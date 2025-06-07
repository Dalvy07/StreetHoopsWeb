const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passwordResetTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Один токен на пользователя
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

passwordResetTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: process.env.PASSWORD_RESET_TOKEN_EXPIRE_SEC }); // Индекс для автоматического удаления токенов по истечении срока действия
passwordResetSchema.index({ token: 1 });
passwordResetSchema.index({ userId: 1 });

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

module.exports = PasswordResetToken;