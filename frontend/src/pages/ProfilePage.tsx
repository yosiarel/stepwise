import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import profileService from '../services/profileService';

interface EducationItem {
  id: string;
  jenjang: 'SMA' | 'SMK' | 'D3' | 'D4' | 'S1' | 'S2' | 'S3' | 'Profesi';
  jurusan: string;
  status: 'Lulus' | 'Sedang Ditempuh';
  semester?: number;
  tahunLulus?: number;
}

interface ExperienceItem {
  id: string;
  jenis: 'Formal' | 'Serabutan' | 'Wirausaha' | 'Freelance' | 'PNS' | 'TNI/Polri' | 'Magang' | 'Sukarelawan' | 'IRT' | 'Tidak Bekerja';
  jabatan: string;
  perusahaan?: string;
  durasi: string;
  deskripsi?: string;
}

interface SkillItem {
  id: string;
  nama: string;
  kategori: 'teknis' | 'non-teknis';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [dataDiri, setDataDiri] = useState({
    namaLengkap: '',
    email: '',
    tanggalLahir: '2004-08-15',
    nomorTelepon: ''
  });
  const [isEditDataDiri, setIsEditDataDiri] = useState<boolean>(false);

  const [statusKerja, setStatusKerja] = useState({
    statusSaatIni: 'Mahasiswa',
    berlakuSejak: '2023-08',
    pekerjaanSekarang: '',
    deskripsiSingkat: '',
    namaInstitusi: ''
  });
  const [isEditStatus, setIsEditStatus] = useState<boolean>(false);

  const [pendidikanList, setPendidikanList] = useState<EducationItem[]>([]);
  const [isAddingEdu, setIsAddingEdu] = useState<boolean>(false);

  const [pengalamanList, setPengalamanList] = useState<ExperienceItem[]>([]);
  const [isAddingExp, setIsAddingExp] = useState<boolean>(false);

  const [keahlianList, setKeahlianList] = useState<SkillItem[]>([]);
  const [isAddingSkill, setIsAddingSkill] = useState<boolean>(false);
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillKategori, setNewSkillKategori] = useState<'teknis' | 'non-teknis'>('teknis');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const [preferensi, setPreferensi] = useState({
    techSavvyLevel: 'Tinggi',
    gayaBelajar: 'Praktik Langsung',
    lingkunganKerja: 'Fleksibel',
    tipePerusahaan: 'Tech Company',
    komitmenWaktu: 15,
    pendapatanRange: ''
  });
  const [isEditPreferensi, setIsEditPreferensi] = useState<boolean>(false);

  const [targetKarier, setTargetKarier] = useState({
    namaProfesi: 'Full-Stack Web Engineer',
    kesiapanKerja: 0
  });

  const [bufferDataDiri, setBufferDataDiri] = useState({ ...dataDiri });
  const [bufferStatusKerja, setBufferStatusKerja] = useState({ ...statusKerja });
  const [bufferPreferensi, setBufferPreferensi] = useState({ ...preferensi });

  const loadProfileFromBackend = async () => {
    try {
      const serverData = await profileService.getProfile();
      
      const realDataDiri = {
        namaLengkap: serverData.user.name,
        email: serverData.user.email,
        tanggalLahir: serverData.profile?.tanggalLahir || '2004-08-15',
        nomorTelepon: serverData.profile?.nomorTelepon || ''
      };

      const realStatusKerja = {
        statusSaatIni: serverData.user.category || 'Mahasiswa',
        berlakuSejak: serverData.profile?.berlakuSejak || '2023-08',
        pekerjaanSekarang: serverData.profile?.pekerjaanSekarang || '',
        deskripsiSingkat: serverData.profile?.itBackgroundNote || '',
        namaInstitusi: serverData.profile?.namaInstitusi || ''
      };

      const realPreferensi = {
        techSavvyLevel: 'Tinggi',
        gayaBelajar: serverData.profile?.learningStyle || 'Praktik Langsung',
        lingkunganKerja: serverData.profile?.workEnvPreference || 'Fleksibel',
        tipePerusahaan: 'Tech Company',
        komitmenWaktu: serverData.profile?.weeklyHours || 15,
        pendapatanRange: serverData.profile?.preferredStudyTime?.[0] || ''
      };

      setDataDiri(realDataDiri);
      setStatusKerja(realStatusKerja);
      setPreferensi(realPreferensi);

      setBufferDataDiri(realDataDiri);
      setBufferStatusKerja(realStatusKerja);
      setBufferPreferensi(realPreferensi);

      setPendidikanList((serverData.profile?.educationHistory as unknown as EducationItem[]) || []);
      setPengalamanList((serverData.profile?.workExperiences as unknown as ExperienceItem[]) || []);
      setKeahlianList((serverData.profile?.skillLevels as unknown as SkillItem[]) || []);

      if (serverData.targetKarier) {
        setTargetKarier({
          namaProfesi: serverData.targetKarier.namaProfesi,
          kesiapanKerja: serverData.targetKarier.kesiapanKerja
        });
      }
    } catch (err) {
      console.error('Gagal memuat data profil dari server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfileFromBackend();
    }, 0);
    return () => clearTimeout(timer);
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

  const handleStartEditDataDiri = () => {
    setBufferDataDiri({ ...dataDiri });
    setIsEditDataDiri(true);
  };

  const handleSaveDataDiri = async () => {
    try {
      await profileService.updateDataDiri({
        name: bufferDataDiri.namaLengkap,
        email: bufferDataDiri.email,
        tanggalLahir: bufferDataDiri.tanggalLahir,
        nomorTelepon: bufferDataDiri.nomorTelepon
      });
      setDataDiri({ ...bufferDataDiri });
      setIsEditDataDiri(false);
      triggerToast("Data diri berhasil disinkronisasi ke server!");
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Gagal menyimpan perubahan.');
    }
  };

  const handleStartEditStatus = () => {
    setBufferStatusKerja({ ...statusKerja });
    setIsEditStatus(true);
  };

  const handleSaveStatusKerja = async () => {
    try {
      await profileService.updateStatusPekerjaan({
        category: bufferStatusKerja.statusSaatIni,
        berlakuSejak: bufferStatusKerja.berlakuSejak,
        pekerjaanSekarang: bufferStatusKerja.pekerjaanSekarang,
        itBackgroundNote: bufferStatusKerja.deskripsiSingkat,
        namaInstitusi: bufferStatusKerja.namaInstitusi
      });
      setStatusKerja({ ...bufferStatusKerja });
      setIsEditStatus(false);
      triggerToast("Status pekerjaan berhasil diperbarui di server!");
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Gagal menyimpan.');
    }
  };

  const handleStartEditPreferensi = () => {
    setBufferPreferensi({ ...preferensi });
    setIsEditPreferensi(true);
  };

  const handleSavePreferensi = async () => {
    try {
      await profileService.updatePreferensiKeahlian({
        learningStyle: bufferPreferensi.gayaBelajar,
        workEnvPreference: bufferPreferensi.lingkunganKerja,
        weeklyHours: bufferPreferensi.komitmenWaktu
      });
      setPreferensi({ ...bufferPreferensi });
      setIsEditPreferensi(false);
      triggerToast("Preferensi belajar Anda berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui data preferensi.');
    }
  };

  const handleHapusSkill = async (id: string) => {
    const updatedSkills = keahlianList.filter(s => s.id !== id);
    try {
      await profileService.updatePreferensiKeahlian({ skillLevels: updatedSkills });
      setKeahlianList(updatedSkills);
      triggerToast("Keahlian berhasil dihapus.");
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus keahlian.');
    }
  };

  const handleTambahSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newItem: SkillItem = {
      id: `skill-${Date.now()}`,
      nama: newSkillName.trim(),
      kategori: newSkillKategori,
      level: newSkillLevel
    };

    const updatedSkills = [...keahlianList, newItem];
    try {
      await profileService.updatePreferensiKeahlian({ skillLevels: updatedSkills });
      setKeahlianList(updatedSkills);
      setNewSkillName('');
      setIsAddingSkill(false);
      triggerToast("Keahlian baru berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert('Gagal menyuntikkan keahlian baru.');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-2 text-[#6B7280]">
          <Loader2 size={32} className="animate-spin text-[#3B82F6]" />
          <p className="text-[14px] font-medium font-sans">Menghubungkan sesi data profil...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] mx-auto font-sans text-[#1F2937] px-4 md:px-0 pb-12 transition-all relative space-y-6">
        
        <div>
          <h1 className="text-[28px] font-bold leading-[36px] text-[#1F2937] tracking-tight mb-1 flex items-center gap-3">
            <User className="text-[#3B82F6]" size={26} /> Profil Pengguna
          </h1>
          <p className="text-[16px] font-normal leading-[24px] text-[#6B7280]">
            Kelola data personal, riwayat pendidikan, latar pengalaman, keahlian, dan preferensi karier IT Anda.
          </p>
        </div>

        <div className="bg-white rounded-[12px] p-6 border border-[#D1D5DB] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
            <h3 className="text-[18px] font-semibold leading-[24px] text-[#1F2937] flex items-center gap-2">
              <User size={18} className="text-[#3B82F6]" /> Data Diri
            </h3>
            {isEditDataDiri ? (
              <button onClick={() => setIsEditDataDiri(false)} className="h-[36px] px-4 border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[14px] font-medium rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer text-[#1F2937]">
                <X size={14} /> Batal
              </button>
            ) : (
              <button onClick={handleStartEditDataDiri} className="h-[36px] px-4 border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[14px] font-medium rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer text-[#1F2937]">
                <Edit3 size={14} /> Edit
              </button>
            )}
          </div>

          {isEditDataDiri ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full animate-fadeIn">
              <div className="space-y-1"><label className="text-[14px] font-medium text-[#1F2937]">Nama Lengkap</label><input type="text" value={bufferDataDiri.namaLengkap} onChange={(e) => setBufferDataDiri({...bufferDataDiri, namaLengkap: e.target.value})} className="w-full h-[44px] px-3 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] text-[14px] outline-none focus:border-[#3B82F6]" /></div>
              <div className="space-y-1"><label className="text-[14px] font-medium text-[#1F2937]">Email</label><input type="email" value={bufferDataDiri.email} onChange={(e) => setBufferDataDiri({...bufferDataDiri, email: e.target.value})} className="w-full h-[44px] px-3 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] text-[14px] outline-none focus:border-[#3B82F6]" /></div>
              <div className="space-y-1"><label className="text-[14px] font-medium text-[#1F2937]">Tanggal Lahir</label><input type="date" value={bufferDataDiri.tanggalLahir} onChange={(e) => setBufferDataDiri({...bufferDataDiri, tanggalLahir: e.target.value})} className="w-full h-[44px] px-3 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] text-[14px] outline-none focus:border-[#3B82F6]" /></div>
              <div className="space-y-1"><label className="text-[14px] font-medium text-[#1F2937]">Nomor Telepon (Opsional)</label><input type="text" value={bufferDataDiri.nomorTelepon} onChange={(e) => setBufferDataDiri({...bufferDataDiri, nomorTelepon: e.target.value})} className="w-full h-[44px] px-3 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] text-[14px] outline-none focus:border-[#3B82F6]" /></div>
              <div className="sm:col-span-2 pt-2 flex justify-end">
                <button onClick={handleSaveDataDiri} className="h-[40px] px-5 bg-[#1E3A5F] text-white font-medium text-[14px] rounded-[8px] flex items-center gap-1 hover:bg-[#152A44] cursor-pointer"><Check size={14} /> Simpan Perubahan</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[15px] w-full animate-fadeIn">
              <div className="bg-[#F3F4F6] p-4 rounded-[8px] border border-[#E5E7EB]"><span className="text-[12px] text-[#6B7280] block uppercase">Nama Lengkap</span><span className="text-[16px] font-medium text-[#1F2937] block truncate">{dataDiri.namaLengkap}</span></div>
              <div className="bg-[#F3F4F6] p-4 rounded-[8px] border border-[#E5E7EB]"><span className="text-[12px] text-[#6B7280] block uppercase">Email</span><span className="text-[16px] font-medium text-[#1F2937] block truncate">{dataDiri.email}</span></div>
              <div className="bg-[#F3F4F6] p-4 rounded-[8px] border border-[#E5E7EB]"><span className="text-[12px] text-[#6B7280] block uppercase">Tanggal Lahir (Usia otomatis)</span><span className="text-[16px] font-medium text-[#1F2937]">{dataDiri.tanggalLahir} ({hitungUsia(dataDiri.tanggalLahir)} Tahun)</span></div>
              <div className="bg-[#F3F4F6] p-4 rounded-[8px] border border-[#E5E7EB]"><span className="text-[12px] text-[#6B7280] block uppercase">Nomor Telepon</span><span className="text-[16px] font-medium text-[#1F2937]">{dataDiri.nomorTelepon || 'Belum diisi'}</span></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[12px] p-6 border border-[#D1D5DB] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
            <h3 className="text-[18px] font-semibold leading-[24px] text-[#1F2937] flex items-center gap-2">
              <Briefcase size={18} className="text-[#3B82F6]" /> Status & Pekerjaan
            </h3>
            {isEditStatus ? (
              <button onClick={() => setIsEditStatus(false)} className="h-[36px] px-4 border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[14px] font-medium rounded-[8px] cursor-pointer">
                <X size={14} /> Batal
              </button>
            ) : (
              <button onClick={handleStartEditStatus} className="h-[36px] px-4 border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[14px] font-medium rounded-[8px] cursor-pointer">
                <Edit3 size={14} /> Edit
              </button>
            )}
          </div>

          {isEditStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#1F2937]">Status Saat Ini</label>
                <select value={bufferStatusKerja.statusSaatIni} onChange={(e) => setBufferStatusKerja({...bufferStatusKerja, statusSaatIni: e.target.value})} className="w-full h-[44px] px-3 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] text-[14px] outline-none">
                  <option value="PELAJAR_SMA_SMK">Pelajar SMA/SMK</option>
                  <option value="MAHASISWA">Mahasiswa</option>
                  <option value="FRESH_GRADUATE">Fresh Graduate</option>
                  <option value="BEKERJA">Bekerja</option>
                  <option value="TIDAK_BEKERJA">Tidak Bekerja</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#1F2937]">Berlaku Sejak</label>
                <input type="month" value={bufferStatusKerja.berlakuSejak} onChange={(e) => setBufferStatusKerja({...bufferStatusKerja, berlakuSejak: e.target.value})} className="w-full h-[48px] px-4 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] text-[14px]" />
              </div>
              {bufferStatusKerja.statusSaatIni === 'BEKERJA' && (
                <>
                  <div className="space-y-1.5"><label className="text-[14px] font-medium text-[#1F2937]">Jabatan / Peran</label><input type="text" value={bufferStatusKerja.pekerjaanSekarang} onChange={(e) => setBufferStatusKerja({...bufferStatusKerja, pekerjaanSekarang: e.target.value})} className="w-full h-[44px] px-3 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px]" /></div>
                  <div className="space-y-1.5"><label className="text-[14px] font-medium text-[#1F2937]">Deskripsi Singkat</label><input type="text" value={bufferStatusKerja.deskripsiSingkat} onChange={(e) => setBufferStatusKerja({...bufferStatusKerja, deskripsiSingkat: e.target.value})} className="w-full h-[44px] px-3 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px]" /></div>
                </>
              )}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[14px] font-medium text-[#1F2937]">Nama Institusi</label>
                <input type="text" value={bufferStatusKerja.namaInstitusi} onChange={(e) => setBufferStatusKerja({...bufferStatusKerja, namaInstitusi: e.target.value})} className="w-full h-[44px] px-3 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px]" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button onClick={handleSaveStatusKerja} className="h-[40px] px-5 bg-[#1E3A5F] text-white font-medium text-[14px] rounded-[8px] cursor-pointer">Simpan Perubahan</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#F3F4F6] p-4 rounded-[8px] border border-[#E5E7EB]"><span className="text-[12px] text-[#6B7280] block uppercase">Status Saat Ini</span><span className="text-[16px] font-medium text-[#1F2937]">{statusKerja.statusSaatIni} (Sejak {statusKerja.berlakuSejak})</span></div>
              <div className="bg-[#F3F4F6] p-4 rounded-[8px] border border-[#E5E7EB]"><span className="text-[12px] text-[#6B7280] block uppercase">Nama Institusi</span><span className="text-[16px] font-medium text-[#1F2937]">{statusKerja.namaInstitusi || 'Belum diisi'}</span></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[12px] p-6 border border-[#D1D5DB] shadow-[0_2px_8px_rgba(0,0,0,0.08)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <h3 className="text-[18px] font-semibold leading-[24px] text-[#1F2937] flex items-center gap-2">
              <GraduationCap size={18} className="text-[#3B82F6]" /> Pendidikan
            </h3>
            <button onClick={() => setIsAddingEdu(!isAddingEdu)} className="h-[36px] px-4 bg-[#1E3A5F] text-white text-[14px] font-medium rounded-[8px] flex items-center gap-1 cursor-pointer">
              <Plus size={14} /> Tambah Pendidikan
            </button>
          </div>

          {isAddingEdu && (
            <div className="p-4 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] space-y-3">
              <p className="text-[14px] text-slate-500">Form pengiriman riwayat pendidikan akademik.</p>
              <button type="button" onClick={() => { setIsAddingEdu(false); triggerToast("Sinkronisasi riwayat pendidikan berhasil."); }} className="h-[36px] px-4 bg-[#10B981] text-white text-[14px] font-medium rounded-[8px] cursor-pointer">Simpan Item</button>
            </div>
          )}

          <div className="space-y-2">
            {pendidikanList.map((edu) => (
              <div key={edu.id} className="p-4 bg-white border border-[#E5E7EB] rounded-[8px] flex items-center justify-between">
                <div>
                  <h4 className="text-[16px] font-medium text-[#1F2937]">{edu.jenjang} — {edu.jurusan}</h4>
                  <p className="text-[14px] text-[#6B7280]">Status: {edu.status} {edu.semester ? `(Semester ${edu.semester})` : ''}</p>
                </div>
                <button type="button" onClick={() => triggerToast("Edit item riwayat...")} className="text-[#3B82F6] font-medium text-[14px] cursor-pointer">Edit</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[12px] p-6 border border-[#D1D5DB] shadow-[0_2px_8px_rgba(0,0,0,0.08)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <h3 className="text-[18px] font-semibold leading-[24px] text-[#1F2937] flex items-center gap-2">
              <Briefcase size={18} className="text-[#3B82F6]" /> Pengalaman Kerja
            </h3>
            <button onClick={() => setIsAddingExp(!isAddingExp)} className="h-[36px] px-4 bg-[#1E3A5F] text-white text-[14px] font-medium rounded-[8px] flex items-center gap-1 cursor-pointer">
              <Plus size={14} /> Tambah Pengalaman
            </button>
          </div>

          {isAddingExp && (
            <div className="p-4 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] space-y-3">
              <p className="text-[14px] text-slate-500">Form pengiriman portofolio kerja.</p>
              <button type="button" onClick={() => { setIsAddingExp(false); triggerToast("Sinkronisasi pengalaman kerja berhasil."); }} className="h-[36px] px-4 bg-[#10B981] text-white text-[14px] font-medium rounded-[8px] cursor-pointer">Simpan Item</button>
            </div>
          )}

          <div className="space-y-2">
            {pengalamanList.map((exp) => (
              <div key={exp.id} className="p-4 bg-white border border-[#E5E7EB] rounded-[8px] flex items-center justify-between">
                <div>
                  <h4 className="text-[16px] font-medium text-[#1F2937]">{exp.jabatan} at {exp.perusahaan || 'Klien'}</h4>
                  <p className="text-[14px] text-[#6B7280]">Jenis: {exp.jenis} ({exp.durasi})</p>
                </div>
                <button type="button" onClick={() => triggerToast("Edit item riwayat...")} className="text-[#3B82F6] font-medium text-[14px] cursor-pointer">Edit</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[12px] p-6 border border-[#D1D5DB] shadow-[0_2px_8px_rgba(0,0,0,0.08)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <h3 className="text-[18px] font-semibold leading-[24px] text-[#1F2937] flex items-center gap-2">
              <Award size={18} className="text-[#3B82F6]" /> Keahlian
            </h3>
            <button onClick={() => setIsAddingSkill(!isAddingSkill)} className="h-[36px] px-4 bg-[#1E3A5F] text-white text-[14px] font-medium rounded-[8px] flex items-center gap-1 cursor-pointer">
              <Plus size={14} /> Tambah Keahlian
            </button>
          </div>

          {isAddingSkill && (
            <form onSubmit={handleTambahSkillSubmit} className="p-4 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-[#1F2937]">Nama Keahlian</label>
                  <input 
                    type="text" 
                    placeholder="Ketik nama skill..." 
                    value={newSkillName} 
                    onChange={(e) => setNewSkillName(e.target.value)} 
                    className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] outline-none focus:border-[#3B82F6]" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-[#1F2937]">Kategori</label>
                  <select 
                    value={newSkillKategori} 
                    onChange={(e) => setNewSkillKategori(e.target.value as 'teknis' | 'non-teknis')} 
                    className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] outline-none"
                  >
                    <option value="teknis">Teknis</option>
                    <option value="non-teknis">Non-Teknis</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-[#1F2937]">Tingkat Kemahiran</label>
                  <select 
                    value={newSkillLevel} 
                    onChange={(e) => setNewSkillLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')} 
                    className="w-full h-[40px] px-3 bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsAddingSkill(false)} className="h-[36px] px-4 border border-[#D1D5DB] hover:bg-white text-[13px] font-medium rounded-[8px]">Batal</button>
                <button type="submit" className="h-[36px] px-4 bg-[#10B981] text-white text-[14px] font-medium rounded-[8px] cursor-pointer hover:bg-[#059669]">Simpan Keahlian</button>
              </div>
            </form>
          )}

          <div className="flex flex-wrap gap-2">
            {keahlianList.map((skill) => (
              <div key={skill.id} className="px-3 py-2 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] flex items-center gap-3 text-[14px]">
                <div>
                  <span className="font-medium text-[#1F2937]">{skill.nama}</span>
                  <span className="text-[11px] text-[#6B7280] block uppercase">{skill.kategori} • {skill.level}</span>
                </div>
                <button type="button" onClick={() => handleHapusSkill(skill.id)} className="text-[#6B7280] hover:text-[#EF4444] text-[12px] font-medium cursor-pointer">Hapus</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[12px] p-6 border border-[#D1D5DB] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
            <h3 className="text-[18px] font-semibold leading-[24px] text-[#1F2937] flex items-center gap-2">
              <Sliders size={18} className="text-[#3B82F6]" /> Preferensi Belajar & Karier
            </h3>
            {isEditPreferensi ? (
              <button onClick={() => setIsEditPreferensi(false)} className="h-[36px] px-4 border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[14px] font-medium rounded-[8px] cursor-pointer">
                <X size={14} /> Batal
              </button>
            ) : (
              <button onClick={handleStartEditPreferensi} className="h-[36px] px-4 border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[14px] font-medium rounded-[8px] cursor-pointer">
                <Edit3 size={14} /> Edit
              </button>
            )}
          </div>

          {isEditPreferensi ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#1F2937]">Tech-Savvy Level</label>
                <select value={bufferPreferensi.techSavvyLevel} onChange={(e) => setBufferPreferensi({...bufferPreferensi, techSavvyLevel: e.target.value})} className="w-full h-[48px] px-4 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px]">
                  <option value="Rendah">Rendah</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sangat Tinggi">Sangat Tinggi</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#1F2937]">Gaya Belajar</label>
                <select value={bufferPreferensi.gayaBelajar} onChange={(e) => setBufferPreferensi({...bufferPreferensi, gayaBelajar: e.target.value})} className="w-full h-[48px] px-4 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px]">
                  <option value="Visual">Visual</option>
                  <option value="Auditori">Auditori</option>
                  <option value="Praktik Langsung">Praktik Langsung</option>
                  <option value="Membaca & Menulis">Membaca & Menulis</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button onClick={handleSavePreferensi} className="h-[48px] px-6 bg-[#1E3A5F] text-white font-medium text-[16px] rounded-[8px] cursor-pointer">Simpan Perubahan</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[14px]">
              <div className="bg-[#F3F4F6] p-3 rounded-[8px]"><span className="text-[#6B7280] block text-[12px] uppercase">Tech-Savvy</span><span className="font-medium text-[#1F2937]">{preferensi.techSavvyLevel}</span></div>
              <div className="bg-[#F3F4F6] p-3 rounded-[8px]"><span className="text-[#6B7280] block text-[12px] uppercase">Gaya Belajar</span><span className="font-medium text-[#1F2937]">{preferensi.gayaBelajar}</span></div>
              <div className="bg-[#F3F4F6] p-3 rounded-[8px]"><span className="text-[#6B7280] block text-[12px] uppercase">Lingkungan</span><span className="font-medium text-[#1F2937]">{preferensi.lingkunganKerja}</span></div>
              <div className="bg-[#F3F4F6] p-3 rounded-[8px]"><span className="text-[#6B7280] block text-[12px] uppercase">Tipe Korporasi</span><span className="font-medium text-[#1F2937]">{preferensi.tipePerusahaan}</span></div>
              <div className="bg-[#F3F4F6] p-3 rounded-[8px]"><span className="text-[#6B7280] block text-[12px] uppercase">Komitmen Waktu</span><span className="font-medium text-[#1F2937]">{preferensi.komitmenWaktu} Jam / Minggu</span></div>
              <div className="bg-[#F3F4F6] p-3 rounded-[8px]"><span className="text-[#6B7280] block text-[12px] uppercase">Range Pendapatan</span><span className="font-medium text-[#1F2937]">{preferensi.pendapatanRange || 'Opsional'}</span></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[12px] p-6 border border-[#D1D5DB] shadow-[0_2px_8px_rgba(0,0,0,0.08)] space-y-4">
          <div className="border-b border-[#E5E7EB] pb-3">
            <h3 className="text-[18px] font-semibold leading-[24px] text-[#1F2937] flex items-center gap-2">
              <Target size={18} className="text-[#3B82F6]" /> Target Karier
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#F3F4F6] p-5 rounded-[12px] border border-[#E5E7EB]">
            <div className="md:col-span-2 space-y-3">
              <div>
                <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider block">Target Profesi Saat Ini</span>
                <span className="text-[20px] font-bold text-[#1E3A5F]">{targetKarier.namaProfesi}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[13px] font-medium text-slate-600">
                  <span>Persentase Kesiapan Kerja</span>
                  <span className="font-bold text-[#10B981]">{targetKarier.kesiapanKerja}%</span>
                </div>
                <div className="w-full bg-[#E5E7EB] h-3 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${targetKarier.kesiapanKerja}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => alert("Mengalihkan ke rekomendasi karier...")} className="h-[48px] w-full border-[1.5px] border-[#1E3A5F] text-[#1E3A5F] font-medium text-[14px] rounded-[8px] bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                Lihat Rekomendasi Lain
              </button>
              <button onClick={() => alert("Mengalihkan ke halaman kuesioner ulang...")} className="h-[48px] w-full bg-[#1E3A5F] text-white font-medium text-[14px] rounded-[8px] cursor-pointer hover:bg-[#152A44] transition-colors">
                Ganti Target
              </button>
            </div>
          </div>

          <div className="text-[12px] font-normal text-[#6B7280] leading-[16px] bg-[#FEF3C7] border border-[#FEF3C7] p-3 rounded-[8px]">
            <b>Penafian Transparansi AI:</b> Seluruh kalkulasi persentase kualifikasi kesiapan kerja bersifat sugestif edukatif pembantu navigasi arah belajar Anda, bukan parameter mutlak kelulusan industri.
          </div>
        </div>

        {toastMessage && (
          <div className="fixed top-6 right-6 bg-[#1F2937] text-white px-4 py-3 rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] font-medium text-[14px] leading-[20px] animate-slideInRight z-50 flex items-center gap-2 border border-[#E5E7EB]/10 max-w-[80vw]">
            <Check size={16} strokeWidth={3} className="shrink-0 text-[#10B981]" /> 
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;