# Документация бэкенд части StreetBall App

![Логотип](https://api.placeholder.com/400/150?text=StreetBall+App)

## Проект бэкенд системы для приложения Streetball-App

**Автор:** Владислав Люлька  

---

Люблин, 2025

# Документация бэкенд части StreetBall App

## Содержание
1. [Описание проекта](#1-описание-проекта)
2. [Архитектура бэкенд системы](#2-архитектура-бэкенд-системы)
3. [Технический стек](#3-технический-стек)
4. [API интерфейсы](#4-api-интерфейсы)
5. [Аутентификация и авторизация](#5-аутентификация-и-авторизация)
6. [Обработка данных и бизнес-логика](#6-обработка-данных-и-бизнес-логика)
7. [Система уведомлений](#7-система-уведомлений)
8. [Интеграция с геолокационными сервисами](#8-интеграция-с-геолокационными-сервисами)
9. [Развертывание и масштабирование](#9-развертывание-и-масштабирование)
10. [Тестирование и мониторинг](#10-тестирование-и-мониторинг)

## 1. Описание проекта

StreetBall App — это веб-приложение для организации и участия в уличных спортивных играх в Польше, с первоначальным акцентом на стритбол и баскетбол, с возможностью расширения на другие виды спорта. Бэкенд часть системы обеспечивает всю программную логику, взаимодействие с базой данных MongoDB и предоставляет API для мобильных и веб-клиентов.

Основные функции бэкенд системы:
- Управление пользователями, аутентификация и авторизация
- Обработка запросов для поиска и фильтрации площадок и игр
- Управление организацией игр и регистрацией участников
- Работа с геолокационными данными для поиска ближайших площадок
- Система уведомлений для оповещения пользователей о событиях
- Аналитика и статистика использования платформы

## 2. Архитектура бэкенд системы

Бэкенд StreetBall App построен на основе микросервисной архитектуры, что обеспечивает гибкость, масштабируемость и удобство поддержки. Система состоит из следующих основных компонентов:

### 2.1. Микросервисы

1. **Auth Service** - отвечает за аутентификацию, авторизацию и управление пользователями
2. **Courts Service** - управляет данными о спортивных площадках, их рейтингах и отзывах
3. **Games Service** - обрабатывает логику создания, поиска и управления играми
4. **Notifications Service** - отвечает за создание и доставку уведомлений
5. **Geolocation Service** - обрабатывает запросы, связанные с геолокацией и поиском ближайших объектов
6. **Analytics Service** - собирает и обрабатывает статистические данные для аналитики

### 2.2. Взаимодействие компонентов

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Web Client │       │ Mobile App  │       │  Admin UI   │
└──────┬──────┘       └──────┬──────┘       └──────┬──────┘
       │                     │                     │
       └─────────────┬───────┴─────────────┬──────┘
                     │                     │
                     ▼                     ▼
┌────────────────────────────────────────────────────────┐
│                     API Gateway                         │
└────────┬─────────┬───────┬────────┬─────────┬──────────┘
         │         │       │        │         │
         ▼         ▼       ▼        ▼         ▼
┌──────────┐ ┌─────────┐ ┌────┐ ┌────────┐ ┌────────┐
│   Auth   │ │ Courts  │ │Games│ │Notific.│ │  Geo   │
│ Service  │ │ Service │ │Serv.│ │Service │ │Service │
└────┬─────┘ └────┬────┘ └──┬──┘ └───┬────┘ └───┬────┘
     │            │         │        │          │
     └────────────┴─────────┴────────┴──────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   MongoDB   │
                    └─────────────┘
```

### 2.3. Реализация API Gateway

API Gateway служит единой точкой входа для всех клиентских запросов и обеспечивает:
- Маршрутизацию запросов к соответствующим микросервисам
- Балансировку нагрузки
- Кэширование часто запрашиваемых данных
- Мониторинг и логирование запросов
- Ограничение частоты запросов (rate limiting)
- Трансформацию данных при необходимости

## 3. Технический стек

### 3.1. Основные технологии

- **Язык программирования**: Node.js (JavaScript/TypeScript)
- **Веб-фреймворк**: Express.js
- **База данных**: MongoDB (согласно существующей схеме)
- **Управление аутентификацией**: JWT (JSON Web Tokens)
- **Документация API**: Swagger/OpenAPI
- **Управление конфигурацией**: Docker и Docker Compose
- **Оркестрация**: Kubernetes (для продакшн среды)
- **Очереди сообщений**: RabbitMQ (для асинхронной обработки и уведомлений)

### 3.2. Библиотеки и фреймворки

- **Mongoose**: ORM для MongoDB
- **Joi/Yup**: Валидация входных данных
- **Winston**: Логирование
- **Passport.js**: Аутентификация
- **Socket.io**: Для реал-тайм уведомлений
- **Jest**: Тестирование
- **Supertest**: Тестирование API
- **Morgan**: HTTP-логирование
- **Helmet**: Безопасность HTTP-заголовков
- **Redis**: Для кэширования и управления сессиями

## 4. API интерфейсы

### 4.1. REST API Эндпоинты

#### 4.1.1. Пользователи (Users Service)

```
POST   /api/v1/auth/register              - Регистрация нового пользователя
POST   /api/v1/auth/login                 - Аутентификация пользователя
GET    /api/v1/auth/profile               - Получение профиля текущего пользователя
PUT    /api/v1/auth/profile               - Обновление профиля пользователя
PUT    /api/v1/auth/notifications         - Обновление настроек уведомлений
GET    /api/v1/users/:id                  - Получение информации о пользователе
GET    /api/v1/users/:id/games            - Получение игр пользователя
```

#### 4.1.2. Площадки (Courts Service)

```
GET    /api/v1/courts                     - Получение списка площадок
GET    /api/v1/courts/nearby              - Поиск ближайших площадок
GET    /api/v1/courts/:id                 - Получение информации о площадке
POST   /api/v1/courts/:id/reviews         - Добавление отзыва о площадке
GET    /api/v1/courts/:id/games           - Получение игр на площадке
GET    /api/v1/courts/filter              - Фильтрация площадок по параметрам
```

#### 4.1.3. Игры (Games Service)

```
GET    /api/v1/games                      - Получение списка игр
GET    /api/v1/games/filter               - Фильтрация игр по параметрам
POST   /api/v1/games                      - Создание новой игры
GET    /api/v1/games/:id                  - Получение информации об игре
PUT    /api/v1/games/:id                  - Обновление информации об игре
DELETE /api/v1/games/:id                  - Отмена игры
POST   /api/v1/games/:id/join             - Присоединение к игре
POST   /api/v1/games/:id/leave            - Выход из игры
POST   /api/v1/games/:id/status           - Изменение статуса игры
```

#### 4.1.4. Уведомления (Notifications Service)

```
GET    /api/v1/notifications              - Получение уведомлений пользователя
PUT    /api/v1/notifications/:id/read     - Отметка уведомления как прочитанного
DELETE /api/v1/notifications/:id          - Удаление уведомления
```

### 4.2. Формат ответов API

Все API ответы имеют стандартизированный формат:

**Успешный ответ**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "totalItems": 100,
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalPages": 10
  }
}
```

**Ответ с ошибкой**:
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Requested resource not found",
    "details": { ... }
  }
}
```

### 4.3. Примеры запросов и ответов

#### Пример 1: Поиск ближайших площадок

**Запрос**:
```
GET /api/v1/courts/nearby?lat=52.229676&lng=21.012228&radius=5&sportTypes=streetball
```

**Ответ**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "68066af3615f85b790f651cf",
      "name": "Park Jordana",
      "location": {
        "coordinates": [21.012228, 52.229676],
        "address": "ul. Parkowa 15, Warszawa"
      },
      "distance": 0.2,
      "sportTypes": ["streetball", "basketball"],
      "features": {
        "lighting": true,
        "surface": "asphalt"
      },
      "rating": 4.5
    },
    // другие площадки
  ],
  "meta": {
    "totalItems": 3,
    "radius": 5
  }
}
```

#### Пример 2: Создание новой игры

**Запрос**:
```
POST /api/v1/games
Content-Type: application/json

{
  "court": "68066af3615f85b790f651cf",
  "sportType": "streetball",
  "dateTime": "2025-05-10T18:00:00.000Z",
  "duration": 90,
  "format": "3x3",
  "maxPlayers": 12,
  "description": "Еженедельная игра для всех желающих",
  "skillLevel": "intermediate",
  "isPrivate": false
}
```

**Ответ**:
```json
{
  "success": true,
  "data": {
    "_id": "60a6e3d0f2a3a3001c8e9a10",
    "court": "68066af3615f85b790f651cf",
    "creator": "68066af3615f85b790f651ca",
    "sportType": "streetball",
    "dateTime": "2025-05-10T18:00:00.000Z",
    "duration": 90,
    "format": "3x3",
    "maxPlayers": 12,
    "currentPlayers": [
      {
        "user": "68066af3615f85b790f651ca",
        "joinedAt": "2025-05-08T15:25:33.000Z"
      }
    ],
    "status": "scheduled",
    "description": "Еженедельная игра для всех желающих",
    "skillLevel": "intermediate",
    "isPrivate": false,
    "createdAt": "2025-05-08T15:25:33.000Z",
    "updatedAt": "2025-05-08T15:25:33.000Z"
  }
}
```

## 5. Аутентификация и авторизация

### 5.1. Процесс регистрации и аутентификации

1. Пользователь регистрируется через эндпоинт `/api/v1/auth/register`
2. Пароль хешируется с использованием bcrypt перед сохранением в базу данных
3. При успешной аутентификации (`/api/v1/auth/login`) сервер генерирует JWT токен
4. Токен отправляется клиенту и используется для всех последующих запросов

### 5.2. Защита маршрутов и авторизация

Для защиты API используется middleware, проверяющий JWT токен:

```javascript
// Пример middleware для проверки аутентификации
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });

## 9. Развертывание и масштабирование

### 9.1. Архитектура развертывания

Система разработана для размещения в контейнерной среде и включает несколько вариантов развертывания:

1. **Разработка**: Docker Compose для локальной разработки
2. **Тестирование**: Kubernetes кластер для тестовой среды
3. **Производство**: Kubernetes кластер с высокой доступностью для промышленной эксплуатации

```
┌───────────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                      │
├───────────────┬───────────────┬───────────────────────────┤
│ Auth Service  │ Courts Service│         Games Service     │
│   Pod (x2)    │    Pod (x2)   │           Pod (x3)        │
├───────────────┼───────────────┼───────────────────────────┤
│ Notifications │ Geolocation   │       API Gateway         │
│  Service (x2) │  Service (x2) │         Pod (x3)          │
├───────────────┴───────────────┴───────────────────────────┤
│             Persistent Storage (MongoDB Atlas)            │
├───────────────────────────────────────────────────────────┤
│                  Message Broker (RabbitMQ)                │
├───────────────────────────────────────────────────────────┤
│                      Redis Cluster                        │
├───────────────────────────────────────────────────────────┤
│             Monitoring (Prometheus + Grafana)             │
└───────────────────────────────────────────────────────────┘
```

### 9.2. Контейнеризация

Каждый микросервис упакован в Docker-контейнер:

```dockerfile
# Пример Dockerfile для микросервиса
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
```

### 9.3. Конфигурация сервисов

Конфигурация приложения управляется через переменные окружения и конфигурационные файлы:

```javascript
// config.js
const config = {
  app: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
  },
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/streetball-db',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || ''
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    exchange: process.env.RABBITMQ_EXCHANGE || 'streetball'
  },
  services: {
    courts: process.env.COURTS_SERVICE_URL || 'http://localhost:3001',
    games: process.env.GAMES_SERVICE_URL || 'http://localhost:3002',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3003',
    geolocation: process.env.GEOLOCATION_SERVICE_URL || 'http://localhost:3004'
  }
};

module.exports = config;
```

### 9.4. Масштабирование

Система поддерживает горизонтальное масштабирование через:

1. **Stateless микросервисы** - все сервисы не хранят состояние и могут масштабироваться горизонтально
2. **Репликацию MongoDB** - использование MongoDB Atlas с настройкой репликации
3. **Кэширование в Redis** - снижение нагрузки на базу данных через кэширование частых запросов
4. **Балансировку нагрузки** - использование Kubernetes Ingress или отдельного балансировщика нагрузки
5. **Автомасштабирование** - настройка HPA (Horizontal Pod Autoscaler) для автоматического масштабирования на основе нагрузки

Пример конфигурации HPA для Kubernetes:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: games-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: games-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 10. Тестирование и мониторинг

### 10.1. Стратегия тестирования

Система охватывает несколько уровней тестирования:

1. **Модульные тесты** - тестирование отдельных функций и классов
2. **Интеграционные тесты** - тестирование взаимодействия между компонентами
3. **API тесты** - тестирование REST API эндпоинтов
4. **End-to-end тесты** - тестирование полного потока пользователя

Пример модульного теста с использованием Jest:

```javascript
// tests/services/gameService.test.js
const { GameService } = require('../../src/services');
const { Game, User } = require('../../src/models');

jest.mock('../../src/models');

describe('GameService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('joinGame', () => {
    it('should add user to game players', async () => {
      // Arrange
      const gameId = 'game-123';
      const userId = 'user-456';
      
      const mockGame = {
        _id: gameId,
        status: 'scheduled',
        format: '3x3',
        maxPlayers: 10,
        currentPlayers: [],
        save: jest.fn().mockResolvedValue(true)
      };
      
      Game.findById = jest.fn().mockResolvedValue(mockGame);
      User.findByIdAndUpdate = jest.fn().mockResolvedValue({});
      
      // Act
      const gameService = new GameService();
      const result = await gameService.joinGame(gameId, userId);
      
      // Assert
      expect(Game.findById).toHaveBeenCalledWith(gameId);
      expect(mockGame.currentPlayers).toHaveBeenCalledWith(
        expect.objectContaining({
          user: userId,
          joinedAt: expect.any(Date)
        })
      );
      expect(mockGame.save).toHaveBeenCalled();
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $addToSet: { joinedGames: gameId } }
      );
    });
    
    it('should throw error if game is full', async () => {
      // Arrange
      const gameId = 'game-123';
      const userId = 'user-456';
      
      const mockGame = {
        _id: gameId,
        status: 'scheduled',
        maxPlayers: 3,
        currentPlayers: [
          { user: 'user-1' },
          { user: 'user-2' },
          { user: 'user-3' }
        ]
      };
      
      Game.findById = jest.fn().mockResolvedValue(mockGame);
      
      // Act & Assert
      const gameService = new GameService();
      await expect(
        gameService.joinGame(gameId, userId)
      ).rejects.toThrow('Game is already full');
    });
  });
});
```

### 10.2. Тестирование API

Для тестирования API используется Supertest:

```javascript
// tests/api/games.test.js
const request = require('supertest');
const app = require('../../src/app');
const { Game, User } = require('../../src/models');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('Games API', () => {
  let authToken;
  let testUserId;
  
  beforeAll(async () => {
    // Подключение к тестовой базе данных
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    
    // Создание тестового пользователя
    testUserId = new mongoose.Types.ObjectId();
    const user = new User({
      _id: testUserId,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      fullName: 'Test User'
    });
    await user.save();
    
    // Создание токена для тестирования
    authToken = jwt.sign(
      { id: testUserId, username: 'testuser' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });
  
  afterAll(async () => {
    await User.deleteMany({});
    await Game.deleteMany({});
    await mongoose.connection.close();
  });
  
  describe('GET /api/v1/games', () => {
    it('should return list of games', async () => {
      // Arrange
      // Создание тестовых данных...
      
      // Act
      const response = await request(app)
        .get('/api/v1/games')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should filter games by sport type', async () => {
      // Arrange
      // Создание тестовых данных...
      
      // Act
      const response = await request(app)
        .get('/api/v1/games?sportType=streetball')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(game => game.sportType === 'streetball')).toBe(true);
    });
  });
});
```

### 10.3. Мониторинг производительности

Для мониторинга производительности используется комбинация инструментов:

1. **Prometheus** - сбор метрик производительности
2. **Grafana** - визуализация метрик и создание дашбордов
3. **ELK Stack** (Elasticsearch, Logstash, Kibana) - централизованное логирование
4. **Sentry** - отслеживание ошибок и исключений в реальном времени

Пример интеграции Prometheus с Express:

```javascript
const express = require('express');
const promClient = require('prom-client');
const app = express();

// Создание регистра для метрик
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Счетчик HTTP запросов
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// Гистограмма времени ответа
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register]
});

// Middleware для сбора метрик
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode
    });
    
    httpRequestDurationMicroseconds.observe(
      {
        method: req.method,
        route: req.route ? req.route.path : req.path,
        status: res.statusCode
      },
      duration
    );
  });
  
  next();
});

// Эндпоинт для сбора метрик Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Остальные маршруты...
```

### 10.4. Логирование

Система использует структурированное логирование с Winston:

```javascript
// logger.js
const winston = require('winston');
const { format, transports } = winston;

// Настройка форматирования
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.metadata(),
  format.json()
);

// Создание логгера
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: process.env.SERVICE_NAME || 'api' },
  transports: [
    // Консольный вывод для разработки
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, service, metadata }) => {
          return `${timestamp} [${service}] ${level}: ${message} ${
            Object.keys(metadata).length ? JSON.stringify(metadata) : ''
          }`;
        })
      )
    })
  ]
});

// Добавление транспорта для файлового логирования в продакшене
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  );
}

module.exports = logger;
```

## Заключение

Бэкенд часть StreetBall App построена с использованием современных технологий и подходов к разработке программного обеспечения. Микросервисная архитектура обеспечивает гибкость, масштабируемость и удобство поддержки системы. Каждый компонент системы спроектирован с учетом возможности независимого развития и масштабирования.

API интерфейсы предоставляют полный набор функций для работы с пользователями, площадками, играми и уведомлениями. Интеграция с геолокационными сервисами позволяет пользователям находить ближайшие площадки и игры. Система уведомлений обеспечивает своевременное информирование пользователей о событиях.

Контейнеризация и оркестрация с использованием Docker и Kubernetes обеспечивают удобное развертывание и масштабирование системы. Комплексное тестирование и мониторинг гарантируют стабильную работу приложения.
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
};
```

### 5.3. Разграничение прав доступа

Система поддерживает следующие роли пользователей:
- **User**: Обычный пользователь приложения
- **Admin**: Администратор с правами управления всей системой
- **Moderator**: Модератор с правами проверки и редактирования контента

Пример middleware для проверки прав доступа:

```javascript
// Middleware для проверки роли
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      });
    }
    
    next();
  };
};

// Пример использования
router.delete('/courts/:id', authenticate, checkRole(['admin']), courtController.deleteCourt);
```

## 6. Обработка данных и бизнес-логика

### 6.1. Сервисный слой

Для каждого микросервиса реализован сервисный слой, который содержит основную бизнес-логику:

```javascript
// Пример сервиса для работы с играми
class GameService {
  async findGames(filters, options) {
    // Создание запроса с учетом фильтров
    const query = {};
    
    if (filters.sportType) {
      query.sportType = filters.sportType;
    }
    
    if (filters.dateFrom && filters.dateTo) {
      query.dateTime = {
        $gte: new Date(filters.dateFrom),
        $lte: new Date(filters.dateTo)
      };
    }
    
    if (filters.skillLevel) {
      query.skillLevel = filters.skillLevel;
    }
    
    // Настройка пагинации
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    
    // Выполнение запроса
    const games = await Game.find(query)
      .skip(skip)
      .limit(limit)
      .populate('court', 'name location rating')
      .populate('creator', 'username avatar')
      .sort({ dateTime: 1 });
    
    const total = await Game.countDocuments(query);
    
    return {
      games,
      meta: {
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  async joinGame(gameId, userId) {
    const game = await Game.findById(gameId);
    
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.status !== 'scheduled') {
      throw new Error('Game is not in scheduled state');
    }
    
    if (game.currentPlayers.length >= game.maxPlayers) {
      throw new Error('Game is already full');
    }
    
    if (game.currentPlayers.some(p => p.user.toString() === userId)) {
      throw new Error('User is already joined to this game');
    }
    
    game.currentPlayers.push({
      user: userId,
      joinedAt: new Date()
    });
    
    await game.save();
    
    // Отправка уведомления создателю игры
    await notificationService.createNotification({
      user: game.creator,
      game: gameId,
      type: 'player_joined',
      message: `Новый игрок присоединился к вашей игре в ${game.sportType}`
    });
    
    // Отправка уведомления пользователю
    await notificationService.createNotification({
      user: userId,
      game: gameId,
      type: 'player_joined',
      message: `Вы присоединились к игре в ${game.sportType} (${game.format})`
    });
    
    // Обновление статистики пользователя
    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedGames: gameId }
    });
    
    return game;
  }
  
  // Другие методы...
}
```

### 6.2. Валидация входных данных

Для валидации всех входных данных используется библиотека Joi:

```javascript
// Пример схемы валидации для создания игры
const gameSchema = Joi.object({
  court: Joi.string().required(),
  sportType: Joi.string().valid('streetball', 'basketball', 'football', 'volleyball').required(),
  dateTime: Joi.date().greater('now').required(),
  duration: Joi.number().min(30).max(240).required(),
  format: Joi.string().required(),
  maxPlayers: Joi.number().min(2).max(20).required(),
  description: Joi.string().max(500),
  skillLevel: Joi.string().valid('beginner', 'intermediate', 'advanced', 'any').required(),
  isPrivate: Joi.boolean().default(false),
  inviteCode: Joi.when('isPrivate', {
    is: true,
    then: Joi.string().min(4).required(),
    otherwise: Joi.optional()
  })
});

// Middleware для валидации
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.details
        }
      });
    }
    
    next();
  };
};

// Пример использования
router.post('/games', authenticate, validateRequest(gameSchema), gameController.createGame);
```

### 6.3. Обработка ошибок

Система включает централизованную обработку ошибок:

```javascript
// Middleware для обработки ошибок
const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  // Определение типа ошибки
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: err.errors
      }
    });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: 'Duplicate key error',
        details: err.keyValue
      }
    });
  }
  
  // Для остальных ошибок
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
};

// Применение middleware
app.use(errorHandler);
```

## 7. Система уведомлений

### 7.1. Типы уведомлений

Система поддерживает следующие типы уведомлений:
- `game_created` - Создание новой игры
- `player_joined` - Присоединение игрока к игре
- `game_reminder` - Напоминание о предстоящей игре
- `game_cancelled` - Отмена игры
- `court_review` - Новый отзыв о площадке
- `player_left` - Игрок покинул игру

### 7.2. Архитектура системы уведомлений

Система уведомлений построена на основе RabbitMQ и включает:
- Producer: сервисы, генерирующие события
- Очереди сообщений: RabbitMQ для асинхронной обработки
- Consumer: сервис уведомлений, обрабатывающий сообщения и создающий уведомления
- Delivery Service: сервис доставки уведомлений по различным каналам

```
┌────────────────┐    ┌───────────────┐    ┌─────────────────┐
│  Game Service  │    │  Auth Service  │    │  Court Service  │
└────────┬───────┘    └───────┬───────┘    └────────┬────────┘
         │                    │                     │
         └────────────┬───────┴─────────────┬──────┘
                      │                     │
                      ▼                     ▼
             ┌────────────────────────────────────┐
             │            RabbitMQ                │
             │   (Events and Message Queues)      │
             └───────────────────┬───────────────┘
                                 │
                                 ▼
                      ┌────────────────────┐
                      │ Notification Service│
                      └──────────┬─────────┘
                                 │
                 ┌───────────────┴────────────────┐
                 │                                │
                 ▼                               ▼
        ┌────────────────┐             ┌─────────────────┐
        │   Email        │             │  Push           │
        │  Delivery      │             │  Notification   │
        └────────────────┘             └─────────────────┘
```

### 7.3. Пример реализации

```javascript
// Пример генерации события в Game Service
async joinGame(gameId, userId) {
  // ... логика присоединения к игре ...
  
  // Публикация события
  await messageBroker.publish('game.player.joined', {
    gameId,
    userId,
    timestamp: new Date()
  });
  
  return game;
}

// Пример обработчика событий в Notification Service
messageBroker.subscribe('game.player.joined', async (data) => {
  const { gameId, userId, timestamp } = data;
  
  // Получение информации об игре и пользователе
  const game = await gameService.getGameById(gameId);
  const user = await userService.getUserById(userId);
  
  // Создание уведомления для создателя игры
  if (game.creator.toString() !== userId) {
    await notificationRepository.create({
      user: game.creator,
      game: gameId,
      type: 'player_joined',
      message: `${user.username} присоединился к вашей игре в ${game.sportType}`,
      isRead: false,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    // Отправка push-уведомления, если включено
    const creator = await userService.getUserById(game.creator);
    if (creator.notifications.push) {
      await pushService.sendNotification(
        creator.pushToken,
        'Новый участник игры',
        `${user.username} присоединился к вашей игре в ${game.sportType}`
      );
    }
  }
  
  // Создание уведомления для пользователя
  await notificationRepository.create({
    user: userId,
    game: gameId,
    type: 'player_joined',
    message: `Вы присоединились к игре в ${game.sportType} (${game.format})`,
    isRead: false,
    createdAt: timestamp,
    updatedAt: timestamp
  });
});
```

### 7.4. Планировщик для напоминаний

Для отправки напоминаний о предстоящих играх используется планировщик задач:

```javascript
// Пример планировщика на основе node-cron
const cron = require('node-cron');
const { Game, User } = require('../models');
const notificationService = require('./notificationService');

// Запуск задачи каждый час
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  
  // Поиск предстоящих игр в ближайшие 24 часа
  const upcomingGames = await Game.find({
    status: 'scheduled',
    dateTime: {
      $gt: now,
      $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
    }
  }).populate('currentPlayers.user');
  
  for (const game of upcomingGames) {
    for (const player of game.currentPlayers) {
      const user = player.user;
      const reminderTime = user.notifications.reminderTime || 60; // минут
      
      // Проверка времени для отправки напоминания
      const gameTime = new Date(game.dateTime);
      const reminderThreshold = new Date(gameTime.getTime() - reminderTime * 60 * 1000);
      
      if (now >= reminderThreshold && now <= gameTime) {
        // Создание уведомления-напоминания
        await notificationService.createNotification({
          user: user._id,
          game: game._id,
          type: 'game_reminder',
          message: `Напоминание: Игра в ${game.sportType} (${game.format}) начнется через ${reminderTime} минут`,
          scheduledFor: gameTime
        });
        
        // Отправка push-уведомления, если включено
        if (user.notifications.push) {
          await pushService.sendNotification(
            user.pushToken,
            'Скоро начало игры',
            `Игра в ${game.sportType} (${game.format}) начнется через ${reminderTime} минут`
          );
        }
        
        // Отправка email, если включено
        if (user.notifications.email) {
          await emailService.sendGameReminder(
            user.email,
            {
              username: user.username,
              gameType: game.sportType,
              gameFormat: game.format,
              gameTime: game.dateTime,
              courtName: game.court.name,
              courtAddress: game.court.location.address
            }
          );
        }
      }
    }
  }
});
```

## 8. Интеграция с геолокационными сервисами

### 8.1. Геопространственные запросы

Для реализации поиска ближайших площадок используются геопространственные индексы MongoDB и запросы $near:

Для работы с географическими данными используются геопространственные индексы MongoDB:

```javascript
// Создание 2dsphere индекса для коллекции courts
db.courts.createIndex({ "location.coordinates": "2dsphere" });

// Пример запроса для поиска ближайших площадок
const findNearbyCourtService = async (lat, lng, radius, filters = {}) => {
  // Преобразование радиуса из километров в метры
  const radiusInMeters = radius * 1000;
  
  // Построение запроса
  const query = {
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: radiusInMeters
      }
    }
  };
  
  // Добавление дополнительных фильтров
  if (filters.sportTypes && filters.sportTypes.length) {
    query.sportTypes = { $in: filters.sportTypes };
  }
  
  if (filters.features) {
    for (const [key, value] of Object.entries(filters.features)) {
      query[`features.${key}`] = value;
    }
  }
  
  // Выполнение запроса
  const courts = await Court.find(query)
    .select('name location sportTypes features rating photos')
    .limit(20);
  
  // Расчет расстояния до каждой площадки и добавление в результат
  const courtsWithDistance = courts.map(court => {
    const courtObj = court.toObject();
    
    // Расчет расстояния
    const courtLat = court.location.coordinates[1];
    const courtLng = court.location.coordinates[0];
    const distance = calculateDistance(lat, lng, courtLat, courtLng);
    
    return {
      ...courtObj,
      distance // в км
    };
  });
  
  return {
    courts: courtsWithDistance,
    meta: {
      count: courtsWithDistance.length,
      radius
    }
  };
};

// Функция для расчета расстояния между двумя точками по координатам
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Радиус Земли в км
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
}

function toRad(value) {
  return value * Math.PI / 180;
}

### 8.2. Интеграция с картографическими сервисами

Для отображения карт и геокодирования адресов система интегрируется с Google Maps API:

```javascript
// Пример сервиса для геокодирования адресов
const { Client } = require('@googlemaps/google-maps-services-js');

const geocodingService = {
  client: new Client({}),
  
  async geocodeAddress(address) {
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });
      
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const { lat, lng } = result.geometry.location;
        
        return {
          coordinates: [lng, lat], // MongoDB ожидает [lng, lat]
          formattedAddress: result.formatted_address,
          placeId: result.place_id
        };
      }
      
      throw new Error('No results found');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Geocoding service failed');
    }
  },
  
  async reverseGeocode(lat, lng) {
    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: `${lat},${lng}`,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });
      
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return {
          address: response.data.results[0].formatted_address,
          addressComponents: response.data.results[0].address_components
        };
      }
      
      throw new Error('No results found');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Geocoding service failed');
    }
  }
};
```

### 8.3. Определение местоположения пользователя

Система предоставляет несколько методов для определения местоположения пользователя:

1. **HTML5 Geolocation API** - основной способ определения местоположения на клиенте
2. **IP-геолокация** - резервный метод для случаев, когда пользователь не дает разрешение на использование Geolocation API
3. **Ручной ввод адреса** - позволяет пользователю вручную указать свое местоположение

```javascript
// Пример обработки локации пользователя на сервере

// Эндпоинт для сохранения последнего известного местоположения пользователя
router.post('/api/v1/users/location', authenticate, async (req, res, next) => {
  try {
    const { lat, lng, accuracy, timestamp } = req.body;
    
    // Валидация входных данных
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_LOCATION',
          message: 'Latitude and longitude are required'
        }
      });
    }
    
    // Определение адреса по координатам
    let address = null;
    try {
      const geocodeResult = await geocodingService.reverseGeocode(lat, lng);
      address = geocodeResult.address;
    } catch (error) {
      console.warn('Failed to reverse geocode location:', error);
    }
    
    // Сохранение местоположения пользователя
    await User.findByIdAndUpdate(req.user.id, {
      lastLocation: {
        coordinates: [lng, lat],
        accuracy,
        address,
        updatedAt: timestamp || new Date()
      }
    });
    
    res.json({
      success: true,
      data: {
        location: {
          coordinates: [lng, lat],
          address
        }
      }
    });
  } catch (error) {
    next(error);
  }
});
