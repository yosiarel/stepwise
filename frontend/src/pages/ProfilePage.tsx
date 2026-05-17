import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Sliders, 
  Target, 
  Edit3, 
  Plus, 
  Check, 
  X, 
  Loader2, 
  Trash2
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import profileService from '../services/profileService';
import careerService from '../services/careerService';

interface EducationItem {
  id: string;
  level: 'SMA' | 'SMK' | 'D3' | 'D4' | 'S1' | 'S2' | 'S3' | 'PROFESI';
  major: string;
  status: 'LULUS' | 'SEDANG_DITEMPUH';
  semester?: number;
  yearGraduated?: number;
  institution?: string;
}

interface ExperienceItem {
  id: string;
  workType: 'FORMAL' | 'SERABUTAN' | 'WIRAUSAHA' | 'FREELANCE' | 'PNS' | 'TNI_POLRI' | 'MAGANG' | 'SUKARELAWAN' | 'IRT' | 'TIDAK_BEKERJA';
  jobTitle: string;
  companyName?: string;
  duration: string;
  description?: string;
}

interface SkillItem {
  id: string;
  name: string;
  category: 'TEKNIS' | 'NON_TEKNIS';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Data Diri State
  const [dataDiri, setDataDiri] = useState({
    namaLengkap: '',
    email: '',
    tanggalLahir: '2004-08-15',
    nomorTelepon: ''
  });
  const [isEditDataDiri, setIsEditDataDiri] = useState<boolean>(false);
  const [bufferDataDiri, setBufferDataDiri] = useState({ ...dataDiri });

  // 2. Status Kerja State
  const [statusKerja, setStatusKerja] = useState({
    statusSaatIni: 'MAHASISWA',
    berlakuSejak: '2023-08-01',
    pekerjaanSekarang: '',
    deskripsiSingkat: '',
    namaInstitusi: ''
  });
  const [isEditStatus, setIsEditStatus] = useState<boolean>(false);
  const [bufferStatusKerja, setBufferStatusKerja] = useState({ ...statusKerja });

  // 3. Pendidikan State
  const [pendidikanList, setPendidikanList] = useState<EducationItem[]>([]);
  const [isAddingEdu, setIsAddingEdu] = useState<boolean>(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduForm, setEduForm] = useState({
    level: 'S1',
    major: '',
    status: 'SEDANG_DITEMPUH',
    semester: 1,
    yearGraduated: new Date().getFullYear(),
    institution: ''
  });

  // 4. Pengalaman State
  const [pengalamanList, setPengalamanList] = useState<ExperienceItem[]>([]);
  const [isAddingExp, setIsAddingExp] = useState<boolean>(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expForm, setExpForm] = useState({
    workType: 'MAGANG',
    jobTitle: '',
    companyName: '',
    duration: '',
    description: ''
  });

  // 5. Keahlian State
  const [keahlianList, setKeahlianList] = useState<SkillItem[]>([]);
  const [isAddingSkill, setIsAddingSkill] = useState<boolean>(false);
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillKategori, setNewSkillKategori] = useState<'TEKNIS' | 'NON_TEKNIS'>('TEKNIS');
  const [newSkillLevel, setNewSkillLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');

  // 6. Preferensi State
  const [preferensi, setPreferensi] = useState({
    techSavvyLevel: 'TINGGI',
    gayaBelajar: 'PRAKTIK_LANGSUNG',
    lingkunganKerja: 'FLEKSIBEL',
    tipePerusahaan: 'TECH_COMPANY',
    komitmenWaktu: 15,
    pendapatanRange: 'THREE_TO_7M'
  });
  const [isEditPreferensi, setIsEditPreferensi] = useState<boolean>(false);
  const [bufferPreferensi, setBufferPreferensi] = useState({ ...preferensi });

  // 7. Target Karier State
  const [targetKarier, setTargetKarier] = useState({
    namaProfesi: 'Mengevaluasi target...',
    kesiapanKerja: 0
  });

  // Mappers Ke Bahasa Indonesia yang Indah
  const mapStatusLabel = (val: string) => {
    const m: Record<string, string> = {
      PELAJAR_SMA_SMK: 'Pelajar SMA/SMK',
      MAHASISWA: 'Mahasiswa',
      FRESH_GRADUATE: 'Lulusan Baru (Fresh Graduate)',
      BEKERJA: 'Bekerja Profesional',
      TIDAK_BEKERJA: 'Tidak / Belum Bekerja'
    };
    return m[val] || val;
  };

  const mapTechSavvy = (val: string) => {
    const m: Record<string, string> = {
      RENDAH: 'Rendah',
      MENENGAH: 'Menengah',
      TINGGI: 'Tinggi',
      SANGAT_TINGGI: 'Sangat Tinggi'
    };
    return m[val] || val;
  };

  const mapGayaBelajar = (val: string) => {
    const m: Record<string, string> = {
      VISUAL: 'Visual (Video/Bagan)',
      AUDITORI: 'Auditori (Penjelasan/Audio)',
      PRAKTIK_LANGSUNG: 'Praktik Langsung (Coding & Debug)',
      MEMBACA_MENULIS: 'Membaca & Menulis (Dokumentasi)'
    };
    return m[val] || val;
  };

  const mapLingkunganKerja = (val: string) => {
    const m: Record<string, string> = {
      INDIVIDU: 'Fokus Mandiri (Individu)',
      TIM_KECIL: 'Tim Kecil (2–5 Orang)',
      TIM_BESAR: 'Tim Besar Korporasi',
      FLEKSIBEL: 'Fleksibel Adaptif'
    };
    return m[val] || val;
  };

  const mapTipePerusahaan = (val: string) => {
    const m: Record<string, string> = {
      STARTUP: 'Startup (Dinamis & Cepat)',
      KORPORAT: 'Korporat / Swasta Mapan',
      FREELANCE: 'Freelance / Mandiri',
      TECH_COMPANY: 'Tech Company (Inovatif)',
      BELUM_TERPIKIRKAN: 'Belum Terpikirkan'
    };
    return m[val] || val;
  };

  const mapMonthlyIncome = (val: string) => {
    const m: Record<string, string> = {
      LESS_THAN_1M: 'Di bawah Rp 1 Juta',
      ONE_TO_3M: 'Rp 1 Juta – Rp 3 Juta',
      THREE_TO_7M: 'Rp 3 Juta – Rp 7 Juta',
      SEVEN_TO_12M: 'Rp 7 Juta – Rp 12 Juta',
      MORE_THAN_12M: 'Di atas Rp 12 Juta'
    };
    return m[val] || val;
  };

  const mapWorkType = (val: string) => {
    const m: Record<string, string> = {
      FORMAL: 'Formal / Kontrak Tetap',
      SERABUTAN: 'Pekerjaan Lepas',
      WIRAUSAHA: 'Wirausaha / Bisnis Mandiri',
      FREELANCE: 'Freelance',
      PNS: 'Pegawai Negeri Sipil (PNS)',
      TNI_POLRI: 'TNI / POLRI',
      MAGANG: 'Magang (Internship)',
      SUKARELAWAN: 'Sukarelawan (Volunteer)',
      IRT: 'Ibu Rumah Tangga',
      TIDAK_BEKERJA: 'Tidak Bekerja'
    };
    return m[val] || val;
  };

  const loadProfileFromBackend = async () => {
    try {
      const serverData = await profileService.getProfile();
      
      const realDataDiri = {
        namaLengkap: serverData.name || '',
        email: serverData.email || '',
        tanggalLahir: serverData.birthDate ? serverData.birthDate.substring(0, 10) : '2004-08-15',
        nomorTelepon: serverData.phone || ''
      };

      const realStatusKerja = {
        statusSaatIni: serverData.profile?.currentStatus || 'MAHASISWA',
        berlakuSejak: serverData.profile?.statusSince ? serverData.profile.statusSince.substring(0, 7) : '2023-08',
        pekerjaanSekarang: serverData.profile?.currentJobTitle || '',
        deskripsiSingkat: serverData.profile?.currentJobDesc || '',
        namaInstitusi: serverData.profile?.institutionName || ''
      };

      const realPreferensi = {
        techSavvyLevel: serverData.profile?.techSavvyLevel || 'TINGGI',
        gayaBelajar: serverData.profile?.learningStyle || 'PRAKTIK_LANGSUNG',
        lingkunganKerja: serverData.profile?.workEnvPreference || 'FLEKSIBEL',
        tipePerusahaan: serverData.profile?.companyTypePreference || 'TECH_COMPANY',
        komitmenWaktu: serverData.profile?.weeklyHours || 15,
        pendapatanRange: serverData.profile?.monthlyIncome || 'THREE_TO_7M'
      };

      setDataDiri(realDataDiri);
      setStatusKerja(realStatusKerja);
      setPreferensi(realPreferensi);

      setBufferDataDiri(realDataDiri);
      setBufferStatusKerja(realStatusKerja);
      setBufferPreferensi(realPreferensi);

      setPendidikanList((serverData.educationHistories as unknown as EducationItem[]) || []);
      setPengalamanList((serverData.workExperiences as unknown as ExperienceItem[]) || []);
      setKeahlianList((serverData.skills as unknown as SkillItem[]) || []);

      // Hubungkan target karir terpilih
      try {
        const careerRes = await careerService.getSelectedCareer();
        if (careerRes) {
          setTargetKarier({
            namaProfesi: careerRes.professionTitle,
            kesiapanKerja: careerRes.readinessPercent || 0
          });
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setTargetKarier({
            namaProfesi: 'Belum memilih target karier',
            kesiapanKerja: 0
          });
        }
      }
    } catch (err) {
      console.error('Gagal memuat data profil dari server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileFromBackend();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const hitungUsia = (dobString: string): number => {
    const hariIni = new Date();
    const lahir = new Date(dobString);
    let usia = hariIni.getFullYear() - lahir.getFullYear();
    const bulan = hariIni.getMonth() - lahir.getMonth();
    if (bulan < 0 || (bulan === 0 && hariIni.getDate() < lahir.getDate())) {
      usia--;
    }
    return isNaN(usia) ? 0 : usia;
  };

  // Handler Perubahan Data Diri
  const handleStartEditDataDiri = () => {
    setBufferDataDiri({ ...dataDiri });
    setIsEditDataDiri(true);
  };

  const handleSaveDataDiri = async () => {
    try {
      await profileService.updateDataDiri({
        name: bufferDataDiri.namaLengkap,
        email: bufferDataDiri.email,
        birthDate: bufferDataDiri.tanggalLahir ? new Date(bufferDataDiri.tanggalLahir).toISOString() : undefined,
        phone: bufferDataDiri.nomorTelepon || undefined
      });
      setDataDiri({ ...bufferDataDiri });
      setIsEditDataDiri(false);
      triggerToast("Data diri berhasil disinkronisasi ke server!");
      await loadProfileFromBackend();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan perubahan.');
    }
  };

  // Handler Perubahan Status Pekerjaan
  const handleStartEditStatus = () => {
    setBufferStatusKerja({ ...statusKerja });
    setIsEditStatus(true);
  };

  const handleSaveStatusKerja = async () => {
    try {
      await profileService.updateStatusPekerjaan({
        currentStatus: bufferStatusKerja.statusSaatIni,
        statusSince: bufferStatusKerja.berlakuSejak ? new Date(bufferStatusKerja.berlakuSejak + '-02').toISOString() : new Date().toISOString(),
        currentJobTitle: bufferStatusKerja.statusSaatIni === 'BEKERJA' ? bufferStatusKerja.pekerjaanSekarang : undefined,
        currentJobDesc: bufferStatusKerja.statusSaatIni === 'BEKERJA' ? bufferStatusKerja.deskripsiSingkat : undefined,
        institutionName: bufferStatusKerja.namaInstitusi || undefined
      });
      setStatusKerja({ ...bufferStatusKerja });
      setIsEditStatus(false);
      triggerToast("Status pekerjaan berhasil diperbarui di server!");
      await loadProfileFromBackend();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan.');
    }
  };

  // Handler Perubahan Preferensi
  const handleStartEditPreferensi = () => {
    setBufferPreferensi({ ...preferensi });
    setIsEditPreferensi(true);
  };

  const handleSavePreferensi = async () => {
    try {
      await profileService.updatePreferences({
        techSavvyLevel: bufferPreferensi.techSavvyLevel,
        learningStyle: bufferPreferensi.gayaBelajar,
        workEnvPreference: bufferPreferensi.lingkunganKerja,
        companyTypePreference: bufferPreferensi.tipePerusahaan,
        weeklyHours: Number(bufferPreferensi.komitmenWaktu),
        monthlyIncome: bufferPreferensi.pendapatanRange || undefined
      });
      setPreferensi({ ...bufferPreferensi });
      setIsEditPreferensi(false);
      triggerToast("Preferensi belajar Anda berhasil diperbarui!");
      await loadProfileFromBackend();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui data preferensi.');
    }
  };

  // CRUD Pendidikan
  const handleStartAddEdu = () => {
    setEditingEduId(null);
    setEduForm({
      level: 'S1',
      major: '',
      status: 'SEDANG_DITEMPUH',
      semester: 1,
      yearGraduated: new Date().getFullYear(),
      institution: ''
    });
    setIsAddingEdu(true);
  };

  const handleStartEditEdu = (edu: EducationItem) => {
    setEditingEduId(edu.id);
    setEduForm({
      level: edu.level,
      major: edu.major,
      status: edu.status,
      semester: edu.semester || 1,
      yearGraduated: edu.yearGraduated || new Date().getFullYear(),
      institution: edu.institution || ''
    });
    setIsAddingEdu(true);
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        level: eduForm.level,
        major: eduForm.major,
        status: eduForm.status,
        semester: eduForm.status === 'SEDANG_DITEMPUH' ? Number(eduForm.semester) : undefined,
        yearGraduated: eduForm.status === 'LULUS' ? Number(eduForm.yearGraduated) : undefined,
        institution: eduForm.institution || undefined
      };

      if (editingEduId) {
        await profileService.updateEducation(editingEduId, payload);
        triggerToast("Riwayat pendidikan berhasil diperbarui!");
      } else {
        await profileService.createEducation(payload);
        triggerToast("Riwayat pendidikan berhasil ditambahkan!");
      }
      setIsAddingEdu(false);
      setEditingEduId(null);
      await loadProfileFromBackend();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan riwayat pendidikan.');
    }
  };

  const handleDeleteEdu = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat pendidikan ini?")) return;
    try {
      await profileService.deleteEducation(id);
      triggerToast("Riwayat pendidikan berhasil dihapus.");
      await loadProfileFromBackend();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus riwayat pendidikan.');
    }
  };

  // CRUD Pengalaman Kerja
  const handleStartAddExp = () => {
    setEditingExpId(null);
    setExpForm({
      workType: 'MAGANG',
      jobTitle: '',
      companyName: '',
      duration: '',
      description: ''
    });
    setIsAddingExp(true);
  };

  const handleStartEditExp = (exp: ExperienceItem) => {
    setEditingExpId(exp.id);
    setExpForm({
      workType: exp.workType,
      jobTitle: exp.jobTitle,
      companyName: exp.companyName || '',
      duration: exp.duration,
      description: exp.description || ''
    });
    setIsAddingExp(true);
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        workType: expForm.workType,
        jobTitle: expForm.jobTitle,
        companyName: expForm.companyName || undefined,
        duration: expForm.duration,
        description: expForm.description || undefined
      };

      if (editingExpId) {
        await profileService.updateWorkExperience(editingExpId, payload);
        triggerToast("Riwayat pengalaman kerja berhasil diperbarui!");
      } else {
        await profileService.createWorkExperience(payload);
        triggerToast("Riwayat pengalaman kerja berhasil ditambahkan!");
      }
      setIsAddingExp(false);
      setEditingExpId(null);
      await loadProfileFromBackend();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan riwayat pengalaman.');
    }
  };

  const handleDeleteExp = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengalaman kerja ini?")) return;
    try {
      await profileService.deleteWorkExperience(id);
      triggerToast("Pengalaman kerja berhasil dihapus.");
      await loadProfileFromBackend();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus pengalaman.');
    }
  };

  // CRUD Keahlian (Skills)
  const handleTambahSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      await profileService.createSkill({
        name: newSkillName.trim(),
        category: newSkillKategori,
        level: newSkillLevel
      });
      setNewSkillName('');
      setIsAddingSkill(false);
      triggerToast("Keahlian baru berhasil disimpan!");
      await loadProfileFromBackend();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan keahlian baru.');
    }
  };

  const handleHapusSkill = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus keahlian ini?")) return;
    try {
      await profileService.deleteSkill(id);
      triggerToast("Keahlian berhasil dihapus.");
      await loadProfileFromBackend();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus keahlian.');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3 text-[#1E3A5F]">
          <Loader2 size={36} className="animate-spin text-[#3B82F6]" />
          <p className="text-[14px] font-bold font-sans">Menghubungkan sesi data profil dari Railway...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-[1000px] xl:max-w-[1100px] mx-auto font-sans text-[#1F2937] px-4 md:px-0 pb-12 transition-all relative space-y-6">
        
        <div>
          <h1 className="text-[28px] font-black leading-[36px] text-[#1E3A5F] tracking-tight mb-1 flex items-center gap-3">
            <User className="text-[#3B82F6]" size={28} /> Profil Pengguna
          </h1>
          <p className="text-[15px] font-medium leading-[24px] text-slate-400">
            Kelola data personal, riwayat akademik, latar portofolio pengalaman, keahlian, dan preferensi karier IT Anda.
          </p>
        </div>

        {/* DATA DIRI SECTION */}
        <div className="bg-white rounded-[20px] p-6 border border-slate-200/60 shadow-sm transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h3 className="text-[16px] xl:text-[18px] font-black text-[#1E3A5F] flex items-center gap-2">
              <User size={20} className="text-[#3B82F6]" /> Data Diri
            </h3>
            {isEditDataDiri ? (
              <button onClick={() => setIsEditDataDiri(false)} className="h-[36px] px-4 border-2 border-slate-200 hover:bg-slate-50 text-[13px] font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer text-[#1E3A5F]">
                <X size={14} /> Batal
              </button>
            ) : (
              <button onClick={handleStartEditDataDiri} className="h-[36px] px-4 border-2 border-slate-200 hover:bg-slate-50 text-[13px] font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer text-[#1E3A5F]">
                <Edit3 size={14} /> Edit Data Diri
              </button>
            )}
          </div>

          {isEditDataDiri ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Nama Lengkap</label>
                <input type="text" value={bufferDataDiri.namaLengkap} onChange={(e) => setBufferDataDiri({...bufferDataDiri, namaLengkap: e.target.value})} className="w-full h-[44px] px-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl text-[14px] font-medium outline-none transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Email</label>
                <input type="email" value={bufferDataDiri.email} onChange={(e) => setBufferDataDiri({...bufferDataDiri, email: e.target.value})} className="w-full h-[44px] px-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl text-[14px] font-medium outline-none transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Tanggal Lahir</label>
                <input type="date" value={bufferDataDiri.tanggalLahir} onChange={(e) => setBufferDataDiri({...bufferDataDiri, tanggalLahir: e.target.value})} className="w-full h-[44px] px-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl text-[14px] font-medium outline-none transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Nomor Telepon (Opsional)</label>
                <input type="text" value={bufferDataDiri.nomorTelepon} onChange={(e) => setBufferDataDiri({...bufferDataDiri, nomorTelepon: e.target.value})} className="w-full h-[44px] px-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl text-[14px] font-medium outline-none transition-colors" />
              </div>
              <div className="sm:col-span-2 pt-2 flex justify-end">
                <button onClick={handleSaveDataDiri} className="h-[42px] px-6 bg-[#1E3A5F] text-white font-bold text-[13px] rounded-xl flex items-center gap-1.5 hover:bg-[#152A44] transition-all cursor-pointer shadow-sm"><Check size={14} /> Simpan Perubahan</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[15px] w-full animate-fadeIn">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Nama Lengkap</span><span className="text-[15px] font-extrabold text-[#1E3A5F] block truncate">{dataDiri.namaLengkap}</span></div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Email</span><span className="text-[15px] font-extrabold text-[#1E3A5F] block truncate">{dataDiri.email}</span></div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Tanggal Lahir</span><span className="text-[15px] font-extrabold text-[#1E3A5F]">{dataDiri.tanggalLahir} ({hitungUsia(dataDiri.tanggalLahir)} Tahun)</span></div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Nomor Telepon</span><span className="text-[15px] font-extrabold text-[#1E3A5F]">{dataDiri.nomorTelepon || 'Belum diisi'}</span></div>
            </div>
          )}
        </div>

        {/* STATUS & PEKERJAAN SECTION */}
        <div className="bg-white rounded-[20px] p-6 border border-slate-200/60 shadow-sm transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h3 className="text-[16px] xl:text-[18px] font-black text-[#1E3A5F] flex items-center gap-2">
              <Briefcase size={20} className="text-[#3B82F6]" /> Status & Pekerjaan
            </h3>
            {isEditStatus ? (
              <button onClick={() => setIsEditStatus(false)} className="h-[36px] px-4 border-2 border-slate-200 hover:bg-slate-50 text-[13px] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-[#1E3A5F]">
                <X size={14} /> Batal
              </button>
            ) : (
              <button onClick={handleStartEditStatus} className="h-[36px] px-4 border-2 border-slate-200 hover:bg-slate-50 text-[13px] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-[#1E3A5F]">
                <Edit3 size={14} /> Edit Status
              </button>
            )}
          </div>

          {isEditStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Status Saat Ini</label>
                <select value={bufferStatusKerja.statusSaatIni} onChange={(e) => setBufferStatusKerja({...bufferStatusKerja, statusSaatIni: e.target.value})} className="w-full h-[44px] px-3 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl text-[14px] font-medium outline-none transition-colors">
                  <option value="PELAJAR_SMA_SMK">Pelajar SMA/SMK</option>
                  <option value="MAHASISWA">Mahasiswa</option>
                  <option value="FRESH_GRADUATE">Fresh Graduate</option>
                  <option value="BEKERJA">Bekerja</option>
                  <option value="TIDAK_BEKERJA">Tidak Bekerja</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Berlaku Sejak</label>
                <input type="month" value={bufferStatusKerja.berlakuSejak} onChange={(e) => setBufferStatusKerja({...bufferStatusKerja, berlakuSejak: e.target.value})} className="w-full h-[44px] px-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl text-[14px] font-medium outline-none transition-colors" />
              </div>
              {bufferStatusKerja.statusSaatIni === 'BEKERJA' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-extrabold text-[#1E3A5F]">Jabatan / Peran Saat Ini</label>
                    <input type="text" placeholder="Contoh: Junior Web Developer" value={bufferStatusKerja.pekerjaanSekarang} onChange={(e) => setBufferStatusKerja({...bufferStatusKerja, pekerjaanSekarang: e.target.value})} className="w-full h-[44px] px-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl text-[14px] outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-extrabold text-[#1E3A5F]">Deskripsi Singkat Pengalaman</label>
                    <input type="text" placeholder="Contoh: Mengembangkan web app dengan React" value={bufferStatusKerja.deskripsiSingkat} onChange={(e) => setBufferStatusKerja({...bufferStatusKerja, deskripsiSingkat: e.target.value})} className="w-full h-[44px] px-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl text-[14px] outline-none" />
                  </div>
                </>
              )}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Nama Institusi / Universitas / Sekolah</label>
                <input type="text" placeholder="Contoh: Universitas Gadjah Mada" value={bufferStatusKerja.namaInstitusi} onChange={(e) => setBufferStatusKerja({...bufferStatusKerja, namaInstitusi: e.target.value})} className="w-full h-[44px] px-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl text-[14px] outline-none" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button onClick={handleSaveStatusKerja} className="h-[42px] px-6 bg-[#1E3A5F] text-white font-bold text-[13px] rounded-xl cursor-pointer hover:bg-[#152A44] transition-all shadow-sm">Simpan Perubahan</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Status Saat Ini</span><span className="text-[15px] font-extrabold text-[#1E3A5F]">{mapStatusLabel(statusKerja.statusSaatIni)} (Mulai {statusKerja.berlakuSejak})</span></div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Nama Institusi</span><span className="text-[15px] font-extrabold text-[#1E3A5F]">{statusKerja.namaInstitusi || 'Belum diisi'}</span></div>
              {statusKerja.statusSaatIni === 'BEKERJA' && (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Jabatan Sekarang</span><span className="text-[15px] font-extrabold text-[#1E3A5F]">{statusKerja.pekerjaanSekarang || 'Belum diisi'}</span></div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="text-[11px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Latar Belakang IT / Deskripsi</span><span className="text-[15px] font-extrabold text-[#1E3A5F]">{statusKerja.deskripsiSingkat || 'Belum diisi'}</span></div>
                </>
              )}
            </div>
          )}
        </div>

        {/* PENDIDIKAN SECTION */}
        <div className="bg-white rounded-[20px] p-6 border border-slate-200/60 shadow-sm space-y-5 transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-[16px] xl:text-[18px] font-black text-[#1E3A5F] flex items-center gap-2">
              <GraduationCap size={20} className="text-[#3B82F6]" /> Pendidikan Akademik
            </h3>
            {!isAddingEdu && (
              <button onClick={handleStartAddEdu} className="h-[36px] px-4 bg-[#1E3A5F] hover:bg-[#152A44] text-white text-[13px] font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer">
                <Plus size={14} /> Tambah Riwayat
              </button>
            )}
          </div>

          {isAddingEdu && (
            <form onSubmit={handleSaveEducation} className="p-5 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-4 animate-fadeIn">
              <h4 className="text-[#1E3A5F] text-[14px] font-extrabold uppercase tracking-wide border-b border-slate-200 pb-2">
                {editingEduId ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan baru'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Jenjang Pendidikan</label>
                  <select value={eduForm.level} onChange={(e) => setEduForm({...eduForm, level: e.target.value})} className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none">
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                    <option value="D3">Diploma 3 (D3)</option>
                    <option value="D4">Diploma 4 (D4)</option>
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2">Magister (S2)</option>
                    <option value="S3">Doktor (S3)</option>
                    <option value="PROFESI">Profesi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Nama Institusi / Universitas</label>
                  <input type="text" required placeholder="Contoh: Universitas Indonesia" value={eduForm.institution} onChange={(e) => setEduForm({...eduForm, institution: e.target.value})} className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Program Studi / Jurusan</label>
                  <input type="text" required placeholder="Contoh: Teknik Informatika" value={eduForm.major} onChange={(e) => setEduForm({...eduForm, major: e.target.value})} className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Status Kelulusan</label>
                  <select value={eduForm.status} onChange={(e) => setEduForm({...eduForm, status: e.target.value})} className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none">
                    <option value="LULUS">Sudah Lulus</option>
                    <option value="SEDANG_DITEMPUH">Sedang Ditempuh</option>
                  </select>
                </div>

                {eduForm.status === 'SEDANG_DITEMPUH' ? (
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-extrabold text-[#1E3A5F]">Semester Saat Ini</label>
                    <input type="number" min={1} max={14} required value={eduForm.semester} onChange={(e) => setEduForm({...eduForm, semester: Number(e.target.value)})} className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none" />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-extrabold text-[#1E3A5F]">Tahun Kelulusan</label>
                    <input type="number" min={1980} max={2035} required value={eduForm.yearGraduated} onChange={(e) => setEduForm({...eduForm, yearGraduated: Number(e.target.value)})} className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => { setIsAddingEdu(false); setEditingEduId(null); }} className="h-[38px] px-4 border-2 border-slate-200 text-[#1E3A5F] hover:bg-white text-[13px] font-bold rounded-xl transition-all cursor-pointer">Batal</button>
                <button type="submit" className="h-[38px] px-5 bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-bold rounded-xl transition-all cursor-pointer shadow-sm">Simpan Item</button>
              </div>
            </form>
          )}

          <div className="space-y-3.5">
            {pendidikanList.length > 0 ? (
              pendidikanList.map((edu) => (
                <div key={edu.id} className="p-4 bg-slate-50/50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4 hover:border-slate-300 transition-colors animate-fadeIn">
                  <div>
                    <h4 className="text-[15px] font-extrabold text-[#1E3A5F]">{edu.level} — {edu.major}</h4>
                    <p className="text-[13px] text-slate-500 font-medium mt-0.5">{edu.institution || 'Institusi Pendidikan'}</p>
                    <span className="inline-block mt-2 text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                      {edu.status === 'LULUS' ? `Lulus (Tahun ${edu.yearGraduated})` : `Semester ${edu.semester}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => handleStartEditEdu(edu)} className="text-[#3B82F6] hover:bg-blue-50 p-2 rounded-xl font-bold text-[13px] transition-all cursor-pointer">Edit</button>
                    <button type="button" onClick={() => handleDeleteEdu(edu.id)} className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-all cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-xl">Belum ada riwayat pendidikan akademik terdaftar.</div>
            )}
          </div>
        </div>

        {/* PENGALAMAN KERJA SECTION */}
        <div className="bg-white rounded-[20px] p-6 border border-slate-200/60 shadow-sm space-y-5 transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-[16px] xl:text-[18px] font-black text-[#1E3A5F] flex items-center gap-2">
              <Briefcase size={20} className="text-[#3B82F6]" /> Portofolio Pengalaman Kerja
            </h3>
            {!isAddingExp && (
              <button onClick={handleStartAddExp} className="h-[36px] px-4 bg-[#1E3A5F] hover:bg-[#152A44] text-white text-[13px] font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer">
                <Plus size={14} /> Tambah Pengalaman
              </button>
            )}
          </div>

          {isAddingExp && (
            <form onSubmit={handleSaveExperience} className="p-5 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-4 animate-fadeIn">
              <h4 className="text-[#1E3A5F] text-[14px] font-extrabold uppercase tracking-wide border-b border-slate-200 pb-2">
                {editingExpId ? 'Edit Portofolio Kerja' : 'Tambah Portofolio Kerja Baru'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Tipe Pekerjaan</label>
                  <select value={expForm.workType} onChange={(e) => setExpForm({...expForm, workType: e.target.value})} className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none">
                    <option value="FORMAL">Formal / Kontrak Tetap</option>
                    <option value="SERABUTAN">Pekerjaan Lepas</option>
                    <option value="WIRAUSAHA">Wirausaha / Bisnis Mandiri</option>
                    <option value="FREELANCE">Freelance</option>
                    <option value="PNS">Pegawai Negeri (PNS)</option>
                    <option value="TNI_POLRI">TNI / POLRI</option>
                    <option value="MAGANG">Magang (Internship)</option>
                    <option value="SUKARELAWAN">Sukarelawan (Volunteer)</option>
                    <option value="IRT">Ibu Rumah Tangga</option>
                    <option value="TIDAK_BEKERJA">Tidak Bekerja</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Jabatan / Posisi</label>
                  <input type="text" required placeholder="Contoh: Frontend Developer" value={expForm.jobTitle} onChange={(e) => setExpForm({...expForm, jobTitle: e.target.value})} className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Nama Perusahaan / Klien</label>
                  <input type="text" placeholder="Contoh: PT GoTo Gojek Tokopedia" value={expForm.companyName} onChange={(e) => setExpForm({...expForm, companyName: e.target.value})} className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Durasi Kerja</label>
                  <input type="text" required placeholder="Contoh: Jan 2022 – Des 2023 atau 6 Bulan" value={expForm.duration} onChange={(e) => setExpForm({...expForm, duration: e.target.value})} className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none" />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Deskripsi Tanggung Jawab & Portofolio</label>
                  <textarea rows={3} placeholder="Ceritakan singkat proyek yang Anda buat atau tools yang dipakai..." value={expForm.description} onChange={(e) => setExpForm({...expForm, description: e.target.value})} className="w-full p-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none resize-none" />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => { setIsAddingExp(false); setEditingExpId(null); }} className="h-[38px] px-4 border-2 border-slate-200 text-[#1E3A5F] hover:bg-white text-[13px] font-bold rounded-xl transition-all cursor-pointer">Batal</button>
                <button type="submit" className="h-[38px] px-5 bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-bold rounded-xl transition-all cursor-pointer shadow-sm">Simpan Item</button>
              </div>
            </form>
          )}

          <div className="space-y-3.5">
            {pengalamanList.length > 0 ? (
              pengalamanList.map((exp) => (
                <div key={exp.id} className="p-4 bg-slate-50/50 border border-slate-200/80 rounded-xl flex items-start justify-between gap-4 hover:border-slate-300 transition-colors animate-fadeIn">
                  <div className="space-y-1">
                    <h4 className="text-[15px] font-extrabold text-[#1E3A5F]">{exp.jobTitle}</h4>
                    <p className="text-[13px] text-slate-500 font-bold">{exp.companyName || 'Proyek Lepas / Klien Mandiri'}</p>
                    <p className="text-[12px] text-slate-400 font-medium">Tipe: {mapWorkType(exp.workType)} ({exp.duration})</p>
                    {exp.description && <p className="text-[13px] text-[#1E3A5F]/80 leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg mt-2 font-medium">{exp.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => handleStartEditExp(exp)} className="text-[#3B82F6] hover:bg-blue-50 p-2 rounded-xl font-bold text-[13px] transition-all cursor-pointer">Edit</button>
                    <button type="button" onClick={() => handleDeleteExp(exp.id)} className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-all cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-xl">Belum ada portofolio pengalaman kerja terdaftar.</div>
            )}
          </div>
        </div>

        {/* KEAHLIAN SECTION */}
        <div className="bg-white rounded-[20px] p-6 border border-slate-200/60 shadow-sm space-y-5 transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-[16px] xl:text-[18px] font-black text-[#1E3A5F] flex items-center gap-2">
              <Award size={20} className="text-[#3B82F6]" /> Keahlian (Skills) Terverifikasi
            </h3>
            {!isAddingSkill && (
              <button onClick={() => setIsAddingSkill(true)} className="h-[36px] px-4 bg-[#1E3A5F] hover:bg-[#152A44] text-white text-[13px] font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer">
                <Plus size={14} /> Tambah Keahlian
              </button>
            )}
          </div>

          {isAddingSkill && (
            <form onSubmit={handleTambahSkillSubmit} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Nama Keahlian</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: React.js, Tailwind CSS" 
                    value={newSkillName} 
                    onChange={(e) => setNewSkillName(e.target.value)} 
                    className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Kategori Keahlian</label>
                  <select 
                    value={newSkillKategori} 
                    onChange={(e) => setNewSkillKategori(e.target.value as 'TEKNIS' | 'NON_TEKNIS')} 
                    className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none"
                  >
                    <option value="TEKNIS">Teknis</option>
                    <option value="NON_TEKNIS">Non-Teknis (Soft Skills)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#1E3A5F]">Tingkat Penguasaan</label>
                  <select 
                    value={newSkillLevel} 
                    onChange={(e) => setNewSkillLevel(e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED')} 
                    className="w-full h-[40px] px-3 bg-white border-2 border-slate-200 rounded-lg text-[14px] outline-none"
                  >
                    <option value="BEGINNER">Beginner (Dasar)</option>
                    <option value="INTERMEDIATE">Intermediate (Menengah)</option>
                    <option value="ADVANCED">Advanced (Mahir)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsAddingSkill(false)} className="h-[36px] px-4 border-2 border-slate-200 hover:bg-white text-[13px] font-bold rounded-xl">Batal</button>
                <button type="submit" className="h-[36px] px-4 bg-[#10B981] text-white text-[13px] font-bold rounded-xl cursor-pointer hover:bg-[#059669]">Simpan Keahlian</button>
              </div>
            </form>
          )}

          <div className="flex flex-wrap gap-3">
            {keahlianList.length > 0 ? (
              keahlianList.map((skill) => (
                <div key={skill.id} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5 text-[14px] hover:border-slate-300 transition-all animate-fadeIn">
                  <div>
                    <span className="font-extrabold text-[#1E3A5F]">{skill.name}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider mt-0.5">{skill.category} • {skill.level}</span>
                  </div>
                  <button type="button" onClick={() => handleHapusSkill(skill.id)} className="text-slate-400 hover:text-[#EF4444] transition-colors cursor-pointer"><X size={15} className="stroke-[2.5]" /></button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-xl w-full">Belum ada daftar keahlian yang ditambahkan.</div>
            )}
          </div>
        </div>

        {/* PREFERENSI SECTION */}
        <div className="bg-white rounded-[20px] p-6 border border-slate-200/60 shadow-sm transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h3 className="text-[16px] xl:text-[18px] font-black text-[#1E3A5F] flex items-center gap-2">
              <Sliders size={20} className="text-[#3B82F6]" /> Preferensi Belajar & Karier
            </h3>
            {isEditPreferensi ? (
              <button onClick={() => setIsEditPreferensi(false)} className="h-[36px] px-4 border-2 border-slate-200 hover:bg-slate-50 text-[13px] font-bold rounded-xl cursor-pointer text-[#1E3A5F]">
                <X size={14} /> Batal
              </button>
            ) : (
              <button onClick={handleStartEditPreferensi} className="h-[36px] px-4 border-2 border-slate-200 hover:bg-slate-50 text-[13px] font-bold rounded-xl cursor-pointer text-[#1E3A5F]">
                <Edit3 size={14} /> Edit Preferensi
              </button>
            )}
          </div>

          {isEditPreferensi ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Tech-Savvy Level</label>
                <select value={bufferPreferensi.techSavvyLevel} onChange={(e) => setBufferPreferensi({...bufferPreferensi, techSavvyLevel: e.target.value})} className="w-full h-[44px] px-3 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl outline-none">
                  <option value="RENDAH">Rendah</option>
                  <option value="MENENGAH">Menengah</option>
                  <option value="TINGGI">Tinggi</option>
                  <option value="SANGAT_TINGGI">Sangat Tinggi</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Gaya Belajar Terfavorit</label>
                <select value={bufferPreferensi.gayaBelajar} onChange={(e) => setBufferPreferensi({...bufferPreferensi, gayaBelajar: e.target.value})} className="w-full h-[44px] px-3 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl outline-none">
                  <option value="VISUAL">Visual (Video/Bagan)</option>
                  <option value="AUDITORI">Auditori (Penjelasan/Audio)</option>
                  <option value="PRAKTIK_LANGSUNG">Praktik Langsung (Coding & Debug)</option>
                  <option value="MEMBACA_MENULIS">Membaca & Menulis (Dokumentasi)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Ekosistem Lingkungan Kerja</label>
                <select value={bufferPreferensi.lingkunganKerja} onChange={(e) => setBufferPreferensi({...bufferPreferensi, lingkunganKerja: e.target.value})} className="w-full h-[44px] px-3 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl outline-none">
                  <option value="INDIVIDU">Fokus Mandiri (Individu)</option>
                  <option value="TIM_KECIL">Tim Kecil (2-5 Orang)</option>
                  <option value="TIM_BESAR">Tim Besar Korporasi</option>
                  <option value="FLEKSIBEL">Fleksibel Adaptif</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Tipe Korporasi Impian</label>
                <select value={bufferPreferensi.tipePerusahaan} onChange={(e) => setBufferPreferensi({...bufferPreferensi, tipePerusahaan: e.target.value})} className="w-full h-[44px] px-3 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl outline-none">
                  <option value="STARTUP">Startup</option>
                  <option value="KORPORAT">Korporat / Swasta Mapan</option>
                  <option value="FREELANCE">Freelance / Mandiri</option>
                  <option value="TECH_COMPANY">Tech Company (Inovatif)</option>
                  <option value="BELUM_TERPIKIRKAN">Belum Terpikirkan</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Komitmen Belajar Mingguan (Jam)</label>
                <input type="number" min={1} max={80} value={bufferPreferensi.komitmenWaktu} onChange={(e) => setBufferPreferensi({...bufferPreferensi, komitmenWaktu: Number(e.target.value)})} className="w-full h-[44px] px-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-extrabold text-[#1E3A5F]">Ekspektasi Uang Saku / Gaji Bulanan</label>
                <select value={bufferPreferensi.pendapatanRange} onChange={(e) => setBufferPreferensi({...bufferPreferensi, pendapatanRange: e.target.value})} className="w-full h-[44px] px-3 bg-slate-50 border-2 border-slate-200 focus:border-[#3B82F6] rounded-xl outline-none">
                  <option value="LESS_THAN_1M">Di bawah Rp 1 Juta</option>
                  <option value="ONE_TO_3M">Rp 1 Juta – Rp 3 Juta</option>
                  <option value="THREE_TO_7M">Rp 3 Juta – Rp 7 Juta</option>
                  <option value="SEVEN_TO_12M">Rp 7 Juta – Rp 12 Juta</option>
                  <option value="MORE_THAN_12M">Di atas Rp 12 Juta</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end pt-1">
                <button onClick={handleSavePreferensi} className="h-[42px] px-6 bg-[#1E3A5F] text-white font-bold text-[13px] rounded-xl cursor-pointer hover:bg-[#152A44] transition-all shadow-sm">Simpan Preferensi</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[14px]">
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl"><span className="text-slate-400 block text-[11px] font-extrabold uppercase tracking-wider mb-1">Tech-Savvy</span><span className="font-extrabold text-[#1E3A5F]">{mapTechSavvy(preferensi.techSavvyLevel)}</span></div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl"><span className="text-slate-400 block text-[11px] font-extrabold uppercase tracking-wider mb-1">Gaya Belajar</span><span className="font-extrabold text-[#1E3A5F]">{mapGayaBelajar(preferensi.gayaBelajar)}</span></div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl"><span className="text-slate-400 block text-[11px] font-extrabold uppercase tracking-wider mb-1">Lingkungan</span><span className="font-extrabold text-[#1E3A5F]">{mapLingkunganKerja(preferensi.lingkunganKerja)}</span></div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl"><span className="text-slate-400 block text-[11px] font-extrabold uppercase tracking-wider mb-1">Tipe Korporasi</span><span className="font-extrabold text-[#1E3A5F]">{mapTipePerusahaan(preferensi.tipePerusahaan)}</span></div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl"><span className="text-slate-400 block text-[11px] font-extrabold uppercase tracking-wider mb-1">Komitmen Waktu</span><span className="font-extrabold text-[#1E3A5F]">{preferensi.komitmenWaktu} Jam / Minggu</span></div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl"><span className="text-slate-400 block text-[11px] font-extrabold uppercase tracking-wider mb-1">Target Bulanan</span><span className="font-extrabold text-[#1E3A5F]">{mapMonthlyIncome(preferensi.pendapatanRange)}</span></div>
            </div>
          )}
        </div>

        {/* TARGET KARIER SECTION */}
        <div className="bg-white rounded-[20px] p-6 border border-slate-200/60 shadow-sm space-y-4 transition-all">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-[16px] xl:text-[18px] font-black text-[#1E3A5F] flex items-center gap-2">
              <Target size={20} className="text-[#3B82F6]" /> Sasaran Target Karier IT
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="md:col-span-2 space-y-3">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Target Profesi Saat Ini</span>
                <span className="text-[20px] font-black text-[#1E3A5F]">{targetKarier.namaProfesi}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[13px] font-bold text-slate-500">
                  <span>Persentase Kesiapan Kerja</span>
                  <span className="font-black text-[#10B981]">{targetKarier.kesiapanKerja}%</span>
                </div>
                <div className="w-full bg-[#E5E7EB] h-3 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-full rounded-full transition-all duration-500" style={{ width: `${targetKarier.kesiapanKerja}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button onClick={() => navigate('/dashboard/career')} className="h-[44px] w-full border-2 border-slate-200 text-[#1E3A5F] font-bold text-[13px] rounded-xl bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                Ubah Target / Karier Lain
              </button>
            </div>
          </div>

          <div className="text-[12px] font-bold text-amber-800 leading-[18px] bg-amber-50 border border-amber-100/50 p-4 rounded-xl">
            <b>Penafian Transparansi AI:</b> Seluruh kalkulasi persentase kesiapan kerja bersifat sugestif dan didesain oleh kecerdasan buatan Gemini AI untuk memandu navigasi materi belajar Anda, bukan merupakan jaminan kelulusan mutlak industri.
          </div>
        </div>

        {/* TOAST MESSAGE SYSTEM */}
        {toastMessage && (
          <div className="fixed top-6 right-6 bg-[#1F2937] text-white px-5 py-3 rounded-xl shadow-lg font-bold text-[13.5px] animate-slideInRight z-50 flex items-center gap-2.5 border border-slate-100/10">
            <Check size={16} strokeWidth={3} className="shrink-0 text-emerald-500" /> 
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;