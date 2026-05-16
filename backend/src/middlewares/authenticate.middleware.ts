import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../util/Jwt.js';
import type { JwtAccessPayload } from '../../types/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtAccessPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies['access_token'];

  if (!token) {
    res.status(401).json({ message: 'Akses ditolak. Silakan login terlebih dahulu.' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token tidak valid atau sudah expired.' });
  }
};