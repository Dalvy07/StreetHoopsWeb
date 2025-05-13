// // server.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const { connectDB } = require('./src/config/database');
// const logger = require('./src/utils/logger');
// const ApiResponse = require('./src/utils/ApiResponse');
// const { NotFoundError } = require('./src/utils/errors');
// const errorHandler = require('./src/middleware/errorHandler');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Базовые middleware
// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Базовые маршруты
// app.get('/', (req, res) => {
//   res.json(ApiResponse.success('Welcome to the API!', "Endpoint is working"));
// });

// app.get('/health', (req, res) => {
//   res.status(200).json(ApiResponse.success(null, 'Server is healthy'));
// });

// // Обработка несуществующих маршрутов
// app.use('*', (req, res, next) => {
//   next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
// });

// // Глобальный обработчик ошибок
// app.use(errorHandler);

// // Запуск сервера
// async function startServer() {
//   try {
//     // Подключение к базе данных
//     await connectDB();
//     logger.info('Connected to MongoDB');
    
//     // Запуск сервера
//     app.listen(PORT, () => {
//       logger.info(`Server is running on port ${PORT}`);
//       console.log(`Server is running on port ${PORT}`);
//     });
//   } catch (error) {
//     logger.error('Failed to start server:', {
//       message: error.message,
//       stack: error.stack
//     });
//     console.error('Error while starting server:', error.message);
//     process.exit(1);
//   }
// }

// startServer();


// server.js - полностью новая версия
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./src/config/database');
const logger = require('./src/utils/logger');
const ApiResponse = require('./src/utils/ApiResponse');
const { NotFoundError } = require('./src/utils/errors');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Базовые middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Прямое определение маршрутов без использования отдельного файла routes/index.js
const userRoutes = require('./src/routes/user.routes');
app.use('/api/v1/users', userRoutes);

// Базовый маршрут API
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Welcome to StreetBall API',
    version: '1.0.0'
  });
});

// Базовые маршруты приложения
app.get('/', (req, res) => {
  res.json(ApiResponse.success('Welcome to the StreetBall API!', "Endpoint is working"));
});

app.get('/health', (req, res) => {
  res.status(200).json(ApiResponse.success(null, 'Server is healthy'));
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