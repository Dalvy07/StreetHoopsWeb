// server.js - обновленная версия с площадками и играми
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { connectDB } = require('./src/config/database');
const logger = require('./src/utils/logger');
const ApiResponse = require('./src/utils/ApiResponse');
const { NotFoundError } = require('./src/utils/errors');
const errorHandler = require('./src/middleware/errorHandler');

const passport = require('./src/config/passport');
const authenticate = require('./src/middleware/auth.middleware');
const checkRole = require('./src/middleware/checkRole.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Базовые middleware
// app.use(cors());
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'], // Разрешаем оба порта
  credentials: true, // Важно для cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Конфигурация Passport.js
app.use(passport.initialize());

// Подключение маршрутов
const userRoutes = require('./src/routes/user.routes');
const authRoutes = require('./src/routes/auth.routes');
const courtRoutes = require('./src/routes/court.routes');
const gameRoutes = require('./src/routes/game.routes');

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courts', courtRoutes);
app.use('/api/v1/games', gameRoutes);

// Базовый маршрут API
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Welcome to StreetBall API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      courts: '/api/v1/courts',
      games: '/api/v1/games'
    }
  });
});

// Корневой маршрут - требует аутентификации
app.get('/', authenticate, checkRole(['user']), (req, res) => {
  res.json(ApiResponse.success('Welcome to the StreetBall API!', "Endpoint is working"));
});

// Маршрут для проверки здоровья сервера
app.get('/health', (req, res) => {
  res.status(200).json(ApiResponse.success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  }, 'Server is healthy'));
});

// Обработка несуществующих маршрутов
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Глобальный обработчик ошибок
app.use(errorHandler);

// Запуск сервера
async function startServer() {
  try {
    // Подключение к базе данных
    await connectDB();
    logger.info('Connected to MongoDB');

    // Запуск сервера
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start server:', {
      message: error.message,
      stack: error.stack
    });
    console.error('Error while starting server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app; // Экспортируем для тестирования