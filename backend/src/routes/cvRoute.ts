import { Router } from 'express';
import { uploadCv, extractCv, reviewCv, getCvList } from '../controllers/cvController.js';
import { authenticate } from '../middlewares/authenticateMiddleware.js';
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: CV
 *   description: Upload dan ekstraksi data CV pengguna
 */

/**
 * @swagger
 * /api/cv:
 *   get:
 *     summary: Ambil riwayat upload CV milik user
 *     tags: [CV]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Daftar CV berhasil diambil
 *       401:
 *         description: Unauthorized
 */
router.get('/', getCvList);

/**
 * @swagger
 * /api/cv/upload:
 *   post:
 *     summary: Upload file CV (PDF)
 *     tags: [CV]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [cv]
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: File CV dalam format PDF (maks 5MB)
 *     responses:
 *       201:
 *         description: CV berhasil diunggah
 *       400:
 *         description: File tidak ditemukan atau bukan PDF
 *       401:
 *         description: Unauthorized
 */
router.post('/upload', uploadMiddleware.single('cv'), uploadCv);

/**
 * @swagger
 * /api/cv/{id}/extract:
 *   post:
 *     summary: Ekstrak data dari CV yang sudah diupload menggunakan Gemini AI
 *     tags: [CV]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari CvUpload
 *     responses:
 *       200:
 *         description: Ekstraksi berhasil, data siap untuk ditinjau
 *       404:
 *         description: CV tidak ditemukan
 *       422:
 *         description: CV tidak dapat dibaca (berbasis gambar atau format tidak standar)
 */
router.post('/:id/extract', extractCv);

/**
 * @swagger
 * /api/cv/{id}/review:
 *   put:
 *     summary: Simpan hasil review/koreksi data CV ke UserProfile
 *     tags: [CV]
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
 *             properties:
 *               educationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     institution: { type: string }
 *                     degree:      { type: string }
 *                     major:       { type: string }
 *                     year:        { type: string }
 *               workExperiences:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     company:     { type: string }
 *                     role:        { type: string }
 *                     duration:    { type: string }
 *                     description: { type: string }
 *               extractedSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       404:
 *         description: CV tidak ditemukan
 */
router.put('/:id/review', reviewCv);

export default router;