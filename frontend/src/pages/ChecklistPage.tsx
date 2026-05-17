import { useState, useMemo, useEffect } from 'react';
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
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import roadmapService from '../services/roadmapService';
import type { RoadmapMaterial as BackendMaterial } from '../types/roadmap';

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

  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [currentWeekNum, setCurrentWeekNum] = useState<number>(1);
  const [professionTitle, setProfessionTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const transformMaterialsToWeeks = (materials: BackendMaterial[]): WeekData[] => {
    if (!materials || materials.length === 0) return [];

    const sorted = [...materials].sort((a, b) => a.order - b.order);
    const minTime = new Date(sorted[0].scheduledAt).getTime();

    const grouped: { [key: number]: BackendMaterial[] } = {};
    sorted.forEach(m => {
      const mTime = new Date(m.scheduledAt).getTime();
      const diffDays = Math.max(0, Math.floor((mTime - minTime) / (1000 * 60 * 60 * 24)));
      const weekNum = Math.floor(diffDays / 7) + 1;

      if (!grouped[weekNum]) {
        grouped[weekNum] = [];
      }
      grouped[weekNum].push(m);
    });

    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .map((weekNum, index) => {
        const tasksInWeek = grouped[weekNum];
        const firstTask = tasksInWeek[0];
        const phaseLabel = firstTask.phase;

        const cleanTopic = firstTask.title.split(' untuk ')[0] || firstTask.title;
        const topic = `${phaseLabel}: ${cleanTopic}`;
        const description = firstTask.description || `Fase ${phaseLabel} untuk mendalami kompetensi utama dan keterampilan spesifik yang relevan dengan standar industri kerja.`;

        return {
          weekNumber: index + 1,
          topic,
          description,
          isLocked: false,
          tasks: tasksInWeek.map(t => {
            const types: MaterialType[] = ['Video', 'Artikel', 'Praktik'];
            const type = types[t.order % types.length];

            const durations = ['1 jam', '1.5 jam', '2 jam', '45 menit', '3 jam'];
            const duration = durations[t.order % durations.length];

            return {
              id: t.id,
              title: t.title,
              duration,
              type,
              completed: t.isCompleted
            };
          })
        };
      });
  };

  useEffect(() => {
    const fetchActiveRoadmap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await roadmapService.getActiveRoadmap();
        setProfessionTitle(data.professionTitle);
        
        const transformedWeeks = transformMaterialsToWeeks(data.materials);
        setWeeks(transformedWeeks);

        if (transformedWeeks.length > 0) {
          const activeWeek = transformedWeeks.find(w => w.tasks.some(t => !t.completed)) || transformedWeeks[0];
          setCurrentWeekNum(activeWeek.weekNumber);
        }
      } catch (err) {
        console.error('Error fetching checklist roadmap:', err);
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Belum ada kurikulum roadmap yang aktif. Silakan pilih target karier terlebih dahulu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveRoadmap();
  }, []);

  const currentWeekIndex = useMemo(() => {
    return weeks.findIndex(w => w.weekNumber === currentWeekNum);
  }, [weeks, currentWeekNum]);

  const hasPrevWeek = currentWeekIndex > 0;
  const hasNextWeek = currentWeekIndex < weeks.length - 1;
  const isNextLocked = hasNextWeek ? weeks[currentWeekIndex + 1].isLocked : false;

  const currentWeekData = weeks[currentWeekIndex] || null;

  const { totalTasks, completedTasks, progressPercentage } = useMemo(() => {
    if (!currentWeekData) return { totalTasks: 0, completedTasks: 0, progressPercentage: 0 };
    const total = currentWeekData.tasks.length;
    const completed = currentWeekData.tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { totalTasks: total, completedTasks: completed, progressPercentage: percentage };
  }, [currentWeekData]);

  const handleToggleTask = async (taskId: string) => {
    if (!currentWeekData) return;

    const targetedTask = currentWeekData.tasks.find(t => t.id === taskId);
    if (!targetedTask) return;

    if (targetedTask.completed) {
      setToastMessage("Materi ini sudah selesai dipelajari! 👍");
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    try {
      await roadmapService.completeMaterial(taskId);
      
      setWeeks(prevWeeks => prevWeeks.map(week => {
        if (week.weekNumber === currentWeekNum) {
          const newTasks = week.tasks.map(task => 
            task.id === taskId ? { ...task, completed: true } : task
          );
          return { ...week, tasks: newTasks };
        }
        return week;
      }));

      setToastMessage("Sukses memperbarui progres belajarmu! 🎉");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Gagal memperbarui progres:', err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Gagal menandai materi sebagai selesai. Coba lagi nanti.');
    }
  };

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

  const getTypeIcon = (type: MaterialType) => {
    switch (type) {
      case 'Video': return <PlayCircle size={14} />;
      case 'Artikel': return <FileText size={14} />;
      case 'Praktik': return <Code size={14} />;
      default: return <FileText size={14} />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 size={36} className="animate-spin text-[#1E3A5F]" />
          <span className="text-[14px] font-bold">Menyelaraskan kurikulum belajarmu...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !currentWeekData) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-md mx-auto h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <AlertCircle size={44} className="text-amber-500 mb-4 animate-bounce" />
          <h3 className="text-[#1E3A5F] text-[16px] font-black mb-1">Kurikulum Aktif Tidak Ditemukan</h3>
          <p className="text-slate-400 text-[13px] font-medium leading-relaxed mb-5">
            {error || 'Sistem belum mendeteksi adanya roadmap yang aktif untuk akun Anda saat ini.'}
          </p>
          <button 
            onClick={() => navigate('/dashboard/career')}
            className="h-10 px-5 bg-[#1E3A5F] hover:bg-[#152A44] text-white text-[13px] font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            Lihat Rekomendasi Karier
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] mx-auto transition-all relative">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 xl:mb-8">
          <button 
            onClick={() => navigate('/dashboard/roadmap')}
            className="flex items-center gap-2 text-slate-500 hover:text-[#1E3A5F] font-bold text-[13.5px] transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft size={18} /> Kembali ke Roadmap ({professionTitle})
          </button>

          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-sm w-fit">
            <button 
              onClick={handlePrevWeek}
              disabled={!hasPrevWeek}
              className="w-8 h-8 xl:w-9 xl:h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[#1E3A5F] font-extrabold text-[13.5px] xl:text-[14.5px] px-2">
              Minggu {currentWeekData.weekNumber}
            </span>
            <button 
              onClick={handleNextWeek}
              disabled={!hasNextWeek || isNextLocked}
              title={isNextLocked ? "Minggu ini masih terkunci" : "Minggu Selanjutnya"}
              className="w-8 h-8 xl:w-9 xl:h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 cursor-pointer"
            >
              {isNextLocked ? <Lock size={16} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>

        <div className="mb-8 xl:mb-10">
          <h1 className="text-[24px] md:text-[28px] xl:text-[32px] font-black text-[#1E3A5F] tracking-tight mb-2 md:mb-3">
            Minggu {currentWeekData.weekNumber}: {currentWeekData.topic}
          </h1>
          <p className="text-slate-500 text-[14px] xl:text-[15px] max-w-3xl leading-relaxed">
            {currentWeekData.description}
          </p>
        </div>

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

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
          <div className="p-5 md:p-6 xl:p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-[#1E3A5F] text-[16px] xl:text-[18px] font-extrabold">Materi Pembelajaran</h3>
          </div>
          
          <div className="flex flex-col">
            {currentWeekData.tasks.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <Lock size={32} className="mx-auto mb-3 opacity-50" />
                <p>Materi minggu ini masih kosong atau terkunci.</p>
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
                  <div className={`mt-1 w-[22px] h-[22px] shrink-0 rounded flex items-center justify-center transition-colors border ${
                    task.completed 
                      ? 'bg-[#10B981] border-[#10B981] text-white' 
                      : 'border-slate-300 bg-white group-hover:border-[#3B82F6]'
                  }`}>
                    {task.completed && <Check size={14} strokeWidth={3} />}
                  </div>
                  
                  <div className="flex flex-col gap-1.5 min-w-0 flex-grow">
                    <h4 className={`text-[15px] xl:text-[16px] font-bold transition-colors duration-200 break-words ${
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

        {toastMessage && (
          <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl font-bold text-[13px] tracking-wide animate-slideInRight z-50 flex items-center gap-2 border border-emerald-500 max-w-[80vw]">
            <Check size={16} strokeWidth={3} className="shrink-0" /> 
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ChecklistPage;