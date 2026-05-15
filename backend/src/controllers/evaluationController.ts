import type { Request, Response, NextFunction } from 'express';
import {
  triggerEvaluationService,
  submitReflectionService,
  getPendingProposalsService,
  decideProposalService,
  getNotificationsService,
  readNotificationService,
} from '../services/evaluationService.js';

export const triggerEvaluation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await triggerEvaluationService(req.user!.sub);
    res.status(200).json({ message: result.message, data: result });
  } catch (err) { next(err); }
};

export const submitReflection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await submitReflectionService(req.user!.sub, req.body);
    res.status(200).json({
      message: result.hasProposals
        ? 'Refleksi tersimpan. Ada beberapa usulan penyesuaian untukmu.'
        : 'Refleksi tersimpan. Roadmap-mu sudah on track!',
      data: result,
    });
  } catch (err) { next(err); }
};

export const getPendingProposals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getPendingProposalsService(req.user!.sub);
    res.status(200).json({ data: result });
  } catch (err) { next(err); }
};

export const decideProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { decision } = req.body as { decision: 'APPROVED' | 'REJECTED' };
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      res.status(400).json({ message: "decision harus 'APPROVED' atau 'REJECTED'" });
      return;
    }
    const result = await decideProposalService(req.user!.sub, req.params.id as string, decision);
    res.status(200).json({ message: result.message, data: result.proposal });
  } catch (err) { next(err); }
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getNotificationsService(req.user!.sub);
    res.status(200).json({ data });
  } catch (err) { next(err); }
};

export const readNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await readNotificationService(req.user!.sub, req.params.id as string);
    res.status(200).json({ data });
  } catch (err) { next(err); }
};