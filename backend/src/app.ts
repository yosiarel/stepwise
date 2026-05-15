import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { setupSwagger } from './swagger.js';
import authRouter from './routes/authRoute.js';
import cvRouter from './routes/cvRoute.js';
import assessmentRouter from './routes/assessmentRoute.js';
import recommendationRouter from './routes/recommendationRoute.js';
import roadmapRouter from './routes/roadmapRoute.js';
import trackerRouter from './routes/trackerRoute.js';
import evaluationRouter from './routes/evaluationRoute.js';
import advisorRouter from './routes/advisorRoute.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

app.use(cors());
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
