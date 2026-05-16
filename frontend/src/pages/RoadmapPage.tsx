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
  ChevronUp
} from 'lucide-react';
import Footer from '../components/Footer';

interface SubMaterial {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
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

  // State Accordion Toggle
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    4: true 
  });

  const activeWeekRef = useRef<HTMLDivElement | null>(null);

  // Dataset Roadmap
  const [weeklyNodes, setWeeklyNodes] = useState<WeekNode[]>([
    {
      weekNumber: 1,
      topic: "Dasar HTML & CSS",
      startDate: "01 Mei",
      endDate: "07 Mei",
      status: "completed",
      materials: [
        { id: "m-1-1", title: "Pengenalan struktur web dasar & sintaks HTML", duration: "1 Jam", completed: true },
        { id: "m-1-2", title: "Semantik HTML5 untuk SEO Friendly", duration: "1.5 Jam", completed: true },
        { id: "m-1-3", title: "Styling dasar komponen dengan CSS Selector", duration: "2 Jam", completed: true }
      ]
    },
    {
      weekNumber: 2,
      topic: "CSS Layouting (Flexbox & Grid)",
      startDate: "08 Mei",
      endDate: "14 Mei",
      status: "completed",
      materials: [
        { id: "m-2-1", title: "Menguasai teknik layout modern Flexbox axis", duration: "2 Jam", completed: true },
        { id: "m-2-2", title: "Grid System kompleks tanpa framework", duration: "3 Jam", completed: true },
        { id: "m-2-3", title: "Responsive web design dengan Media Queries", duration: "2.5 Jam", completed: true }
      ]
    },
    {
      weekNumber: 3,
      topic: "Dasar JavaScript",
      startDate: "15 Mei",
      endDate: "21 Mei",
      status: "completed",
      materials: [
        { id: "m-3-1", title: "Variabel, tipe data, dan operasi aritmatika JS", duration: "1 Jam", completed: true },
        { id: "m-3-2", title: "Logika kontrol keputusan (if/else) dan loops", duration: "2 Jam", completed: true },
        { id: "m-3-3", title: "Fungsi (functions) dan modularitas scope kode", duration: "1.5 Jam", completed: true }
      ]
    },
    {
      weekNumber: 4,
      topic: "DOM Manipulation",
      startDate: "22 Mei",
      endDate: "28 Mei",
      status: "active",
      materials: [
        { id: "m-4-1", title: "Seleksi elemen menggunakan querySelector & getElementById", duration: "1 Jam", completed: true },
        { id: "m-4-2", title: "Event Listeners: Menangani klik, form submit, & ketukan", duration: "2 Jam", completed: true },
        { id: "m-4-3", title: "Modifikasi struktur & style class DOM via JS", duration: "2.5 Jam", completed: false }
      ]
    },
    {
      weekNumber: 5,
      topic: "Async JavaScript & APIs",
      startDate: "29 Mei",
      endDate: "04 Jun",
      status: "locked",
      materials: [
        { id: "m-5-1", title: "Memahami Callback hell, Promises, dan Async/Await", duration: "2 Jam", completed: false },
        { id: "m-5-2", title: "Mengambil data dari API eksternal menggunakan Fetch", duration: "3 Jam", completed: false }
      ]
    },
    {
      weekNumber: 6,
      topic: "Pengenalan React JS",
      startDate: "05 Jun",
      endDate: "11 Jun",
      status: "locked",
      materials: [
        { id: "m-6-1", title: "Dasar komponen, sintaks JSX, dan props React", duration: "2 Jam", completed: false },
        { id: "m-6-2", title: "Manajemen state lokal dalam ekosistem React", duration: "2.5 Jam", completed: false }
      ]
    }
  ]);

  const totalSubMaterials = weeklyNodes.reduce((acc, curr) => acc + curr.materials.length, 0);
  const checkedSubMaterials = weeklyNodes.reduce((acc, curr) => acc + curr.materials.filter(m => m.completed).length, 0);
  const calculatedReadiness = Math.round((checkedSubMaterials / totalSubMaterials) * 100);

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

  const handleToggleMaterialCheckbox = (weekNum: number, matId: string) => {
    const updatedNodes = weeklyNodes.map((node) => {
      if (node.weekNumber === weekNum) {
        const updatedMaterials = node.materials.map((mat) => {
          if (mat.id === matId) return { ...mat, completed: !mat.completed };
          return mat;
        });
        
        let newStatus = node.status;
        const allChecked = updatedMaterials.every(m => m.completed);
        if (node.status === 'active' || node.status === 'completed' || node.status === 'overdue') {
          newStatus = allChecked ? 'completed' : 'active';
        }

        return { ...node, materials: updatedMaterials, status: newStatus };
      }
      return node;
    });
    setWeeklyNodes(updatedNodes);
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
          <div className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-[14px] shrink-0">H</div>
          {isExpanded && (
            <div className="overflow-hidden animate-fadeIn">
              <h4 className="text-[#1E3A5F] text-[13px] font-black truncate">Harry Telaumbanua</h4>
              <span className="text-slate-400 text-[11px] font-medium block">Tech Student</span>
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
          <span className="font-sans font-extrabold text-[18px] text-[#1E3A5F] tracking-wide">StepWise</span>
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
        
        {/* REVISI FIX: DIV pembungkus luar dihancurkan. ASIDE murni menjadi anak langsung agar STICKY bekerja mutlak */}
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
            
            {/* ROADMAP DASHBOARD MACRO HEADER BANNER */}
            <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 shadow-sm mb-6 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-slate-400 text-[11px] font-extrabold uppercase tracking-widest block mb-1">Peta Pembelajaran Terstruktur</span>
                  <h1 className="text-[#1E3A5F] text-[24px] md:text-[28px] font-black tracking-tight flex items-center gap-2">
                    Roadmap Belajar: Frontend Developer <Sparkles size={22} className="text-[#3B82F6]" />
                  </h1>
                  <span className="text-slate-500 text-[12.5px] font-medium block mt-1.5 flex items-center gap-1.5">
                    <Clock size={15} className="text-slate-400" /> Estimasi 16 minggu dengan alokasi intensif 8 jam/minggu
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
                    onClick={() => alert("Membuka Modul Evaluasi Karier Berkala!")}
                    className="h-[42px] px-4 bg-white border-2 border-slate-200 text-[#1E3A5F] hover:bg-slate-50 font-bold text-[13px] rounded-xl transition-colors"
                  >
                    Evaluasi Karier
                  </button>
                </div>
              </div>

              {/* MACRO PROGRESS DISPLAY BAR CONTAINER */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#1E3A5F] text-[13px] font-extrabold uppercase tracking-wider">Total Progress Kurikulum</span>
                  <span className="text-[#10B981] text-[14px] font-black">{calculatedReadiness}% Selesai ({checkedSubMaterials}/{totalSubMaterials} Modul)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/20">
                  <div 
                    className="bg-gradient-to-r from-[#10B981] to-[#059669] h-full rounded-full transition-all duration-700 shadow-inner"
                    style={{ width: `${calculatedReadiness}%` }}
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
                            {node.materials.map((material) => (
                              <div 
                                key={material.id}
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  handleToggleMaterialCheckbox(node.weekNumber, material.id);
                                }}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                                  material.completed 
                                    ? 'bg-slate-50/60 border-slate-200/40 opacity-75' 
                                    : 'bg-white border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                                    material.completed 
                                      ? 'bg-[#10B981] border-[#10B981] text-white' 
                                      : 'border-slate-300 bg-white'
                                  }`}>
                                    {material.completed && <CheckCircle2 size={12} strokeWidth={3} />}
                                  </div>
                                  <p className={`text-[13px] font-semibold tracking-tight ${material.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                    {material.title}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                                  <PlayCircle size={15} className="hover:text-[#3B82F6] transition-colors" />
                                  <span className="text-[11px] font-bold">{material.duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>

          </main>

          <Footer />
        </div>

      </div> 
    </div>
  );
};

export default RoadmapPage;