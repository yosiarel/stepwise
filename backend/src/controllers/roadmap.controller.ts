import type { Request, Response, NextFunction } from 'express';
import {
  generateRoadmapService,
  getActiveRoadmapService,
  completeMaterialService,
  getRoadmapProgressService,
} from '../services/roadmap.service.js';

export const generateRoadmap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const result = await generateRoadmapService(userId);

    res.status(201).json({
      message: 'Roadmap belajar berhasil dibuat!',
      data:    result,
    });
  } catch (err) {
    next(err);
  }
};

export const getActiveRoadmap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const result = await getActiveRoadmapService(userId);

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const completeMaterial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId     = req.user!.sub;
    const materialId = req.params.materialId as string;
    const result     = await completeMaterialService(userId, materialId);

    res.status(200).json({
      message: result.message,
      data:    result.material,
    });
  } catch (err) {
    next(err);
  }
};

export const getRoadmapProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const result = await getRoadmapProgressService(userId);

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};
