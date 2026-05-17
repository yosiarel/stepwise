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
  name?: string;
  educationHistory: EducationEntry[];
  workExperiences: WorkExperienceEntry[];
  extractedSkills: string[];
}

export interface ReviewCvBody {
  educationHistory: EducationEntry[];
  workExperiences: WorkExperienceEntry[];
  extractedSkills: string[];
}

export interface UploadCvResponse {
  id: string;
  url?: string;
}

export interface ExtractCvResponse {
  id: string;
  extractedData: CvExtractedData;
}

export interface ReviewCvResponse {
  success: boolean;
  message: string;
}

const cvService = {
  async uploadCv(file: File): Promise<UploadCvResponse> {
    const formData = new FormData();
    formData.append('cv', file);

    const response = await axiosInstance.post('/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async extractCv(cvId: string): Promise<ExtractCvResponse> {
    const response = await axiosInstance.post(`/cv/${cvId}/extract`);
    return response.data.data;
  },

  async reviewCv(cvId: string, body: ReviewCvBody): Promise<ReviewCvResponse> {
    const response = await axiosInstance.put(`/cv/${cvId}/review`, body);
    return response.data;
  }
};

export default cvService;