import { Router } from 'express';
import {
  getProfile,
  updatePersonal,
  updateStatus,
  createEducation,
  updateEducation,
  deleteEducation,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  createSkill,
  deleteSkill,
  updatePreferences,
} from '../controllers/profile.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Manajemen profil pengguna
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Ambil profil lengkap user
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profil lengkap berhasil diambil
 */
router.get('/', getProfile);

/**
 * @swagger
 * /api/profile/personal:
 *   put:
 *     summary: Edit data diri (nama, email, tanggal lahir, nomor telepon)
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:      { type: string }
 *               email:     { type: string }
 *               birthDate: { type: string, format: date }
 *               phone:     { type: string }
 *     responses:
 *       200:
 *         description: Data diri berhasil diperbarui
 */
router.put('/personal', updatePersonal);

/**
 * @swagger
 * /api/profile/status:
 *   put:
 *     summary: Edit status & pekerjaan
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentStatus, statusSince]
 *             properties:
 *               currentStatus:
 *                 type: string
 *                 enum: [PELAJAR_SMA_SMK, MAHASISWA, FRESH_GRADUATE, BEKERJA, TIDAK_BEKERJA]
 *               statusSince:     { type: string, format: date }
 *               currentJobTitle: { type: string }
 *               currentJobDesc:  { type: string }
 *               institutionName: { type: string }
 *     responses:
 *       200:
 *         description: Status berhasil diperbarui
 */
router.put('/status', updateStatus);

/**
 * @swagger
 * /api/profile/education:
 *   post:
 *     summary: Tambah riwayat pendidikan
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [level, major, status]
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [SMA, SMK, D3, D4, S1, S2, S3, PROFESI]
 *               major:         { type: string }
 *               status:
 *                 type: string
 *                 enum: [LULUS, SEDANG_DITEMPUH]
 *               semester:      { type: integer }
 *               yearGraduated: { type: integer }
 *               institution:   { type: string }
 *     responses:
 *       201:
 *         description: Riwayat pendidikan berhasil ditambahkan
 */
router.post('/education', createEducation);

/**
 * @swagger
 * /api/profile/education/{id}:
 *   put:
 *     summary: Edit riwayat pendidikan
 *     tags: [Profile]
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
 *         description: Riwayat pendidikan berhasil diperbarui
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Data tidak ditemukan
 */
router.put('/education/:id', updateEducation);

/**
 * @swagger
 * /api/profile/education/{id}:
 *   delete:
 *     summary: Hapus riwayat pendidikan
 *     tags: [Profile]
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
 *         description: Riwayat pendidikan berhasil dihapus
 */
router.delete('/education/:id', deleteEducation);

/**
 * @swagger
 * /api/profile/experience:
 *   post:
 *     summary: Tambah riwayat pengalaman kerja
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workType, jobTitle, duration]
 *             properties:
 *               workType:
 *                 type: string
 *                 enum: [FORMAL, SERABUTAN, WIRAUSAHA, FREELANCE, PNS, TNI_POLRI, MAGANG, SUKARELAWAN, IRT, TIDAK_BEKERJA]
 *               jobTitle:    { type: string }
 *               companyName: { type: string }
 *               duration:    { type: string, example: "Jan 2022 – Mar 2024" }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Pengalaman kerja berhasil ditambahkan
 */
router.post('/experience', createWorkExperience);

/**
 * @swagger
 * /api/profile/experience/{id}:
 *   put:
 *     summary: Edit riwayat pengalaman kerja
 *     tags: [Profile]
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
 *         description: Pengalaman kerja berhasil diperbarui
 */
router.put('/experience/:id', updateWorkExperience);

/**
 * @swagger
 * /api/profile/experience/{id}:
 *   delete:
 *     summary: Hapus riwayat pengalaman kerja
 *     tags: [Profile]
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
 *         description: Pengalaman kerja berhasil dihapus
 */
router.delete('/experience/:id', deleteWorkExperience);

/**
 * @swagger
 * /api/profile/skills:
 *   post:
 *     summary: Tambah keahlian baru
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, level]
 *             properties:
 *               name:
 *                 type: string
 *                 example: React.js
 *               category:
 *                 type: string
 *                 enum: [TEKNIS, NON_TEKNIS]
 *               level:
 *                 type: string
 *                 enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *     responses:
 *       201:
 *         description: Keahlian berhasil ditambahkan
 *       409:
 *         description: Keahlian sudah ada
 */
router.post('/skills', createSkill);

/**
 * @swagger
 * /api/profile/skills/{id}:
 *   delete:
 *     summary: Hapus keahlian
 *     tags: [Profile]
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
 *         description: Keahlian berhasil dihapus
 */
router.delete('/skills/:id', deleteSkill);

/**
 * @swagger
 * /api/profile/preferences:
 *   put:
 *     summary: Edit preferensi belajar & karier
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               techSavvyLevel:
 *                 type: string
 *                 enum: [RENDAH, MENENGAH, TINGGI, SANGAT_TINGGI]
 *               learningStyle:
 *                 type: string
 *                 enum: [VISUAL, AUDITORI, PRAKTIK_LANGSUNG, MEMBACA_MENULIS]
 *               workEnvPreference:
 *                 type: string
 *                 enum: [INDIVIDU, TIM_KECIL, TIM_BESAR, FLEKSIBEL]
 *               companyTypePreference:
 *                 type: string
 *                 enum: [STARTUP, KORPORAT, FREELANCE, TECH_COMPANY, BELUM_TERPIKIRKAN]
 *               weeklyHoursRange:
 *                 type: string
 *                 enum: [LESS_THAN_5, FIVE_TO_10, TEN_TO_20, MORE_THAN_20]
 *               weeklyHours:        { type: integer }
 *               preferredStudyTime:
 *                 type: array
 *                 items: { type: string }
 *               monthlyIncome:
 *                 type: string
 *                 enum: [LESS_THAN_1M, ONE_TO_3M, THREE_TO_7M, SEVEN_TO_12M, MORE_THAN_12M]
 *     responses:
 *       200:
 *         description: Preferensi berhasil diperbarui
 */
router.put('/preferences', updatePreferences);

export default router;