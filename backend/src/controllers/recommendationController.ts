import type { Request, Response, NextFunction } from 'express';
import {
  getOrGenerateRecommendationService,
  selectCareerService,
  getSelectedCareerService,
} from '../services/recommendationService.js';

export const getOrGenerateRecommendation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.sub;
    const result = await getOrGenerateRecommendationService(userId);

    res.status(200).json({
      message: result.isNew
        ? 'Rekomendasi karier berhasil dibuat.'
        : 'Menampilkan rekomendasi yang sudah ada.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const selectCareer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const result = await selectCareerService(userId, req.body);

    res.status(200).json({
      message: result.message,
      data:    result.recommendation,
    });
  } catch (err) {
    next(err);
  }
};

export const getSelectedCareer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const result = await getSelectedCareerService(userId);

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};