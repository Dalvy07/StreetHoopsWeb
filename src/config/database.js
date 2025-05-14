// src/config/database.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { ConnectionError } = require('../utils/errors');

// Строка подключения к MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

// Настройки подключения с улучшенной обработкой ошибок
const options = {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Таймаут в 5 секунд
  socketTimeoutMS: 45000, // Увеличиваем таймаут подключения до 45 секунд
  heartbeatFrequencyMS: 10000, // Проверка соединения каждые 10 секунд
};

// Функция для подключения к базе данных
const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(MONGODB_URI, options);
    
    logger.info(`MongoDB подключена: ${conn.connection.host}`);
    
    // Обработка событий соединения для логирования
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB ошибка соединения:', err);
      throw new ConnectionError('Ошибка соединения с базой данных', { 
        errorDetails: err.message 
      });
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB отключена, попытка переподключения...');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB успешно переподключена');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB соединение закрыто из-за завершения приложения');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    logger.error('Ошибка при подключении к MongoDB:', {
      message: error.message,
      stack: error.stack
    });
    
    // Преобразуем обычную ошибку в нашу кастомную ошибку подключения
    throw new ConnectionError(
      'Не удалось подключиться к MongoDB', 
      {
        original: error.message,
        uri: MONGODB_URI?.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@') // Маскируем пароль в URI
      }
    );
  }
};

module.exports = { connectDB, mongoose };