// // src/routes/index.js
// const express = require('express');
// const router = express.Router();
// const userRoutes = require('./user.routes');

// // Базовый маршрут API
// router.get('/', (req, res) => {
//   res.json({
//     message: 'Welcome to StreetBall API',
//     version: '1.0.0'
//   });
// });

// // Регистрация маршрутов
// router.use('/users', userRoutes);

// module.exports = router;

// src/routes/index.js
const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');

// Базовый маршрут API
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to StreetBall API',
    version: '1.0.0'
  });
});

// Регистрация маршрутов
router.use('/users', userRoutes);
router.use('/auth', authRoutes);

module.exports = router;