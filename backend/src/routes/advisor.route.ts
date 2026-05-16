import { Router } from 'express';
import { sendMessage, getHistory, clearHistory } from '../controllers/advisor.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Advisor
 *   description: AI Career Advisor — asisten karier personal berbasis konteks
 */

/**
 * @swagger
 * /api/advisor/chat:
 *   post:
 *     summary: Kirim pesan ke AI Career Advisor
 *     tags: [Advisor]
 *     security:
 *       - cookieAuth: []
 *     description: >
 *       AI Advisor memahami seluruh konteks pengguna (profil, target karier, roadmap,
 *       progres, evaluasi terakhir) dan dapat mengusulkan perubahan nyata.
 *       Jika ada usulan perubahan, field `proposal` akan terisi dan proposal
 *       otomatis masuk ke daftar PENDING untuk disetujui/ditolak user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Saya merasa roadmap saya terlalu padat, bisa dibantu?"
 *     responses:
 *       200:
 *         description: Respons AI berhasil diterima
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     reply:
 *                       type: string
 *                       description: Respons teks dari AI Advisor
 *                     proposal:
 *                       nullable: true
 *                       type: object
 *                       description: Usulan perubahan (null jika tidak ada)
 *                       properties:
 *                         type:
 *                           type: string
 *                           enum: [SCHEDULE_SPEED, ADD_MATERIAL, CHANGE_CAREER, REORDER_MATERIAL]
 *                         description:
 *                           type: string
 *                     history:
 *                       type: integer
 *                       description: Jumlah pesan dalam history saat ini
 *       400:
 *         description: Pesan kosong
 */
router.post('/chat', sendMessage);

/**
 * @swagger
 * /api/advisor/history:
 *   get:
 *     summary: Ambil history percakapan saat ini (in-memory, hilang saat refresh server)
 *     tags: [Advisor]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: History percakapan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           role:    { type: string, enum: [user, assistant] }
 *                           content: { type: string }
 */
router.get('/history', getHistory);

/**
 * @swagger
 * /api/advisor/history:
 *   delete:
 *     summary: Hapus history percakapan (mulai sesi baru)
 *     tags: [Advisor]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: History berhasil dihapus
 */
router.delete('/history', clearHistory);

export default router;