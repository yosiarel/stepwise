import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  MessageSquare, 
  Flame, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

interface WeeklyTask {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  impactValue: number;
}

const DashboardPage = () => {
  const navigate = useNav();
  const { user, logout: authLogout } = useAuthStore();

  // State Kesiapan Kerja & Statistik Belajar (Dinamis)
  const [readiness, setReadiness] = useState<number>(45); 
  const [materiSelasai, setMateriSelesai] = useState<number>(12); 
  const totalMateri = 28; 
  const totalJamBelajar = 34; 
  const streakDays = 5; 

  // State Banner Evaluasi Berkala
  const [showEvalBanner, setShowEvalBanner] = useState<boolean>(true);

  // State Daftar Tugas Mingguan (Interaktif)
  const [tasks, setTasks] = useState<WeeklyTask[]>([
    { id: 'task-1', title: 'Learn CSS Flexbox Layouting', duration: 'Est. 2 Jam', completed: false, impactValue: 2 },
    { id: 'task-2', title: 'Master Grid Layout & Responsive Design', duration: 'Est. 3 Jam', completed: false, impactValue: 3 },
    { id: 'task-3', title: 'Build Navigation Bar Project Practice', duration: 'Project Praktik', completed: false, impactValue: 4 },
    { id: 'task-4', title: 'Introduction to JavaScript DOM Manipulation', duration: 'Est. 2 Jam', completed: false, impactValue: 2 }
  ]);

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

  return (
    <DashboardLayout>
      {/* Target Karier */}
      <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 xl:p-8 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all">
        <div>
          <span className="text-slate-400 text-[11px] xl:text-[12px] font-extrabold uppercase tracking-widest block mb-1">Target Karier Saat Ini</span>
          <h1 className="text-[#1E3A5F] text-[24px] md:text-[28px] xl:text-[32px] font-black tracking-tight flex items-center gap-2">
            Frontend Developer <Sparkles size={20} className="text-[#3B82F6] fill-[#3B82F6]/10" />
          </h1>
        </div>
        <button
          onClick={() => navigate('/dashboard/career')}
          className="h-[44px] xl:h-[48px] px-5 xl:px-8 border-2 border-slate-200 text-[#1E3A5F] hover:bg-slate-50 font-bold text-[13px] xl:text-[14px] rounded-xl transition-colors flex items-center justify-center shrink-0"
        >
          Ubah Target
        </button>
      </div>

      {/* Banner Evaluasi Berkala */}
      {showEvalBanner && (
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#152A44] text-white rounded-[16px] xl:rounded-[20px] p-4 md:p-5 xl:p-6 shadow-md mb-6 xl:mb-8 flex items-center justify-between gap-4 animate-fadeIn transition-all">
          <div className="flex items-center gap-3 xl:gap-5">
            <div className="w-10 h-10 xl:w-12 xl:h-12 bg-white/10 rounded-xl flex items-center justify-center text-[#3B82F6] shrink-0">
              <AlertCircle size={20} className="text-[#3B82F6] xl:w-6 xl:h-6" />
            </div>
            <div>
              <h3 className="text-[14px] md:text-[15px] xl:text-[17px] font-extrabold tracking-tight">Evaluasi berkala menunggumu!</h3>
              <p className="text-slate-300 text-[12px] xl:text-[13px] font-medium">Ukur perkembangan pemahaman materi barumu untuk kalibrasi kesiapan kerja otomatis.</p>
            </div>
          </div>
          <button
            onClick={() => {
              alert("Mengarahkan ke halaman pengisian evaluasi berkala!");
              setShowEvalBanner(false);
            }}
            className="h-[38px] xl:h-[42px] px-4 xl:px-6 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[12px] xl:text-[13px] font-bold rounded-lg xl:rounded-xl transition-colors shrink-0"
          >
            Mulai Evaluasi
          </button>
        </div>
      )}

      {/* Grid Utama Dasbor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start transition-all">
        
        {/* Panel Kiri */}
        <div className="lg:col-span-8 space-y-6 xl:space-y-8">
          
          {/* Status Kesiapan */}
          <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 xl:p-8 shadow-sm space-y-4 xl:space-y-6 transition-all">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-[#1E3A5F] text-[15px] xl:text-[17px] font-black uppercase tracking-wider">Status Kesiapan Kerja</h3>
                <p className="text-slate-400 text-[12px] xl:text-[13px] font-medium">Berdasarkan rasio penyelesaian target modul kurikulum roadmap belajar.</p>
              </div>
              <span className="text-[11px] xl:text-[12px] font-bold text-[#10B981] bg-[#D1FAE5] px-2.5 xl:px-3 py-0.5 xl:py-1 rounded-full uppercase tracking-wider">
                On Track
              </span>
            </div>

            <div className="w-full bg-slate-100 h-8 xl:h-10 rounded-xl overflow-hidden relative border border-slate-200/30">
              <div 
                className="bg-gradient-to-r from-[#10B981] to-[#059669] h-full rounded-l-xl flex items-center justify-end px-3 transition-all duration-500 shadow-inner"
                style={{ width: `${readiness}%` }}
              >
                {readiness >= 18 && (
                  <span className="text-white text-[11px] md:text-[12px] xl:text-[14px] font-black tracking-wide relative z-10">
                    {readiness}% Ready
                  </span>
                )}
              </div>
              {readiness < 18 && (
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-500 text-[11px] md:text-[12px] xl:text-[14px] font-black tracking-wide">
                  {readiness}% Ready
                </span>
              )}
              <div className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-[10px] xl:text-[11px] font-bold uppercase tracking-wider">
                Target: 100% (Job Ready)
              </div>
            </div>
          </div>

          {/* Checklist Tugas */}
          <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 xl:p-8 shadow-sm transition-all">
            <div className="mb-5 xl:mb-7">
              <h3 className="text-[#1E3A5F] text-[15px] xl:text-[17px] font-black uppercase tracking-wider">Yang Harus Diselesaikan Minggu Ini</h3>
              <p className="text-slate-400 text-[12px] xl:text-[13px] font-medium">Selesaikan target materi di bawah ini untuk mendongkrak skor kesiapan kerjamu.</p>
            </div>

            <div className="space-y-2.5 xl:space-y-4">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-4 xl:p-5 rounded-xl border-2 cursor-pointer flex items-center justify-between gap-4 transition-all ${
                    task.completed 
                      ? 'bg-slate-50/80 border-slate-200/50 opacity-70' 
                      : 'bg-white border-slate-100 shadow-sm hover:border-[#3B82F6]/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 xl:gap-5">
                    <div className={`w-5 h-5 xl:w-6 xl:h-6 rounded-md border flex items-center justify-center transition-all ${
                      task.completed 
                        ? 'bg-[#10B981] border-[#10B981] text-white' 
                        : 'border-slate-300 bg-white group-hover:border-[#3B82F6]'
                    }`}>
                      {task.completed && <CheckSquare size={14} className="stroke-[3] xl:w-4 xl:h-4" />}
                    </div>
                    <div>
                      <p className={`text-[13.5px] xl:text-[15px] font-extrabold transition-all ${
                        task.completed ? 'text-slate-400 line-through' : 'text-[#1E3A5F]'
                      }`}>
                        {task.title}
                      </p>
                      <span className="text-slate-400 text-[11px] xl:text-[12px] font-bold block mt-0.5 xl:mt-1">{task.duration}</span>
                    </div>
                  </div>
                  <PlayCircle size={18} className="text-slate-400 hover:text-[#3B82F6] transition-colors shrink-0 xl:w-6 xl:h-6" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Panel Kanan */}
        <div className="lg:col-span-4 space-y-6 xl:space-y-8">
          
          <div className="space-y-3 xl:space-y-4">
            <button
              onClick={() => navigate('/dashboard/roadmap')}
              className="w-full h-[52px] xl:h-[60px] bg-[#1E3A5F] hover:bg-[#152A44] text-white font-bold text-[14.5px] xl:text-[16px] rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>Lihat Roadmap Lengkap</span>
              <ArrowRight size={16} className="xl:w-5 xl:h-5" />
            </button>
            <button
              onClick={() => navigate('/dashboard/advisor')}
              className="w-full h-[52px] xl:h-[60px] bg-white border-2 border-slate-200 text-[#1E3A5F] hover:bg-slate-50 font-bold text-[14.5px] xl:text-[16px] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageSquare size={16} className="text-[#3B82F6] xl:w-5 xl:h-5" />
              <span>Tanya AI Advisor</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-[20px] p-5 xl:p-7 shadow-sm space-y-4 xl:space-y-6 transition-all">
            <h3 className="text-[#1E3A5F] text-[13px] xl:text-[15px] font-black uppercase tracking-wider border-b border-slate-100 pb-2.5 xl:pb-4">
              Statistik Belajar Kamu
            </h3>

            <div className="space-y-3.5 xl:space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 xl:gap-4">
                  <div className="w-8 h-8 xl:w-10 xl:h-10 bg-blue-50 text-[#3B82F6] rounded-lg flex items-center justify-center">
                    <BookOpen size={16} className="xl:w-5 xl:h-5" />
                  </div>
                  <span className="text-slate-500 text-[12.5px] xl:text-[14px] font-bold">Materi Selesai</span>
                </div>
                <span className="text-[#1E3A5F] text-[13.5px] xl:text-[15px] font-black">{materiSelasai} <span className="text-slate-400 font-bold text-[11px] xl:text-[12px]">/ {totalMateri}</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 xl:gap-4">
                  <div className="w-8 h-8 xl:w-10 xl:h-10 bg-amber-50 text-[#D97706] rounded-lg flex items-center justify-center">
                    <Clock size={16} className="xl:w-5 xl:h-5" />
                  </div>
                  <span className="text-slate-500 text-[12.5px] xl:text-[14px] font-bold">Total Jam Belajar</span>
                </div>
                <span className="text-[#1E3A5F] text-[13.5px] xl:text-[15px] font-black">{totalJamBelajar} <span className="text-slate-400 font-bold text-[11px] xl:text-[12px]">Jam</span></span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 xl:gap-4">
                  <div className="w-8 h-8 xl:w-10 xl:h-10 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center">
                    <Flame size={16} className="fill-rose-500/10 xl:w-5 xl:h-5" />
                  </div>
                  <span className="text-slate-500 text-[12.5px] xl:text-[14px] font-bold">Streak Harian</span>
                </div>
                <span className="text-rose-600 text-[13.5px] xl:text-[15px] font-black flex items-center gap-1">
                  {streakDays} Hari 🔥
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;