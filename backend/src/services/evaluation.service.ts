import { prisma } from '../lib/prisma.js';
import { nvidiaClient, NVIDIA_ROADMAP_MODEL } from '../lib/nvidia.js';
import {
  findPendingEvaluation,
  createPendingEvaluation,
  completeEvaluation,
  findEvaluationWithContext,
  createAdjustmentProposals,
  findPendingProposals,
  decideProposal,
  createNotification,
} from '../repositories/evaluation.repository.js';
import type { SubmitReflectionBody, AIEvaluationResult } from '../../types/evaluation.js';

const calcReadiness = (completed: number, total: number): number =>
  total > 0 ? Math.round((completed / total) * 100) : 0;


const buildEvaluationPrompt = (ctx: {
  professionTitle:     string;
  completedMaterials:  number;
  totalMaterials:      number;
  readinessPercent:    number;
  paceComfort:         string;
  interestShifted:     boolean;
  timeAvailabilityNote?: string | undefined;
  freeNotes?:          string | undefined;
  weeklyHours:         number;
  otherRecommendations: { id: string; professionTitle: string }[];
  materials: { title: string; phase: string; isCompleted: boolean; scheduledAt: Date | null }[];
}): string => `
Kamu adalah AI advisor di platform StepWise yang membantu pengguna mengevaluasi progres belajar IT mereka.
Analisis data berikut dan hasilkan usulan penyesuaian yang konkret dan empatik.

## DATA EVALUASI

**Target Profesi:** ${ctx.professionTitle}
**Progress:** ${ctx.completedMaterials}/${ctx.totalMaterials} materi (${ctx.readinessPercent}%)
**Kecepatan belajar dirasakan:** ${ctx.paceComfort}
**Minat bergeser:** ${ctx.interestShifted ? 'Ya' : 'Tidak'}
**Catatan ketersediaan waktu:** ${ctx.timeAvailabilityNote ?? '-'}
**Catatan bebas:** ${ctx.freeNotes ?? '-'}
**Jam belajar/minggu saat ini:** ${ctx.weeklyHours} jam

**Status materi:**
${ctx.materials.map(m =>
  `- [${m.isCompleted ? '✓' : ' '}] ${m.phase}: ${m.title}${m.scheduledAt ? ` (target: ${m.scheduledAt.toISOString().split('T')[0]})` : ''}`
).join('\n')}

**Alternatif profesi lain yang pernah direkomendasikan:**
${ctx.otherRecommendations.map(r => `- ${r.professionTitle} (id: ${r.id})`).join('\n') || 'Tidak ada'}

## INSTRUKSI OUTPUT

Analisis situasi user dan hasilkan usulan penyesuaian jika diperlukan.
Kembalikan HANYA JSON valid tanpa markdown:

{
  "summary": "2-3 kalimat analisis situasi user secara empatik",
  "adjustments": [
    {
      "type": "SCHEDULE_SPEED | REORDER_MATERIAL | ADD_MATERIAL | CHANGE_CAREER",
      "description": "penjelasan singkat usulan untuk ditampilkan ke user",
      "payload": {}
    }
  ]
}

Aturan payload per type:
- SCHEDULE_SPEED: { "newWeeklyHours": <angka> }
- REORDER_MATERIAL: {} (sistem akan minta AI susun ulang roadmap)
- ADD_MATERIAL: { "materialsToAdd": [{ "title": "...", "phase": "Inti|Lanjutan", "description": "..." }] }
- CHANGE_CAREER: { "newRecommendationId": "<id dari alternatif profesi di atas>" }

Aturan penting:
- Jika paceComfort "comfortable" dan tidak ada pergeseran minat → adjustments boleh kosong []
- Jika interestShifted true → pertimbangkan CHANGE_CAREER
- Jika paceComfort "too_slow" → pertimbangkan SCHEDULE_SPEED (turunkan jam) atau REORDER_MATERIAL
- Jika paceComfort "too_fast" → pertimbangkan SCHEDULE_SPEED (naikkan jam) atau ADD_MATERIAL
- Kembalikan HANYA JSON
`;

export const triggerEvaluationService = async (userId: string) => {
  const roadmap = await prisma.roadmap.findFirst({
    where:   { userId, status: 'ACTIVE' },
    include: { 
      materials: true,
      user: true,
      recommendation: true 
    },
  });

  if (!roadmap) {
    throw { status: 404, message: 'Belum ada roadmap aktif.' };
  }

  const existing = await findPendingEvaluation(userId, roadmap.id);
  if (existing) {
    return {
      message:      'Sudah ada evaluasi yang menunggu refleksimu.',
      evaluationId: existing.id,
      isNew:        false,
    };
  }

  const total     = roadmap.materials.length;
  const completed = roadmap.materials.filter(m => m.isCompleted).length;
  const percent   = calcReadiness(completed, total);

  const evaluation = await createPendingEvaluation(userId, roadmap.id, {
    completedMaterials:    completed,
    totalMaterials:        total,
    readinessPercentAtEval: percent,
  });

  // Kirim email (Untuk testing & integrasi)
  try {
    const { sendEmail, buildEvaluationReminderEmail } = await import('../util/Email.js');
    await sendEmail({
      to:      roadmap.user.email,
      subject: '⏰ Waktunya evaluasi progres belajarmu di StepWise!',
      html:    buildEvaluationReminderEmail({
        name:            roadmap.user.name,
        professionTitle: roadmap.recommendation.professionTitle,
        completedCount:  completed,
        totalCount:      total,
        percent,
      }),
    });
  } catch (emailErr) {
    console.error('Failed to send trigger email:', emailErr);
  }

  return {
    message:      'Evaluasi siap diisi. Email pengingat telah dikirim.',
    evaluationId: evaluation.id,
    isNew:        true,
    snapshot:     { completed, total, percent },
  };
};

export const submitReflectionService = async (
  userId: string,
  body:   SubmitReflectionBody
) => {
  if (!body || !body.evaluationId) {
    throw { status: 400, message: 'Data evaluasi tidak lengkap.' };
  }
  const { evaluationId, paceComfort, interestShifted, timeAvailabilityNote, freeNotes } = body;

  const evaluation = await findEvaluationWithContext(evaluationId);

  if (!evaluation) throw { status: 404, message: 'Evaluasi tidak ditemukan.' };
  if (evaluation.userId !== userId) throw { status: 403, message: 'Akses ditolak.' };
  if (evaluation.status === 'COMPLETED') throw { status: 400, message: 'Evaluasi sudah pernah diisi.' };

  await completeEvaluation(evaluationId, {
    paceComfort,
    interestShifted,
    timeAvailabilityNote,
    freeNotes,
  });

  const { roadmap, user } = evaluation;
  const weeklyHours = user.profile?.weeklyHours ?? 10;

  const otherRecs = await prisma.careerRecommendation.findMany({
    where: {
      sessionId: roadmap.recommendation.sessionId,
      isSelected: false,
    },
    select: { id: true, professionTitle: true },
  });

  const prompt = buildEvaluationPrompt({
    professionTitle:      roadmap.recommendation.professionTitle,
    completedMaterials:   evaluation.completedMaterials,
    totalMaterials:       evaluation.totalMaterials,
    readinessPercent:     evaluation.readinessPercentAtEval,
    paceComfort,
    interestShifted,
    timeAvailabilityNote,
    freeNotes,
    weeklyHours,
    otherRecommendations: otherRecs,
    materials:            roadmap.materials,
  });

  const completion = await nvidiaClient.chat.completions.create({
    model:       NVIDIA_ROADMAP_MODEL,
    messages:    [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens:  1024,
  });

  const rawText = completion.choices[0]?.message?.content?.trim() ?? '';
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

  let aiResult: AIEvaluationResult;
  try {
    aiResult = JSON.parse(cleaned);
  } catch {
    throw { status: 422, message: 'Gagal memproses analisis AI. Coba lagi.' };
  }

  if (aiResult.adjustments?.length) {
    await createAdjustmentProposals(
      userId,
      roadmap.id,
      evaluationId,
      aiResult.adjustments
    );

    await createNotification({
      userId,
      type:  'ADJUSTMENT_PROPOSAL',
      title: 'Ada usulan penyesuaian roadmap-mu',
      body:  aiResult.summary,
      metadata: { evaluationId, roadmapId: roadmap.id },
    });
  }

  return {
    summary:     aiResult.summary,
    adjustments: aiResult.adjustments ?? [],
    hasProposals: (aiResult.adjustments?.length ?? 0) > 0,
  };
};

export const getPendingProposalsService = async (userId: string) => {
  const proposals = await findPendingProposals(userId);
  return { proposals };
};
export const decideProposalService = async (
  userId:     string,
  proposalId: string,
  decision:   'APPROVED' | 'REJECTED'
) => {
  const proposal = await prisma.adjustmentProposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal)               throw { status: 404, message: 'Proposal tidak ditemukan.' };
  if (proposal.userId !== userId) throw { status: 403, message: 'Akses ditolak.' };
  if (proposal.decision !== 'PENDING') {
    throw { status: 400, message: 'Proposal sudah diputuskan sebelumnya.' };
  }

  const updated = await decideProposal(proposalId, decision);

  if (decision === 'APPROVED') {
    await executeApprovedProposal(proposal.roadmapId, updated);
  }

  return {
    message:  decision === 'APPROVED' ? 'Perubahan berhasil diterapkan.' : 'Usulan ditolak.',
    proposal: updated,
  };
};

const executeApprovedProposal = async (roadmapId: string, proposal: {
  type:    string;
  payload: unknown;
}) => {
  const payload = proposal.payload as Record<string, unknown>;

  switch (proposal.type) {
    case 'SCHEDULE_SPEED': {
      const newHours = payload.newWeeklyHours as number;
      if (newHours) {
        await prisma.roadmap.update({
          where: { id: roadmapId },
          data:  { weeklyHoursAtCreation: newHours },
        });
        const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
        if (roadmap) {
          await prisma.userProfile.update({
            where: { userId: roadmap.userId },
            data:  { weeklyHours: newHours },
          });
        }
      }
      break;
    }

    case 'ADD_MATERIAL': {
      const toAdd = payload.materialsToAdd as {
        title: string; phase: string; description: string
      }[] | undefined;

      if (toAdd?.length) {
        const lastMaterial = await prisma.roadmapMaterial.findFirst({
          where:   { roadmapId },
          orderBy: { order: 'desc' },
        });
        const startOrder = (lastMaterial?.order ?? 0) + 1;

        await prisma.roadmapMaterial.createMany({
          data: toAdd.map((m, i) => ({
            roadmapId,
            order:       startOrder + i,
            phase:       m.phase,
            title:       m.title,
            description: m.description,
          })),
        });
      }
      break;
    }

    case 'CHANGE_CAREER': {
      const newRecId = payload.newRecommendationId as string | undefined;
      if (newRecId) {
        const currentRoadmap = await prisma.roadmap.findUnique({
          where:   { id: roadmapId },
          include: { recommendation: { include: { session: true } } },
        });
        if (currentRoadmap) {
          await prisma.careerRecommendation.updateMany({
            where: { sessionId: currentRoadmap.recommendation.sessionId },
            data:  { isSelected: false },
          });
          await prisma.careerRecommendation.update({
            where: { id: newRecId },
            data:  { isSelected: true },
          });
          await prisma.roadmap.update({
            where: { id: roadmapId },
            data:  { status: 'REPLACED' },
          });
        }
      }
      break;
    }

    case 'REORDER_MATERIAL':
      break;
  }
};

export const getNotificationsService = async (userId: string) => {
  const { findUserNotifications } = await import('../repositories/evaluation.repository.js');
  return findUserNotifications(userId);
};

export const readNotificationService = async (userId: string, notificationId: string) => {
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif)                throw { status: 404, message: 'Notifikasi tidak ditemukan.' };
  if (notif.userId !== userId) throw { status: 403, message: 'Akses ditolak.' };

  const { markNotificationRead } = await import('../repositories/evaluation.repository.js');
  return markNotificationRead(notificationId);
};