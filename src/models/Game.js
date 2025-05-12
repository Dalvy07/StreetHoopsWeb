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
    required: true
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
  inviteCode: String
}, { timestamps: true });

// Индекс для поиска по дате и времени
gameSchema.index({ dateTime: 1 });
// Индекс для поиска по создателю
gameSchema.index({ creator: 1 });
// Индекс для поиска по площадке
gameSchema.index({ court: 1 });
// Индекс для поиска по статусу
gameSchema.index({ status: 1 });

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;