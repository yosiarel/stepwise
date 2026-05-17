import { prisma } from '../lib/prisma.js';
import { geminiModel } from '../lib/gemini.js';
import {
  findActiveSession,
  archiveActiveSessions,
  createRecommendationSession,
  findRecommendationById,
  selectCareerTarget,
  findSelectedRecommendation,
} from '../repositories/recommendation.repository.js';
import type {
  GeminiRecommendationResponse,
  SelectCareerBody,
} from '../../types/recommendation.js';

const buildRecommendationPrompt = (profile: {
  educationHistory:   unknown;
  workExperiences:    unknown;
  extractedSkills:    string[];
  skillLevels:        unknown;
  itBackground:       boolean | null;
  itInterests:        string[];
  learningStyle:      string | null;
  workEnvPreference:  string | null;
  weeklyHours:        number | null;
  preferredStudyTime: string[];
  category:           string | null;
}): string => {
  return `
Kamu adalah sistem rekomendasi karier IT yang akurat dan empatik untuk platform StepWise.
Tugasmu adalah menganalisis profil pengguna dan merekomendasikan TEPAT 3 profesi IT yang paling sesuai.

## PROFIL PENGGUNA

**Kategori:** ${profile.category ?? 'Tidak diketahui'}
**Latar belakang IT:** ${profile.itBackground ? 'Ada' : 'Tidak ada'}

**Riwayat Pendidikan:**
${JSON.stringify(profile.educationHistory, null, 2)}

**Pengalaman Kerja:**
${JSON.stringify(profile.workExperiences, null, 2)}

**Skill yang Dimiliki beserta Level:**
${JSON.stringify(profile.skillLevels, null, 2) || profile.extractedSkills.join(', ') || 'Belum ada data'}

**Minat Bidang IT:**
${profile.itInterests.join(', ') || 'Belum ditentukan'}

**Gaya Belajar:** ${profile.learningStyle ?? 'Tidak diketahui'}
**Preferensi Lingkungan Kerja:** ${profile.workEnvPreference ?? 'Tidak diketahui'}
**Komitmen Belajar:** ${profile.weeklyHours ?? '?'} jam/minggu
**Waktu Belajar:** ${profile.preferredStudyTime.join(', ') || 'Fleksibel'}

## INSTRUKSI OUTPUT

Kembalikan HANYA JSON valid tanpa markdown, tanpa komentar, dengan struktur berikut:

{
  "recommendations": [
    {
      "rank": 1,
      "professionTitle": "nama profesi IT",
      "readinessPercent": 0-100,
      "skills": [
        {
          "nama_skill": "nama skill spesifik",
          "level_saat_ini": "beginner" | "intermediate" | "advanced" | null,
          "level_target": "beginner" | "intermediate" | "advanced"
        }
      ],
      "reasonSummary": "2-3 kalimat alasan konkret mengapa profesi ini cocok untuk user ini",
      "professionOverview": {
        "dailyTasks": ["tanggung jawab harian yang spesifik"],
        "companyTypes": ["jenis perusahaan yang memakai profesi ini"],
        "longTermProspect": "prospek karier jangka panjang dalam 2-3 kalimat"
      }
    }
  ]
}

## ATURAN PENTING
- readinessPercent harus jujur berdasarkan skill gap nyata, bukan dibuat tinggi agar user senang
- skills harus spesifik (e.g. "React.js", bukan "programming")
- level_saat_ini: gunakan data skill user jika ada, null jika skill belum pernah dipelajari sama sekali
- level_target: level minimum standar industri yang dibutuhkan untuk profesi tersebut
- Urutkan skills: null (gap terbesar) dulu, lalu yang level_saat_ini < level_target, lalu yang sudah tercapai
- Pertimbangkan waktu belajar user — jika weeklyHours rendah, rekomendasikan profesi yang gap-nya lebih kecil
- Urutkan rekomendasi dari yang paling sesuai (rank 1) ke yang paling kurang sesuai (rank 3)
- Kembalikan HANYA JSON, tidak ada teks lain
`;
};

const parseGeminiResponse = (raw: string): GeminiRecommendationResponse => {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned) as GeminiRecommendationResponse;
  } catch {
    throw { status: 422, message: 'Gagal memproses rekomendasi dari AI. Coba lagi.' };
  }
};

export const getOrGenerateRecommendationService = async (userId: string) => {
  const existing = await findActiveSession(userId);
  if (existing) {
    return {
      isNew:           false,
      sessionId:       existing.id,
      recommendations: existing.recommendations,
    };
  }

  const user = await prisma.user.findUnique({
    where:   { id: userId },
    include: {
      profile: true,
      educationHistories: true,
      workExperiences: true,
      skills: true,
    },
  });

  if (!user?.profile) {
    throw {
      status:  400,
      message: 'Profil belum lengkap. Selesaikan upload CV dan asesmen terlebih dahulu.',
    };
  }

  const { profile } = user;

  if (!profile.extractedSkills.length && !profile.itInterests.length) {
    throw {
      status:  400,
      message: 'Data profil tidak cukup untuk menghasilkan rekomendasi.',
    };
  }

  const prompt = buildRecommendationPrompt({
    educationHistory:   user.educationHistories,
    workExperiences:    user.workExperiences,
    extractedSkills:    profile.extractedSkills,
    skillLevels:        user.skills,
    itBackground:       profile.itBackground,
    itInterests:        profile.itInterests,
    learningStyle:      profile.learningStyle,
    workEnvPreference:  profile.workEnvPreference,
    weeklyHours:        profile.weeklyHours,
    preferredStudyTime: profile.preferredStudyTime,
    category:           user.category,
  });

  const result  = await geminiModel.generateContent(prompt);
  const rawText = result.response.text().trim();
  const parsed  = parseGeminiResponse(rawText);

  if (!parsed.recommendations?.length) {
    throw { status: 422, message: 'AI tidak menghasilkan rekomendasi yang valid.' };
  }

  await archiveActiveSessions(userId);

  const session = await createRecommendationSession(userId, parsed.recommendations);

  return {
    isNew:           true,
    sessionId:       session.id,
    recommendations: session.recommendations,
    disclaimer:      'Rekomendasi ini bersifat sugestif berdasarkan data profilmu. Keputusan akhir tetap di tanganmu.',
  };
};

export const selectCareerService = async (
  userId: string,
  body:   SelectCareerBody
) => {
  const { recommendationId } = body;

  const recommendation = await findRecommendationById(recommendationId);
  if (!recommendation) {
    throw { status: 404, message: 'Rekomendasi tidak ditemukan' };
  }

  const session = await findActiveSession(userId);
  if (!session || session.id !== recommendation.sessionId) {
    throw { status: 403, message: 'Akses ditolak' };
  }

  const updated = await selectCareerTarget(session.id, recommendationId);

  return {
    message:        `Target karier "${updated.professionTitle}" berhasil dipilih.`,
    recommendation: updated,
  };
};

export const getSelectedCareerService = async (userId: string) => {
  const selected = await findSelectedRecommendation(userId);
  if (!selected) {
    throw { status: 404, message: 'Belum ada target karier yang dipilih.' };
  }
  return selected;
};