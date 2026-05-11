import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma } from './lib/prisma.js';
import { setupSwagger } from './swagger.js';
import authRouter from './routes/authRouter.js';
import cvRouter from './routes/cvRoute.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

setupSwagger(app);

app.use('/api/auth', authRouter);
app.use('/api/cv', cvRouter);

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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});