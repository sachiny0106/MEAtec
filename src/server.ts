import app from './app';
import dotenv from 'dotenv';
import connectDB from './config/db';

// load env vars first
dotenv.config();

const PORT = process.env.PORT || 5000;

// connect to mongodb then start server
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});
