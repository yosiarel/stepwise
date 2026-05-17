import axiosInstance from '../api/axiosInstance';

export interface EducationEntry {
  institution: string;
  degree: string;
  major: string;
  year: string;
}

export interface WorkExperienceEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface CvExtractedData {
  educationHistory: EducationEntry[];
  workExperiences: WorkExperienceEntry[];
  extractedSkills: string[];
}

export interface ReviewCvBody {
  educationHistory: EducationEntry[];
  workExperiences: WorkExperienceEntry[];
  extractedSkills: string[];
}

const cvService = {
  // 1. Upload CV PDF ke Backend
  async uploadCv(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('cv', file);

    const response = await axiosInstance.post('/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // 2. Ekstrak data teks CV menggunakan AI
  async extractCv(cvId: string): Promise<any> {
    const response = await axiosInstance.post(`/cv/${cvId}/extract`);
    return response.data.data;
  },

  // 3. Simpan review / revisi akhir CV ke Profile
  async reviewCv(cvId: string, body: ReviewCvBody): Promise<any> {
    const response = await axiosInstance.put(`/cv/${cvId}/review`, body);
    return response.data;
  }
};

export default cvService;
