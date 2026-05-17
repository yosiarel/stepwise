import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Eye, Check, ArrowRight, Award, X, Briefcase, Building, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

interface IntegratedSkill {
  name: string;
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced' | null;
  targetLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'matching' | 'upgrade' | 'new';
}

interface ProfessionCard {
  id: string;
  title: string;
  description: string;
  readiness: number;
  reason: string;
  skillsHave: string[];
  skillsGap: string[];
  responsibilities: string[];
  companyTypes: string[];
  outlook: string;
  integratedSkills: IntegratedSkill[];
}

const DashboardCareerPage = () => {
  const navigate = useNavigate(); 
  const [selectedId, setSelectedId] = useState<string>('frontend');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Dataset Rekomendasi
  const recommendations: ProfessionCard[] = [
    {
      id: 'frontend',
      title: 'Frontend Developer',
      description: 'Membangun dan mengoptimalkan komponen antarmuka web yang interaktif, responsif, serta memastikan kenyamanan pengalaman pengguna akhir secara visual.',
      readiness: 85,
      reason: 'Kecocokan yang sangat kuat berdasarkan pemahaman dasar HTML, CSS, dan JavaScript kamu saat ini. Fokus mendalami modern framework serta manajemen state akan mempercepat kesiapan kerjamu menuju level profesional industri.',
      skillsHave: ['HTML/CSS', 'JavaScript', 'Git'], 
      skillsGap: ['React/Vue', 'State Management'],
      responsibilities: [
        'Mentransformasikan mockup desain UI/UX (Figma) menjadi kode web yang bersih, modular, dan interaktif.',
        'Mengintegrasikan API (Application Programming Interface) untuk pertukaran data yang dinamis.',
        'Mengoptimalkan performa kecepatan loading aplikasi web dan memastikan fungsionalitas lintas browser.'
      ],
      companyTypes: ['Tech Companies (Mapan)', 'Tech Startups', 'Digital Agencies', 'E-commerce Platforms'],
      outlook: 'Kebutuhan talenta sangat tinggi seiring transformasi digital global. Jalur karier mapan menuju Senior Developer, Tech Lead, hingga Engineering Manager.',
      integratedSkills: [
        { name: 'State Management', currentLevel: null, targetLevel: 'Intermediate', status: 'new' },
        { name: 'React/Vue', currentLevel: 'Beginner', targetLevel: 'Advanced', status: 'upgrade' },
        { name: 'HTML/CSS', currentLevel: 'Advanced', targetLevel: 'Advanced', status: 'matching' },
        { name: 'JavaScript', currentLevel: 'Intermediate', targetLevel: 'Intermediate', status: 'matching' }, 
        { name: 'Git', currentLevel: 'Beginner', targetLevel: 'Beginner', status: 'matching' }
      ]
    },
    {
      id: 'uiux',
      title: 'UI/UX Designer',
      description: 'Merancang alur arsitektur informasi, pengalaman eksplorasi produk, serta visualisasi antarmuka aplikasi digital agar intuitif, bernilai guna, dan estetik.',
      readiness: 70,
      reason: 'Kemampuan desain visual, estetika, dan empati pengguna kamu sudah sangat solid. Memperdalam metodologi riset pengguna (user research) serta pembuatan purwarupa interaktif akan melengkapi portofolio emasmu.',
      skillsHave: ['Figma', 'Visual Design'],
      skillsGap: ['User Research', 'Prototyping'],
      responsibilities: [
        'Melakukan riset pengguna (wawancara, survei) untuk memahami kebutuhan masalah nyata target audiens.',
        'Menyusun wireframe, user flow, dan purwarupa (prototype) interaktif untuk keperluan pengujian produk.',
        'Merancang sistem desain visual (komponen, tipografi, warna) yang konsisten dan modern.'
      ],
      companyTypes: ['Product Startups', 'IT Consultancies', 'Digital Design Studios', 'Korporat Multinasional'],
      outlook: 'Sangat krusial bagi retensi pengguna produk digital. Peluang karier meluas menjadi Senior Designer, Lead UX Researcher, hingga Product Manager.',
      integratedSkills: [
        { name: 'User Research', currentLevel: null, targetLevel: 'Intermediate', status: 'new' },
        { name: 'Prototyping', currentLevel: 'Beginner', targetLevel: 'Advanced', status: 'upgrade' },
        { name: 'Figma', currentLevel: 'Intermediate', targetLevel: 'Intermediate', status: 'matching' },
        { name: 'Visual Design', currentLevel: 'Advanced', targetLevel: 'Advanced', status: 'matching' }
      ]
    },
    {
      id: 'data-analyst',
      title: 'Data Analyst',
      description: 'Mengolah, mengekstrak, dan memvalidasi sekumpulan dataset mentah menjadi laporan analisis bisnis yang mudah dipahami guna mendukung pengambilan keputusan.',
      readiness: 60,
      reason: 'Memiliki fondasi berpikir logis, analitis, dan sistematis yang kuat dari hobi olah datamu. Kamu hanya memerlukan pelatihan terstruktur pada penguerian database relasional serta penguasaan tools visualisasi data mutakhir.',
      skillsHave: ['Excel', 'Analytical Logic'],
      skillsGap: ['SQL', 'Python/R', 'Tableau'],
      responsibilities: [
        'Mengekstrak dan memfilter data dari berbagai database relational menggunakan query SQL terstruktur.',
        'Melakukan pembersihan data (data cleaning) untuk menjaga validitas and akurasi metrik bisnis.',
        'Membangun dashboard visualisasi data interaktif untuk monitoring performa bisnis berkala.'
      ],
      companyTypes: ['Fintech & Perbankan', 'FMCG / Korporat Ritel', 'Business Consultancies', 'Data Center & Telekomunikasi'],
      outlook: 'Era Big Data menuntut setiap bisnis mengambil keputusan berbasis data. Prospek karier cerah menuju Senior Analyst, Analytics Manager, atau transisi ke Data Scientist.',
      integratedSkills: [
        { name: 'SQL', currentLevel: null, targetLevel: 'Advanced', status: 'new' },
        { name: 'Tableau', currentLevel: null, targetLevel: 'Intermediate', status: 'new' },
        { name: 'Python/R', currentLevel: 'Beginner', targetLevel: 'Intermediate', status: 'upgrade' },
        { name: 'Excel', currentLevel: 'Advanced', targetLevel: 'Advanced', status: 'matching' },
        { name: 'Analytical Logic', currentLevel: 'Advanced', targetLevel: 'Advanced', status: 'matching' }
      ]
    }
  ];

  const currentSelectedProfession = recommendations.find(p => p.id === selectedId);
  const [modalData, setModalData] = useState<ProfessionCard>(recommendations[0]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleOpenModal = (prof: ProfessionCard) => {
    setModalData(prof);
    setIsModalOpen(true);
  };

  const handleUpdateTarget = () => {
    if (currentSelectedProfession) {
      alert(`Target karier berhasil diperbarui ke: ${currentSelectedProfession.title}`);
      navigate('/dashboard/roadmap'); 
    }
  };

  return (
    <DashboardLayout>
      {/* PERBAIKAN TAKTIS LAYER BESAR: Menghapus h-full dan min-h kaku agar tinggi pembungkus menguncup natural mengikuti volume konten asli */}
      <div className="w-full transition-all flex flex-col relative pb-4">
        
        <div className="text-center mb-8 max-w-[850px] mx-auto pt-2">
          <h1 className="text-[#1E3A5F] text-[28px] md:text-[34px] font-extrabold leading-tight tracking-tight mb-3">
            Manajemen Target Karier
          </h1>
          <p className="text-[#6B7280] text-[14px] md:text-[15px] leading-relaxed font-medium">
            Jelajahi kembali rekomendasi profesimu atau ubah fokus utama untuk menyesuaikan ulang kurikulum belajarmu.
          </p>
        </div>

        {/* PERBAIKAN TAKTIS LAYER BESAR: Mengubah items-start flex-grow menjadi items-stretch agar tinggi antar kartu seragam secara proporsional sesuai isi teks, bukan melar dipaksa tinggi layar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8 items-stretch">
          {recommendations.map((prof) => {
            const isSelected = selectedId === prof.id;
            const sentences = prof.reason.split(/(?<=[.!?])\s+/);
            const summaryText = sentences.slice(0, 2).join(' ') + (sentences.length > 2 ? '...' : '');

            return (
              <div
                key={prof.id}
                onClick={() => setSelectedId(prof.id)}
                className={`relative bg-white rounded-[20px] p-6 xl:p-8 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  isSelected 
                    ? 'border-[#1E3A5F] shadow-xl shadow-[#1E3A5F]/5 scale-[1.01]' 
                    : 'border-slate-200/60 shadow-sm hover:border-[#3B82F6] hover:shadow-md'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3.5 right-6 bg-[#1E3A5F] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Check size={12} strokeWidth={3} /> Target Aktif
                  </div>
                )}

                <div>
                  <h3 className="text-[#1E3A5F] text-[18px] xl:text-[21px] font-extrabold mb-4 group-hover:text-[#3B82F6] transition-colors">
                    {prof.title}
                  </h3>

                  <div className="mb-6 bg-slate-50 p-3.5 rounded-lg border border-slate-100/50">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Kesiapan</span>
                      <span className="text-[#10B981] text-[14px] font-extrabold">{prof.readiness}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-[7px] rounded-full overflow-hidden">
                      <div className="bg-[#10B981] h-full rounded-full transition-all duration-500" style={{ width: `${prof.readiness}%` }}></div>
                    </div>
                  </div>

                  <p className="text-[#4B5563] text-[13.5px] xl:text-[14px] leading-relaxed mb-6 font-medium">
                    {summaryText}
                  </p>

                  <div className="space-y-4 pt-3 mb-6 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Skills Terkuasai</span>
                      <div className="flex flex-wrap gap-1.5">
                        {prof.skillsHave.map((sk, i) => (
                          <span key={i} className="bg-[#EFF6FF] text-[#3B82F6] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#DBEAFE]">{sk}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Skill Gaps</span>
                      <div className="flex flex-wrap gap-1.5">
                        {prof.skillsGap.map((sg, i) => (
                          <span key={i} className="bg-[#FFFBEB] text-[#D97706] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#FEF3C7]">{sg}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleOpenModal(prof); }}
                  className="w-full h-[44px] bg-slate-50 text-[#1E3A5F] hover:bg-[#EFF6FF] hover:text-[#3B82F6] font-bold text-[13.5px] rounded-[10px] flex items-center justify-center gap-2 border border-slate-200/80 transition-colors mt-4"
                >
                  <Eye size={16} /> Lihat Detail
                </button>
              </div>
            );
          })}
        </div>

        {/* ACTION BAR STICKY: Jarak margin top dikurangi (mt-6) agar tidak menjauhkan bar terlalu ekstrem */}
        <div className="sticky bottom-0 mt-8 w-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-2xl px-5 xl:px-8 py-4 z-30 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-[#3B82F6] shrink-0 hidden sm:flex">
              <Award size={20} />
            </div>
            <div>
              <span className="text-slate-400 text-[12px] font-bold uppercase tracking-wider block">Target Terpilih:</span>
              <strong className="text-[#1E3A5F] text-[16px] xl:text-[18px] font-black">{currentSelectedProfession?.title}</strong>
            </div>
          </div>
          <button
            onClick={handleUpdateTarget}
            className="w-full sm:w-auto h-[48px] xl:h-[52px] px-8 xl:px-10 bg-[#1E3A5F] hover:bg-[#152A44] text-white font-bold text-[14.5px] xl:text-[15.5px] rounded-[12px] flex items-center justify-center gap-2 shadow-lg shadow-[#1E3A5F]/10 transition-all active:scale-95"
          >
            Perbarui Roadmap Belajar <ArrowRight size={16} />
          </button>
        </div>

      </div>

      {/* MODAL COMPONENT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-[1100px] xl:max-w-[1200px] 2xl:max-w-[1280px] rounded-[24px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-slate-100 transition-all">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1E3A5F] text-white rounded-xl flex items-center justify-center shadow-md shadow-[#1E3A5F]/10">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="text-[#1E3A5F] text-[20px] md:text-[22px] font-black tracking-tight">{modalData.title}</h2>
                  <p className="text-[#6B7280] text-[12px] font-medium">Detail Ringkasan Kompetensi dan Prospek Industri</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 rounded-full bg-white text-slate-400 hover:text-slate-600 border border-slate-200/60 flex items-center justify-center transition-colors shadow-sm">
                <X size={18} />
              </button>
            </div>

            <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-8 bg-white max-h-[calc(90vh-84px)]">
              <div className="md:col-span-7 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#3B82F6] uppercase tracking-widest block">Deskripsi</span>
                    <p className="text-slate-600 text-[14px] leading-relaxed font-medium pl-4 border-l-4 border-[#1E3A5F]">{modalData.description}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#3B82F6] uppercase tracking-widest block">Alasan Rekomendasi AI</span>
                    <p className="text-slate-700 text-[14px] leading-relaxed font-semibold pl-4 border-l-4 border-[#1E3A5F]">{modalData.reason}</p>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100/70">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#1E3A5F] text-[13px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">Kesiapan Kerja Saat Ini</span>
                    <span className="text-[#10B981] text-[20px] font-black">{modalData.readiness}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-[10px] rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-[#10B981] to-[#059669] h-full rounded-full transition-all duration-700" style={{ width: `${modalData.readiness}%` }}></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[#1E3A5F] text-[14px] font-extrabold uppercase tracking-wider">Gambaran Umum Profesi</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-2">
                      <span className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5"><Briefcase size={15} className="text-[#3B82F6]" /> Tanggung Jawab Harian</span>
                      <ul className="list-disc pl-4 text-slate-500 text-[12px] space-y-1.5 font-medium">
                        {modalData.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-1.5">
                        <span className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5"><Building size={15} className="text-[#3B82F6]" /> Perusahaan Pengguna</span>
                        <p className="text-slate-500 text-[12px] leading-relaxed font-medium">{modalData.companyTypes.join(', ')}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-1.5">
                        <span className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5"><TrendingUp size={15} className="text-[#10B981]" /> Prospek Jangka Panjang</span>
                        <p className="text-slate-500 text-[12px] leading-relaxed font-medium">{modalData.outlook}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col h-full border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                <div className="mb-4">
                  <h4 className="text-[#1E3A5F] text-[14px] font-extrabold uppercase tracking-wider mb-1">Daftar Skill & Target Belajar</h4>
                  <p className="text-slate-400 text-[11px] font-medium leading-normal">Diurutkan berdasarkan prioritas skill yang perlu kamu kejar terlebih dahulu.</p>
                </div>
                <div className="space-y-3 flex-grow overflow-y-auto max-h-[420px] pr-1.5 scrollbar-thin">
                  {modalData.integratedSkills.map((skill, index) => (
                    <div key={index} className={`p-3.5 rounded-xl border transition-all ${skill.status === 'matching' ? 'bg-white border-slate-100' : skill.status === 'upgrade' ? 'bg-amber-50/20 border-amber-200/60 shadow-sm' : 'bg-blue-50/20 border-blue-200/60 shadow-sm'}`}>
                      <div className="flex justify-between items-start gap-2 mb-2.5">
                        <span className="font-extrabold text-[#1E3A5F] text-[13px] tracking-tight">{skill.name}</span>
                        {skill.status === 'matching' && <span className="bg-[#D1FAE5] text-[#065F46] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#A7F3D0] uppercase tracking-wide">Tercapai</span>}
                        {skill.status === 'upgrade' && <span className="bg-[#FEF3C7] text-[#92400E] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#FDE68A] uppercase tracking-wide animate-pulse">Tingkatkan</span>}
                        {skill.status === 'new' && <span className="bg-[#DBEAFE] text-[#1E40AF] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#BFDBFE] uppercase tracking-wide">Baru</span>}
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 mb-1.5">
                        <span>Kamu: <strong className={skill.currentLevel ? 'text-slate-600' : 'text-slate-400 font-medium'}>{skill.currentLevel || 'Belum dikuasai'}</strong></span>
                        <span>Dibutuhkan: <strong className="text-[#1E3A5F]">{skill.targetLevel}</strong></span>
                      </div>
                      <div className="w-full bg-slate-100 h-4 rounded-md overflow-hidden relative flex items-center px-2 text-[10px] font-extrabold">
                        {skill.status === 'matching' && <><div className="absolute inset-0 bg-[#10B981] transition-all duration-300"></div><span className="relative z-10 text-white flex items-center gap-1"><Check size={10} strokeWidth={3} /> Sesuai Target Standar</span></>}
                        {skill.status === 'upgrade' && <><div className="absolute inset-y-0 left-0 bg-[#F59E0B] w-1/3 transition-all duration-300"></div><span className="relative z-10 text-[#92400E] ml-auto">Tingkatkan ke {skill.targetLevel} →</span></>}
                        {skill.status === 'new' && <><div className="absolute inset-y-0 left-0 bg-slate-200 w-0"></div><span className="relative z-10 text-slate-400 font-bold mx-auto">Mulai dari dasar</span></>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardCareerPage;