# 🎯 Habit Tracker API

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A RESTful API for tracking daily habits with streak management, built with Node.js, Express, TypeScript, and MongoDB.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based auth with bcrypt password hashing |
| 📝 **Habit CRUD** | Create, read, update, delete habits |
| ✅ **Daily Tracking** | Mark habits complete (once per day) |
| 🔥 **Streaks** | Auto-calculated consecutive day streaks |
| 🏷️ **Tags & Filtering** | Organize habits with tags, filter by tag |
| 📄 **Pagination** | Paginated habit lists |
| ⏰ **Reminders** | Store reminder times for habits |
| 🛡️ **Rate Limiting** | 100 requests/hour per IP |
| 📚 **Swagger Docs** | Interactive API docs at `/api-docs` |
| 🧪 **Tested** | 13 unit tests with Jest |

---

## 🛠️ Tech Stack

<p>
  <img src="https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/-Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/-Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" />
  <img src="https://img.shields.io/badge/-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" />
</p>

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [API Endpoints](#-api-endpoints)
- [Example Usage](#-example-usage)
- [Database Schema](#-database-schema)
- [JWT Authentication](#-jwt-authentication)
- [Project Structure](#-project-structure)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/sachiny0106/MEAtec.git
cd MEAtec

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/habit-tracker
JWT_SECRET=your_super_secret_key_here
```

### Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build && npm start

# Run tests
npm test
```

🎉 **Server running at** `http://localhost:5000`  
📚 **API Docs at** `http://localhost:5000/api-docs`

---

## 📡 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & get token |

### 📝 Habits

> 🔒 All routes require `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/habits` | Create habit |
| `GET` | `/api/habits` | List habits (paginated) |
| `GET` | `/api/habits?tag=health` | Filter by tag |
| `GET` | `/api/habits/:id` | Get single habit |
| `PUT` | `/api/habits/:id` | Update habit |
| `DELETE` | `/api/habits/:id` | Delete habit |

### ✅ Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/habits/:id/track` | Mark done for today |
| `GET` | `/api/habits/:id/history` | Last 7 days logs |

---

## 💡 Example Usage

### 1️⃣ Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "mypassword123"
  }'
```

<details>
<summary>📤 Response</summary>

```json
{
  "_id": "6759a1b2c3d4e5f6a7b8c9d0",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
</details>

### 2️⃣ Create Habit

```bash
curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Morning Run",
    "description": "5km jog every morning",
    "frequency": "daily",
    "tags": ["health", "fitness"],
    "reminderTime": "07:00"
  }'
```

<details>
<summary>📤 Response</summary>

```json
{
  "_id": "6759b2c3d4e5f6a7b8c9d0e1",
  "user": "6759a1b2c3d4e5f6a7b8c9d0",
  "title": "Morning Run",
  "description": "5km jog every morning",
  "frequency": "daily",
  "streak": 0,
  "longestStreak": 0,
  "tags": ["health", "fitness"],
  "reminderTime": "07:00",
  "createdAt": "2025-12-11T10:00:00.000Z"
}
```
</details>

### 3️⃣ Track Habit

```bash
curl -X POST http://localhost:5000/api/habits/HABIT_ID/track \
  -H "Authorization: Bearer YOUR_TOKEN"
```

<details>
<summary>📤 Response</summary>

```json
{
  "log": {
    "_id": "6759c3d4e5f6a7b8c9d0e1f2",
    "habit": "6759b2c3d4e5f6a7b8c9d0e1",
    "date": "2025-12-11T00:00:00.000Z",
    "completed": true
  },
  "streak": 1,
  "longestStreak": 1
}
```
</details>

---

## 🗃️ Database Schema

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Habit    │       │ TrackingLog │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ _id         │──────<│ user        │       │ _id         │
│ name        │       │ _id         │──────<│ habit       │
│ email       │       │ title       │       │ date        │
│ password    │       │ description │       │ completed   │
│ createdAt   │       │ frequency   │       └─────────────┘
└─────────────┘       │ streak      │
                      │ longestStreak│
                      │ tags[]      │
                      │ reminderTime│
                      │ createdAt   │
                      └─────────────┘
```

---

## 🔑 JWT Authentication

1. **Register** or **Login** to get a token
2. Add to all protected requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Token expires in **30 days**

---

## 📁 Project Structure

```
src/
├── __tests__/          # Jest test files
├── config/
│   ├── db.ts           # MongoDB connection
│   └── swagger.ts      # Swagger config
├── controllers/
│   ├── authController.ts
│   └── habitController.ts
├── middleware/
│   ├── authMiddleware.ts
│   ├── errorHandler.ts
│   └── rateLimiter.ts
├── models/
│   ├── User.ts
│   ├── Habit.ts
│   └── TrackingLog.ts
├── routes/
│   ├── authRoutes.ts
│   └── habitRoutes.ts
├── utils/
│   └── generateToken.ts
├── app.ts
└── server.ts
```

---

## 🧪 Testing

```bash
npm test
```

```
✓ Auth Routes (4 tests)
✓ Habit Routes (9 tests)

Test Suites: 2 passed
Tests: 13 passed
```

---

## 📝 License

MIT © 2025

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/sachiny0106">Sachin</a>
</p>
