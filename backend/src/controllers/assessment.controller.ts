import type { Request, Response, NextFunction } from 'express';
import {
  startSessionService,
  submitAnswerService,
  getSessionSummaryService,
} from '../services/assessment.service.js';

export const startSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    const result = await startSessionService(userId);

    res.status(200).json({
      message: result.isResumed ? 'Melanjutkan sesi sebelumnya.' : 'Sesi baru dimulai.',
      data:    result,
    });
  } catch (err) {
    next(err);
  }
};

export const submitAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId    = req.user!.sub;
    const sessionId = req.params.sessionId as string;
    const result    = await submitAnswerService(userId, sessionId, req.body);

    res.status(200).json({
      message: result.isCompleted
        ? 'Asesmen selesai! Profil kamu telah diperbarui.'
        : 'Jawaban tersimpan.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getSessionSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId    = req.user!.sub;
    const sessionId = req.params.sessionId as string;
    const result    = await getSessionSummaryService(userId, sessionId);

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};