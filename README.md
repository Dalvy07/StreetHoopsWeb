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
6. [Система уведомлений](#система-уведомлений)
7. [Развертывание и конфигурация](#развертывание-и-конфигурация)

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
- **Разработка:** Nodemon
- **Тестирование:** Jest, Supertest
- **База данных:** MongoDB 6+ с Mongoose ODM
- **Аутентификация:** Passport.js, JWT
- **Валидация:** Express-validator
- **Геолокация:** Node-geocoder, Geolib
- **Логирование:** Winston
- **Уведомления:** Nodemailer, Push-notifications
- **Контейнеризация:** Docker, Docker Compose
- **Документация:** Swagger/OpenAPI

```
# Основные зависимости
npm install express@^4 mongoose@^8 passport passport-local passport-jwt jsonwebtoken express-validator node-geocoder geolib nodemailer swagger-jsdoc swagger-ui-express cors helmet dotenv winston

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

### Passport.js стратегии

- **Local Strategy:** Для аутентификации по email/password
- **JWT Strategy:** Для защиты роутов

## 6. Система уведомлений

### Типы уведомлений

- **Email:** Регистрация, напоминания о играх, отмена игр
- **Push:** Присоединение игроков, начало игры
- **In-app:** Все события в приложении

## 7. Развертывание и конфигурация

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
