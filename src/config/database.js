const mongoose = require('mongoose');

// Строка подключения к MongoDB
const MONGODB_URI = process.env.MONGODB_URI

// Настройки подключения
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Функция для подключения к базе данных
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('Connected to MongoDB successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('Error while connecting to MongoDB: ', error.message);
    process.exit(1);
  }
};


module.exports = { connectDB, mongoose };