import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { setupSwagger } from './swagger.js';
import authRouter from './routes/authRoute.js';
import cvRouter from './routes/cvRoute.js';
import assessmentRouter from './routes/assessmentRoute.js';
import recommendationRouter from './routes/recommendationRoute.js';
import roadmapRouter from './routes/roadmapRoute.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

setupSwagger(app);

app.use('/api/auth', authRouter);
app.use('/api/cv', cvRouter);
app.use('/api/assessment', assessmentRouter);
app.use('/api/recommendation', recommendationRouter);
app.use('/api/roadmap', roadmapRouter);


app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});