const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Убедимся, что директория для логов существует
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Определение форматов логирования
const formats = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Настройка транспортов (куда будут направляться логи)
const transports = [
  // Логирование ошибок в отдельный файл
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 10,
  }),
  // Общий файл логов
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 10,
  }),
];

// В режиме разработки также выводим логи в консоль
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}${
            info.stack ? '\n' + info.stack : ''
          }`
        )
      ),
    })
  );
}


// Создание логгера
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: formats,
  transports,
  exitOnError: false, // Приложение не завершится при необработанной ошибке
});

module.exports = logger;