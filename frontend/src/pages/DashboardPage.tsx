import { useState, useEffect, useRef } from 'react';
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
  PlayCircle,
  FileText,
  ClipboardList,
  Loader2,
  Briefcase,
  Check
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuthStore } from '../store/useAuthStore';
import trackerService from '../services/trackerService';
import roadmapService from '../services/roadmapService';
import careerService from '../services/careerService';
import evaluationService from '../services/evaluationService';

interface WeeklyTask {
  id: string;
  title: string;
  phase: string;
  isCompleted: boolean;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data Terintegrasi
  const [trackerSummary, setTrackerSummary] = useState<any>(null);
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [showEvalBanner, setShowEvalBanner] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Ambil ringkasan pelacak kemajuan
      const summary = await trackerService.getSummary();
      setTrackerSummary(summary);
      setHasRoadmap(true);

      // Ambil data detail modul dari active roadmap
      const roadmap = await roadmapService.getActiveRoadmap();
      if (roadmap && roadmap.materials) {
        // Urutkan dan ambil materi belum selesai, lalu sisa modul
        const incomplete = roadmap.materials.filter((m: any) => !m.isCompleted);
        const completed = roadmap.materials.filter((m: any) => m.isCompleted);

        // Ambil maksimal 4 target materi untuk minggu ini
        const listToShow = [...incomplete, ...completed].slice(0, 4);
        setTasks(listToShow as WeeklyTask[]);
      }

      // Ambil data evaluasi tertunda dari backend
      try {
        const pendingEval = await evaluationService.getPending();
        setShowEvalBanner(!!pendingEval);
      } catch (evalErr) {
        console.warn('Gagal memuat status evaluasi tertunda:', evalErr);
        setShowEvalBanner(false);
      }
    } catch (err: any) {
      // Jika 404 (belum ada roadmap aktif), cek apakah pengguna sudah memilih karir target
      try {
        const selectedCareer = await careerService.getSelectedCareer();
        if (selectedCareer) {
          console.log('Target karir ditemukan tapi roadmap aktif belum ada. Memulai pembuatan roadmap otomatis...');
          await roadmapService.generateRoadmap();

          // Coba fetch kembali setelah roadmap terbuat
          const summary = await trackerService.getSummary();
          setTrackerSummary(summary);
          setHasRoadmap(true);

          const roadmap = await roadmapService.getActiveRoadmap();
          if (roadmap && roadmap.materials) {
            const incomplete = roadmap.materials.filter((m: any) => !m.isCompleted);
            const completed = roadmap.materials.filter((m: any) => m.isCompleted);
            const listToShow = [...incomplete, ...completed].slice(0, 4);
            setTasks(listToShow as WeeklyTask[]);
          }
          return;
        }
      } catch (innerErr) {
        console.log('Pengguna belum memilih target karir.');
      }

      console.warn('Pengguna belum memiliki peta jalan aktif (404/belum asesmen).');
      setHasRoadmap(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDashboardData();
  }, []);

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    if (isCompleted) {
      triggerToast("Materi ini sudah selesai dipelajari! 👍");
      return;
    }

    try {
      await roadmapService.completeMaterial(taskId);
      triggerToast("Modul ditandai selesai! Kesiapan kerjamu meningkat. 🎉");
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui status progres materi.');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3 text-[#1E3A5F]">
          <Loader2 size={36} className="animate-spin text-[#3B82F6]" />
          <p className="text-[14px] font-bold">Sinkronisasi data aktivitas belajar...</p>
        </div>
      </DashboardLayout>
    );
  }

  // WIZARD INITIAL JIKA BELUM ADA ROADMAP
  if (!hasRoadmap) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-[1000px] mx-auto font-sans text-[#1F2937] pb-12 transition-all space-y-8 animate-fadeIn">

          <div className="bg-gradient-to-br from-[#1E3A5F] to-[#152A44] text-white rounded-[24px] p-8 xl:p-12 shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 top-0 opacity-10 hidden md:block">
              <Sparkles size={300} className="text-white" />
            </div>
            <div className="relative z-10 max-w-[650px] space-y-4">
              <span className="text-blue-300 text-[11px] xl:text-[12px] font-black uppercase tracking-widest block">Langkah Awal</span>
              <h1 className="text-[28px] md:text-[36px] font-black leading-tight tracking-tight">
                Selamat Datang di StepWise, {user?.name || 'Talenta Hebat'}!
              </h1>
              <p className="text-slate-300 text-[15px] md:text-[16px] leading-relaxed font-medium">
                Asisten navigasi karier IT cerdas berbasis AI. Agar kami dapat memetakan roadmap belajar personal dan mengukur tingkat kesiapan kerja Anda, mari tentukan target rute karier Anda terlebih dahulu!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
            {/* OPSI A: Unggah CV */}
            <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 xl:p-8 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-50 text-[#3B82F6] rounded-2xl flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <h3 className="text-[#1E3A5F] text-[18px] font-black tracking-tight">Opsi A: Pindai CV Instan</h3>
                <p className="text-[#6B7280] text-[13.5px] leading-relaxed font-medium">
                  Biarkan Gemini AI mengekstrak data pendidikan, keahlian teknis, dan portofolio dari resume Anda secara otomatis untuk pembuatan peta jalan belajar instan.
                </p>
              </div>
              <button
                onClick={() => navigate('/upload-cv')}
                className="h-[46px] w-full bg-[#1E3A5F] hover:bg-[#152A44] text-white font-bold text-[13.5px] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Unggah CV Sekarang</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* OPSI B: Asesmen Interaktif */}
            <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 xl:p-8 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-[#10B981] rounded-2xl flex items-center justify-center">
                  <ClipboardList size={24} />
                </div>
                <h3 className="text-[#1E3A5F] text-[18px] font-black tracking-tight">Opsi B: Asesmen Interaktif</h3>
                <p className="text-[#6B7280] text-[13.5px] leading-relaxed font-medium">
                  Belum memiliki CV? Ikuti kuesioner adaptif cerdas kami untuk menggali minat, gaya belajar, kecocokan bidang kerja IT, dan komitmen waktu belajar Anda.
                </p>
              </div>
              <button
                onClick={() => navigate('/assessment/profiling')}
                className="h-[46px] w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold text-[13.5px] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Mulai Asesmen Minat</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

        </div>
      </DashboardLayout>
    );
  }

  // TAMPILAN DASHBOARD UTAMA TERINTEGRASI
  const readiness = trackerSummary?.overallProgress?.percent || 0;
  const materiSelesai = trackerSummary?.overallProgress?.completed || 0;
  const totalMateri = trackerSummary?.overallProgress?.total || 0;
  const streakDays = trackerSummary?.streak?.currentStreak || 0;
  const targetKarierTitle = trackerSummary?.professionTitle || 'Rute Pilihan';

  const getStatusBadge = () => {
    const status = trackerSummary?.projection?.onTrackStatus || 'NO_DATA';
    switch (status) {
      case 'AHEAD':
        return (
          <span className="text-[11px] xl:text-[12px] font-bold text-indigo-600 bg-indigo-50 px-2.5 xl:px-3 py-0.5 xl:py-1 rounded-full uppercase tracking-wider">
            Ahead
          </span>
        );
      case 'ON_TRACK':
        return (
          <span className="text-[11px] xl:text-[12px] font-bold text-[#10B981] bg-[#D1FAE5] px-2.5 xl:px-3 py-0.5 xl:py-1 rounded-full uppercase tracking-wider">
            On Track
          </span>
        );
      case 'BEHIND':
        return (
          <span className="text-[11px] xl:text-[12px] font-bold text-rose-600 bg-rose-50 px-2.5 xl:px-3 py-0.5 xl:py-1 rounded-full uppercase tracking-wider animate-pulse">
            Behind
          </span>
        );
      case 'NO_DATA':
      default:
        return (
          <span className="text-[11px] xl:text-[12px] font-bold text-slate-500 bg-slate-100 px-2.5 xl:px-3 py-0.5 xl:py-1 rounded-full uppercase tracking-wider">
            No Data
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-[1000px] xl:max-w-[1100px] mx-auto space-y-6 animate-fadeIn">

        {/* ROW 1: Career Route Display */}
        <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 xl:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all">
          <div>
            <span className="text-slate-400 text-[11px] xl:text-[12px] font-extrabold uppercase tracking-widest block mb-1">Target Karier Saat Ini</span>
            <h1 className="text-[#1E3A5F] text-[24px] md:text-[28px] xl:text-[32px] font-black tracking-tight flex items-center gap-2">
              <Briefcase className="text-[#3B82F6]" size={26} /> {targetKarierTitle} <Sparkles size={20} className="text-[#3B82F6] fill-[#3B82F6]/10" />
            </h1>
          </div>
          <button
            onClick={() => navigate('/dashboard/career')}
            className="h-[44px] xl:h-[48px] px-5 xl:px-8 border-2 border-slate-200 text-[#1E3A5F] hover:bg-slate-50 font-bold text-[13px] xl:text-[14px] rounded-xl transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          >
            Ubah Target
          </button>
        </div>

        {/* ROW 2: Periodic Evaluation Banner */}
        {showEvalBanner && (
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#152A44] text-white rounded-[16px] xl:rounded-[20px] p-4 md:p-5 xl:p-6 shadow-md flex items-center justify-between gap-4 animate-fadeIn transition-all">
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
                navigate('/dashboard/evaluation');
                setShowEvalBanner(false);
              }}
              className="h-[38px] xl:h-[42px] px-4 xl:px-6 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[12px] xl:text-[13px] font-bold rounded-lg xl:rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              Mulai Evaluasi
            </button>
          </div>
        )}

        {/* ROW 3: Split Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start transition-all">

          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Status Kesiapan Kerja */}
            <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 xl:p-8 shadow-sm space-y-4 xl:space-y-6 transition-all">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-[#1E3A5F] text-[15px] xl:text-[17px] font-black uppercase tracking-wider">Status Kesiapan Kerja</h3>
                  <p className="text-slate-400 text-[12px] xl:text-[13px] font-medium">Berdasarkan rasio penyelesaian target modul kurikulum roadmap belajar.</p>
                </div>
                {getStatusBadge()}
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

            {/* Target Materi Belajar Minggu Ini */}
            <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 xl:p-8 shadow-sm transition-all">
              <div className="mb-5 xl:mb-7">
                <h3 className="text-[#1E3A5F] text-[15px] xl:text-[17px] font-black uppercase tracking-wider">Yang Harus Diselesaikan Minggu Ini</h3>
                <p className="text-slate-400 text-[12px] xl:text-[13px] font-medium font-sans">Centang materi di bawah jika Anda telah menguasainya untuk memperbarui status kesiapan kerja Anda.</p>
              </div>

              <div className="space-y-2.5 xl:space-y-4">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.isCompleted)}
                      className={`p-4 xl:p-5 rounded-xl border-2 cursor-pointer flex items-center justify-between gap-4 transition-all ${task.isCompleted
                        ? 'bg-slate-50/80 border-slate-200/50 opacity-70'
                        : 'bg-white border-slate-100 shadow-sm hover:border-[#3B82F6]/60'
                        }`}
                    >
                      <div className="flex items-center gap-3.5 xl:gap-5">
                        <div className={`w-5 h-5 xl:w-6 xl:h-6 rounded-md border flex items-center justify-center transition-all ${task.isCompleted
                          ? 'bg-[#10B981] border-[#10B981] text-white'
                          : 'border-slate-300 bg-white group-hover:border-[#3B82F6]'
                          }`}>
                          {task.isCompleted && <CheckSquare size={14} className="stroke-[3] xl:w-4 xl:h-4" />}
                        </div>
                        <div>
                          <p className={`text-[13.5px] xl:text-[15px] font-extrabold transition-all ${task.isCompleted ? 'text-slate-400 line-through' : 'text-[#1E3A5F]'
                            }`}>
                            {task.title}
                          </p>
                          <span className="text-slate-400 text-[11px] xl:text-[12px] font-bold block mt-0.5 xl:mt-1">{task.phase}</span>
                        </div>
                      </div>
                      <PlayCircle size={18} className="text-[#3B82F6] hover:text-[#2563EB] transition-colors shrink-0 xl:w-6 xl:h-6" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-xl">Semua materi roadmap Anda saat ini sudah selesai!</div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/roadmap')}
                className="w-full h-[52px] xl:h-[60px] bg-[#1E3A5F] hover:bg-[#152A44] text-white font-bold text-[14.5px] xl:text-[16px] rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Lihat Roadmap Lengkap</span>
                <ArrowRight size={16} className="xl:w-5 xl:h-5" />
              </button>
              <button
                onClick={() => navigate('/dashboard/advisor')}
                className="w-full h-[52px] xl:h-[60px] bg-white border-2 border-slate-200 text-[#1E3A5F] hover:bg-slate-50 font-bold text-[14.5px] xl:text-[16px] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageSquare size={16} className="text-[#3B82F6] xl:w-5 xl:h-5" />
                <span>Tanya AI Advisor</span>
              </button>
            </div>

            {/* Statistics */}
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
                  <span className="text-[#1E3A5F] text-[13.5px] xl:text-[15px] font-black">{materiSelesai} <span className="text-slate-400 font-bold text-[11px] xl:text-[12px]">/ {totalMateri}</span></span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 xl:gap-4">
                    <div className="w-8 h-8 xl:w-10 xl:h-10 bg-[#EFF4FF] text-[#3B82F6] rounded-lg flex items-center justify-center">
                      <Clock size={16} className="xl:w-5 xl:h-5" />
                    </div>
                    <span className="text-slate-500 text-[12.5px] xl:text-[14px] font-bold">Modul Belajar</span>
                  </div>
                  <span className="text-[#1E3A5F] text-[13.5px] xl:text-[15px] font-black">{totalMateri} <span className="text-slate-400 font-bold text-[11px] xl:text-[12px]">Modul</span></span>
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

        {/* Toast Notification System */}
        {toastMessage && (
          <div className="fixed top-6 right-6 bg-[#1F2937] text-white px-5 py-3 rounded-xl shadow-lg font-bold text-[13.5px] animate-slideInRight z-50 flex items-center gap-2.5 border border-slate-100/10">
            <Check size={16} strokeWidth={3} className="shrink-0 text-emerald-500" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;