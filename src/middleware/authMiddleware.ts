import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../modal/User';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string };
  }
}

interface DecodedToken {
  userId: string;
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = { id: user._id.toString() };

    next();
  } catch (error) {
    next({
      status: 401,
      message: 'Invalid or expired token',
      error,
    });
  }
};
