import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  X
} from 'lucide-react';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDesktopExpanded, setIsDesktopExpanded] = useState<boolean>(true); 
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false); 

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarMenu = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Roadmap Belajar', icon: <Map size={18} />, path: '/dashboard/roadmap' },
    { name: 'Checklist Mingguan', icon: <CheckSquare size={18} />, path: '/dashboard/checklist' },
    { name: 'Rekomendasi Karier', icon: <Briefcase size={18} />, path: '/dashboard/career' },
    { name: 'AI Career Advisor', icon: <MessageSquare size={18} />, path: '/dashboard/advisor' },
    { name: 'Evaluasi & Progres', icon: <BarChart2 size={18} />, path: '/dashboard/evaluation' },
    { name: 'Profil Pengguna', icon: <User size={18} />, path: '/dashboard/profile' },
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

        <nav className="flex flex-col gap-1">
          {sidebarMenu.map((menu, i) => {
            const isActive = location.pathname === menu.path || (menu.path !== '/dashboard' && location.pathname.startsWith(menu.path));
            
            return (
              <button
                key={i}
                onClick={() => navigate(menu.path)}
                title={!isExpanded ? menu.name : undefined}
                className={`w-full h-[42px] rounded-lg flex items-center text-[13.5px] font-bold transition-all ${
                  isExpanded ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'
                } ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#3B82F6] shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#1E3A5F]'
                }`}
              >
                <div className="shrink-0">{menu.icon}</div>
                {isExpanded && <span className="truncate animate-fadeIn">{menu.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

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

      <div className="flex flex-grow w-full mx-auto relative items-start">
        
        <aside 
          className={`bg-white border-r border-slate-200/80 p-4 hidden md:flex flex-col justify-between sticky top-16 h-[calc(100vh-64px)] shrink-0 z-20 transition-all duration-300 ease-in-out ${
            isDesktopExpanded ? 'w-[260px]' : 'w-[76px]'
          }`}
        >
          {renderSidebarContent(isDesktopExpanded, false)}
        </aside>

        <div className="flex-grow flex flex-col min-w-0 min-h-[calc(100vh-64px)]">
          
          <main className="flex-grow p-4 md:p-8 xl:p-10 2xl:p-14 overflow-x-hidden transition-all">
            {children}
          </main>

          <Footer />
        </div>

      </div> 
    </div>
  );
};

export default DashboardLayout;