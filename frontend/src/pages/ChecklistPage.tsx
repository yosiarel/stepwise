import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Lock,
  PlayCircle,
  FileText,
  Code,
  Check
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

type MaterialType = 'Video' | 'Artikel' | 'Praktik';

interface Task {
  id: string;
  title: string;
  duration: string;
  type: MaterialType;
  completed: boolean;
}

interface WeekData {
  weekNumber: number;
  topic: string;
  description: string;
  isLocked: boolean;
  tasks: Task[];
}

const ChecklistPage = () => {
  const navigate = useNavigate();

  // Dataset Mockup yang direstrukturisasi menjadi daftar Mingguan (tanpa pengelompokan hari)
  const [weeks, setWeeks] = useState<WeekData[]>([
    {
      weekNumber: 3,
      topic: "Dasar JavaScript",
      description: "Pahami konsep inti JavaScript seperti variabel, tipe data, dan logika kontrol.",
      isLocked: false,
      tasks: [
        { id: "w3-t1", title: "Variabel & Tipe Data JS", duration: "1 jam", type: "Video", completed: true },
        { id: "w3-t2", title: "Operasi Aritmatika", duration: "30 menit", type: "Artikel", completed: true }
      ]
    },
    {
      weekNumber: 4,
      topic: "Layouting & Responsive Design",
      description: "Kuasai teknik pengaturan tata letak modern dengan Flexbox dan Grid, serta pastikan antarmuka Anda terlihat sempurna di berbagai ukuran layar.",
      isLocked: false,
      tasks: [
        { id: "w4-t1", title: "CSS Flexbox Deep Dive", duration: "2 jam", type: "Video", completed: true },
        { id: "w4-t2", title: "Membangun Navigasi dengan Flexbox", duration: "1.5 jam", type: "Artikel", completed: true },
        { id: "w4-t3", title: "CSS Grid Mastery", duration: "3 jam", type: "Video", completed: false },
        { id: "w4-t4", title: "Responsive Breakpoints & Media Queries", duration: "1 jam", type: "Artikel", completed: false },
        { id: "w4-t5", title: "Mini Project: Layout Dashboard Responsive", duration: "4 jam", type: "Praktik", completed: false }
      ]
    },
    {
      weekNumber: 5,
      topic: "Async JavaScript & APIs",
      description: "Pelajari cara mengambil data dari server dan menangani proses asinkronus.",
      isLocked: true,
      tasks: []
    }
  ]);

  const [currentWeekNum, setCurrentWeekNum] = useState<number>(4);

  // PERBAIKAN LOGIKA NAVIGASI MINGGU BERDASARKAN INDEX ARRAY
  const currentWeekIndex = useMemo(() => {
    return weeks.findIndex(w => w.weekNumber === currentWeekNum);
  }, [weeks, currentWeekNum]);

  const hasPrevWeek = currentWeekIndex > 0;
  const hasNextWeek = currentWeekIndex < weeks.length - 1;
  const isNextLocked = hasNextWeek ? weeks[currentWeekIndex + 1].isLocked : false;

  // Mendapatkan data minggu yang sedang aktif (fallback aman)
  const currentWeekData = weeks[currentWeekIndex] || weeks[0];

  // Menghitung Progress Mingguan
  const { totalTasks, completedTasks, progressPercentage } = useMemo(() => {
    const total = currentWeekData.tasks.length;
    const completed = currentWeekData.tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { totalTasks: total, completedTasks: completed, progressPercentage: percentage };
  }, [currentWeekData]);

  // Handler: Centang Tugas
  const handleToggleTask = (taskId: string) => {
    setWeeks(prevWeeks => prevWeeks.map(week => {
      if (week.weekNumber === currentWeekNum) {
        const newTasks = week.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        return { ...week, tasks: newTasks };
      }
      return week;
    }));
  };

  // Handler: Navigasi Minggu yang Sudah Diperbaiki
  const handlePrevWeek = () => {
    if (hasPrevWeek) {
      setCurrentWeekNum(weeks[currentWeekIndex - 1].weekNumber);
    }
  };

  const handleNextWeek = () => {
    if (hasNextWeek && !isNextLocked) {
      setCurrentWeekNum(weeks[currentWeekIndex + 1].weekNumber);
    }
  };

  // Fungsi pembantu untuk render ikon berdasarkan tipe materi
  const getTypeIcon = (type: MaterialType) => {
    switch (type) {
      case 'Video': return <PlayCircle size={14} />;
      case 'Artikel': return <FileText size={14} />;
      case 'Praktik': return <Code size={14} />;
      default: return <FileText size={14} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] mx-auto transition-all">
        
        {/* ACTION BAR ATAS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 xl:mb-8">
          <button 
            onClick={() => navigate('/dashboard/roadmap')}
            className="flex items-center gap-2 text-slate-500 hover:text-[#1E3A5F] font-bold text-[13.5px] transition-colors w-fit"
          >
            <ArrowLeft size={18} /> Kembali ke Roadmap
          </button>

          {/* Navigasi Minggu */}
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-sm w-fit">
            <button 
              onClick={handlePrevWeek}
              disabled={!hasPrevWeek}
              className="w-8 h-8 xl:w-9 xl:h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[#1E3A5F] font-extrabold text-[13.5px] xl:text-[14.5px] px-2">
              Minggu {currentWeekNum}
            </span>
            <button 
              onClick={handleNextWeek}
              disabled={!hasNextWeek || isNextLocked}
              title={isNextLocked ? "Minggu ini masih terkunci" : "Minggu Selanjutnya"}
              className="w-8 h-8 xl:w-9 xl:h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
            >
              {isNextLocked ? <Lock size={16} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>

        {/* HEADER JUDUL & DESKRIPSI */}
        <div className="mb-8 xl:mb-10">
          <h1 className="text-[24px] md:text-[28px] xl:text-[32px] font-black text-[#1E3A5F] tracking-tight mb-2 md:mb-3">
            Minggu {currentWeekData.weekNumber}: {currentWeekData.topic}
          </h1>
          <p className="text-slate-500 text-[14px] xl:text-[15px] max-w-3xl leading-relaxed">
            {currentWeekData.description}
          </p>
        </div>

        {/* KARTU PROGRES MINGGU INI */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 xl:p-8 mb-6 xl:mb-8 transition-all">
          <h3 className="text-[#1E3A5F] text-[16px] xl:text-[18px] font-extrabold mb-4">Progres Minggu Ini</h3>
          
          <div className="flex items-center justify-between text-[13px] xl:text-[14px] font-bold mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[#10B981]">{completedTasks} / {totalTasks} Selesai</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">{progressPercentage}%</span>
            </div>
            <div className="flex items-center gap-10 text-slate-400 text-[12px] font-semibold">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="w-full bg-[#E2E8F0] h-3 xl:h-3.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#34D399] h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* KARTU DAFTAR MATERI PEMBELAJARAN */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
          <div className="p-5 md:p-6 xl:p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-[#1E3A5F] text-[16px] xl:text-[18px] font-extrabold">Materi Pembelajaran</h3>
          </div>
          
          <div className="flex flex-col">
            {currentWeekData.tasks.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <Lock size={32} className="mx-auto mb-3 opacity-50" />
                <p>Materi minggu ini masih terkunci.</p>
              </div>
            ) : (
              currentWeekData.tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`group flex items-start gap-4 p-5 xl:p-6 cursor-pointer transition-all duration-200 border-b border-slate-100 last:border-b-0 ${
                    task.completed ? 'bg-emerald-50/30' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Checkbox Persegi */}
                  <div className={`mt-1 w-[22px] h-[22px] shrink-0 rounded flex items-center justify-center transition-colors border ${
                    task.completed 
                      ? 'bg-[#10B981] border-[#10B981] text-white' 
                      : 'border-slate-300 bg-white group-hover:border-[#3B82F6]'
                  }`}>
                    {task.completed && <Check size={14} strokeWidth={3} />}
                  </div>
                  
                  {/* Konten Tugas */}
                  <div className="flex flex-col gap-1.5">
                    <h4 className={`text-[15px] xl:text-[16px] font-bold transition-colors duration-200 ${
                      task.completed ? 'text-slate-400 line-through' : 'text-[#1E3A5F]'
                    }`}>
                      {task.title}
                    </h4>
                    
                    <div className="flex items-center gap-3 text-[12px] xl:text-[13px] font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{task.duration}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className={`flex items-center gap-1.5 ${task.type === 'Praktik' ? 'text-[#10B981]' : ''}`}>
                        {getTypeIcon(task.type)}
                        <span>{task.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ChecklistPage;