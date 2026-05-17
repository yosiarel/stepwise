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
    // ATRIBUT OPSIONAL FRONTEND BUFFER
    tanggalLahir?: string;
    nomorTelepon?: string;
    fotoProfil?: string;
    berlakuSejak?: string;
    namaInstitusi?: string;
    pekerjaanSekarang?: string; // 🛠️ PERBAIKAN: Menambahkan deklarasi properti ini
  } | null;
  targetKarier?: {
    namaProfesi: string;
    kesiapanKerja: number;
  };
}

const profileService = {
  // Mengambil seluruh data profil terpadu milik pengguna yang sedang login
  async getProfile(): Promise<UserProfileResponse> {
    const response = await axiosInstance.get('/profile');
    return response.data.data;
  },

  // Memperbarui informasi utama seksi Data Diri
  async updateDataDiri(data: { name: string; email: string; tanggalLahir?: string; nomorTelepon?: string }): Promise<void> {
    await axiosInstance.put('/profile/data-diri', data);
  },

  // Memperbarui informasi seksi Status & Pekerjaan
  async updateStatusPekerjaan(data: { category: string; berlakuSejak?: string; pekerjaanSekarang?: string; namaInstitusi?: string; itBackgroundNote?: string }): Promise<void> {
    await axiosInstance.put('/profile/status-pekerjaan', data);
  },

  // Memperbarui array data Pendidikan atau Pengalaman
  async updateLists(data: { educationHistory?: unknown; workExperiences?: unknown }): Promise<void> {
    await axiosInstance.put('/profile/lists', data);
  },

  // Memperbarui array keahlian dan preferensi belajar
  async updatePreferensiKeahlian(data: { skillLevels?: unknown; learningStyle?: string; workEnvPreference?: string; weeklyHours?: number }): Promise<void> {
    await axiosInstance.put('/profile/preferensi', data);
  },

  // Mengunggah file fisik foto profil pengguna menggunakan FormData
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