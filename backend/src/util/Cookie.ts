import type { Response } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';

export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax', 
    maxAge: 15 * 60 * 1000, 
  });
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax', 
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    path: '/api/auth', 
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('access_token', {
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
  });
  res.clearCookie('refresh_token', { 
    path: '/api/auth',
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
  });
  res.clearCookie('refresh_jwt', { 
    path: '/api/auth',
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
  });
};