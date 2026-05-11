import type { Request, Response, NextFunction } from 'express';
import {
  uploadCvService,
  extractCvService,
  reviewCvService,
  getCvListService,
} from '../services/cvService.js';

export const uploadCv = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'File CV wajib diunggah' });
      return;
    }

    const userId = (req as any).user.sub;
    const result = await uploadCvService(userId, req.file);

    res.status(201).json({
      message: 'CV berhasil diunggah. Lanjutkan dengan ekstraksi.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const extractCv = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.sub;
    const cvId   = req.params.id as string;
    const result = await extractCvService(userId, cvId);

    res.status(200).json({
      message: 'Ekstraksi CV berhasil.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const reviewCv = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.sub;
    const cvId   = req.params.id as string;
    const result = await reviewCvService(userId, cvId, req.body);

    res.status(200).json({
      message: result.message,
      data: result.profile,
    });
  } catch (err) {
    next(err);
  }
};

export const getCvList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.sub;
    const data   = await getCvListService(userId);

    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};