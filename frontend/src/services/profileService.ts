import axiosInstance from '../api/axiosInstance';

export interface UserProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    category: string | null;
  };
  profile: {
    educationHistory: Array<Record<string, unknown>> | null;
    workExperiences: Array<Record<string, unknown>> | null;
    extractedSkills: string[];
    skillLevels: Array<Record<string, unknown>> | null;
    itBackground: boolean | null;
    itBackgroundNote: string | null;
    learningStyle: string | null;
    workEnvPreference: string | null;
    weeklyHours: number | null;
    preferredStudyTime: string[];
    tanggalLahir?: string;
    nomorTelepon?: string;
    fotoProfil?: string;
    berlakuSejak?: string;
    namaInstitusi?: string;
    pekerjaanSekarang?: string;
  } | null;
  targetKarier?: {
    namaProfesi: string;
    kesiapanKerja: number;
  };
}

const profileService = {
  async getProfile(): Promise<UserProfileResponse> {
    const response = await axiosInstance.get('/profile');
    return response.data.data;
  },

  async updateDataDiri(data: { name: string; email: string; tanggalLahir?: string; nomorTelepon?: string }): Promise<void> {
    await axiosInstance.put('/profile/data-diri', data);
  },

  async updateStatusPekerjaan(data: { category: string; berlakuSejak?: string; pekerjaanSekarang?: string; namaInstitusi?: string; itBackgroundNote?: string }): Promise<void> {
    await axiosInstance.put('/profile/status-pekerjaan', data);
  },

  async updateLists(data: { educationHistory?: unknown; workExperiences?: unknown }): Promise<void> {
    await axiosInstance.put('/profile/lists', data);
  },

  async updatePreferensiKeahlian(data: { skillLevels?: unknown; learningStyle?: string; workEnvPreference?: string; weeklyHours?: number }): Promise<void> {
    await axiosInstance.put('/profile/preferensi', data);
  },

  async uploadAvatar(formData: FormData): Promise<{ fotoProfilUrl: string }> {
    const response = await axiosInstance.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  }
};

export default profileService;