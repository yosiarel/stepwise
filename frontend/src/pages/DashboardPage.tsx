import { useState, useEffect } from 'react';
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
  Flame, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  PlayCircle,
  Menu,
  X
} from 'lucide-react';
import Footer from '../components/Footer';

interface WeeklyTask {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  impactValue: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();

  // State Kendali Responsiveness Buka-Tutup Sidebar
  const [isDesktopExpanded, setIsDesktopExpanded] = useState<boolean>(true); 
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false); 

  // Menutup otomatis mobile drawer jika user melebarkan layar ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State Kesiapan Kerja & Statistik Belajar (Dinamis)
  const [readiness, setReadiness] = useState<number>(45); 
  const [materiSelasai, setMateriSelesai] = useState<number>(12); 
  const totalMateri = 28; 
  const totalJamBelajar = 34; 
  const streakDays = 5; 

  // State Banner Evaluasi Berkala
  const [showEvalBanner, setShowEvalBanner] = useState<boolean>(true);

  // State Daftar Tugas Mingguan (Interaktif)
  const [tasks, setTasks] = useState<WeeklyTask[]>(
    [
      { id: 'task-1', title: 'Learn CSS Flexbox Layouting', duration: 'Est. 2 Jam', completed: false, impactValue: 2 },
      { id: 'task-2', title: 'Master Grid Layout & Responsive Design', duration: 'Est. 3 Jam', completed: false, impactValue: 3 },
      { id: 'task-3', title: 'Build Navigation Bar Project Practice', duration: 'Project Praktik', completed: false, impactValue: 4 },
      { id: 'task-4', title: 'Introduction to JavaScript DOM Manipulation', duration: 'Est. 2 Jam', completed: false, impactValue: 2 }
    ]
  );

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const nextState = !task.completed;
        
        if (nextState) {
          setReadiness((prev) => Math.min(prev + task.impactValue, 100));
          setMateriSelesai((prev) => Math.min(prev + 1, totalMateri));
        } else {
          setReadiness((prev) => Math.max(prev - task.impactValue, 0));
          setMateriSelesai((prev) => Math.max(prev - 1, 0));
        }
        
        return { ...task, completed: nextState };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const sidebarMenu = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard', active: true },
    { name: 'Roadmap Belajar', icon: <Map size={18} />, path: '/dashboard/roadmap', active: false },
    { name: 'Checklist Mingguan', icon: <CheckSquare size={18} />, path: '/dashboard/checklist', active: false },
    { name: 'Rekomendasi Karier', icon: <Briefcase size={18} />, path: '/assessment/results', active: false },
    { name: 'AI Career Advisor', icon: <MessageSquare size={18} />, path: '/dashboard/advisor', active: false },
    { name: 'Evaluasi & Progres', icon: <BarChart2 size={18} />, path: '/dashboard/evaluation', active: false },
    { name: 'Profil Pengguna', icon: <User size={18} />, path: '/dashboard/profile', active: false },
  ];

  const renderSidebarContent = (isExpanded: boolean, isMobileView = false) => (
    <>
      <div className="flex flex-col gap-5">
        {/* Tombol Hamburger internal di paling atas sidebar (Hanya Desktop) */}
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

        {/* Informasi Akun User */}
        <div className={`p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
          <div className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-[14px] shrink-0">
            H
          </div>
          {isExpanded && (
            <div className="overflow-hidden animate-fadeIn">
              <h4 className="text-[#1E3A5F] text-[13px] font-black truncate">Harry Telaumbanua</h4>
              <span className="text-slate-400 text-[11px] font-medium block">Tech Student</span>
            </div>
          )}
        </div>

        {/* List Menu Item Navigasi */}
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
                menu.active
                  ? 'bg-[#EFF6FF] text-[#3B82F6] shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[#1E3A5F]'
              }`}
            >
              <div className="shrink-0">{menu.icon}</div>
              {isExpanded && <span className="truncate animate-fadeIn">{menu.name}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Bagian Bawah Sidebar */}
      <div className="pt-4 border-t border-slate-100 flex flex-col gap-1">
        <button className={`w-full h-[40px] rounded-lg flex items-center text-[13.5px] font-bold text-slate-500 hover:bg-slate-50 hover:text-[#1E3A5F] transition-colors ${isExpanded ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'}`}>
          <HelpCircle size={18} />
          {isExpanded && <span className="animate-fadeIn">Bantuan</span>}
        </button>
        <button 
          onClick={() => navigate('/')}
          className={`w-full h-[40px] rounded-lg flex items-center text-[13.5px] font-bold text-rose-500 hover:bg-rose-50/50 transition-colors ${isExpanded ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'}`}
        >
          <LogOut size={18} />
          {isExpanded && <span className="animate-fadeIn">Keluar</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased relative">
      
      {/* HEADER/NAVBAR UNIFIED STICKY (Tanpa Avatar & Tanpa Robot Logo) */}
      <header className="w-full bg-white border-b border-slate-200/80 px-4 md:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden w-10 h-10 border border-slate-200 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-sans font-extrabold text-[18px] text-[#1E3A5F] tracking-wide">StepWise</span>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Menu Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn" 
            onClick={() => setIsMobileOpen(false)}
          ></div>
          
          <aside className="relative w-[270px] bg-white h-full p-4 flex flex-col justify-between shadow-2xl z-10 animate-slideInLeft border-r border-slate-100">
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-slate-100 bg-slate-50 text-slate-400 flex items-center justify-center animate-fadeIn"
            >
              <X size={16} />
            </button>
            {renderSidebarContent(true, true)}
          </aside>
        </div>
      )}

      {/* Structural Main Page Grid Layout Architecture */}
      <div className="flex flex-grow w-full max-w-[1440px] mx-auto relative items-start">
        
        {/* REVISI FIX: DIV pembungkus luar dihancurkan. ASIDE murni menjadi anak langsung agar STICKY bekerja mutlak */}
        <aside 
          className={`bg-white border-r border-slate-200/80 p-4 hidden md:flex flex-col justify-between sticky top-16 h-[calc(100vh-64px)] shrink-0 z-20 transition-all duration-300 ease-in-out ${
            isDesktopExpanded ? 'w-[260px]' : 'w-[76px]'
          }`}
        >
          {renderSidebarContent(isDesktopExpanded, false)}
        </aside>

        {/* Right Content Panel */}
        <div className="flex-grow flex flex-col min-w-0 min-h-[calc(100vh-64px)]">
          
          <main className="flex-grow p-5 md:p-8 overflow-x-hidden">
            
            {/* Target Karier */}
            <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-slate-400 text-[11px] font-extrabold uppercase tracking-widest block mb-1">Target Karier Saat Ini</span>
                <h1 className="text-[#1E3A5F] text-[24px] md:text-[28px] font-black tracking-tight flex items-center gap-2">
                  Frontend Developer <Sparkles size={20} className="text-[#3B82F6] fill-[#3B82F6]/10" />
                </h1>
              </div>
              <button
                onClick={() => navigate('/assessment/results')}
                className="h-[44px] px-5 border-2 border-slate-200 text-[#1E3A5F] hover:bg-slate-50 font-bold text-[13px] rounded-xl transition-colors flex items-center justify-center shrink-0"
              >
                Ubah Target
              </button>
            </div>

            {/* Banner Evaluasi Berkala */}
            {showEvalBanner && (
              <div className="bg-gradient-to-r from-[#1E3A5F] to-[#152A44] text-white rounded-[16px] p-4 md:p-5 shadow-md mb-6 flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#3B82F6] shrink-0">
                    <AlertCircle size={20} className="text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] md:text-[15px] font-extrabold tracking-tight">Evaluasi berkala menunggumu!</h3>
                    <p className="text-slate-300 text-[12px] font-medium">Ukur perkembangan pemahaman materi barumu untuk kalibrasi kesiapan kerja otomatis.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    alert("Mengarahkan ke halaman pengisian evaluasi berkala!");
                    setShowEvalBanner(false);
                  }}
                  className="h-[38px] px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[12px] font-bold rounded-lg transition-colors shrink-0"
                >
                  Mulai Evaluasi
                </button>
              </div>
            )}

            {/* Grid Utama Dasbor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Panel Kiri */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Status Kesiapan */}
                <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-[#1E3A5F] text-[15px] font-black uppercase tracking-wider">Status Kesiapan Kerja</h3>
                      <p className="text-slate-400 text-[12px] font-medium">Berdasarkan rasio penyelesaian target modul kurikulum roadmap belajar.</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#10B981] bg-[#D1FAE5] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      On Track
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-8 rounded-xl overflow-hidden relative border border-slate-200/30">
                    <div 
                      className="bg-gradient-to-r from-[#10B981] to-[#059669] h-full rounded-l-xl flex items-center justify-end px-3 transition-all duration-500 shadow-inner"
                      style={{ width: `${readiness}%` }}
                    >
                      {readiness >= 18 && (
                        <span className="text-white text-[11px] md:text-[12px] font-black tracking-wide relative z-10">
                          {readiness}% Ready
                        </span>
                      )}
                    </div>
                    {readiness < 18 && (
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-500 text-[11px] md:text-[12px] font-black tracking-wide">
                        {readiness}% Ready
                      </span>
                    )}
                    <div className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Target: 100% (Job Ready)
                    </div>
                  </div>
                </div>

                {/* Checklist Tugas */}
                <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm">
                  <div className="mb-5">
                    <h3 className="text-[#1E3A5F] text-[15px] font-black uppercase tracking-wider">Yang Harus Diselesaikan Minggu Ini</h3>
                    <p className="text-slate-400 text-[12px] font-medium">Selesaikan target materi di bawah ini untuk mendongkrak skor kesiapan kerjamu.</p>
                  </div>

                  <div className="space-y-2.5">
                    {tasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between gap-4 transition-all ${
                          task.completed 
                            ? 'bg-slate-50/80 border-slate-200/50 opacity-70' 
                            : 'bg-white border-slate-100 shadow-sm hover:border-[#3B82F6]/60'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            task.completed 
                              ? 'bg-[#10B981] border-[#10B981] text-white' 
                              : 'border-slate-300 bg-white group-hover:border-[#3B82F6]'
                          }`}>
                            {task.completed && <CheckSquare size={14} className="stroke-[3]" />}
                          </div>
                          <div>
                            <p className={`text-[13.5px] font-extrabold transition-all ${
                              task.completed ? 'text-slate-400 line-through' : 'text-[#1E3A5F]'
                            }`}>
                              {task.title}
                            </p>
                            <span className="text-slate-400 text-[11px] font-bold block mt-0.5">{task.duration}</span>
                          </div>
                        </div>
                        <PlayCircle size={18} className="text-slate-400 hover:text-[#3B82F6] transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Panel Kanan */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/dashboard/roadmap')}
                    className="w-full h-[52px] bg-[#1E3A5F] hover:bg-[#152A44] text-white font-bold text-[14.5px] rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <span>Lihat Roadmap Lengkap</span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/advisor')}
                    className="w-full h-[52px] bg-white border-2 border-slate-200 text-[#1E3A5F] hover:bg-slate-50 font-bold text-[14.5px] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <MessageSquare size={16} className="text-[#3B82F6]" />
                    <span>Tanya AI Advisor</span>
                  </button>
                </div>

                <div className="bg-white border border-slate-200/60 rounded-[20px] p-5 shadow-sm space-y-4">
                  <h3 className="text-[#1E3A5F] text-[13px] font-black uppercase tracking-wider border-b border-slate-100 pb-2.5">
                    Statistik Belajar Kamu
                  </h3>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-50 text-[#3B82F6] rounded-lg flex items-center justify-center">
                          <BookOpen size={16} />
                        </div>
                        <span className="text-slate-500 text-[12.5px] font-bold">Materi Selesai</span>
                      </div>
                      <span className="text-[#1E3A5F] text-[13.5px] font-black">{materiSelasai} <span className="text-slate-400 font-bold text-[11px]">/ {totalMateri}</span></span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-amber-50 text-[#D97706] rounded-lg flex items-center justify-center">
                          <Clock size={16} />
                        </div>
                        <span className="text-slate-500 text-[12.5px] font-bold">Total Jam Belajar</span>
                      </div>
                      <span className="text-[#1E3A5F] text-[13.5px] font-black">{totalJamBelajar} <span className="text-slate-400 font-bold text-[11px]">Jam</span></span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center">
                          <Flame size={16} className="fill-rose-500/10" />
                        </div>
                        <span className="text-slate-500 text-[12.5px] font-bold">Streak Harian</span>
                      </div>
                      <span className="text-rose-600 text-[13.5px] font-black flex items-center gap-1">
                        {streakDays} Hari 🔥
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </main>

          <Footer />
        </div>

      </div> 
    </div>
  );
};

export default DashboardPage;