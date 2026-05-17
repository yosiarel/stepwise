import axiosInstance from '../api/axiosInstance';

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  birthDate: string | null;
  phone: string | null;
  category: string | null;
  profile: {
    id: string;
    userId: string;
    currentStatus: string | null;
    statusSince: string | null;
    currentJobTitle: string | null;
    currentJobDesc: string | null;
    institutionName: string | null;
    techSavvyLevel: string | null;
    learningStyle: string | null;
    workEnvPreference: string | null;
    companyTypePreference: string | null;
    weeklyHoursRange: string | null;
    weeklyHours: number | null;
    preferredStudyTime: string[] | null;
    monthlyIncome: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  educationHistories: Array<{
    id: string;
    userId: string;
    level: 'SMA' | 'SMK' | 'D3' | 'D4' | 'S1' | 'S2' | 'S3' | 'PROFESI';
    major: string;
    status: 'LULUS' | 'SEDANG_DITEMPUH';
    semester: number | null;
    yearGraduated: number | null;
    institution: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  workExperiences: Array<{
    id: string;
    userId: string;
    workType: 'FORMAL' | 'SERABUTAN' | 'WIRAUSAHA' | 'FREELANCE' | 'PNS' | 'TNI_POLRI' | 'MAGANG' | 'SUKARELAWAN' | 'IRT' | 'TIDAK_BEKERJA';
    jobTitle: string;
    companyName: string | null;
    duration: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  skills: Array<{
    id: string;
    userId: string;
    name: string;
    category: 'TEKNIS' | 'NON_TEKNIS';
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    createdAt: string;
    updatedAt: string;
  }>;
}

const profileService = {
  async getProfile(): Promise<UserProfileResponse> {
    const response = await axiosInstance.get('/profile');
    return response.data.data;
  },

  async updateDataDiri(data: { name: string; email: string; birthDate?: string; phone?: string }): Promise<any> {
    const response = await axiosInstance.put('/profile/personal', data);
    return response.data;
  },

  async updateStatusPekerjaan(data: { currentStatus: string; statusSince: string; currentJobTitle?: string; currentJobDesc?: string; institutionName?: string }): Promise<any> {
    const response = await axiosInstance.put('/profile/status', data);
    return response.data;
  },

  async updatePreferences(data: {
    techSavvyLevel?: string;
    learningStyle?: string;
    workEnvPreference?: string;
    companyTypePreference?: string;
    weeklyHours?: number;
    monthlyIncome?: string;
  }): Promise<any> {
    const response = await axiosInstance.put('/profile/preferences', data);
    return response.data;
  },

  async createEducation(data: {
    level: string;
    major: string;
    status: string;
    semester?: number;
    yearGraduated?: number;
    institution?: string;
  }): Promise<any> {
    const response = await axiosInstance.post('/profile/education', data);
    return response.data;
  },

  async updateEducation(id: string, data: {
    level?: string;
    major?: string;
    status?: string;
    semester?: number;
    yearGraduated?: number;
    institution?: string;
  }): Promise<any> {
    const response = await axiosInstance.put(`/profile/education/${id}`, data);
    return response.data;
  },

  async deleteEducation(id: string): Promise<any> {
    const response = await axiosInstance.delete(`/profile/education/${id}`);
    return response.data;
  },

  async createWorkExperience(data: {
    workType: string;
    jobTitle: string;
    companyName?: string;
    duration: string;
    description?: string;
  }): Promise<any> {
    const response = await axiosInstance.post('/profile/experience', data);
    return response.data;
  },

  async updateWorkExperience(id: string, data: {
    workType?: string;
    jobTitle?: string;
    companyName?: string;
    duration?: string;
    description?: string;
  }): Promise<any> {
    const response = await axiosInstance.put(`/profile/experience/${id}`, data);
    return response.data;
  },

  async deleteWorkExperience(id: string): Promise<any> {
    const response = await axiosInstance.delete(`/profile/experience/${id}`);
    return response.data;
  },

  async createSkill(data: {
    name: string;
    category: string;
    level: string;
  }): Promise<any> {
    const response = await axiosInstance.post('/profile/skills', data);
    return response.data;
  },

  async deleteSkill(id: string): Promise<any> {
    const response = await axiosInstance.delete(`/profile/skills/${id}`);
    return response.data;
  }
};

export default profileService;