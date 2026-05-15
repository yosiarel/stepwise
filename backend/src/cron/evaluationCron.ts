import cron from 'node-cron';
import { findDueEvaluations, createPendingEvaluation, createNotification } from '../repositories/evaluationRepository.js';
import { sendEmail, buildEvaluationReminderEmail } from '../util/Email.js';
import { prisma } from '../lib/prisma.js';

const calcReadiness = (completed: number, total: number): number =>
  total > 0 ? Math.round((completed / total) * 100) : 0;

const processEvaluations = async () => {
  console.log('[Cron] Checking due evaluations...');

  try {
    const dueRoadmaps = await findDueEvaluations();
    console.log(`[Cron] Found ${dueRoadmaps.length} roadmap(s) due for evaluation.`);

    for (const roadmap of dueRoadmaps) {
      const userId = roadmap.userId;
      const user   = roadmap.user;

      const existingPending = await prisma.periodicEvaluation.findFirst({
        where: { userId, roadmapId: roadmap.id, status: 'PENDING' },
      });
      if (existingPending) continue;

      const materials = await prisma.roadmapMaterial.findMany({ where: { roadmapId: roadmap.id } });
      const total     = materials.length;
      const completed = materials.filter(m => m.isCompleted).length;
      const percent   = calcReadiness(completed, total);

      const evaluation = await createPendingEvaluation(userId, roadmap.id, {
        completedMaterials:    completed,
        totalMaterials:        total,
        readinessPercentAtEval: percent,
      });

      const recommendation = await prisma.careerRecommendation.findUnique({
        where: { id: roadmap.recommendationId },
      });
      const professionTitle = recommendation?.professionTitle ?? 'karier IT-mu';
      await createNotification({
        userId,
        type:  'EVALUATION_REMINDER',
        title: 'Waktunya evaluasi progres belajarmu!',
        body:  `Kamu sudah belajar selama beberapa waktu. Yuk isi refleksi singkat untuk memperbarui roadmap menuju ${professionTitle}.`,
        metadata: { evaluationId: evaluation.id, roadmapId: roadmap.id },
      });
      try {
        await sendEmail({
          to:      user.email,
          subject: '⏰ Waktunya evaluasi progres belajarmu di StepWise!',
          html:    buildEvaluationReminderEmail({
            name:            user.name,
            professionTitle,
            completedCount:  completed,
            totalCount:      total,
            percent,
          }),
        });
        console.log(`[Cron] Email sent to ${user.email}`);
      } catch (emailErr) {
        console.error(`[Cron] Failed to send email to ${user.email}:`, emailErr);
      }
    }

    console.log('[Cron] Evaluation check complete.');
  } catch (err) {
    console.error('[Cron] Error during evaluation check:', err);
  }
};

export const startEvaluationCron = () => {
  cron.schedule('0 1 * * *', processEvaluations, {
    timezone: 'Asia/Jakarta',
  });
  console.log('[Cron] Evaluation reminder cron started (daily at 08:00 WIB).');
};