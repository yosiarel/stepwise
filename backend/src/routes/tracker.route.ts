import { Router } from 'express';
import {
  getTrackerSummary,
  getTrackerActivity,
  getTrackerPhases,
} from '../controllers/tracker.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tracker
 *   description: Progress tracker belajar user
 */

/**
 * @swagger
 * /api/tracker/summary:
 *   get:
 *     summary: Ringkasan lengkap progress belajar user
 *     tags: [Tracker]
 *     security:
 *       - cookieAuth: []
 *     description: >
 *       Mengembalikan: overall progress (%), streak belajar,
 *       dan proyeksi kapan user akan selesai roadmap.
 *     responses:
 *       200:
 *         description: Ringkasan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     roadmapId:       { type: string }
 *                     professionTitle: { type: string }
 *                     overallProgress:
 *                       type: object
 *                       properties:
 *                         completed: { type: integer }
 *                         total:     { type: integer }
 *                         percent:   { type: integer }
 *                     streak:
 *                       type: object
 *                       properties:
 *                         currentStreak: { type: integer, description: "Hari belajar berturut-turut saat ini" }
 *                         longestStreak: { type: integer, description: "Rekor streak terpanjang" }
 *                     projection:
 *                       type: object
 *                       properties:
 *                         averagePerDay:       { type: number }
 *                         estimatedDaysLeft:   { type: integer, nullable: true }
 *                         projectedFinishDate: { type: string, format: date, nullable: true }
 *                         onTrackStatus:       { type: string, enum: [AHEAD, ON_TRACK, BEHIND, NO_DATA] }
 *       404:
 *         description: Belum ada roadmap aktif
 */
router.get('/summary', getTrackerSummary);

/**
 * @swagger
 * /api/tracker/activity:
 *   get:
 *     summary: Data aktivitas belajar harian (untuk chart)
 *     tags: [Tracker]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *           default: 7
 *         description: Jumlah hari ke belakang yang ingin ditampilkan (max 30)
 *     responses:
 *       200:
 *         description: Data aktivitas berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     period: { type: integer }
 *                     activity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:  { type: string, format: date }
 *                           count: { type: integer }
 *       404:
 *         description: Belum ada roadmap aktif
 */
router.get('/activity', getTrackerActivity);

/**
 * @swagger
 * /api/tracker/phases:
 *   get:
 *     summary: Progress breakdown per fase belajar
 *     tags: [Tracker]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Breakdown fase berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     phases:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           phase:     { type: string, example: "Fondasi" }
 *                           completed: { type: integer }
 *                           total:     { type: integer }
 *                           status:    { type: string, enum: [Selesai, Berjalan, Belum Dimulai] }
 *       404:
 *         description: Belum ada roadmap aktif
 */
router.get('/phases', getTrackerPhases);

export default router;
