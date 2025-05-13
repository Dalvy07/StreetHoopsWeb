const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const workingHoursSchema = new Schema({
  open: {
    type: String,
    default: '08:00'
  },
  close: {
    type: String,
    default: '22:00'
  }
});

// Новая схема для отслеживания занятости площадки
const availabilitySchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  timeSlots: [{
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    isBooked: {
      type: Boolean,
      default: false
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      default: null
    }
  }]
});

const courtSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  sportTypes: {
    type: [String],
    required: true
  },
  photos: [String],
  description: String,
  features: {
    covered: Boolean,
    lighting: Boolean,
    surface: String,
    changingRooms: Boolean
  },
  workingHours: {
    monday: workingHoursSchema,
    tuesday: workingHoursSchema,
    wednesday: workingHoursSchema,
    thursday: workingHoursSchema,
    friday: workingHoursSchema,
    saturday: workingHoursSchema,
    sunday: workingHoursSchema
  },
  // Новое поле для отслеживания доступности
  availableHours: [availabilitySchema],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [reviewSchema],
  // Новые поля
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'pending_approval'],
    default: 'active'
  }
}, { timestamps: true });

// Создание индекса для геопространственного поиска
courtSchema.index({ location: '2dsphere' });
// Индекс для поиска по создателю
courtSchema.index({ createdBy: 1 });
// Индекс для фильтрации по статусу
courtSchema.index({ status: 1 });
// Комбинированный индекс для поиска по типу спорта и статусу
courtSchema.index({ sportTypes: 1, status: 1 });

// Метод для проверки доступности площадки в определенное время
courtSchema.methods.isAvailable = function(date, startTime, endTime) {
  const requestDate = new Date(date);
  requestDate.setHours(0, 0, 0, 0); // Нормализация даты

  const availabilityRecord = this.availableHours.find(record => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === requestDate.getTime();
  });

  if (!availabilityRecord) return true; // Если нет записи, считаем доступным

  // Проверяем есть ли пересечения с забронированными слотами
  return !availabilityRecord.timeSlots.some(slot => {
    if (!slot.isBooked) return false;
    
    // Преобразуем строки времени в минуты для простого сравнения
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    const reqStart = timeToMinutes(startTime);
    const reqEnd = timeToMinutes(endTime);
    
    // Проверяем, есть ли пересечение
    return (reqStart < slotEnd && reqEnd > slotStart);
  });
};

// Вспомогательная функция для преобразования времени в минуты
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Метод для обновления среднего рейтинга после добавления нового отзыва
courtSchema.methods.updateRating = function() {
  if (!this.reviews || this.reviews.length === 0) {
    this.rating = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = totalRating / this.reviews.length;
  
  return this.rating;
};

const Court = mongoose.model('Court', courtSchema);
module.exports = Court;