import { Router } from 'express';
import { startSession, submitAnswer, getSessionSummary } from '../controllers/assessment.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Assessment
 *   description: Kuesioner adaptif hybrid
 */

/**
 * @swagger
 * /api/assessment/start:
 *   post:
 *     summary: Mulai sesi asesmen baru atau lanjutkan yang belum selesai
 *     tags: [Assessment]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sesi dimulai. Mengembalikan pertanyaan pertama (atau terakhir yang belum dijawab).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:  { type: string }
 *                     isResumed:  { type: boolean }
 *                     question:
 *                       type: object
 *                       properties:
 *                         key:       { type: string, example: "Q1" }
 *                         text:      { type: string }
 *                         helpText:  { type: string, nullable: true }
 *                         inputType: { type: string, enum: [single_choice, multi_choice, number, time_multi] }
 *                         options:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:              { type: string }
 *                               label:           { type: string }
 *                               value:           { type: string }
 *                               nextQuestionKey: { type: string, nullable: true }
 */
router.post('/start', startSession);

/**
 * @swagger
 * /api/assessment/{sessionId}/answer:
 *   post:
 *     summary: Submit satu jawaban dan dapatkan pertanyaan berikutnya
 *     tags: [Assessment]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [questionKey, answerValue]
 *             properties:
 *               questionKey:
 *                 type: string
 *                 example: Q1
 *               answerValue:
 *                 oneOf:
 *                   - type: string
 *                     example: SMA_SMK
 *                   - type: array
 *                     items:
 *                       type: string
 *                     example: ["morning", "evening"]
 *     responses:
 *       200:
 *         description: Jawaban tersimpan. Mengembalikan pertanyaan berikutnya atau isCompleted=true.
 *       400:
 *         description: Sesi sudah selesai
 *       404:
 *         description: Sesi atau pertanyaan tidak ditemukan
 */
router.post('/:sessionId/answer', submitAnswer);

/**
 * @swagger
 * /api/assessment/{sessionId}/summary:
 *   get:
 *     summary: Ambil ringkasan semua jawaban dalam satu sesi
 *     tags: [Assessment]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ringkasan jawaban berhasil diambil
 *       404:
 *         description: Sesi tidak ditemukan
 */
router.get('/:sessionId/summary', getSessionSummary);

export default router;