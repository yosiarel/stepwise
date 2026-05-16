import type { Request, Response, NextFunction } from 'express';
import {
  registerService,
  loginService,
  refreshService,
  logoutService,
} from '../services/auth.service.js';
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
} from '../util/Cookie.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await registerService(req.body);
    res.status(201).json({
      message: 'Registrasi berhasil',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};


export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken, user } = await loginService(req.body);

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      message: 'Login berhasil',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawRefreshToken = req.cookies['refresh_token'];
    const refreshJwt      = req.cookies['refresh_jwt']; 

    if (!rawRefreshToken || !refreshJwt) {
      res.status(401).json({ message: 'Refresh token tidak ditemukan' });
      return;
    }

    const { accessToken, refreshToken: newRawToken, refreshJwt: newRefreshJwt } =
      await refreshService(rawRefreshToken, refreshJwt);

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, newRawToken);
    
    res.cookie('refresh_jwt', newRefreshJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.status(200).json({ message: 'Token berhasil diperbarui' });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawRefreshToken = req.cookies['refresh_token'];
    const refreshJwt      = req.cookies['refresh_jwt'];

    if (rawRefreshToken && refreshJwt) {
      await logoutService(refreshJwt, rawRefreshToken);
    }

    clearAuthCookies(res);
    res.status(200).json({ message: 'Logout berhasil' });
  } catch (err) {
    next(err);
  }
};