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
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [reviewSchema]
}, { timestamps: true });

// Создание индекса для геопространственного поиска
courtSchema.index({ location: '2dsphere' });

const Court = mongoose.model('Court', courtSchema);
module.exports = Court;