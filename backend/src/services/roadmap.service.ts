import { nvidiaClient, NVIDIA_ROADMAP_MODEL } from '../lib/nvidia.js';
import { prisma } from '../lib/prisma.js';
import {
  findActiveRoadmap,
  deactivateActiveRoadmaps,
  createRoadmapWithMaterials,
  findMaterialById,
  markMaterialComplete,
  getRoadmapProgressSummary,
} from '../repositories/roadmap.repository.js';
import type { RoadmapMaterialAI, RoadmapAIResponse } from '../../types/roadmap.js';
import type { SkillEntry } from '../../types/recommendation.js';

const formatSkillsContext = (skills: SkillEntry[]): { owned: string; gap: string } => {
  const owned = skills
    .filter(s => s.currentLevel !== null && s.currentLevel === s.targetLevel)
    .map(s => `${s.skillName} (${s.currentLevel})`)
    .join(', ') || 'Belum ada';

  const gap = skills
    .filter(s => s.currentLevel === null || s.currentLevel !== s.targetLevel)
    .map(s => {
      if (!s.currentLevel)
        return `${s.skillName}: Belum dikuasai → target ${s.targetLevel}`;
      return `${s.skillName}: ${s.currentLevel} → target ${s.targetLevel}`;
    })
    .join('\n') || 'Tidak ada gap';

  return { owned, gap };
};

const buildRoadmapPrompt = (params: {
  professionTitle:    string;
  skills:             SkillEntry[];
  weeklyHours:        number;
  preferredStudyTime: string[];
}): string => {
  const { owned, gap } = formatSkillsContext(params.skills);

  return `
Kamu adalah kurator roadmap pembelajaran IT yang berpengalaman.
Tugasmu adalah menyusun roadmap belajar yang terstruktur, realistis, dan personal.

## KONTEKS USER

**Target Profesi:** ${params.professionTitle}
**Skill yang Sudah Tercapai:** ${owned}
**Skill yang Perlu Ditingkatkan:**
${gap}
**Jam Belajar per Minggu:** ${params.weeklyHours} jam
**Waktu Belajar Favorit:** ${params.preferredStudyTime.join(', ') || 'Fleksibel'}

## INSTRUKSI

Susun roadmap materi pembelajaran dengan ketentuan:
1. Urutkan dari yang paling FUNDAMENTAL ke LANJUTAN (jangan melompat langkah)
2. Bagi ke dalam 3 fase: "Fondasi", "Inti", "Lanjutan"
3. "durationDays" = estimasi hari yang dibutuhkan berdasarkan ${params.weeklyHours} jam/minggu
4. Skill yang sudah tercapai tetap masukkan sebagai review singkat di "Fondasi" (durationDays max 3 hari)
5. Skill dengan gap besar (belum dikuasai → advanced) beri durationDays lebih panjang
6. Skill yang perlu ditingkatkan (beginner → advanced) beri durationDays menengah
7. Total materi: 8–15 item (proporsional dengan jumlah skill gap)
8. Judul materi harus spesifik, contoh: "Belajar Pandas untuk Manipulasi Data", bukan "Python"

Kembalikan HANYA JSON valid tanpa markdown dan tanpa komentar:

{
  "materials": [
    {
      "order": 1,
      "phase": "Fondasi",
      "title": "judul materi spesifik",
      "description": "Apa yang dipelajari dan mengapa penting untuk profesi ini",
      "durationDays": 7
    }
  ]
}
`;
};

const parseAIResponse = (raw: string): RoadmapAIResponse => {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned) as RoadmapAIResponse;
  } catch {
    throw { status: 422, message: 'Gagal memproses roadmap dari AI. Coba lagi.' };
  }
};

const calculateSchedule = (materials: RoadmapMaterialAI[]): Date[] => {
  const dates: Date[] = [];
  let cursor = new Date();

  for (const m of materials) {
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + m.durationDays);
    dates.push(new Date(cursor));
  }

  return dates;
};

export const generateRoadmapService = async (userId: string) => {
  const recommendation = await prisma.careerRecommendation.findFirst({
    where: {
      isSelected: true,
      session:    { userId, status: 'ACTIVE' },
    },
  });

  if (!recommendation) {
    throw {
      status:  400,
      message: 'Belum ada target karier yang dipilih. Pilih profesi dari rekomendasi terlebih dahulu.',
    };
  }

  const profile = await prisma.userProfile.findUnique({ where: { userId } });

  if (!profile?.weeklyHours) {
    throw {
      status:  400,
      message: 'Data profil belum lengkap. Pastikan asesmen sudah selesai.',
    };
  }

  // Cast skills dari Json ke SkillEntry[]
  const skills = (recommendation.skills ?? []) as SkillEntry[];

  const prompt = buildRoadmapPrompt({
    professionTitle:    recommendation.professionTitle,
    skills,
    weeklyHours:        profile.weeklyHours,
    preferredStudyTime: profile.preferredStudyTime,
  });

  const completion = await nvidiaClient.chat.completions.create({
    model:       NVIDIA_ROADMAP_MODEL,
    messages:    [{ role: 'user', content: prompt }],
    temperature: 0.4,
    top_p:       0.9,
    max_tokens:  2048,
  });

  const rawText = completion.choices[0]?.message?.content?.trim() ?? '';
  const parsed  = parseAIResponse(rawText);

  if (!parsed.materials?.length) {
    throw { status: 422, message: 'AI tidak menghasilkan roadmap yang valid.' };
  }

  const scheduledDates  = calculateSchedule(parsed.materials);
  const materialsToSave = parsed.materials.map((m, i) => ({
    order:       m.order,
    phase:       m.phase,
    title:       m.title,
    description: m.description ?? null,
    scheduledAt: scheduledDates[i] ?? null,
  }));

  await deactivateActiveRoadmaps(userId);

  const roadmap = await createRoadmapWithMaterials(
    userId,
    recommendation.id,
    profile.weeklyHours,
    materialsToSave
  );

  return {
    roadmapId:       roadmap.id,
    professionTitle: recommendation.professionTitle,
    totalMaterials:  roadmap.materials.length,
    weeklyHours:     profile.weeklyHours,
    materials:       roadmap.materials,
  };
};

export const getActiveRoadmapService = async (userId: string) => {
  const roadmap = await findActiveRoadmap(userId);

  if (!roadmap) {
    throw { status: 404, message: 'Belum ada roadmap aktif. Generate roadmap terlebih dahulu.' };
  }

  const total     = roadmap.materials.length;
  const completed = roadmap.materials.filter(m => m.isCompleted).length;
  const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    roadmapId:       roadmap.id,
    professionTitle: roadmap.recommendation.professionTitle,
    status:          roadmap.status,
    weeklyHours:     roadmap.weeklyHoursAtCreation,
    progress:        { completed, total, percent },
    materials:       roadmap.materials,
  };
};

export const completeMaterialService = async (userId: string, materialId: string) => {
  const material = await findMaterialById(materialId);

  if (!material) {
    throw { status: 404, message: 'Materi tidak ditemukan.' };
  }
  if (material.roadmap.userId !== userId) {
    throw { status: 403, message: 'Akses ditolak.' };
  }
  if (material.isCompleted) {
    throw { status: 400, message: 'Materi sudah ditandai selesai sebelumnya.' };
  }

  const updated = await markMaterialComplete(materialId);

  return {
    message:  `Materi "${updated.title}" berhasil ditandai selesai.`,
    material: updated,
  };
};

export const getRoadmapProgressService = async (userId: string) => {
  const progress = await getRoadmapProgressSummary(userId);

  if (!progress) {
    throw { status: 404, message: 'Belum ada roadmap aktif.' };
  }

  return progress;
};