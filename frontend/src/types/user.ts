export type UserCategory = 'PELAJAR_SMA_SMK' | 'MAHASISWA' | 'FRESH_GRADUATE' | 'PROFESIONAL' | 'UMUM';

export interface UserProfile {
  id: string;
  userId: string;
  educationHistory: any; 
  workExperiences: any;
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