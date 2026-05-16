import { Router } from 'express';
import {
  generateRoadmap,
  getActiveRoadmap,
  completeMaterial,
  getRoadmapProgress,
} from '../controllers/roadmap.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Roadmap
 *   description: Roadmap belajar personal berbasis AI
 */

/**
 * @swagger
 * /api/roadmap/generate:
 *   post:
 *     summary: Generate roadmap belajar baru berdasarkan target karier yang dipilih
 *     tags: [Roadmap]
 *     security:
 *       - cookieAuth: []
 *     description: >
 *       Membutuhkan: (1) rekomendasi karier dengan isSelected=true, (2) profil user yang sudah memiliki weeklyHours.
 *       Roadmap lama akan diarsipkan (status REPLACED) jika ada.
 *     responses:
 *       201:
 *         description: Roadmap berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     roadmapId:      { type: string }
 *                     professionTitle: { type: string }
 *                     totalMaterials: { type: integer }
 *                     weeklyHours:    { type: integer }
 *                     materials:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:          { type: string }
 *                           order:       { type: integer }
 *                           phase:       { type: string, enum: [Fondasi, Inti, Lanjutan] }
 *                           title:       { type: string }
 *                           description: { type: string }
 *                           scheduledAt: { type: string, format: date-time }
 *                           isCompleted: { type: boolean }
 *       400:
 *         description: Belum ada target karier atau profil belum lengkap
 *       422:
 *         description: AI gagal menghasilkan roadmap
 */
router.post('/generate', generateRoadmap);

/**
 * @swagger
 * /api/roadmap:
 *   get:
 *     summary: Ambil roadmap aktif beserta semua materi dan progress
 *     tags: [Roadmap]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Roadmap aktif berhasil diambil
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
 *                     status:          { type: string }
 *                     weeklyHours:     { type: integer }
 *                     progress:
 *                       type: object
 *                       properties:
 *                         completed: { type: integer }
 *                         total:     { type: integer }
 *                         percent:   { type: integer }
 *                     materials:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Belum ada roadmap aktif
 */
router.get('/', getActiveRoadmap);

/**
 * @swagger
 * /api/roadmap/progress:
 *   get:
 *     summary: Ambil ringkasan progress roadmap aktif
 *     tags: [Roadmap]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Progress berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     roadmapId: { type: string }
 *                     total:     { type: integer }
 *                     completed: { type: integer }
 *                     percent:   { type: integer }
 *       404:
 *         description: Belum ada roadmap aktif
 */
router.get('/progress', getRoadmapProgress);

/**
 * @swagger
 * /api/roadmap/material/{materialId}/complete:
 *   patch:
 *     summary: Tandai satu materi sebagai selesai
 *     tags: [Roadmap]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari RoadmapMaterial yang ingin diselesaikan
 *     responses:
 *       200:
 *         description: Materi berhasil ditandai selesai
 *       400:
 *         description: Materi sudah selesai sebelumnya
 *       403:
 *         description: Materi bukan milik roadmap user ini
 *       404:
 *         description: Materi tidak ditemukan
 */
router.patch('/material/:materialId/complete', completeMaterial);

export default router;
