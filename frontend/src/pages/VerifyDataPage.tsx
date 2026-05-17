import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Upload, Plus, ArrowLeft, User, Target, GraduationCap, Briefcase, Loader2, Sparkles, CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SkillItem from '../components/verify/SkillItem';
import cvService from '../services/cvService';
import { useAuthStore } from '../store/useAuthStore';

interface SkillEntry {
  id: number;
  name: string;
  level: string;
}

const VerifyDataPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Ambil state hasil ekstraksi dari UploadCVPage
  const { cvId, extractedInfo } = (location.state || {}) as { cvId?: string; extractedInfo?: any };

  // States untuk Form & Skill
  const [formData, setFormData] = useState({
    fullName: 'Harry Phalosa',
    email: 'harry.phalosa@example.com',
    education: 'S1 Teknik Informatika - Universitas Brawijaya',
    experience: 'Fullstack Developer Intern'
  });

  const [skills, setSkills] = useState<SkillEntry[]>([
    { id: 1, name: 'React.js', level: 'Intermediate' },
    { id: 2, name: 'Node.js', level: 'Beginner' }
  ]);

  // Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'success' | 'error'>('saving');
  const [errorMsg, setErrorMsg] = useState('');

  // Sinkronisasi data dari hasil ekstraksi AI CV / Profile User
  useEffect(() => {
    // 1. Tentukan Nama & Email (Prioritaskan data auth login pengguna)
    const name = user?.name || extractedInfo?.name || 'Harry Phalosa';
    const email = user?.email || 'harry.phalosa@example.com';

    // 2. Format Pendidikan
    let educationStr = 'S1 Teknik Informatika - Universitas Brawijaya';
    if (extractedInfo?.educationHistory && extractedInfo.educationHistory.length > 0) {
      const firstEdu = extractedInfo.educationHistory[0];
      educationStr = `${firstEdu.degree || 'S1'} ${firstEdu.major || 'Teknik Informatika'} - ${firstEdu.institution || 'Universitas Brawijaya'}`;
    }

    // 3. Format Pengalaman
    let experienceStr = 'Fullstack Developer Intern';
    if (extractedInfo?.workExperiences && extractedInfo.workExperiences.length > 0) {
      const firstExp = extractedInfo.workExperiences[0];
      experienceStr = `${firstExp.role || 'Software Engineer'} di ${firstExp.company || 'StepWise Partner'}`;
    }

    // Set Form Data
    setFormData({
      fullName: name,
      email: email,
      education: educationStr,
      experience: experienceStr
    });

    // 4. Format Skills
    if (extractedInfo?.extractedSkills && extractedInfo.extractedSkills.length > 0) {
      const mappedSkills = extractedInfo.extractedSkills.map((sk: string, idx: number) => ({
        id: idx + 1,
        name: sk,
        level: 'Intermediate'
      }));
      setSkills(mappedSkills);
    }
  }, [user, extractedInfo]);

  // Handlers untuk Skill Dinamis
  const addSkill = () => setSkills([...skills, { id: Date.now(), name: '', level: 'Beginner' }]);
  const removeSkill = (id: number) => setSkills(skills.filter(s => s.id !== id));
  const updateSkill = (id: number, field: string, value: string) => 
    setSkills(skills.map(s => s.id === id ? { ...s, [field]: value } : s));

  // Handler Submit & Simpan ke Profile Database
  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    setErrorMsg('');

    try {
      // 1. Parsing Single-line Text ke Array Object sesuai JSON Schema Backend
      let degree = 'S1';
      let major = 'Teknik Informatika';
      let institution = formData.education;

      if (formData.education.includes(' - ')) {
        const parts = formData.education.split(' - ');
        institution = parts[1] || '';
        const firstPart = parts[0] || '';
        const words = firstPart.split(' ');
        degree = words[0] || 'S1';
        major = words.slice(1).join(' ');
      } else {
        const words = formData.education.split(' ');
        if (words.length > 1) {
          degree = words[0];
          major = words.slice(1).join(' ');
        }
      }

      let role = formData.experience;
      let company = 'StepWise Partner';
      if (formData.experience.includes(' di ')) {
        const parts = formData.experience.split(' di ');
        role = parts[0] || '';
        company = parts[1] || '';
      }

      const reviewBody = {
        educationHistory: [
          { 
            institution: institution.trim(), 
            degree: degree.trim(), 
            major: major.trim(), 
            year: '2026' 
          }
        ],
        workExperiences: [
          { 
            company: company.trim(), 
            role: role.trim(), 
            duration: '1 Tahun', 
            description: `Bekerja sebagai ${role.trim()} profesional.` 
          }
        ],
        extractedSkills: skills.map(s => s.name).filter(Boolean)
      };

      // 2. Simpan ke database jika ada cvId
      if (cvId) {
        console.log(`Menyimpan review data CV dengan ID: ${cvId}...`);
        await cvService.reviewCv(cvId, reviewBody);
        console.log('Profil berhasil disimpan di backend!');
      } else {
        console.warn('Simpan profil manual tanpa cvId, mengabaikan hit review.');
      }

      setSaveStatus('success');
      
      // Delay sebentar untuk feedback kesuksesan yang premium
      setTimeout(() => {
        setIsSaving(false);
        navigate('/assessment/profiling');
      }, 1500);

    } catch (err: any) {
      console.error('Gagal menyimpan tinjauan profil:', err);
      setSaveStatus('error');
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan profil belajar Anda. Silakan periksa koneksi Anda dan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      <main className="flex-grow py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Header Judul */}
          <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-[#1E3A5F] text-[28px] md:text-[32px] font-extrabold tracking-tight">Verifikasi & Lengkapi Profil</h1>
              <p className="text-[#6B7280] text-[15px] mt-2 font-medium">
                Pastikan informasi pendidikan dan keahlian Anda sudah sesuai untuk kurikulum adaptif terbaik.
              </p>
            </div>
            {extractedInfo && (
              <div className="bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] rounded-xl px-4 py-2 flex items-center gap-2 text-[13px] font-bold">
                <Sparkles size={16} className="text-[#2E7D32]" />
                <span>Terisi otomatis via Ekstraksi AI CV</span>
              </div>
            )}
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SISI KIRI: CV Preview Placeholder (Responsive & Stable) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 z-0">
              <div className="bg-[#E0E7FF]/40 border-2 border-dashed border-[#3B82F6]/20 rounded-[20px] min-h-[300px] lg:h-[580px] flex flex-col items-center justify-center p-8 text-center transition-all bg-white/35">
                <div className="space-y-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto border border-slate-100 shadow-sm text-[#3B82F6]">
                    <Upload size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-extrabold text-[#1E3A5F] text-[16px] tracking-tight">
                      {extractedInfo ? 'CV Berhasil Diolah' : 'Belum ada CV terunggah'}
                    </p>
                    <p className="text-sm text-[#6B7280] max-w-[220px] mx-auto leading-relaxed">
                      {extractedInfo 
                        ? 'Data di sebelah kanan diisi otomatis berdasarkan CV terbaik Anda.' 
                        : 'Anda tetap bisa melanjutkan dengan mengisi data manual di samping.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/upload-cv')}
                    className="px-6 h-[40px] bg-white border border-[#D1D5DB] rounded-xl text-xs font-bold text-[#1E3A5F] hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    {extractedInfo ? 'Unggah CV Baru' : 'Unggah CV Sekarang'}
                  </button>
                </div>
              </div>
            </div>

            {/* SISI KANAN: Form Input (Scrollable) */}
            <div className="lg:col-span-8 space-y-8 pb-12">
              
              {/* Card 1: Data Personal & Pendidikan */}
              <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6 md:p-10 space-y-6 border border-slate-200/60">
                <h3 className="text-[#1E3A5F] font-black text-[17px] flex items-center gap-2 border-b border-slate-50 pb-3 uppercase tracking-wider">
                  <User size={18} className="text-[#3B82F6]" /> Data Personal & Pendidikan
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13.5px] font-bold text-[#1F2937]">Nama Lengkap</label>
                    <input 
                      type="text" 
                      className="w-full h-[48px] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[10px] px-4 focus:border-[#3B82F6] focus:bg-white outline-none transition-all font-medium text-[#1E3A5F]"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13.5px] font-bold text-[#1F2937]">Email</label>
                    <input 
                      type="email" 
                      placeholder="nama@email.com"
                      className="w-full h-[48px] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[10px] px-4 focus:border-[#3B82F6] focus:bg-white outline-none transition-all font-medium text-[#1E3A5F]"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13.5px] font-bold text-[#1F2937] flex items-center gap-2">
                    <GraduationCap size={16} className="text-[#3B82F6]" /> Pendidikan Terakhir / Saat Ini
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: S1 Teknik Informatika - Universitas Brawijaya"
                    className="w-full h-[48px] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[10px] px-4 focus:border-[#3B82F6] focus:bg-white outline-none transition-all font-medium text-[#1E3A5F]"
                    value={formData.education}
                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13.5px] font-bold text-[#1F2937] flex items-center gap-2">
                    <Briefcase size={16} className="text-[#3B82F6]" /> Pengalaman Terakhir / Saat Ini
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Siswa Aktif atau Frontend Developer"
                    className="w-full h-[48px] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[10px] px-4 focus:border-[#3B82F6] focus:bg-white outline-none transition-all font-medium text-[#1E3A5F]"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  />
                </div>
              </div>

              {/* Card 2: Skills Section */}
              <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6 md:p-10 border border-slate-200/60">
                <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-3">
                  <h3 className="text-[#1E3A5F] font-black text-[17px] flex items-center gap-2 uppercase tracking-wider">
                    <Target size={18} className="text-[#3B82F6]" /> Skills & Competencies
                  </h3>
                  <button 
                    onClick={addSkill} 
                    className="flex items-center gap-1 text-[#3B82F6] text-[13px] font-extrabold hover:underline transition-all cursor-pointer"
                  >
                    <Plus size={16} /> Tambah Skill
                  </button>
                </div>

                <div className="space-y-4">
                  {skills.map((skill) => (
                    <SkillItem 
                      key={skill.id} 
                      skill={skill} 
                      onUpdate={updateSkill} 
                      onRemove={removeSkill} 
                    />
                  ))}
                  {skills.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[12px] bg-slate-50/50">
                      <p className="text-[13px] text-[#6B7280] font-bold">Belum ada skill yang ditambahkan.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message if Save Fails */}
              {saveStatus === 'error' && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-red-500 font-bold shrink-0 mt-0.5">⚠️</span>
                  <div>
                    <h4 className="text-red-800 text-[13.5px] font-bold">Gagal Menyimpan Profil</h4>
                    <p className="text-red-600 text-[12.5px] font-medium mt-0.5">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons (Responsive Footer) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-[48px] border border-[#D1D5DB] rounded-[10px] font-bold text-[#1E3A5F] hover:bg-slate-50 transition-colors shadow-sm cursor-pointer bg-white"
                >
                  <ArrowLeft size={18} /> Kembali
                </button>
                
                <button 
                  onClick={handleSaveAndContinue} 
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 h-[48px] bg-[#1E3A5F] text-white rounded-[10px] font-bold hover:bg-[#152A44] transition-colors shadow-md active:scale-95 cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Menyimpan...
                    </>
                  ) : (
                    <span>Lanjutkan ke Asesmen</span>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* PREMIUM SAVING FEEDBACK SCREEN (GLASSMORPHISM) */}
      {isSaving && saveStatus !== 'error' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-[400px] w-full p-8 md:p-10 text-center shadow-2xl border border-white flex flex-col items-center">
            
            <div className="relative w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-6 shadow-md shadow-[#3B82F6]/5 text-[#3B82F6]">
              {saveStatus === 'success' ? (
                <CheckCircle2 size={32} className="text-[#10B981] animate-bounce" />
              ) : (
                <Loader2 className="animate-spin" size={28} />
              )}
            </div>
            
            <h3 className="text-[#1E3A5F] text-[18px] md:text-[20px] font-black leading-tight tracking-tight mb-2">
              {saveStatus === 'success' ? 'Profil Berhasil Disimpan!' : 'Menyimpan Profil Belajar...'}
            </h3>
            
            <p className="text-[#6B7280] text-[13px] md:text-[14px] leading-relaxed font-medium">
              {saveStatus === 'success' 
                ? 'Profil Anda telah terkalibrasi di database. Membuka lembar asesmen...' 
                : 'Mengonversi dan menyelaraskan keahlian Anda ke dalam sistem evaluasi adaptif kami.'}
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VerifyDataPage;