# Бэкенд для приложения StreetBall App

**Проект бэкенд системы для организации уличных спортивных игр**

- **Автор:** Владислав Люлька
- **Стек:** Node.js, Express.js, MongoDB, Mongoose, Passport.js
- **Локация:** Люблин, 2025

## Содержание

1. [Описание проекта](#описание-проекта)
2. [Архитектура системы](#архитектура-системы)
3. [Структура проекта](#структура-проекта)
4. [API Endpoints](#api-endpoints)
5. [Аутентификация и авторизация](#аутентификация-и-авторизация)
6. [Бизнес-логика основных компонентов](#бизнес-логика-основных-компонентов)
7. [Обработка ошибок](#обработка-ошибок)
8. [Система уведомлений](#система-уведомлений)
9. [Геолокационные сервисы](#геолокационные-сервисы)
10. [Развертывание и конфигурация](#развертывание-и-конфигурация)

## 1. Описание проекта

### Назначение

StreetBall App — это веб-приложение для организации и участия в уличных спортивных играх в Польше, с первоначальным акцентом на стритбол и баскетбол, с возможностью расширения на другие виды спорта (футбол, волейбол и т.д.). Бэкенд часть системы обеспечивает всю программную логику, взаимодействие с базой данных MongoDB и предоставляет API для мобильных и веб-клиентов.

### Основные функции бэкенд системы:

- **Управление пользователями:** Регистрация, аутентификация и авторизация с использованием JWT и Passport.js
- **Обработка запросов:** Поиск и фильтрация площадок и игр с поддержкой пагинации
- **Управление играми:** Создание, присоединение, отмена игр и управление участниками
- **Геолокация:** Поиск ближайших площадок и работа с картами
- **Уведомления:** Система push-уведомлений и email-рассылок
- **Аналитика:** Статистика использования платформы и популярности игр

### Используемые технологии

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **База данных:** MongoDB 6+ с Mongoose ODM
- **Аутентификация:** Passport.js, JWT
- **Валидация:** Express-validator
- **Геолокация:** Node-geocoder, Geolib
- **Уведомления:** Nodemailer, Push-notifications
- **Контейнеризация:** Docker, Docker Compose
- **Документация:** Swagger/OpenAPI
- **Разработка:** Nodemon
- **Тестирование:** Jest, Supertest

```
# Основные зависимости
npm install express@^4 mongoose@^8 passport passport-local passport-jwt jsonwebtoken express-validator node-geocoder geolib nodemailer swagger-jsdoc swagger-ui-express cors helmet dotenv

# Зависимости для разработки
npm install -D nodemon jest supertest
```

Также нужно добавить скрипты в package.json для удобной разработки и тестирования
```
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest"
}
```

## 2. Архитектура системы

### Архитектурный паттерн

Проект следует модульной архитектуре с разделением ответственности:

```
┌─────────────────────────────────────────────────────────┐
│             Presentation Layer                          │
│        (API Routes & Controllers)                       │
├─────────────────────────────────────────────────────────┤
│             Business Layer                              │
│            (Services & Utils)                           │
├─────────────────────────────────────────────────────────┤
│            Data Access Layer                            │
│        (Models & Database & Repositories)               │
├─────────────────────────────────────────────────────────┤
│           Infrastructure Layer                          │
│     (Auth, Notifications, File Storage)                 │
└─────────────────────────────────────────────────────────┘
```

### Компоненты системы

- **API Layer:** Express роуты и контроллеры
- **Business Logic:** Сервисы для обработки бизнес-правил
- **Data Layer:** Mongoose модели, репозитории и взаимодействие с MongoDB
- **Auth Service:** JWT-токены и Passport стратегии
- **Notification Service:** Email и push-уведомления
- **Geolocation Service:** Работа с координатами и адресами
- **File Service:** Загрузка и обработка изображений

## 3. Структура проекта

```
streetball-backend/
├── docs/                    # Документация проекта
├── logs/                    # Лог файлы
├── node_modules/           # Зависимости
├── src/                    # Исходный код
│   ├── config/            # Конфигурация приложения
│   │   ├── database.js    # Подключение к MongoDB
│   │   ├── passport.js    # Конфигурация аутентификации
│   │   ├── swagger.js     # Конфигурация API документации
│   │   └── cloudinary.js  # Конфигурация файлового хранилища
│   │
│   ├── controllers/       # Контроллеры API
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── court.controller.js
│   │   ├── game.controller.js
│   │   └── notification.controller.js
│   │
│   ├── middleware/        # Промежуточное ПО
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── upload.middleware.js
│   │
│   ├── models/            # MongoDB модели
│   │   ├── User.js
│   │   ├── Court.js
│   │   ├── Game.js
│   │   └── Notification.js
│   │
│   ├── repositories/      # Слой доступа к данным
│   │   ├── user.repository.js
│   │   ├── court.repository.js
│   │   ├── game.repository.js
│   │   └── notification.repository.js
│   │
│   ├── routes/            # API роуты
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── court.routes.js
│   │   ├── game.routes.js
│   │   └── notification.routes.js
│   │
│   ├── services/          # Бизнес-сервисы
│   │   ├── auth.service.js
│   │   ├── email.service.js
│   │   ├── notification.service.js
│   │   ├── location.service.js
│   │   └── game.service.js
│   │
│   ├── utils/             # Утилиты
│   │   ├── ApiResponse.js
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   ├── logger.js
│   │   └── validation.js
│   │
│   └── validators/        # Схемы валидации
│       ├── auth.validator.js
│       ├── user.validator.js
│       ├── court.validator.js
│       └── game.validator.js
│
├── .env.example            # Пример переменных окружения
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package-lock.json
├── package.json
├── README.md               # Этот файл
└── server.js              # Точка входа
```

## 4. API Endpoints

### Аутентификация и пользователи

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/v1/auth/register` | Регистрация пользователя |
| POST | `/api/v1/auth/login` | Вход в систему |
| POST | `/api/v1/auth/refresh-token` | Обновление токена |
| POST | `/api/v1/auth/logout` | Выход из системы |
| GET | `/api/v1/auth/profile` | Получение профиля |
| PUT | `/api/v1/auth/profile` | Обновление профиля |

### Площадки

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/courts` | Получение всех площадок |
| GET | `/api/v1/courts/:id` | Получение конкретной площадки |
| POST | `/api/v1/courts` | Создание новой площадки |
| PUT | `/api/v1/courts/:id` | Обновление площадки |
| DELETE | `/api/v1/courts/:id` | Удаление площадки |
| GET | `/api/v1/courts/nearby` | Поиск ближайших площадок |
| POST | `/api/v1/courts/:id/review` | Добавление отзыва |

### Игры

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/games` | Получение всех игр |
| GET | `/api/v1/games/:id` | Получение конкретной игры |
| POST | `/api/v1/games` | Создание новой игры |
| PUT | `/api/v1/games/:id` | Обновление игры |
| DELETE | `/api/v1/games/:id` | Отмена игры |
| POST | `/api/v1/games/:id/join` | Присоединение к игре |
| POST | `/api/v1/games/:id/leave` | Покидание игры |
| GET | `/api/v1/games/my-games` | Мои игры |

### Уведомления

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/notifications` | Получение уведомлений |
| PUT | `/api/v1/notifications/:id` | Отметить как прочитанное |
| DELETE | `/api/v1/notifications/:id` | Удаление уведомления |
| PUT | `/api/v1/notifications/settings` | Настройки уведомлений |

## 5. Аутентификация и авторизация

### JWT-токены

Система использует два типа токенов:

- **Access Token:** Короткий срок жизни (15 минут)
- **Refresh Token:** Длительный срок жизни (7 дней)

```javascript
// Пример создания токенов
userSchema.methods.generateTokens = function() {
  const accessToken = jwt.sign(
    { userId: this._id, email: this.email, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: this._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};
```

### Passport.js стратегии

- **Local Strategy:** Для аутентификации по email/password
- **JWT Strategy:** Для защиты роутов
- **Google OAuth:** Для входа через Google (опционально)

```javascript
// JWT стратегия
passport.use('jwt', new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId);
    
    if (!user) {
      return done(null, false, { message: 'Пользователь не найден' });
    }
    
    if (!user.isActive) {
      return done(null, false, { message: 'Аккаунт деактивирован' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));
```

## 6. Бизнес-логика основных компонентов

### Управление играми

```javascript
// services/game.service.js
class GameService {
  async createGame(gameData, creatorId) {
    // Валидация времени игры
    const gameTime = new Date(gameData.dateTime);
    if (gameTime < new Date()) {
      throw new BusinessError('Game time cannot be in the past');
    }

    // Проверка доступности площадки
    const conflictingGame = await Game.findOne({
      court: gameData.court,
      dateTime: {
        $gte: gameTime,
        $lt: new Date(gameTime.getTime() + gameData.duration * 60000)
      },
      status: 'scheduled'
    });

    if (conflictingGame) {
      throw new ConflictError('Court is already booked for this time');
    }

    // Создание игры
    const game = await Game.create({
      ...gameData,
      creator: creatorId,
      currentPlayers: [{ user: creatorId, joinedAt: new Date() }]
    });

    // Отправка уведомлений
    await this.notificationService.sendGameCreatedNotification(game);

    return game;
  }

  async joinGame(gameId, userId) {
    const game = await Game.findById(gameId);
    
    if (!game) {
      throw new NotFoundError('Game not found');
    }

    // Проверки
    if (game.status !== 'scheduled') {
      throw new BusinessError('Cannot join a game that is not scheduled');
    }

    if (game.currentPlayers.some(p => p.user.toString() === userId)) {
      throw new BusinessError('You are already part of this game');
    }

    if (game.currentPlayers.length >= game.maxPlayers) {
      throw new ConflictError('Game is full');
    }

    // Присоединение
    game.currentPlayers.push({
      user: userId,
      joinedAt: new Date()
    });

    await game.save();

    // Отправка уведомлений
    await this.notificationService.sendPlayerJoinedNotification(game, userId);

    return game;
  }
}
```

### Геолокационные сервисы

```javascript
// services/location.service.js
class LocationService {
  async findNearbyCourtы(coordinates, maxDistance = 10) {
    return await Court.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: maxDistance * 1000 // в метрах
        }
      }
    });
  }

  async getCoordinatesFromAddress(address) {
    try {
      const results = await geocoder.geocode(address);
      
      if (!results || results.length === 0) {
        throw new NotFoundError('Address not found');
      }
      
      return {
        coordinates: [results[0].longitude, results[0].latitude],
        formattedAddress: results[0].formattedAddress
      };
    } catch (error) {
      throw new ApiError('Geocoding failed', 500);
    }
  }

  calculateDistance(point1, point2) {
    return geolib.getDistance(
      { latitude: point1[1], longitude: point1[0] },
      { latitude: point2[1], longitude: point2[0] }
    );
  }
}
```

## 7. Обработка ошибок

### Стандартизированные DTO

```javascript
// utils/ApiResponse.js
class ApiResponse {
  constructor(data = null, message = 'Success', meta = {}) {
    this.success = true;
    this.message = message;
    this.data = data;
    
    if (Object.keys(meta).length > 0) {
      this.meta = meta;
    }
  }

  static success(data, message = 'Success') {
    return new ApiResponse(data, message);
  }

  static paginated(data, page, limit, total, message = 'Success') {
    const meta = {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
    return new ApiResponse(data, message, meta);
  }
}

// utils/ApiError.js
class ApiError {
  constructor(message, errors = null, meta = {}) {
    this.success = false;
    this.message = message;
    
    if (errors) {
      this.errors = errors;
    }
    
    if (Object.keys(meta).length > 0) {
      this.meta = meta;
    }
  }

  static badRequest(message, errors = null) {
    return new ApiError(message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(message);
  }

  static notFound(message = 'Not found') {
    return new ApiError(message);
  }

  static conflict(message, errors = null) {
    return new ApiError(message, errors);
  }
}
```

### Глобальный обработчик ошибок

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    user: req.user?.id
  });

  // MongoDB ошибки
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json(
      ApiError.badRequest('Validation error', errors)
    );
  }

  if (err.name === 'CastError') {
    return res.status(400).json(
      ApiError.badRequest('Invalid ID format')
    );
  }

  // JWT ошибки
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ApiError.unauthorized('Invalid token')
    );
  }

  // Неизвестная ошибка
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong'
    : err.message;
    
  res.status(500).json(
    ApiError.internal(message)
  );
};
```

## 8. Система уведомлений

### Типы уведомлений

- **Email:** Регистрация, напоминания о играх, отмена игр
- **Push:** Присоединение игроков, начало игры
- **In-app:** Все события в приложении

```javascript
// services/notification.service.js
class NotificationService {
  async sendGameReminderNotifications() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const games = await Game.find({
      dateTime: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      },
      status: 'scheduled'
    }).populate('currentPlayers.user court');

    for (const game of games) {
      for (const player of game.currentPlayers) {
        const user = player.user;
        
        if (user.notifications.email) {
          await this.sendEmail(
            user.email,
            'Game Reminder',
            this.templates.gameReminder(user, game)
          );
        }

        if (user.notifications.push) {
          await this.sendPushNotification(
            user.pushToken,
            'Игра завтра!',
            `Не забудь про игру в ${game.court.name}`
          );
        }

        // Создание in-app уведомления
        await Notification.create({
          user: user._id,
          game: game._id,
          type: 'game_reminder',
          message: `Напоминание: игра "${game.description}" начнется завтра в ${game.dateTime}`,
          scheduledFor: tomorrow
        });
      }
    }
  }

  async sendEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
      });
    } catch (error) {
      logger.error('Email sending failed:', error);
    }
  }

  async sendPushNotification(token, title, body) {
    try {
      await firebase.messaging().send({
        token,
        notification: { title, body },
        android: {
          priority: 'high'
        },
        apns: {
          headers: {
            'apns-priority': '10'
          }
        }
      });
    } catch (error) {
      logger.error('Push notification failed:', error);
    }
  }
}
```

## 9. Геолокационные сервисы

### Поиск ближайших площадок

```javascript
// controllers/court.controller.js
exports.getNearby = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, sportType } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json(
        ApiError.badRequest('Latitude and longitude are required')
      );
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // км в метры
        }
      }
    };

    if (sportType) {
      query.sportTypes = sportType;
    }

    const courts = await Court.find(query)
      .limit(20)
      .select('name location sportTypes rating photos features');

    // Добавляем расстояние для каждой площадки
    const courtsWithDistance = courts.map(court => {
      const distance = geolib.getDistance(
        { latitude: lat, longitude: lng },
        { 
          latitude: court.location.coordinates[1], 
          longitude: court.location.coordinates[0] 
        }
      );

      return {
        ...court.toObject(),
        distance: Math.round(distance / 1000 * 100) / 100 // км с точностью до 2 знаков
      };
    });

    res.status(200).json(
      ApiResponse.success(courtsWithDistance, 'Nearby courts found')
    );
  } catch (error) {
    next(error);
  }
};
```

## 10. Развертывание и конфигурация

### Docker конфигурация

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci --only=production

# Копирование приложения
COPY . .

# Создание пользователя
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Переменные среды
ENV NODE_ENV=production

# Порт
EXPOSE 5000

# Запуск
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/streetball-db
      - JWT_SECRET=${JWT_SECRET}
      - EMAIL_HOST=${EMAIL_HOST}
    depends_on:
      - mongo
    networks:
      - app-network

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

  redis:
    image: redis:alpine
    networks:
      - app-network

volumes:
  mongo-data:

networks:
  app-network:
    driver: bridge
```

### Переменные окружения

```env
# .env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/streetball-db

# JWT
JWT_SECRET=your_very_secure_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@streetball-app.com

# Push Notifications
FIREBASE_ADMIN_KEY_PATH=./config/firebase-admin-key.json

# Geolocation
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# File Upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### База данных MongoDB

Проект использует MongoDB с следующими коллекциями:

- **users:** Информация о пользователях
- **courts:** Данные о спортивных площадках
- **games:** Информация об играх
- **notifications:** Система уведомлений

Подробная структура базы данных описана в документе "README.md" проекта базы данных, который содержит:

- Схемы коллекций
- Примеры запросов и агрегаций
- Скрипты для создания и заполнения базы
- Операции обновления данных
- Управление пользователями БД

## Заключение

Бэкенд StreetBall App представляет собой масштабируемое и надежное решение для организации уличных спортивных игр. Система спроектирована с учетом:

- **Модульной архитектуры** для легкого расширения функциональности
- **Безопасности** с современными практиками аутентификации
- **Производительности** с оптимизированными запросами к базе данных
- **Надежности** с комплексной обработкой ошибок
- **Масштабируемости** с возможностью развертывания в контейнерах

Проект готов к развертыванию в продакшен и дальнейшему расширению на микросервисную архитектуру.
