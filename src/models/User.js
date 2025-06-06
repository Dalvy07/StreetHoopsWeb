const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationLink: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdGames: [{
    type: Schema.Types.ObjectId,
    ref: 'Game'
  }],
  joinedGames: [{
    type: Schema.Types.ObjectId,
    ref: 'Game'
  }],
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: Number,
      default: 60
    }
  }
}, { timestamps: true });

// Хеширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Метод для обновления времени последнего входа
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Метод для проверки роли пользователя
userSchema.methods.hasRole = function(roles) {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }
  return roles.includes(this.role);
};

// Индекс для поиска пользователей по роли
userSchema.index({ role: 1 });
// Индекс для отслеживания активности пользователей
userSchema.index({ lastLogin: -1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
