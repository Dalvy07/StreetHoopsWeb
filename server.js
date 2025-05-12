// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./src/config/database');
const logger = require('./src/utils/logger');
const ApiResponse = require('./src/utils/apiResponse');

// Импорт маршрутов
// const authRoutes = require('./src/routes/auth.routes');
// const userRoutes = require('./src/routes/user.routes');
// const gameRoutes = require('./src/routes/game.routes');
// const courtRoutes = require('./src/routes/court.routes');

// Импорт middleware
const errorHandler = require('./src/middleware/errorHandler');
const { NotFoundError } = require('./src/utils/errors');

const app = express();
const PORT = process.env.PORT || 3000;

// Базовые middleware
app.use(helmet()); // Защита базовых HTTP заголовков
app.use(cors()); // Разрешение CORS
app.use(express.json()); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded данных

// API маршруты
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/games', gameRoutes);
// app.use('/api/v1/courts', courtRoutes);

// Базовые маршруты
app.get('/', (req, res) => {
  res.json(ApiResponse.success('Welcome to the API!', "Endpoint is working"));
});

// Эндпоинт для проверки здоровья
app.get('/health', (req, res) => {
  res.status(200).json(ApiResponse.success(null, 'Server is healthy'));
});

// Обработка несуществующих маршрутов
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Глобальный обработчик ошибок (должен быть последним middleware)
app.use(errorHandler);

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    message: error.message,
    stack: error.stack
  });
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error);
  
  process.exit(1);
});

// Обработка необработанных отклонений промисов
process.on('unhandledRejection', (error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', {
    message: error.message,
    stack: error.stack
  });
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(error);
  
  process.exit(1);
});

async function startServer() {
  try {
    // Подключение к базе данных
    await connectDB();
    logger.info('Connected to MongoDB');
    
    // Запуск сервера
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    console.error('Error while starting server:', error.message);
    process.exit(1);
  }
}

// Запуск сервера
startServer();

module.exports = app; // Экспорт для тестирования