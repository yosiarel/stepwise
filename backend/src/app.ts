import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { setupSwagger } from './swagger.js';
import authRouter from './routes/auth.route.js';
import cvRouter from './routes/cv.route.js';
import assessmentRouter from './routes/assessment.route.js';
import recommendationRouter from './routes/recommendation.route.js';
import roadmapRouter from './routes/roadmap.route.js';
import trackerRouter from './routes/tracker.route.js';
import evaluationRouter from './routes/evaluation.route.js';
import advisorRouter from './routes/advisor.route.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.get('/health', (_req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'ok' });
});

const frontendUrl = process.env.FRONTEND_URL || '*';

app.use(cors({
  origin: frontendUrl === '*' ? '*' : [frontendUrl],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json());
app.use(cookieParser());

setupSwagger(app);

app.use('/api/auth', authRouter);
app.use('/api/cv', cvRouter);
app.use('/api/assessment', assessmentRouter);
app.use('/api/recommendation', recommendationRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/tracker', trackerRouter);
app.use('/api/evaluation', evaluationRouter);
app.use('/api/advisor', advisorRouter);

app.use(errorHandler);

export default app;
