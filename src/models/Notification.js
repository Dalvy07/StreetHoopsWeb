const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game'
  },
  court: {
    type: Schema.Types.ObjectId,
    ref: 'Court'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'game_invitation',      // Приглашение на игру
      'game_reminder',        // Напоминание о предстоящей игре
      'player_joined',        // Новый игрок присоединился
      'game_cancelled',       // Игра отменена
      'game_updated',         // Детали игры обновлены
      'player_left',          // Игрок покинул игру
      'court_closed',         // Площадка закрыта
      'spot_available',       // Освободилось место в игре
      'near_you'              // Обнаружена игра поблизости
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveryMethod: {
    type: String,
    enum: ['app', 'email', 'push', 'sms'],
    default: 'app'
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  }
}, { timestamps: true });

// Индексы для оптимизации запросов
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ game: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 });

// Метод для пометки уведомления как прочитанное
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Метод для пометки уведомления как доставленное
notificationSchema.methods.markAsDelivered = function() {
  this.isDelivered = true;
  return this.save();
};

// Статический метод для создания группы уведомлений для всех участников игры
notificationSchema.statics.notifyGameParticipants = async function(game, type, title, message, data = {}, excludeUser = null) {
  const notifications = [];
  
  for (const player of game.currentPlayers) {
    if (excludeUser && player.user.toString() === excludeUser.toString()) {
      continue; // Пропускаем отправителя уведомления, если он указан
    }
    
    const notification = new this({
      recipient: player.user,
      game: game._id,
      court: game.court,
      type,
      title,
      message,
      data
    });
    
    await notification.save();
    notifications.push(notification);
  }
  
  return notifications;
};

// Статический метод для получения непрочитанных уведомлений пользователя
notificationSchema.statics.getUnreadForUser = function(userId) {
  return this.find({ 
    recipient: userId, 
    isRead: false,
    scheduledFor: { $lte: new Date() }, // Только уведомления, время которых уже наступило
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  })
  .sort({ createdAt: -1 })
  .populate('game', 'dateTime sportType')
  .populate('court', 'name location')
  .populate('sender', 'username avatar');
};

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;