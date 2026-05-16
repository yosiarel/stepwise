import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentikasi pengguna
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrasi pengguna baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Budi Santoso
 *               email:
 *                 type: string
 *                 example: budi@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       409:
 *         description: Email sudah terdaftar
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: budi@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login berhasil. Access token & refresh token di-set via httpOnly cookie.
 *       401:
 *         description: Email atau password salah
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Perbarui access token menggunakan refresh token
 *     tags: [Auth]
 *     description: Refresh token dibaca dari httpOnly cookie. Menerapkan token rotation — refresh token lama langsung direvoke.
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui
 *       401:
 *         description: Refresh token tidak valid atau tidak ditemukan
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout pengguna
 *     tags: [Auth]
 *     description: Merevoke refresh token di DB dan menghapus semua auth cookie.
 *     responses:
 *       200:
 *         description: Logout berhasil
 */
router.post('/logout', logout);

export default router;