import type { Request, Response, NextFunction } from 'express';
import {
  sendMessageService,
  clearHistoryService,
  getHistoryService,
} from '../services/advisorService.js';

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId  = req.user!.sub;
    const { message } = req.body as { message: string };

    if (!message?.trim()) {
      res.status(400).json({ message: 'Pesan tidak boleh kosong.' });
      return;
    }

    const result = await sendMessageService(userId, message.trim());

    res.status(200).json({
      data: {
        reply:    result.reply,
        proposal: result.proposal,
        history:  result.history,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getHistory = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId  = req.user!.sub;
    const history = getHistoryService(userId);
    res.status(200).json({ data: { history } });
  } catch (err) {
    next(err);
  }
};

export const clearHistory = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.sub;
    clearHistoryService(userId);
    res.status(200).json({ message: 'Riwayat percakapan berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
};