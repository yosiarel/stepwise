import type { Request, Response, NextFunction } from 'express';
 
interface AppError {
  status?: number;
  message?: string;
}
 
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status  = err.status  ?? 500;
  const message = err.message ?? 'Terjadi kesalahan pada server';
 
  res.status(status).json({ message });
};
 