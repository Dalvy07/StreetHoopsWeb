const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

refreshTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: process.env.JWT_REFRESH_EXPIRE_SEC }); // Индекс для автоматического удаления токенов по истечении срока действия

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;