import rateLimit from 'express-rate-limit';

// 100 requests per hour per IP
export const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in ms
  max: 100,
  message: 'Too many requests from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false
});
