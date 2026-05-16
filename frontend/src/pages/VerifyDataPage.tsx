import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Plus, ArrowLeft, User, Target, GraduationCap, Briefcase 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SkillItem from '../components/verify/SkillItem';

const VerifyDataPage = () => {
  const navigate = useNavigate();

  // Data Dummy sesuai permintaan (Harry Phalosa, React, Node)
  const [formData, setFormData] = useState({
    fullName: 'Harry Phalosa',
    email: 'harry.phalosa@example.com',
    education: 'S1 Teknik Informatika - Universitas Brawijaya',
    experience: 'Fullstack Developer Intern'
  });

  const [skills, setSkills] = useState([
    { id: 1, name: 'React.js', level: 'Intermediate' },
    { id: 2, name: 'Node.js', level: 'Beginner' }
  ]);

  // Handlers untuk Skill Dinamis
  const addSkill = () => setSkills([...skills, { id: Date.now(), name: '', level: 'Beginner' }]);
  const removeSkill = (id: number) => setSkills(skills.filter(s => s.id !== id));
  const updateSkill = (id: number, field: string, value: string) => 
    setSkills(skills.map(s => s.id === id ? { ...s, [field]: value } : s));

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      <main className="flex-grow py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Header Judul */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-[#1E3A5F] text-[28px] md:text-[32px] font-bold tracking-tight">Verifikasi & Lengkapi Profil</h1>
            <p className="text-[#6B7280] text-[16px] mt-2 font-medium">
              Pastikan informasi pendidikan dan keahlian Anda sudah sesuai.
            </p>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SISI KIRI: CV Preview Placeholder (Responsive & Stable) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 z-0">
              <div className="bg-[#E0E7FF]/40 border-2 border-dashed border-[#3B82F6]/20 rounded-[12px] min-h-[300px] lg:h-[580px] flex flex-col items-center justify-center p-8 text-center transition-all">
                <div className="space-y-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto border-2 border-white shadow-sm">
                    <Upload className="text-[#6B7280]" size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-[#1E3A5F]">Belum ada CV terunggah</p>
                    <p className="text-sm text-[#6B7280] max-w-[200px] mx-auto">
                      Anda tetap bisa melanjutkan dengan mengisi data manual di samping.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/upload-cv')}
                    className="px-6 py-2 bg-white border border-[#D1D5DB] rounded-full text-sm font-bold text-[#1E3A5F] hover:bg-white/80 transition-all shadow-sm"
                  >
                    Unggah CV Sekarang
                  </button>
                </div>
              </div>
            </div>

            {/* SISI KANAN: Form Input (Scrollable) */}
            <div className="lg:col-span-8 space-y-8 pb-12">
              
              {/* Card 1: Data Personal & Pendidikan */}
              <div className="bg-white rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-6 md:p-10 space-y-6 border border-gray-50">
                <h3 className="text-[#1E3A5F] font-bold text-[18px] flex items-center gap-2">
                  <User size={20} className="text-[#3B82F6]" /> Data Personal & Pendidikan
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-medium text-[#1F2937]">Nama Lengkap</label>
                    <input 
                      type="text" 
                      className="w-full h-[48px] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[8px] px-4 focus:border-[#3B82F6] focus:bg-white outline-none transition-all"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-medium text-[#1F2937]">Email</label>
                    <input 
                      type="email" 
                      placeholder="nama@email.com"
                      className="w-full h-[48px] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[8px] px-4 focus:border-[#3B82F6] focus:bg-white outline-none transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[14px] font-medium text-[#1F2937] flex items-center gap-2">
                    <GraduationCap size={16} /> Pendidikan Terakhir / Saat Ini
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: S1 Teknik Informatika - Universitas Brawijaya"
                    className="w-full h-[48px] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[8px] px-4 focus:border-[#3B82F6] focus:bg-white outline-none transition-all"
                    value={formData.education}
                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[14px] font-medium text-[#1F2937] flex items-center gap-2">
                    <Briefcase size={16} /> Pengalaman Terakhir / Saat Ini
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Siswa Aktif atau Frontend Developer"
                    className="w-full h-[48px] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[8px] px-4 focus:border-[#3B82F6] focus:bg-white outline-none transition-all"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  />
                </div>
              </div>

              {/* Card 2: Skills Section */}
              <div className="bg-white rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-6 md:p-10 border border-gray-50">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[#1E3A5F] font-bold text-[18px] flex items-center gap-2">
                    <Target size={20} className="text-[#3B82F6]" /> Skills & Competencies
                  </h3>
                  <button onClick={addSkill} className="flex items-center gap-1 text-[#3B82F6] text-[14px] font-bold hover:underline transition-all">
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
                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-[12px]">
                      <p className="text-[14px] text-[#6B7280]">Belum ada skill yang ditambahkan.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons (Responsive Footer) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-[48px] border border-[#D1D5DB] rounded-[8px] font-bold text-[#1E3A5F] hover:bg-white transition-all shadow-sm"
                >
                  <ArrowLeft size={18} /> Kembali
                </button>
                <button 
                  onClick={() => navigate('/assessment/profiling')} 
                  className="w-full sm:w-auto px-8 h-[48px] bg-[#1E3A5F] text-white rounded-[8px] font-bold hover:bg-[#152A44] transition-all shadow-lg active:scale-95"
                >
                  Lanjutkan ke Asesmen
              </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyDataPage;