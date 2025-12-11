import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

interface DecodedToken {
  id: string;
}

// protect routes - check for valid JWT in Authorization header
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'secret'
      ) as DecodedToken;

      // attach user to request (without password)
      req.user = await User.findById(decoded.id).select('-password') || undefined;
      
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
