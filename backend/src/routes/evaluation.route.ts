import { Router } from 'express';
import {
  triggerEvaluation,
  submitReflection,
  getPendingProposals,
  decideProposal,
  getNotifications,
  readNotification,
  getLastCompletedEvaluation,
  getPendingEvaluation,
} from '../controllers/evaluation.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Evaluation
 *   description: Evaluasi periodik dan penyesuaian roadmap
 */

/**
 * @swagger
 * /api/evaluation/trigger:
 *   post:
 *     summary: Trigger evaluasi baru (biasanya dipanggil manual atau otomatis)
 *     tags: [Evaluation]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Evaluasi siap diisi
 */
router.post('/trigger', triggerEvaluation);

/**
 * @swagger
 * /api/evaluation/submit:
 *   post:
 *     summary: Submit refleksi user dan dapatkan analisis AI
 *     tags: [Evaluation]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evaluationId
 *               - paceComfort
 *               - interestShifted
 *             properties:
 *               evaluationId:
 *                 type: string
 *               paceComfort:
 *                 type: string
 *                 enum: [too_fast, comfortable, too_slow]
 *               interestShifted:
 *                 type: boolean
 *               timeAvailabilityNote:
 *                 type: string
 *               freeNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refleksi tersimpan
 */
router.post('/submit', submitReflection);

/**
 * @swagger
 * /api/evaluation/proposals:
 *   get:
 *     summary: Ambil daftar usulan penyesuaian yang pending
 *     tags: [Evaluation]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Daftar proposal
 */
router.get('/proposals', getPendingProposals);

/**
 * @swagger
 * /api/evaluation/proposal/{id}/decide:
 *   patch:
 *     summary: Putuskan usulan (APPROVED/REJECTED)
 *     tags: [Evaluation]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decision
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Keputusan tersimpan
 */
router.patch('/proposal/:id/decide', decideProposal);

/**
 * @swagger
 * /api/evaluation/notifications:
 *   get:
 *     summary: Ambil notifikasi user
 *     tags: [Evaluation]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Daftar notifikasi
 */
router.get('/notifications', getNotifications);

/**
 * @swagger
 * /api/evaluation/notification/{id}/read:
 *   patch:
 *     summary: Tandai notifikasi sudah dibaca
 *     tags: [Evaluation]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifikasi dibaca
 */
router.patch('/notification/:id/read', readNotification);

router.get('/last-completed', getLastCompletedEvaluation);
router.get('/pending', getPendingEvaluation);

export default router;
