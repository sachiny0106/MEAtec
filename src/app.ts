import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/authRoutes';
import habitRoutes from './routes/habitRoutes';
import { limiter } from './middleware/rateLimiter';
import { notFound, errorHandler } from './middleware/errorHandler';
import swaggerSpec from './config/swagger';

const app = express();

// middleware setup
app.use(cors());
app.use(express.json());
app.use(limiter); // rate limit: 100 req/hr

// swagger docs - visit /api-docs to see the UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

// health check endpoint
app.get('/', (req, res) => {
  res.send('Habit Tracker API is running');
});

// error handling
app.use(notFound);
app.use(errorHandler);

export default app;
