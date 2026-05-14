import { Router } from 'express';
import {
  getOrGenerateRecommendation,
  selectCareer,
  getSelectedCareer,
} from '../controllers/recommendationController.js';
import { authenticate } from '../middlewares/authenticateMiddleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Recommendation
 *   description: Rekomendasi karier IT berbasis AI
 */

/**
 * @swagger
 * /api/recommendation:
 *   get:
 *     summary: Ambil rekomendasi karier aktif atau generate baru via Gemini
 *     tags: [Recommendation]
 *     security:
 *       - cookieAuth: []
 *     description: >
 *       Jika sudah ada rekomendasi aktif di DB, langsung dikembalikan.
 *       Jika belum, generate baru via Gemini berdasarkan profil user.
 *       Profil harus sudah lengkap (CV + asesmen) sebelum memanggil endpoint ini.
 *     responses:
 *       200:
 *         description: Rekomendasi berhasil dikembalikan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     isNew:       { type: boolean }
 *                     sessionId:   { type: string }
 *                     disclaimer:  { type: string }
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:               { type: string }
 *                           rank:             { type: integer }
 *                           professionTitle:  { type: string }
 *                           readinessPercent: { type: integer }
 *                           ownedSkills:      { type: array, items: { type: string } }
 *                           missingSkills:    { type: array, items: { type: string } }
 *                           reasonSummary:    { type: string }
 *                           isSelected:       { type: boolean }
 *                           professionOverview:
 *                             type: object
 *                             properties:
 *                               dailyTasks:       { type: array, items: { type: string } }
 *                               companyTypes:     { type: array, items: { type: string } }
 *                               longTermProspect: { type: string }
 *       400:
 *         description: Profil belum lengkap
 *       422:
 *         description: AI gagal menghasilkan rekomendasi
 */
router.get('/', getOrGenerateRecommendation);

/**
 * @swagger
 * /api/recommendation/selected:
 *   get:
 *     summary: Ambil target karier yang sedang dipilih user
 *     tags: [Recommendation]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Target karier aktif berhasil diambil
 *       404:
 *         description: Belum ada target karier yang dipilih
 */
router.get('/selected', getSelectedCareer);

/**
 * @swagger
 * /api/recommendation/select:
 *   post:
 *     summary: Pilih satu profesi sebagai target karier
 *     tags: [Recommendation]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recommendationId]
 *             properties:
 *               recommendationId:
 *                 type: string
 *                 description: ID dari CareerRecommendation yang dipilih
 *     responses:
 *       200:
 *         description: Target karier berhasil dipilih
 *       403:
 *         description: Rekomendasi bukan milik sesi aktif user
 *       404:
 *         description: Rekomendasi tidak ditemukan
 */
router.post('/select', selectCareer);

export default router;