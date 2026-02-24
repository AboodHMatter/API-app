# Enterprise Learning Management API

A production-ready RESTful Backend API for an online learning management platform, built using **Node.js, Express, and MongoDB**. This API has been heavily refactored to support enterprise-grade security, extreme horizontal scalability, and flawless testing.

## 🌟 Project Overview

This platform serves courses to users, allowing users to register, login, securely upload avatars to AWS S3, and consume paginated course catalogs. Administrators can manage the course catalog. The API relies on stateless JWT authentication paired with robust token reuse detection strategies.

## 🏗️ Architecture Explanation

The application employs a strict **Layered Architecture** to separate concerns profoundly:

- **Routers**: Map HTTP verbiage to controller entrypoints while binding specific middleware pipelines (like validators or file uploders).
- **Controllers**: Strictly manage HTTP `req` and `res`. They format unified responses and never directly touch the database.
- **Services**: The core of the business logic. Handles hashing, token rotations, entity constructions, and error logic (`AppError`).
- **Repositories**: Abstract all Mongoose operations. Should the DB ever transition to PostgreSQL or another ORM, only the repositories need refactoring.
- **Models**: Defines strict Mongoose schema layouts, timestamps, and database indices.

### Folder Structure

```
project-root/
├── app.js                    // Express setup & middleware composition
├── server.js                 // DB connection & server initialization
├── config/                   // Env, Constants, DB, S3 configurations
├── controllers/              // HTTP Request/Response handling
├── docs/                     // Swagger configurations
├── middlewares/              // Request interceptors (auth, upload, error)
├── models/                   // Mongoose Schemas & Indices
├── repositories/             // Database abstraction layer
├── routers/                  // Express Routes
├── services/                 // Business Logic (Auth, Tokens, Users, Courses)
├── tests/                    // Jest Integration Tests
└── utils/                    // formatting, errors
```

## 🚀 How to Run Locally

### 1. Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Running locally or MongoDB Atlas)
- AWS Account (S3 access for uploads)

### 2. Environment Variables

Create a `.env` file in the root directory and populate it:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/learning-db
JWT_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
NODE_ENV=development

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_s3_bucket_name
```

### 3. Installation & Run

```bash
npm install
npm run run:dev
```

_Access API Docs:_ [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 🛡️ Security Improvements Added

- **Opaque Contexts**: Stack traces never leak in production. Utilizes unified custom `AppError` handling.
- **Enterprise JWT Strategy**:
  - Access tokens expire globally in 15 minutes.
  - Refresh tokens are generated cryptographically, hashed using SHA-256 in the database.
  - Refresh tokens are transmitted via highly secure **HttpOnly, SameSite, Secure Cookies** heavily mitigating XSS and CSRF vectors.
- **Token Reuse Attack Detection**: If a stolen refresh token is utilized by an attacker, the system immediately invalidates the entire session family, logging everyone out instantly and protecting the user account.
- **Rate Limiting & Helmet**: Prevents basic brute-force attacks and hides express-related HTTP headers.

## 📈 Scalability Explanation

- **Horizontal Server Scalability**: Fully achieved. The transition from local `diskStorage` to AWS S3 utilizing `multer-s3` ensures any server node can process an upload without causing a split-brain synchronization issue.
- **Cursor-Based Pagination**: `skip()` and `limit()` logic was eradicated. The API utilizes strictly monotonic `_id` cursor pagination querying, yielding lightning-fast database retrieval via optimal indexes (`{_id: -1, createdAt: -1}`), completely bypassing query scan degradations regardless of massive dataset sizes.

## 🧪 Testing Instructions

The API boasts high-coverage backend tests executing against an ephemeral `mongodb-memory-server` ensuring no bleeding mutations.

```bash
# Run unit & integration test suite
npm run test

# Run tests and generate full Coverage Report
npm run test:coverage
```

## 🚢 Deployment Instructions

1. Ensure `.env` is securely provided to the host machine/container.
2. Ensure you have Node `NODE_ENV=production` configured.
3. Start the process utilizing a manager like `pm2` or a Docker container entry point for automatic restarting.

```bash
pm2 start server.js --name "Learning-API"
```
