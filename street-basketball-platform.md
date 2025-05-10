# Backend Architecture Documentation

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Passport.js with JWT
- **Validation:** express-validator
- **Logging:** Winston
- **Documentation:** Swagger (swagger-ui-express)
- **Security:** Helmet, CORS, express-rate-limit

## Project Structure

```
backend/
├── src/
│   ├── config/          # Application configuration
│   │   ├── database.js
│   │   ├── passport.js
│   │   └── logger.js
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── models/          # Mongoose schemas
│   ├── dto/            # Data Transfer Objects
│   │   ├── ApiResponse.js
│   │   └── ApiError.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── routes/          # API routes
│   ├── helpers/         # Utility functions
│   │   └── errors/      # Custom error classes
│   └── app.js           # Application entry point
├── tests/               # Test files
├── docs/                # API documentation
└── logs/                # Application logs
```

## Architecture Layers

### 1. Controllers Layer
Handles HTTP requests and responses, delegates business logic to services.

```javascript
// Example: src/controllers/authController.js
class AuthController {
  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(ApiResponse.create(result));
    } catch (error) {
      next(error);
    }
  }
}
```

### 2. Services Layer
Contains business logic, coordinates between repositories.

```javascript
// Example: src/services/AuthService.js
class AuthService {
  static async register(userData) {
    // Validation and business logic
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw AppError.conflict('Email already exists');
    }
    
    // Create user
    const user = await UserRepository.create({
      ...userData,
      password: await bcrypt.hash(userData.password, 12)
    });
    
    return { token: this.generateToken(user), user };
  }
}
```

### 3. Repository Layer
Handles database operations and data access.

```javascript
// Example: src/repositories/UserRepository.js
class UserRepository {
  static async findByEmail(email) {
    return User.findOne({ email }).lean();
  }
  
  static async create(userData) {
    return User.create(userData);
  }
  
  static async findPaginated(page, pageSize) {
    // Pagination logic
  }
}
```

### 4. Model Layer
Defines data structure and validation using Mongoose.

```javascript
// Example: src/models/User.js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

## Data Transfer Objects (DTO)

### ApiResponse
Used for successful responses, optionally with pagination or warnings.

```javascript
// Structure
{
  "data": {}, // Main response data
  "meta": {},  // Metadata (pagination, warnings)
  "timestamp": "2025-05-10T15:30:00.000Z"
}

// Usage
res.status(200).json(ApiResponse.create(userData));
res.status(200).json(ApiResponse.paginated(items, page, pageSize, total));
res.status(207).json(ApiResponse.partial(data, ['Warning message']));
```

### ApiError
Used for error responses with consistent structure.

```javascript
// Structure
{
  "message": "User not found",
  "code": "NOT_FOUND",
  "details": {},
  "timestamp": "2025-05-10T15:30:00.000Z"
}

// Usage
res.status(404).json(ApiError.notFound('User'));
res.status(400).json(ApiError.validation(errors));
```

## Error Handling

### Custom Error Classes

```javascript
// src/helpers/AppError.js
class AppError extends Error {
  constructor(message, code = 'ERROR', details = null) {
    super(message);
    this.code = code;
    this.details = details;
  }
  
  static auth(message) {
    return new AppError(message, 'AUTH_ERROR');
  }
  
  static notFound(resource) {
    return new AppError(`${resource} not found`, 'NOT_FOUND');
  }
}
```

### Error Middleware
Centralized error handling with consistent response format.

```javascript
// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  logger.error({ error: err, request: req.url });
  
  // Map different error types to appropriate HTTP status and response
  const { statusCode, response } = mapErrorToResponse(err);
  
  res.status(statusCode).json(response);
};
```

## Authentication & Authorization

### JWT Strategy

```javascript
// src/config/passport.js
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    return user ? done(null, user) : done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));
```

### Auth Middleware

```javascript
// src/middleware/auth.js
const auth = (roles = []) => {
  return passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json(ApiError.forbidden());
    }
    next();
  };
};
```

## Validation

Using express-validator for input validation:

```javascript
// src/validators/AuthValidator.js
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  validate // Custom middleware to handle validation errors
];

// Usage in routes
router.post('/register', registerValidation, authController.register);
```

## Database Integration

### Mongoose Configuration

```javascript
// src/config/database.js
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
```

## API Documentation

Using Swagger for API documentation:

```javascript
// src/config/swagger.js
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0'
    }
  },
  apis: ['./src/routes/*.js']
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

## Logging

Winston configuration for structured logging:

```javascript
// src/config/logger.js
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

## Security

### Application Security Setup

```javascript
// src/config/security.js
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
}));
```

## Environment Configuration

### Required Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/myapp

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d

# Security
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info

# Server
PORT=5000
NODE_ENV=development
```

## API Response Formats

### Successful Response Examples

```json
// Simple success
{
  "data": { "id": "123", "name": "John Doe" },
  "timestamp": "2025-05-10T15:30:00.000Z"
}

// Paginated response
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100,
      "totalPages": 10
    }
  },
  "timestamp": "2025-05-10T15:30:00.000Z"
}

// Partial success (207 Multi-Status)
{
  "data": {
    "successful": [...],
    "failed": [...]
  },
  "meta": {
    "warnings": ["5 items failed to process"],
    "partialSuccess": true
  },
  "timestamp": "2025-05-10T15:30:00.000Z"
}
```

### Error Response Examples

```json
// Validation error (400)
{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Must be at least 6 characters"
  },
  "timestamp": "2025-05-10T15:30:00.000Z"
}

// Not found (404)
{
  "message": "User not found",
  "code": "NOT_FOUND",
  "timestamp": "2025-05-10T15:30:00.000Z"
}

// Authentication error (401)
{
  "message": "Invalid credentials",
  "code": "AUTH_ERROR",
  "timestamp": "2025-05-10T15:30:00.000Z"
}
```

## Testing Strategy

### Test Structure

```
tests/
├── unit/           # Unit tests for services, repositories
├── integration/    # Integration tests for controllers
├── fixtures/       # Test data
└── helpers/        # Test utilities
```

### Example Test

```javascript
// tests/integration/auth.test.js
describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user.email).toBe('test@example.com');
  });
});
```

## Deployment Considerations

1. **Environment Variables**: Use dotenv for development, proper secret management for production
2. **Database**: Ensure proper indexing and connection pooling
3. **Logging**: Configure log rotation and centralized logging for production
4. **Monitoring**: Implement health checks and performance monitoring
5. **Security**: Enable HTTPS, use strong JWT secrets, implement rate limiting

## Development Workflow

1. **Local Development**: Use nodemon for auto-restart on changes
2. **Code Quality**: ESLint and Prettier for consistent code style
3. **Git Hooks**: Pre-commit hooks for linting and testing
4. **Documentation**: Keep API documentation updated with changes

## Scaling Considerations

- **Horizontal Scaling**: Design for stateless servers
- **Database**: Use MongoDB replica sets for high availability
- **Caching**: Redis for session storage and API caching
- **Load Balancing**: Nginx or AWS ALB for distributing traffic
- **Background Jobs**: Queue system for async processing
