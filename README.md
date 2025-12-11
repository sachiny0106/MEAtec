# Personal Habit Tracking & Streak Management REST API

A backend-only habit tracker API built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication**: Register and Login with JWT.
- **Habit Management**: Create, Read, Update, Delete habits.
- **Tracking**: Mark habits as completed for the day and view history.
- **Security**: Password hashing with bcrypt, route protection with JWT.
- **API Documentation**: Swagger UI at `/api-docs`

## Technologies

- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- JWT (JSON Web Tokens)
- Bcrypt
- Day.js
- Jest + Supertest (Testing)
- Swagger (API Documentation)

## Setup Instructions

1.  **Clone the repository**
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Environment Variables**
    Create a `.env` file in the root directory with the following content:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/habit-tracker
    JWT_SECRET=your_jwt_secret_key
    ```
4.  **Run the server**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

5.  **Run tests**
    ```bash
    npm test
    ```

6.  **API Documentation**
    Open `http://localhost:5000/api-docs` in your browser to view Swagger UI.

## API Endpoints

### Authentication

| Method | Endpoint | Description | Input |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register a new user | `{ "name": "John", "email": "john@example.com", "password": "123" }` |
| POST | `/api/auth/login` | Login user | `{ "email": "john@example.com", "password": "123" }` |

### Habits

*All habit routes require `Authorization: Bearer <token>` header.*

| Method | Endpoint | Description | Input |
| :--- | :--- | :--- | :--- |
| POST | `/api/habits` | Create a new habit | `{ "title": "Exercise", "description": "30 mins cardio", "frequency": "daily", "tags": ["health"], "reminderTime": "07:00" }` |
| GET | `/api/habits` | Get all habits (Paginated) | Query Params: `?page=1&tag=health` |
| GET | `/api/habits/:id` | Get a specific habit | - |
| PUT | `/api/habits/:id` | Update a habit | `{ "title": "Gym", "tags": ["fitness"] }` |
| DELETE | `/api/habits/:id` | Delete a habit | - |

### Tracking

*All tracking routes require `Authorization: Bearer <token>` header.*

| Method | Endpoint | Description | Input |
| :--- | :--- | :--- | :--- |
| POST | `/api/habits/:id/track` | Mark habit as done for today | - |
| GET | `/api/habits/:id/history` | Get last 7 days of logs | - |

## Database Schema

### User
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed)

### Habit
- `user`: ObjectId (Ref: User)
- `title`: String
- `description`: String
- `frequency`: String ('daily' | 'weekly')
- `streak`: Number
- `longestStreak`: Number
- `tags`: [String]
- `reminderTime`: String
- `createdAt`: Date

### TrackingLog
- `habit`: ObjectId (Ref: Habit)
- `date`: Date
- `completed`: Boolean
