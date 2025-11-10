# GoWaay Backend API

RESTful API server built with Node.js, Express, TypeScript, and MongoDB.

## Features

- 🚀 **Node.js** with **Express** framework
- 🔷 **TypeScript** for type safety
- 🍃 **MongoDB** with **Mongoose** ODM
- ✅ **Zod** for request validation
- 🔐 **JWT** authentication
- 💳 **SSLCOMMERZ** payment integration
- 🔥 **Firebase Admin** SDK
- 🛡️ **Security** middleware (Helmet, CORS, Rate Limiting)
- 📝 **Comprehensive logging**

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- MongoDB
- Git

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Setup environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **API will be available at**
   - Base URL: http://localhost:8080
   - Health Check: http://localhost:8080/health

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/thakajabe

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# SSLCOMMERZ Configuration
SSL_STORE_ID=your_ssl_store_id
SSL_STORE_PASSWD=your_ssl_store_password
SSL_SUCCESS_URL=https://thakajabe.com/payment/success
SSL_FAIL_URL=https://thakajabe.com/payment/fail
SSL_CANCEL_URL=https://thakajabe.com/payment/cancel
SSL_IPN_URL=https://api.thakajabe.com/payments/ssl/ipn

# Analytics & Tracking
FB_PIXEL_ACCESS_TOKEN=your_facebook_pixel_access_token
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
TIKTOK_PIXEL_ID=your_tiktok_pixel_id
TIKTOK_TEST_EVENT_CODE=your_tiktok_test_event_code

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_FIREBASE_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## Project Structure

```
gowaay-server/
├── src/
│   ├── controllers/       # Route controllers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── productController.ts
│   │   ├── paymentController.ts
│   │   └── uploadController.ts
│   ├── middleware/        # Custom middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── notFound.ts
│   │   └── validateRequest.ts
│   ├── models/            # Mongoose models
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   └── Payment.ts
│   ├── routes/            # API routes
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── products.ts
│   │   ├── payments.ts
│   │   └── uploads.ts
│   └── index.ts           # Server entry point
├── uploads/               # File uploads directory
└── ...
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/profile` | Get user profile | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/users` | Get all users | Yes | Admin |
| GET | `/api/users/:id` | Get user by ID | Yes | - |
| PUT | `/api/users/:id` | Update user | Yes | Owner/Admin |
| DELETE | `/api/users/:id` | Delete user | Yes | Admin |

### Product Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/products` | Get products | No | - |
| GET | `/api/products/:id` | Get product by ID | No | - |
| POST | `/api/products` | Create product | Yes | Seller/Admin |
| PUT | `/api/products/:id` | Update product | Yes | Seller/Admin |
| DELETE | `/api/products/:id` | Delete product | Yes | Admin |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/ssl/create` | Create SSLCOMMERZ payment | Yes |
| POST | `/api/payments/ssl/verify` | Verify payment | No |
| POST | `/api/payments/ssl/ipn` | SSLCOMMERZ IPN handler | No |
| GET | `/api/payments/status/:transactionId` | Get payment status | Yes |

### Upload Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/uploads/image` | Upload image | Yes |
| DELETE | `/api/uploads/image/:filename` | Delete image | Yes |

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Request validation with Zod
- **Password Hashing** - bcrypt for password security
- **Error Handling** - Comprehensive error management

## Database Models

### User
- Authentication and profile management
- Role-based access control (user, seller, admin)
- Address and contact information

### Product
- Product catalog management
- Category and subcategory organization
- Inventory tracking
- Rating and review system

### Payment
- Payment processing with SSLCOMMERZ
- Transaction tracking
- Refund management

## Deployment

This backend is designed to be deployed on Ubuntu 24.04 VPS with PM2. See the main [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
