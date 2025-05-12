const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game'
  },
  type: {
    type: String,
    required: true,
    enum: ['game_reminder', 'player_joined', 'game_cancelled', 'game_updated', 'court_closed']
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  scheduledFor: Date
}, { timestamps: true });

// Индекс для быстрого поиска по пользователю
notificationSchema.index({ user: 1 });
// Индекс для быстрого поиска по игре
notificationSchema.index({ game: 1 });
// Индекс для быстрого поиска по дате запланированной отправки
notificationSchema.index({ scheduledFor: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;