import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Eye, Check, ArrowRight, Award, X, Briefcase, Building, TrendingUp, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import careerService from '../services/careerService'; //
import type { Recommendation } from '../types/career'; //

const mockRecommendations: ProfessionCard[] = [
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

const CareerResultsPage = () => {
  const navigate = useNavigate(); 
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Recommendation | null>(null);

  // FETCH DATA REKOMENDASI ASESMEN REAL DARI BACKEND
  useEffect(() => {
    const fetchAssessmentResults = async () => {
      try {
        setIsLoading(true);
        const response = await careerService.getRecommendations(); //
        setRecommendations(response.recommendations); //
        
        // Pilih ranking pertama (rank 1) atau item pertama sebagai default selection
        const defaultSelect = response.recommendations.find(r => r.rank === 1) || response.recommendations[0];
        if (defaultSelect) {
          setSelectedId(defaultSelect.id);
        }
      } catch (error) {
        console.error('Gagal memuat hasil rekomendasi asesmen:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentResults();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const handleOpenModal = (prof: Recommendation) => {
    setModalData(prof);
    setIsModalOpen(true);
  };

  // AMBIL PROFESI YANG SEDNG DI-KLIK USER
  const currentSelectedProfession = recommendations.find(p => p.id === selectedId);

  // SIMPAN PILIHAN PROFESI AWAL KE DATABASE & GENERATE ROADMAP
  const handleSelectProfession = async () => {
    if (!selectedId) return;
    try {
      setIsSelecting(true);
      await careerService.selectCareer(selectedId); //
      console.log("Profesi berhasil di-set awal:", currentSelectedProfession?.professionTitle);
      navigate('/dashboard'); 
    } catch (error) {
      console.error('Gagal menyimpan pilihan profesi:', error);
      alert('Terjadi kendala saat menyimpan pilihan karier. Silakan coba lagi.');
    } finally {
      setIsSelecting(false);
    }
  };

  // UX LOADING PREMIUM
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
        <Navbar minimal />
        <div className="flex-grow flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 size={42} className="text-[#1E3A5F] animate-spin" />
          <p className="text-[14px] font-bold tracking-wide animate-pulse">AI StepWise sedang merumuskan kurikulum belajarmu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      {/* DIET PADDING UTAMA: Memastikan ruang tidak terasa sesak atau kebesaran di resolusi 100% */}
      <main className="flex-grow py-8 md:py-12 xl:py-16 px-4 md:px-6 xl:px-8 pb-32 md:pb-40">
        <div className="w-full max-w-[1280px] xl:max-w-[1440px] mx-auto transition-all">
          
          <div className="text-center mb-10 xl:mb-14 max-w-[850px] mx-auto">
            <h1 className="text-[#1E3A5F] text-[28px] md:text-[34px] xl:text-[38px] font-black leading-tight tracking-tight mb-3">
              Rekomendasi Karier Kamu
            </h1>
            <p className="text-[#6B7280] text-[14px] md:text-[15px] xl:text-[16px] leading-relaxed font-medium">
              Berikut 3 profesi IT yang paling cocok berdasarkan profil data dirimu. Pilih satu fokus utama untuk menyusun peta belajar otomatis.
            </p>
          </div>

          {/* GRID PROPORSIONAL: Menggunakan items-stretch agar tinggi kartu seragam natural */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8 items-stretch">
            {recommendations.map((prof) => {
              const isSelected = selectedId === prof.id;
              
              // Perbaikan Logika Pemotongan Teks Analisis
              const sentences = prof.reasonSummary.split(/(?<=[.!?])\s+/);
              const summaryText = sentences.slice(0, 2).join(' ') + (sentences.length > 2 ? '...' : '');

              // Filter skill dari database
              const skillsHave = prof.skills.filter(s => s.currentLevel !== null);
              const skillsGap = prof.skills.filter(s => s.currentLevel === null);

              return (
                <div
                  key={prof.id}
                  onClick={() => setSelectedId(prof.id)}
                  className={`relative bg-white rounded-[20px] p-5 md:p-6 xl:p-8 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                    isSelected 
                      ? 'border-[#1E3A5F] shadow-xl shadow-[#1E3A5F]/5 scale-[1.01]' 
                      : 'border-slate-200/60 shadow-sm hover:border-[#3B82F6] hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-3.5 right-6 bg-[#1E3A5F] text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Check size={12} strokeWidth={3} /> Terpilih
                    </div>
                  )}

                  <div>
                    <h3 className="text-[#1E3A5F] text-[18px] md:text-[20px] xl:text-[21px] font-extrabold mb-3.5 group-hover:text-[#3B82F6] transition-colors">
                      {prof.professionTitle}
                    </h3>

                    <div className="mb-5 bg-slate-50 p-3.5 rounded-lg border border-slate-100/50">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Kesiapan Kerja</span>
                        <span className="text-[#10B981] text-[13.5px] font-extrabold">{prof.readinessPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-[6px] rounded-full overflow-hidden">
                        <div 
                          className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                          style={{ width: `${prof.readinessPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* PERBAIKAN LINTING: Sekarang menggunakan summaryText yang rapi dan memotong kalimat secara aman */}
                    <p className="text-[#4B5563] text-[13px] md:text-[13.5px] xl:text-[14px] leading-relaxed mb-6 font-medium">
                      {summaryText}
                    </p>

                    <div className="space-y-4 pt-3.5 mb-6 border-t border-slate-100">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Skills Terkuasai</span>
                        <div className="flex flex-wrap gap-1.5">
                          {skillsHave.length > 0 ? (
                            skillsHave.map((sk, i) => (
                              <span key={i} className="bg-[#EFF6FF] text-[#3B82F6] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#DBEAFE]">
                                {sk.skillName}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11.5px] font-medium italic">Belum di-set</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Skill Gaps</span>
                        <div className="flex flex-wrap gap-1.5">
                          {skillsGap.length > 0 ? (
                            skillsGap.map((sg, i) => (
                              <span key={i} className="bg-[#FFFBEB] text-[#D97706] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#FEF3C7]">
                                {sg.skillName}
                              </span>
                            ))
                          ) : (
                            <span className="text-emerald-600 text-[11px] font-bold">✓ Kompetensi Sempurna</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(prof);
                    }}
                    className="w-full h-[42px] bg-slate-50 text-[#1E3A5F] hover:bg-[#EFF6FF] hover:text-[#3B82F6] font-bold text-[13px] rounded-[10px] flex items-center justify-center gap-2 border border-slate-200/80 transition-colors mt-2"
                  >
                    <Eye size={15} /> Lihat Detail
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* FLOATING ACTION SELECTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] px-4 py-3.5 z-40">
        <div className="max-w-[1280px] xl:max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-[#3B82F6] shrink-0 hidden sm:flex">
              <Award size={18} />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Target Terpilih:</span>
              <strong className="text-[#1E3A5F] text-[15.5px] md:text-[16px] font-black">
                {currentSelectedProfession ? currentSelectedProfession.professionTitle : 'Pilih profesi...'}
              </strong>
            </div>
          </div>

          <button
            onClick={handleSelectProfession}
            disabled={isSelecting || !selectedId}
            className="w-full sm:w-auto h-[46px] md:h-[50px] px-8 bg-[#1E3A5F] hover:bg-[#152A44] disabled:bg-slate-300 text-white font-bold text-[14.5px] md:text-[15px] rounded-[12px] flex items-center justify-center gap-2 shadow-lg shadow-[#1E3A5F]/10 transition-all active:scale-95"
          >
            {isSelecting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Memproses Peta Belajar...
              </>
            ) : (
              <>
                Pilih Profesi Ini & Buat Roadmap <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODAL COMPONENT */}
      {isModalOpen && modalData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-[1100px] rounded-[24px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-slate-100">
            
            <div className="px-6 py-4 xl:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-[#1E3A5F] text-white rounded-xl flex items-center justify-center shadow-md shadow-[#1E3A5F]/10">
                  <Briefcase size={18} className="md:w-5 md:h-5" />
                </div>
                <div>
                  <h2 className="text-[#1E3A5F] text-[18px] md:text-[22px] font-black tracking-tight">{modalData.professionTitle}</h2>
                  <p className="text-[#6B7280] text-[11.5px] md:text-[12px] font-medium">Detail Ringkasan Kompetensi dan Prospek Industri</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white text-slate-400 hover:text-slate-600 border border-slate-200/60 flex items-center justify-center transition-colors shadow-sm"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-grow p-5 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 bg-white max-h-[calc(90vh-84px)]">
              
              <div className="md:col-span-7 space-y-5 md:space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10.5px] md:text-[11px] font-bold text-[#3B82F6] uppercase tracking-widest block">Alasan Rekomendasi AI</span>
                    <p className="text-slate-700 text-[13.5px] md:text-[14px] leading-relaxed font-semibold pl-4 border-l-4 border-[#1E3A5F]">
                      {modalData.reasonSummary}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-4 md:p-5 rounded-2xl border border-slate-100/70">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#1E3A5F] text-[12.5px] md:text-[13px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      Kesiapan Kerja Saat Ini
                    </span>
                    <span className="text-[#10B981] text-[18px] md:text-[20px] font-black">{modalData.readinessPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-[8px] md:h-[10px] rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#10B981] to-[#059669] h-full rounded-full transition-all duration-700"
                      style={{ width: `${modalData.readinessPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <h4 className="text-[#1E3A5F] text-[13.5px] md:text-[14px] font-extrabold uppercase tracking-wider">Gambaran Umum Profesi</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-2">
                      <span className="text-[11.5px] md:text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Briefcase size={14} className="text-[#3B82F6]" /> Tanggung Jawab Harian
                      </span>
                      <ul className="list-disc pl-4 text-slate-500 text-[11.5px] md:text-[12px] space-y-1.5 font-medium">
                        {modalData.professionOverview.dailyTasks.map((resp, i) => <li key={i}>{resp}</li>)}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-1.5">
                        <span className="text-[11.5px] md:text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                          <Building size={14} className="text-[#3B82F6]" /> Perusahaan Pengguna
                        </span>
                        <p className="text-slate-500 text-[11.5px] md:text-[12px] leading-relaxed font-medium">
                          {modalData.professionOverview.companyTypes.join(', ')}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm space-y-1.5">
                        <span className="text-[11.5px] md:text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                          <TrendingUp size={14} className="text-[#10B981]" /> Prospek Jangka Panjang
                        </span>
                        <p className="text-slate-500 text-[11.5px] md:text-[12px] leading-relaxed font-medium">
                          {modalData.professionOverview.longTermProspect}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN SKILL */}
              <div className="md:col-span-5 flex flex-col h-full border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6">
                <div className="mb-3.5">
                  <h4 className="text-[#1E3A5F] text-[13.5px] md:text-[14px] font-extrabold uppercase tracking-wider mb-1">Daftar Skill & Target Belajar</h4>
                  <p className="text-slate-400 text-[10.5px] md:text-[11px] font-medium leading-normal">Status kompetensi bawaan berdasarkan hasil pembacaan berkas CV dan asesmen.</p>
                </div>

                <div className="space-y-3 flex-grow overflow-y-auto max-h-[420px] pr-1.5 scrollbar-thin">
                  {modalData.skills.map((skill, index) => {
                    const isNew = skill.currentLevel === null;
                    const isMatching = skill.currentLevel === skill.targetLevel;

                    return (
                      <div 
                        key={index}
                        className={`p-3 rounded-xl border transition-all ${
                          isMatching ? 'bg-white border-slate-100' :
                          !isNew ? 'bg-amber-50/20 border-amber-200/60 shadow-sm' :
                          'bg-blue-50/20 border-blue-200/60 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="font-extrabold text-[#1E3A5F] text-[12.5px] tracking-tight">{skill.skillName}</span>
                          
                          {isMatching && (
                            <span className="bg-[#D1FAE5] text-[#065F46] text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-[#A7F3D0] uppercase tracking-wide">
                              Tercapai
                            </span>
                          )}
                          {!isMatching && !isNew && (
                            <span className="bg-[#FEF3C7] text-[#92400E] text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-[#FDE68A] uppercase tracking-wide">
                              Tingkatkan
                            </span>
                          )}
                          {isNew && (
                            <span className="bg-[#DBEAFE] text-[#1E40AF] text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-[#BFDBFE] uppercase tracking-wide">
                              Baru
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[10.5px] md:text-[11px] font-bold text-slate-400 mb-1.5">
                          <span>Kamu: <strong className={!isNew ? 'text-slate-600' : 'text-slate-400 font-medium'}>{skill.currentLevel || 'Belum dikuasai'}</strong></span>
                          <span>Dibutuhkan: <strong className="text-[#1E3A5F]">{skill.targetLevel}</strong></span>
                        </div>

                        <div className="w-full bg-slate-100 h-3.5 rounded-md overflow-hidden relative flex items-center px-2 text-[9.5px] font-extrabold">
                          {isMatching && (
                            <>
                              <div className="absolute inset-0 bg-[#10B981] transition-all duration-300"></div>
                              <span className="relative z-10 text-white flex items-center gap-1">Sesuai Standar</span>
                            </>
                          )}
                          {!isMatching && !isNew && (
                            <>
                              <div className="absolute inset-y-0 left-0 bg-[#F59E0B] w-1/2 transition-all duration-300"></div>
                              <span className="relative z-10 text-[#92400E] ml-auto">Kejar ke {skill.targetLevel} →</span>
                            </>
                          )}
                          {isNew && (
                            <>
                              <div className="absolute inset-y-0 left-0 bg-slate-200 w-0"></div>
                              <span className="relative z-10 text-slate-400 font-bold mx-auto">Mulai dari dasar</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CareerResultsPage;