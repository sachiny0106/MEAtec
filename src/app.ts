import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes';
import habitRoutes from './routes/habitRoutes';
import { limiter } from './middleware/rateLimiter';
import swaggerSpec from './config/swagger';

const app = express();

app.use(cors());
app.use(express.json());

// Apply rate limiting to all requests
app.use(limiter);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

app.get('/', (req, res) => {
  res.send('Habit Tracker API is running');
});

export default app;
