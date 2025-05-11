require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;


// Базовые middleware
app.use(helmet()); // Защита базовых HTTP заголовков
app.use(cors()); // Разрешение CORS
app.use(express.json()); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded данных


// Hello World эндпоинт
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World!',
    status: 'Server is running'
  });
});

// Базовый эндпоинт для проверки здоровья
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Обработка несуществующих маршрутов
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Route not found'
  });
});


async function startServer() {
  try {
    // Подключение к базе данных
    await connectDB();
    
    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error while connecting to MongoDB', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();


// // Запуск сервера
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });