import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  CheckSquare, 
  Briefcase, 
  MessageSquare, 
  BarChart2, 
  User, 
  HelpCircle, 
  LogOut, 
  Menu,
  X,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Footer from '../components/Footer';
import roadmapService from '../services/roadmapService';
import careerService from '../services/careerService';
import type { RoadmapMaterial, RoadmapResponse } from '../types/roadmap';

interface SubMaterial {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  description: string | null;
}

interface WeekNode {
  weekNumber: number;
  topic: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'active' | 'locked' | 'overdue';
  materials: SubMaterial[];
}

const RoadmapPage = () => {
  const navigate = useNavigate();

  // State Kendali Responsiveness Layout Sidebar (Konsisten dengan Dasbor)
  const [isDesktopExpanded, setIsDesktopExpanded] = useState<boolean>(true); 
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false); 

  // State Data Roadmap dari Backend
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [weeklyNodes, setWeeklyNodes] = useState<WeekNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<'none' | 'no_career' | 'other'>('none');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // State Accordion Toggle
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});

  const activeWeekRef = useRef<HTMLDivElement | null>(null);

  // Helper untuk memetakan materi flat dari DB menjadi node mingguan
  const mapMaterialsToWeeks = (materials: RoadmapMaterial[]): WeekNode[] => {
    if (!materials || materials.length === 0) return [];

    const sorted = [...materials].sort((a, b) => a.order - b.order);
    
    // Tentukan tanggal dasar mulai roadmap (7 hari sebelum materi pertama dijadwalkan selesai)
    const firstMaterialDate = sorted[0].scheduledAt ? new Date(sorted[0].scheduledAt) : new Date();
    const baseStart = new Date(firstMaterialDate);
    baseStart.setDate(baseStart.getDate() - 7);

    const nodes: WeekNode[] = [];
    const chunkSize = 2; // Kelompokkan 2 materi per minggu agar seimbang di UI
    
    for (let i = 0; i < sorted.length; i += chunkSize) {
      const chunk = sorted.slice(i, i + chunkSize);
      const weekNum = Math.floor(i / chunkSize) + 1;
      
      const weekStart = new Date(baseStart);
      weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7);
      const weekEnd = new Date(baseStart);
      weekEnd.setDate(weekEnd.getDate() + weekNum * 7 - 1);

      const formatDateStr = (d: Date) => {
        const day = d.getDate();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${day} ${months[d.getMonth()]}`;
      };

      const materialsList: SubMaterial[] = chunk.map((m) => ({
        id: m.id,
        title: m.title,
        duration: 'Belajar 2-3 Jam',
        completed: m.isCompleted,
        description: m.description
      }));

      nodes.push({
        weekNumber: weekNum,
        topic: chunk[0].title, // Gunakan judul materi pertama sebagai topik utama minggu itu
        startDate: formatDateStr(weekStart),
        endDate: formatDateStr(weekEnd),
        status: 'locked', // Default sementara
        materials: materialsList
      });
    }

    // Hitung status setiap minggu secara logis
    let foundActive = false;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const allCompleted = node.materials.every(m => m.completed);
      
      if (allCompleted) {
        node.status = 'completed';
      } else if (!foundActive) {
        node.status = 'active';
        foundActive = true;
      } else {
        node.status = 'locked';
      }
    }

    return nodes;
  };

  // Ambil data roadmap aktif
  const fetchActiveRoadmap = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setIsLoading(true);
    }
    setErrorState('none');
    
    try {
      console.log('Memeriksa target karier terpilih...');
      const selectedCareer = await careerService.getSelectedCareer();
      console.log('Target karier terpilih:', selectedCareer);

      try {
        console.log('Mengambil data roadmap aktif...');
        const data = await roadmapService.getActiveRoadmap();
        console.log('Roadmap aktif berhasil diambil:', data);
        
        // Bandingkan judul profesi roadmap aktif dengan target karier terpilih
        if (data.professionTitle !== selectedCareer.professionTitle) {
          console.log(`Profesi roadmap lama (${data.professionTitle}) berbeda dengan target baru (${selectedCareer.professionTitle}). Memulai regenerasi otomatis...`);
          await handleGenerateRoadmap();
        } else {
          setRoadmap(data);
          const mappedWeeks = mapMaterialsToWeeks(data.materials);
          setWeeklyNodes(mappedWeeks);

          // Cari minggu aktif dan buka accordion-nya secara otomatis
          const activeWeek = mappedWeeks.find(w => w.status === 'active');
          if (activeWeek) {
            setExpandedWeeks(prev => ({ ...prev, [activeWeek.weekNumber]: true }));
          } else if (mappedWeeks.length > 0) {
            setExpandedWeeks(prev => ({ ...prev, [mappedWeeks[mappedWeeks.length - 1].weekNumber]: true }));
          }
        }
      } catch (roadmapErr: any) {
        // Jika error 404 (belum ada roadmap), lakukan generate otomatis!
        if (roadmapErr.response?.status === 404) {
          console.log('Roadmap tidak ditemukan. Memulai proses generate otomatis...');
          await handleGenerateRoadmap();
        } else {
          throw roadmapErr;
        }
      }
    } catch (err: any) {
      console.error('Gagal mengambil data:', err);
      
      // Deteksi jika user belum memilih target karier
      if (err.response?.status === 400 && err.response?.data?.message?.includes('target karier')) {
        setErrorState('no_career');
        setErrorMessage('Anda belum memilih target karier Anda.');
      } else if (err.response?.status === 404) {
        // Menangani jika endpoint selected career mengembalikan 404
        setErrorState('no_career');
        setErrorMessage('Anda belum memilih target karier Anda.');
      } else {
        setErrorState('other');
        setErrorMessage(err.response?.data?.message || 'Terjadi kesalahan saat memuat data belajar Anda.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate roadmap otomatis menggunakan AI
  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    setErrorState('none');
    
    try {
      console.log('Mengenerate roadmap baru via AI...');
      await roadmapService.generateRoadmap();
      console.log('Roadmap AI berhasil dibuat! Mengambil data lengkap...');
      
      // Ambil data lengkap roadmap baru beserta progress dari database
      await fetchActiveRoadmap(false);
    } catch (err: any) {
      console.error('Gagal mengenerate roadmap:', err);
      if (err.response?.status === 400 && err.response?.data?.message?.includes('target karier')) {
        setErrorState('no_career');
        setErrorMessage('Anda belum memilih target karier. Silakan pilih karier target terlebih dahulu dari halaman Rekomendasi Karier.');
      } else {
        setErrorState('other');
        setErrorMessage(err.response?.data?.message || 'AI Career Advisor gagal menyusun roadmap Anda. Silakan coba lagi.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchActiveRoadmap();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToActiveWeek = () => {
    if (activeWeekRef.current) {
      activeWeekRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleWeekExpand = (weekNum: number, isLocked: boolean) => {
    if (isLocked) return; 
    setExpandedWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  // Menandai sub-materi sebagai selesai
  const handleToggleMaterialCheckbox = async (weekNum: number, matId: string, isCompleted: boolean) => {
    // Backend hanya mendukung penyelesaian (complete), bukan pembatalan (uncomplete)
    if (isCompleted) {
      console.log('Materi sudah selesai sebelumnya.');
      return; 
    }

    setActionLoadingId(matId);
    try {
      console.log(`Menandai materi ${matId} sebagai selesai...`);
      await roadmapService.completeMaterial(matId);
      console.log('Materi berhasil diselesaikan!');
      
      // Ambil ulang data roadmap terbaru agar progress dan status tersinkronisasi
      await fetchActiveRoadmap(false);
    } catch (err) {
      console.error('Gagal menyelesaikan materi:', err);
      alert('Gagal memperbarui status materi. Silakan coba lagi.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const sidebarMenu = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard', active: false },
    { name: 'Roadmap Belajar', icon: <Map size={18} />, path: '/dashboard/roadmap', active: true }, 
    { name: 'Checklist Mingguan', icon: <CheckSquare size={18} />, path: '/dashboard/checklist', active: false },
    { name: 'Rekomendasi Karier', icon: <Briefcase size={18} />, path: '/assessment/results', active: false },
    { name: 'AI Career Advisor', icon: <MessageSquare size={18} />, path: '/dashboard/advisor', active: false },
    { name: 'Evaluasi & Progres', icon: <BarChart2 size={18} />, path: '/dashboard/evaluation', active: false },
    { name: 'Profil Pengguna', icon: <User size={18} />, path: '/dashboard/profile', active: false },
  ];

  const renderSidebarContent = (isExpanded: boolean, isMobileView = false) => (
    <>
      <div className="flex flex-col gap-5">
        {!isMobileView && (
          <button
            onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
            className={`text-[#1E3A5F] hover:text-[#3B82F6] p-1.5 rounded-lg hover:bg-slate-100 w-8 h-8 flex items-center justify-center transition-all cursor-pointer ${
              isExpanded ? 'self-start ml-2' : 'self-center'
            }`}
            title={isExpanded ? "Sembunyikan Menu" : "Tampilkan Menu"}
          >
            <Menu size={20} />
          </button>
        )}

        <div className={`p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
          <div className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-[14px] shrink-0">U</div>
          {isExpanded && (
            <div className="overflow-hidden animate-fadeIn">
              <h4 className="text-[#1E3A5F] text-[13px] font-black truncate">Pengguna StepWise</h4>
              <span className="text-slate-400 text-[11px] font-medium block">Tech Innovator</span>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {sidebarMenu.map((menu, i) => (
            <button
              key={i}
              onClick={() => {
                navigate(menu.path);
                if (isMobileView) setIsMobileOpen(false);
              }}
              title={!isExpanded ? menu.name : undefined}
              className={`w-full h-[42px] rounded-lg flex items-center text-[13.5px] font-bold transition-all ${
                isExpanded ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'
              } ${
                menu.active ? 'bg-[#EFF6FF] text-[#3B82F6] shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-[#1E3A5F]'
              }`}
            >
              <div className="shrink-0">{menu.icon}</div>
              {isExpanded && <span className="truncate animate-fadeIn">{menu.name}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100 flex flex-col gap-1">
        <button className={`w-full h-[40px] rounded-lg flex items-center text-[13.5px] font-bold text-slate-500 hover:bg-slate-50 hover:text-[#1E3A5F] transition-colors ${isExpanded ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'}`}>
          <HelpCircle size={18} />
          {isExpanded && <span className="animate-fadeIn">Bantuan</span>}
        </button>
        <button onClick={() => navigate('/')} className={`w-full h-[40px] rounded-lg flex items-center text-[13.5px] font-bold text-rose-500 hover:bg-rose-50/50 transition-colors ${isExpanded ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'}`}>
          <LogOut size={18} />
          {isExpanded && <span className="animate-fadeIn">Keluar</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased relative">
      
      {/* HEADER STICKY NAVBAR */}
      <header className="w-full bg-white border-b border-slate-200/80 px-4 md:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden w-10 h-10 border border-slate-200 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 shadow-sm"
          >
            <Menu size={20} />
          </button>
          <span className="font-sans font-extrabold text-[18px] text-[#1E3A5F] tracking-wide cursor-pointer" onClick={() => navigate('/dashboard')}>StepWise</span>
        </div>
      </header>

      {/* Mobile Sidebar Slide Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
          <aside className="relative w-[270px] bg-white h-full p-4 flex flex-col justify-between shadow-2xl z-10 animate-slideInLeft">
            <button onClick={() => setIsMobileOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full border border-slate-100 bg-slate-50 text-slate-400 flex items-center justify-center">
              <X size={16} />
            </button>
            {renderSidebarContent(true, true)}
          </aside>
        </div>
      )}

      {/* Structural Workspace Architecture Wrapper */}
      <div className="flex flex-grow w-full max-w-[1440px] mx-auto relative items-start">
        
        <aside 
          className={`bg-white border-r border-slate-200/80 p-4 hidden md:flex flex-col justify-between sticky top-16 h-[calc(100vh-64px)] shrink-0 z-20 transition-all duration-300 ease-in-out ${
            isDesktopExpanded ? 'w-[260px]' : 'w-[76px]'
          }`}
        >
          {renderSidebarContent(isDesktopExpanded, false)}
        </aside>

        {/* RIGHT CONTENT SCROLL WORKSPACE ROW */}
        <div className="flex-grow flex flex-col min-w-0 min-h-[calc(100vh-64px)]">
          
          <main className="flex-grow p-4 md:p-8 overflow-x-hidden">

            {/* LOADING STATE - FETCHING ACTIVE ROADMAP */}
            {isLoading && !isGenerating && (
              <div className="bg-white border border-slate-200/60 rounded-[20px] p-16 shadow-sm flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#1E3A5F] mb-4" size={48} />
                <h3 className="text-[#1E3A5F] text-[18px] font-bold">Memuat Roadmap Belajar Anda...</h3>
                <p className="text-[#6B7280] text-[14px] mt-2">Mengambil kurikulum terstruktur Anda.</p>
              </div>
            )}

            {/* GENERATING STATE - AI COMPILING ROADMAP */}
            {isGenerating && (
              <div className="bg-white border border-[#3B82F6]/30 rounded-[20px] p-16 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-[#1E3A5F] animate-pulse"></div>
                <div className="w-[84px] h-[84px] rounded-full border-[3.5px] border-[#1E3A5F] flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-[-3.5px] rounded-full border-[3.5px] border-t-transparent border-r-transparent border-b-transparent border-l-[#3B82F6] animate-spin"></div>
                  <Sparkles size={36} className="text-[#1E3A5F] animate-bounce" />
                </div>
                <h2 className="text-[#1E3A5F] text-[22px] md:text-[24px] font-extrabold tracking-tight mb-3">AI Advisor Sedang Meracik Peta Belajarmu!</h2>
                <p className="text-[#6B7280] text-[14px] md:text-[15px] max-w-[550px] leading-relaxed mb-6 font-medium">
                  Kami sedang menyusun modul belajar terstruktur, realistis, dan personal berdasarkan CV, tingkat kemampuan Anda saat ini, serta jam belajar per minggu yang Anda pilih.
                </p>
                <div className="w-full max-w-[350px] space-y-2.5">
                  <div className="h-3 bg-[#F3F4F6] rounded-full w-full animate-pulse"></div>
                  <div className="h-3 bg-[#F3F4F6] rounded-full w-[85%] animate-pulse mx-auto"></div>
                  <div className="h-3 bg-[#F3F4F6] rounded-full w-[65%] animate-pulse mx-auto"></div>
                </div>
              </div>
            )}

            {/* ERROR STATE - NO CAREER SELECTED */}
            {errorState === 'no_career' && !isLoading && !isGenerating && (
              <div className="bg-white border border-slate-200/60 rounded-[20px] p-12 shadow-sm flex flex-col items-center text-center max-w-[650px] mx-auto">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-5 border border-amber-200">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-[#1E3A5F] text-[20px] md:text-[22px] font-bold mb-3">Target Karier Belum Dipilih</h2>
                <p className="text-[#6B7280] text-[14.5px] leading-relaxed mb-8">
                  Untuk membuat roadmap belajar yang relevan dan disesuaikan AI, Anda perlu memilih target karier terlebih dahulu melalui hasil asesmen.
                </p>
                <button
                  onClick={() => navigate('/assessment/results')}
                  className="h-[48px] px-8 bg-[#1E3A5F] hover:bg-[#152A44] text-white font-bold text-[14px] rounded-[12px] flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  Pilih Target Karier Anda <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ERROR STATE - OTHER GENERAL ERRORS */}
            {errorState === 'other' && !isLoading && !isGenerating && (
              <div className="bg-white border border-slate-200/60 rounded-[20px] p-12 shadow-sm flex flex-col items-center text-center max-w-[600px] mx-auto">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-5 border border-rose-200">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-[#1E3A5F] text-[20px] md:text-[22px] font-bold mb-3">Terjadi Kesalahan</h2>
                <p className="text-[#6B7280] text-[14.5px] leading-relaxed mb-6">
                  {errorMessage}
                </p>
                <button
                  onClick={() => fetchActiveRoadmap(true)}
                  className="h-[44px] px-6 bg-slate-100 hover:bg-slate-200 text-[#1E3A5F] font-bold text-[13.5px] rounded-[10px] transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* SUCCESS STATE - ROADMAP LOADED SUCCESSFULLY */}
            {roadmap && !isLoading && !isGenerating && errorState === 'none' && (
              <>
                {/* ROADMAP DASHBOARD MACRO HEADER BANNER */}
                <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm mb-6 space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-slate-400 text-[11px] font-extrabold uppercase tracking-widest block mb-1">Peta Pembelajaran Terstruktur AI</span>
                      <h1 className="text-[#1E3A5F] text-[24px] md:text-[28px] font-black tracking-tight flex items-center gap-2">
                        Roadmap Belajar: {roadmap.professionTitle} <Sparkles size={22} className="text-[#3B82F6]" />
                      </h1>
                      <span className="text-slate-500 text-[12.5px] font-medium block mt-1.5 flex items-center gap-1.5">
                        <Clock size={15} className="text-slate-400" /> Alokasi intensif {roadmap.weeklyHours} jam/minggu berbasis kecepatan belajar Anda
                      </span>
                    </div>

                    {/* Top Action Button Triggers */}
                    <div className="flex flex-wrap gap-2.5">
                      <button 
                        onClick={scrollToActiveWeek}
                        className="h-[42px] px-4 bg-[#EFF6FF] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white font-bold text-[13px] rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-blue-100"
                      >
                        Lihat Minggu Ini
                      </button>
                      <button 
                        onClick={() => navigate('/assessment/results')}
                        className="h-[42px] px-4 bg-white border-2 border-slate-200 text-[#1E3A5F] hover:bg-slate-50 font-bold text-[13px] rounded-xl transition-colors"
                      >
                        Ganti Target Karier
                      </button>
                    </div>
                  </div>

                  {/* MACRO PROGRESS DISPLAY BAR CONTAINER */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#1E3A5F] text-[13px] font-extrabold uppercase tracking-wider">Total Progress Kurikulum</span>
                      <span className="text-[#10B981] text-[14px] font-black">{roadmap.progress?.percent ?? 0}% Selesai ({roadmap.progress?.completed ?? 0}/{roadmap.progress?.total ?? 0} Modul)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/20">
                      <div 
                        className="bg-gradient-to-r from-[#10B981] to-[#059669] h-full rounded-full transition-all duration-700 shadow-inner"
                        style={{ width: `${roadmap.progress?.percent ?? 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* TIMELINE SECTION CONTAINER (ACCORDION TIMELINE) */}
                <div className="relative border-l-2 border-slate-200 pl-6 ml-4 md:ml-6 space-y-4 my-8">
                  {weeklyNodes.map((node) => {
                    const isExpanded = !!expandedWeeks[node.weekNumber];
                    
                    const totalMat = node.materials.length;
                    const doneMat = node.materials.filter(m => m.completed).length;
                    const weekProgress = Math.round((doneMat / totalMat) * 100);

                    return (
                      <div 
                        key={node.weekNumber} 
                        ref={node.status === 'active' ? activeWeekRef : null}
                        className={`relative transition-all duration-300 ${node.status === 'locked' ? 'opacity-50' : 'opacity-100'}`}
                      >
                        
                        {/* TIMELINE STATUS IDENTIFIER BADGE NODE */}
                        <div className={`absolute -left-[35px] top-4 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                          node.status === 'completed' ? 'bg-[#10B981] border-[#10B981] text-white' :
                          node.status === 'active' ? 'bg-white border-[#3B82F6] text-[#3B82F6] scale-110 shadow-md shadow-blue-100' :
                          node.status === 'overdue' ? 'bg-[#F59E0B] border-[#F59E0B] text-white' :
                          'bg-slate-100 border-slate-300 text-slate-400'
                        }`}>
                          {node.status === 'completed' ? <CheckCircle2 size={14} strokeWidth={3} /> : 
                           node.status === 'locked' ? <Lock size={11} strokeWidth={2.5} /> : 
                           <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>

                        {/* WEEK CARD LAYOUT ACCORDION */}
                        <div 
                          className={`bg-white border rounded-2xl p-4 md:p-5 transition-all shadow-sm ${
                            node.status === 'active' ? 'border-[#3B82F6] shadow-md shadow-blue-50/50' : 'border-slate-200/70 hover:border-slate-300'
                          } ${node.status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                          onClick={() => toggleWeekExpand(node.weekNumber, node.status === 'locked')}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-[#1E3A5F] text-[15px] md:text-[16px] font-black tracking-tight">
                                  Minggu {node.weekNumber}: {node.topic}
                                </h3>
                                {node.status === 'active' && (
                                  <span className="bg-[#EFF6FF] text-[#3B82F6] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#DBEAFE]">
                                    Sedang Jalan
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-400 text-[11px] font-bold block">
                                Durasi Periode: {node.startDate} - {node.endDate}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {node.status !== 'locked' && (
                                <span className={`text-[12px] font-extrabold ${weekProgress === 100 ? 'text-[#10B981]' : 'text-slate-500'}`}>
                                  {weekProgress}%
                                </span>
                              )}
                              {node.status !== 'locked' && (
                                <div className="text-slate-400">
                                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* INTERNAL EXPANDABLE SUB-MATERIAL ELEMENT */}
                          {isExpanded && node.status !== 'locked' && (
                            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 animate-fadeIn">
                              
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${weekProgress === 100 ? 'bg-[#10B981]' : 'bg-[#3B82F6]'}`}
                                  style={{ width: `${weekProgress}%` }}
                                ></div>
                              </div>

                              <div className="space-y-2">
                                {node.materials.map((material) => {
                                  const isChecking = actionLoadingId === material.id;
                                  
                                  return (
                                    <div 
                                      key={material.id}
                                      onClick={(e) => {
                                        e.stopPropagation(); 
                                        handleToggleMaterialCheckbox(node.weekNumber, material.id, material.completed);
                                      }}
                                      className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
                                        material.completed 
                                          ? 'bg-slate-50/60 border-slate-200/40 opacity-75' 
                                          : 'bg-white border-slate-100 hover:border-slate-200 cursor-pointer'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
                                            material.completed 
                                              ? 'bg-[#10B981] border-[#10B981] text-white' 
                                              : 'border-slate-300 bg-white hover:border-[#3B82F6]'
                                          }`}>
                                            {isChecking ? (
                                              <Loader2 className="animate-spin text-slate-400" size={10} />
                                            ) : material.completed ? (
                                              <CheckCircle2 size={12} strokeWidth={3} />
                                            ) : null}
                                          </div>
                                          <p className={`text-[13.5px] font-bold tracking-tight ${material.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {material.title}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                                          <PlayCircle size={15} />
                                          <span className="text-[11px] font-bold">{material.duration}</span>
                                        </div>
                                      </div>

                                      {/* Deskripsi Materi */}
                                      {material.description && (
                                        <p className="text-slate-500 text-[12px] leading-relaxed font-medium pl-8">
                                          {material.description}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

          </main>

          <Footer />
        </div>

      </div> 
    </div>
  );
};

export default RoadmapPage;