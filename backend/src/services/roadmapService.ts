import { nvidiaClient, NVIDIA_ROADMAP_MODEL } from '../lib/nvidia.js';
import { prisma } from '../lib/prisma.js';
import {
  findActiveRoadmap,
  deactivateActiveRoadmaps,
  createRoadmapWithMaterials,
  findMaterialById,
  markMaterialComplete,
  getRoadmapProgressSummary,
} from '../repositories/roadmapRepository.js';
import type { RoadmapMaterialAI, RoadmapAIResponse } from '../../types/roadmap.js';


const buildRoadmapPrompt = (params: {
  professionTitle:    string;
  ownedSkills:        string[];
  missingSkills:      string[];
  weeklyHours:        number;
  preferredStudyTime: string[];
}): string => `
Kamu adalah kurator roadmap pembelajaran IT yang berpengalaman.
Tugasmu adalah menyusun roadmap belajar yang terstruktur, realistis, dan personal.

## KONTEKS USER

**Target Profesi:** ${params.professionTitle}
**Skill yang Sudah Dimiliki:** ${params.ownedSkills.join(', ') || 'Belum ada'}
**Skill yang Perlu Dipelajari:** ${params.missingSkills.join(', ')}
**Jam Belajar per Minggu:** ${params.weeklyHours} jam
**Waktu Belajar Favorit:** ${params.preferredStudyTime.join(', ') || 'Fleksibel'}

## INSTRUKSI

Susun roadmap materi pembelajaran dengan ketentuan:
1. Urutkan dari yang paling FUNDAMENTAL ke LANJUTAN (jangan melompat langkah)
2. Bagi ke dalam 3 fase: "Fondasi", "Inti", "Lanjutan"
3. "durationDays" = estimasi hari yang dibutuhkan berdasarkan ${params.weeklyHours} jam/minggu
4. Skill yang sudah dimiliki tetap masukkan sebagai review singkat di "Fondasi" (durationDays lebih pendek, max 5 hari)
5. Total materi: 8–15 item (proporsional dengan jumlah skill yang perlu dipelajari)
6. Judul materi harus spesifik (bukan generik), contoh: "Belajar Pandas untuk Manipulasi Data", bukan "Python"

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

  const prompt = buildRoadmapPrompt({
    professionTitle:    recommendation.professionTitle,
    ownedSkills:        recommendation.ownedSkills,
    missingSkills:      recommendation.missingSkills,
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

  const rawText = completion.choices[0]?.message?.content?.trim() || '';
  const parsed  = parseAIResponse(rawText);

  if (!parsed.materials?.length) {
    throw { status: 422, message: 'AI tidak menghasilkan roadmap yang valid.' };
  }

  const scheduledDates  = calculateSchedule(parsed.materials);
  const materialsToSave = parsed.materials.map((m, i) => ({
    order:       m.order,
    phase:       m.phase,
    title:       m.title,
    description: m.description || null,
    scheduledAt: scheduledDates[i] || null,
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
