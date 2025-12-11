import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

// global error handler - catches unhandled errors
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler for unknown routes
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};
