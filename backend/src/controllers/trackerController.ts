import type { Request, Response, NextFunction } from 'express';
import {
  getTrackerSummaryService,
  getTrackerActivityService,
  getTrackerPhasesService,
} from '../services/trackerService.js';

export const getTrackerSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const result = await getTrackerSummaryService(userId);

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const getTrackerActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId  = req.user!.sub;
    const rawDays = parseInt(req.query['days'] as string ?? '7', 10);
    const days    = isNaN(rawDays) || rawDays < 1 ? 7 : Math.min(rawDays, 30);

    const result = await getTrackerActivityService(userId, days);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const getTrackerPhases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const result = await getTrackerPhasesService(userId);

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};
