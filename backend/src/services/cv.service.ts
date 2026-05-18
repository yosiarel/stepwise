import { PDFParse } from 'pdf-parse';
import streamifier from 'streamifier';
import cloudinary from '../lib/cloudinary.js';
import { nvidiaClient, NVIDIA_CV_MODEL } from '../lib/nvidia.js';
import { prisma } from '../lib/prisma.js';
import type { CvExtractedData, ReviewCvBody } from '../../types/cv.js';


const uploadToCloudinary = (buffer: Buffer, filename: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:        'stepwise/cv',
        resource_type: 'raw',
        public_id:     filename,
        format:        'pdf',
        access_mode:   'public',
      },
      (error: any, result: any) => {
        if (error || !result) return reject(error ?? new Error('Upload gagal'));
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};


const extractTextFromPdf = async (buffer: Buffer): Promise<string> => {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } catch (err: any) {
    throw err;
  } finally {
    await parser.destroy();
  }
};


const extractWithNvidia = async (cvText: string): Promise<CvExtractedData> => {
  const prompt = `
Kamu adalah sistem ekstraksi data CV yang presisi.
Berikut adalah teks mentah dari sebuah CV:

---
${cvText}
---

Ekstrak informasi berikut dan kembalikan HANYA dalam format JSON yang valid, tanpa penjelasan tambahan:

{
  "educationHistory": [
    {
      "institution": "nama institusi",
      "degree": "jenjang pendidikan (SD/SMP/SMA/SMK/D3/S1/S2/S3/Kursus/dll)",
      "major": "jurusan atau bidang studi",
      "year": "tahun lulus atau rentang tahun, e.g. 2019-2023"
    }
  ],
  "workExperiences": [
    {
      "company": "nama perusahaan atau organisasi",
      "role": "jabatan atau posisi",
      "duration": "durasi kerja, e.g. Jan 2022 - Mar 2024",
      "description": "deskripsi singkat tanggung jawab dan pencapaian"
    }
  ],
  "extractedSkills": ["skill1", "skill2", "skill3"]
}

Aturan:
- Jika data tidak tersedia, gunakan string kosong "" untuk field string dan array kosong [] untuk array.
- extractedSkills harus berisi daftar keahlian teknis maupun non-teknis yang eksplisit disebutkan.
- Jangan mengarang data yang tidak ada di CV.
- Kembalikan HANYA JSON, tanpa markdown, tanpa komentar.
`;

  const completion = await nvidiaClient.chat.completions.create({
    model: NVIDIA_CV_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    top_p: 0.7,
    max_tokens: 1024,
  });

  const rawText = completion.choices[0]?.message?.content?.trim() || '';
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

  try {
    return JSON.parse(cleaned) as CvExtractedData;
  } catch {
    throw { status: 422, message: 'Gagal memproses hasil ekstraksi CV. Coba lagi.' };
  }
};


export const uploadCvService = async (
  userId: string,
  file: Express.Multer.File
) => {
  const timestamp = Date.now();
  const publicId  = `cv_${userId}_${timestamp}`;

  const result  = await uploadToCloudinary(file.buffer, publicId);
  const fileUrl = result.secure_url;

  const cvUpload = await prisma.cvUpload.create({
    data: {
      userId,
      fileName: file.originalname,
      fileUrl,
      publicId: result.public_id,
    },
    select: {
      id:        true,
      fileName:  true,
      fileUrl:   true,
      publicId:  true,
      createdAt: true,
    },
  });

  return cvUpload;
};


export const extractCvService = async (userId: string, cvId: string) => {
  const cvUpload = await prisma.cvUpload.findUnique({ where: { id: cvId } });

  if (!cvUpload) {
    throw { status: 404, message: 'Data CV tidak ditemukan' };
  }
  if (cvUpload.userId !== userId) {
    throw { status: 403, message: 'Akses ditolak' };
  }

  const downloadFile = (url: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      import('https').then((https) => {
        https.get(url, (res) => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Failed to download file: ${res.statusCode}`));
          }
          const chunks: any[] = [];
          res.on('data',  (chunk) => chunks.push(chunk));
          res.on('end',   () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }).on('error', reject);
      });
    });
  };

  let buffer: Buffer;
  try {
    const signedUrl = cloudinary.url(cvUpload.publicId || '', {
      resource_type: 'raw',
      sign_url:      true,
      secure:        true,
    });

    buffer = await downloadFile(signedUrl);
  } catch (err: any) {
    console.error('Download error:', err.message);
    throw { status: 502, message: 'Gagal mengambil file CV dari storage' };
  }

  const cvText = await extractTextFromPdf(buffer);
  if (!cvText.trim()) {
    throw { status: 422, message: 'CV tidak dapat dibaca. Pastikan CV bukan berbasis gambar.' };
  }

  const extractedData = await extractWithNvidia(cvText);

  await prisma.cvUpload.update({
    where: { id: cvId },
    data:  { extractedRaw: extractedData as any },
  });

  return {
    cvId,
    extractedData,
    note: 'Tinjau dan koreksi data berikut sebelum melanjutkan.',
  };
};


// ── HELPER MAPPINGS FOR DATABASE ENUMS ─────────────────────────
import type {
  EducationLevel,
  EducationStatus,
  WorkType,
} from '../../generated/prisma/index.js';

const mapDegreeToLevel = (degree: string): EducationLevel => {
  const d = (degree || '').toUpperCase().trim();
  if (d.includes('S3') || d.includes('DOKTOR')) return 'S3';
  if (d.includes('S2') || d.includes('MAGISTER')) return 'S2';
  if (d.includes('S1') || d.includes('SARJANA')) return 'S1';
  if (d.includes('D4') || d.includes('DIPLOMA 4')) return 'D4';
  if (d.includes('D3') || d.includes('DIPLOMA 3')) return 'D3';
  if (d.includes('SMK')) return 'SMK';
  if (d.includes('SMA') || d.includes('SLTA')) return 'SMA';
  return 'S1'; // Default fallback
};

const parseYearGraduated = (year: string): number | null => {
  const match = (year || '').match(/\b(20\d{2}|19\d{2})\b/g);
  if (match && match.length > 0) {
    return parseInt(match[match.length - 1]!, 10);
  }
  return null;
};

const mapRoleToWorkType = (role: string): WorkType => {
  const r = (role || '').toUpperCase();
  if (r.includes('INTERN') || r.includes('MAGANG')) return 'MAGANG';
  if (r.includes('FREELANCE') || r.includes('LEPAS')) return 'FREELANCE';
  if (r.includes('VOLUNTEER') || r.includes('SUKARELAWAN')) return 'SUKARELAWAN';
  if (r.includes('IRT') || r.includes('HOUSEWIFE')) return 'IRT';
  return 'FORMAL'; // Default fallback
};

export const reviewCvService = async (
  userId: string,
  cvId: string,
  body: ReviewCvBody
) => {
  const cvUpload = await prisma.cvUpload.findUnique({ where: { id: cvId } });

  if (!cvUpload) {
    throw { status: 404, message: 'Data CV tidak ditemukan' };
  }
  if (cvUpload.userId !== userId) {
    throw { status: 403, message: 'Akses ditolak' };
  }

  const { educationHistory, workExperiences, extractedSkills } = body;

  const profile = await prisma.$transaction(async (tx) => {
    // 1. Delete existing education, work experience, and user skills
    await tx.educationHistory.deleteMany({ where: { userId } });
    await tx.workExperience.deleteMany({ where: { userId } });
    await tx.userSkill.deleteMany({ where: { userId } });

    // 2. Insert new Education Histories
    if (educationHistory && educationHistory.length > 0) {
      const mappedEducation = educationHistory.map(edu => {
        const isOngoing = edu.year.toUpperCase().includes('ONGOING') ||
                          edu.year.toUpperCase().includes('SEKARANG') ||
                          edu.year.toUpperCase().includes('PRESENT') ||
                          edu.year.toUpperCase().includes('AKTIF');

        const status: EducationStatus = isOngoing ? 'SEDANG_DITEMPUH' : 'LULUS';

        return {
          userId,
          institution: edu.institution || null,
          level: mapDegreeToLevel(edu.degree),
          major: edu.major || '',
          status,
          yearGraduated: parseYearGraduated(edu.year),
          semester: isOngoing ? 1 : null,
        };
      });

      await tx.educationHistory.createMany({
        data: mappedEducation,
      });
    }

    // 3. Insert new Work Experiences
    if (workExperiences && workExperiences.length > 0) {
      const mappedWork = workExperiences.map(work => ({
        userId,
        companyName: work.company || null,
        jobTitle: work.role || '',
        workType: mapRoleToWorkType(work.role),
        duration: work.duration || '',
        description: work.description || null,
      }));

      await tx.workExperience.createMany({
        data: mappedWork,
      });
    }

    // 4. Insert new Skills in UserSkill (with deduplication)
    if (extractedSkills && extractedSkills.length > 0) {
      const uniqueSkills = Array.from(new Set(extractedSkills.map(s => s.trim())))
        .filter(s => s.length > 0);

      const mappedSkills = uniqueSkills.map(skill => ({
        userId,
        name: skill,
        category: 'TEKNIS' as const,
        level: 'BEGINNER' as const,
      }));

      await tx.userSkill.createMany({
        data: mappedSkills,
      });
    }

    // 5. Upsert UserProfile (keeping extractedSkills array as legacy field for compatibility)
    return tx.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        extractedSkills: extractedSkills || [],
      },
      update: {
        extractedSkills: extractedSkills || [],
      },
    });
  });

  await prisma.cvUpload.update({
    where: { id: cvId },
    data:  { isReviewed: true },
  });

  return {
    message: 'Profil berhasil diperbarui dari data CV',
    profile,
  };
};

export const getCvListService = async (userId: string) => {
  return prisma.cvUpload.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id:         true,
      fileName:   true,
      fileUrl:    true,
      publicId:   true,
      isReviewed: true,
      createdAt:  true,
    },
  });
};