import jwt from 'jsonwebtoken';
import type { JwtAccessPayload, JwtRefreshPayload } from '../../types/auth.js';
 
const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
 
export const signAccessToken = (payload: JwtAccessPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
};
 
export const verifyAccessToken = (token: string): JwtAccessPayload => {
  return jwt.verify(token, ACCESS_SECRET) as JwtAccessPayload;
};
 
export const signRefreshToken = (payload: JwtRefreshPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
};
 
export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JwtRefreshPayload;
};
 