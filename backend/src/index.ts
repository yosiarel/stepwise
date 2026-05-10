import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';
import { setupSwagger } from './swagger.js'; // 1. Import Swagger

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 2. Inisialisasi Swagger
setupSwagger(app);

/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to StepWise API
 *     responses:
 *       200:
 *         description: Returns a welcome message.
 */
app.get('/', (req: Request, res: Response) => {
  console.log('GET / request received');
  res.send('Welcome to StepWise API! 🚀 (Updated)');
});

app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'success', 
      message: 'StepWise API is running and Database is connected! 🚀' 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});