import { PDFParse } from 'pdf-parse';
import streamifier from 'streamifier';
import cloudinary from '../lib/cloudinary.js';
import { geminiModel } from '../lib/gemini.js';
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
    console.error('PDF Parse Error:', err.message);
    throw err;
  } finally {
    await parser.destroy();
  }
};


const extractWithGemini = async (cvText: string): Promise<CvExtractedData> => {
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

  const result  = await geminiModel.generateContent(prompt);
  const rawText = result.response.text().trim();
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
            console.error(`Download failed. Status: ${res.statusCode}, URL: ${url}`);
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

  const extractedData = await extractWithGemini(cvText);

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

  const profile = await prisma.userProfile.upsert({
    where:  { userId },
    create: {
      userId,
      educationHistory: educationHistory as any,
      workExperiences:  workExperiences as any,
      extractedSkills,
    },
    update: {
      educationHistory: educationHistory as any,
      workExperiences:  workExperiences as any,
      extractedSkills,
    },
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