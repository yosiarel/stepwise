export type UserCategory = 'PELAJAR_SMA_SMK' | 'MAHASISWA' | 'FRESH_GRADUATE' | 'PROFESIONAL' | 'UMUM';

export interface EducationHistoryItem {
  institution: string;
  degree: string;
  major: string;
  year?: string | number;
  id?: string;
  jenjang?: string;
  jurusan?: string;
  status?: string;
  semester?: number;
  tahunLulus?: number;
}

export interface WorkExperienceHistoryItem {
  company: string;
  role: string;
  duration: string;
  description?: string;
  id?: string;
  jenis?: string;
  jabatan?: string;
  perusahaan?: string;
  durasi?: string;
  deskripsi?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  educationHistory: EducationHistoryItem[]; 
  workExperiences: WorkExperienceHistoryItem[]; 
  extractedSkills: string[];
  itBackground: boolean | null;
  itInterests: string[];
  learningStyle: string | null;
  weeklyHours: number | null;
  preferredStudyTime: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  category: UserCategory | null;
  profile?: UserProfile;
}