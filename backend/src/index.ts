import 'dotenv/config';
import app from './app.js';
import { startEvaluationCron } from './cron/evaluationCron.js';

const PORT = process.env.PORT || 5000;

// Start Cron Jobs
startEvaluationCron();

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});