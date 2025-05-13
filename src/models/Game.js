const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'maybe', 'cancelled'],
    default: 'confirmed'
  }
});

const gameSchema = new Schema({
  court: {
    type: Schema.Types.ObjectId,
    ref: 'Court',
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sportType: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 30
  },
  format: {
    type: String,
    required: true,
    enum: ['3x3', '5x5', 'freestyle', 'training', 'other']
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2
  },
  currentPlayers: [playerSchema],
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  description: String,
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'any'],
    default: 'any'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: String,
  tags: [String]  // Для дополнительной категоризации ("дружеская", "конкурентная", "тренировка" и т.д.)
}, { timestamps: true });

// TODO Поменять на планировщик задач
// Использовать cron или другой планировщик задач для периодической проверки статусов игр
// Автоматическое обновление статуса игры на основе времени
gameSchema.pre('find', function() {
  this._timer = setTimeout(() => {
    const now = new Date();
    
    // Найти игры, которые должны быть в прогрессе
    Game.updateMany(
      { 
        status: 'scheduled', 
        dateTime: { $lte: now }
      },
      { $set: { status: 'in_progress' } }
    ).exec();
    
    // Найти игры, которые должны быть завершены
    Game.updateMany(
      { 
        status: 'in_progress', 
        $expr: { 
          $lte: [
            { $add: ['$dateTime', { $multiply: ['$duration', 60000] }] }, 
            now.getTime()
          ]
        }
      },
      { $set: { status: 'completed' } }
    ).exec();
  }, 0);
});

// Метод для проверки возможности присоединения к игре
gameSchema.methods.canJoin = function(userId) {
  // Проверка статуса игры
  if (this.status !== 'scheduled') {
    return {
      canJoin: false,
      reason: 'Game is not in scheduled status'
    };
  }
  
  // Проверка даты игры
  if (new Date(this.dateTime) < new Date()) {
    return {
      canJoin: false,
      reason: 'Game has already started'
    };
  }
  
  // Проверка на максимальное количество игроков
  if (this.currentPlayers.length >= this.maxPlayers) {
    return {
      canJoin: false,
      reason: 'Game is full'
    };
  }
  
  // Проверка, не присоединился ли пользователь уже
  if (this.currentPlayers.some(player => player.user.toString() === userId.toString())) {
    return {
      canJoin: false,
      reason: 'User already joined this game'
    };
  }
  
  return {
    canJoin: true
  };
};

// Метод для получения количества свободных мест
gameSchema.methods.getAvailableSpots = function() {
  return this.maxPlayers - this.currentPlayers.length;
};

// Метод для получения списка подтвержденных игроков
gameSchema.methods.getConfirmedPlayers = function() {
  return this.currentPlayers.filter(player => 
    player.status === 'confirmed'
  );
};

// Метод для отмены игры
gameSchema.methods.cancelGame = function(reason) {
  this.status = 'cancelled';
  this.cancelReason = reason;
  return this.save();
};

// Индексы для оптимизации запросов
gameSchema.index({ dateTime: 1 });
gameSchema.index({ creator: 1 });
gameSchema.index({ court: 1 });
gameSchema.index({ status: 1 });
gameSchema.index({ sportType: 1, skillLevel: 1 });
gameSchema.index({ dateTime: 1, status: 1 });
gameSchema.index({ 'currentPlayers.user': 1 });

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;