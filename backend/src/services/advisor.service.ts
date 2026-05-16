import { nvidiaClient, NVIDIA_ROADMAP_MODEL } from '../lib/nvidia.js';
import { buildAdvisorContext } from '../repositories/advisor.repository.js';
import type { ChatMessage, AdvisorContext } from '../../types/advisor.js';
import { createAdjustmentProposals } from '../repositories/evaluation.repository.js';
import { createNotification } from '../repositories/evaluation.repository.js';
import { prisma } from '../lib/prisma.js';

const MAX_HISTORY = 20;
const chatStore   = new Map<string, ChatMessage[]>();

const getHistory = (userId: string): ChatMessage[] =>
  chatStore.get(userId) ?? [];

const pushMessage = (userId: string, message: ChatMessage): void => {
  const history = getHistory(userId);
  history.push(message);

  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }

  chatStore.set(userId, history);
};

const buildSystemPrompt = (ctx: AdvisorContext): string => `
Kamu adalah AI Career Advisor di platform StepWise — asisten navigasi karier IT yang cerdas, empatik, dan proaktif.
Kamu bukan sekadar chatbot tanya-jawab. Kamu memahami SELURUH konteks perjalanan karier pengguna dan bisa mengusulkan perubahan nyata.

## IDENTITAS PENGGUNA

**Nama:** ${ctx.user.name}
**Kategori:** ${ctx.user.category ?? 'Belum diketahui'}
**Background IT:** ${ctx.profile?.itBackground ? 'Ada' : 'Tidak ada'}
**Skill yang dimiliki:** ${ctx.profile?.extractedSkills.join(', ') || 'Belum ada data'}
**Minat IT:** ${ctx.profile?.itInterests.join(', ') || 'Belum ditentukan'}
**Jam belajar/minggu:** ${ctx.profile?.weeklyHours ?? '?'} jam
**Waktu belajar favorit:** ${ctx.profile?.preferredStudyTime.join(', ') || 'Fleksibel'}

## TARGET KARIER

${ctx.selectedCareer
  ? `**Profesi Target:** ${ctx.selectedCareer.professionTitle}
**Kesiapan Kerja:** ${ctx.selectedCareer.readinessPercent}%
**Detail Skill Gap:**
${JSON.stringify(ctx.selectedCareer.skills, null, 2)}`
  : 'Belum memilih target karier.'}

## PROGRES ROADMAP

${ctx.roadmap
  ? `**Status:** ${ctx.roadmap.status}
**Progress:** ${ctx.roadmap.progress.completed}/${ctx.roadmap.progress.total} materi (${ctx.roadmap.progress.percent}%)
**Jam belajar saat roadmap dibuat:** ${ctx.roadmap.weeklyHours} jam/minggu
**Per fase:**
${ctx.roadmap.phases.map(p => `  - ${p.phase}: ${p.completed}/${p.total} selesai`).join('\n')}`
  : 'Belum ada roadmap aktif.'}

## EVALUASI TERAKHIR

${ctx.lastEvaluation
  ? `**Kecepatan belajar dirasakan:** ${ctx.lastEvaluation.paceComfort ?? '-'}
**Minat bergeser:** ${ctx.lastEvaluation.interestShifted ? 'Ya' : 'Tidak'}
**Catatan user:** ${ctx.lastEvaluation.freeNotes ?? '-'}
**Tanggal evaluasi:** ${ctx.lastEvaluation.createdAt.toLocaleDateString('id-ID')}`
  : 'Belum ada evaluasi.'}

## PANDUAN PERILAKU

1. Gunakan bahasa Indonesia yang hangat, jelas, dan tidak menggurui.
2. Selalu pertimbangkan konteks di atas sebelum menjawab — jangan berikan saran generik.
3. Kamu BOLEH dan DIANJURKAN mengusulkan perubahan konkret (ganti target karier, sesuaikan jadwal, tambah materi).
4. Jika kamu mengusulkan perubahan, SERTAKAN tag khusus di akhir responsmu dalam format JSON:
   <ADVISOR_ACTION>{"type":"SCHEDULE_SPEED|ADD_MATERIAL|CHANGE_CAREER|REORDER_MATERIAL","description":"...","payload":{}}</ADVISOR_ACTION>
5. Selalu ingatkan bahwa keputusan akhir ada di tangan pengguna.
6. Jika pengguna bertanya di luar konteks karier IT, arahkan kembali dengan sopan.
7. Respons maksimal 3-4 paragraf — padat dan actionable.
`.trim();

const parseAdvisorAction = (text: string): {
  cleanText: string;
  action: { type: string; description: string; payload: object } | null;
} => {
  const actionRegex = /<ADVISOR_ACTION>([\s\S]*?)<\/ADVISOR_ACTION>/;
  const match       = text.match(actionRegex);

  if (!match) return { cleanText: text, action: null };

  const cleanText = text.replace(actionRegex, '').trim();
  try {
    const action = JSON.parse(match[1]!);
    return { cleanText, action };
  } catch {
    return { cleanText, action: null };
  }
};

export const sendMessageService = async (userId: string, message: string) => {
  const context = await buildAdvisorContext(userId);
  const history = getHistory(userId);

  pushMessage(userId, { role: 'user', content: message });

  const systemPrompt = buildSystemPrompt(context);
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history,                                           
    { role: 'user' as const, content: message },
  ];

  const completion = await nvidiaClient.chat.completions.create({
    model:       NVIDIA_ROADMAP_MODEL,
    messages,
    temperature: 0.6,
    max_tokens:  1024,
    top_p:       0.9,
  });

  const rawResponse = completion.choices[0]?.message?.content?.trim() ?? '';
  const { cleanText, action } = parseAdvisorAction(rawResponse);

  pushMessage(userId, { role: 'assistant', content: cleanText });

  let proposal = null;
  if (action) {
    const activeRoadmap = await prisma.roadmap.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (activeRoadmap) {
      await createAdjustmentProposals(userId, activeRoadmap.id, null as any, [action]);

      await createNotification({
        userId,
        type:     'ADJUSTMENT_PROPOSAL',
        title:    'AI Advisor mengusulkan perubahan',
        body:     action.description,
        metadata: { roadmapId: activeRoadmap.id, triggeredByAdvisor: true },
      });

      proposal = {
        type:        action.type,
        description: action.description,
      };
    }
  }

  return {
    reply:    cleanText,
    proposal, 
    history:  getHistory(userId).length,
  };
};

export const clearHistoryService = (userId: string): void => {
  chatStore.delete(userId);
};

export const getHistoryService = (userId: string): ChatMessage[] => {
  return getHistory(userId);
};