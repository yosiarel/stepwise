import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
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
import DashboardLayout from '../components/DashboardLayout'; 
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

interface AxiosErrorLike {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

const RoadmapPage = () => {
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [weeklyNodes, setWeeklyNodes] = useState<WeekNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<'none' | 'no_career' | 'other'>('none');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});

  const activeWeekRef = useRef<HTMLDivElement | null>(null);

  const mapMaterialsToWeeks = (materials: RoadmapMaterial[]): WeekNode[] => {
    if (!materials || materials.length === 0) return [];

    const sorted = [...materials].sort((a, b) => a.order - b.order);
    const firstMaterialDate = sorted[0].scheduledAt ? new Date(sorted[0].scheduledAt) : new Date();
    const baseStart = new Date(firstMaterialDate);
    baseStart.setDate(baseStart.getDate() - 7);

    const nodes: WeekNode[] = [];
    const chunkSize = 2; 
    
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
        topic: chunk[0].title, 
        startDate: formatDateStr(weekStart),
        endDate: formatDateStr(weekEnd),
        status: 'locked', 
        materials: materialsList
      });
    }

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

  const fetchActiveRoadmap = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setIsLoading(true);
    }
    setErrorState('none');
    
    try {
      const selectedCareer = await careerService.getSelectedCareer();

      try {
        const data = await roadmapService.getActiveRoadmap(); 
        
        if (data.professionTitle !== selectedCareer.professionTitle) {
          await handleGenerateRoadmap();
        } else {
          setRoadmap(data);
          const mappedWeeks = mapMaterialsToWeeks(data.materials);
          setWeeklyNodes(mappedWeeks);

          const activeWeek = mappedWeeks.find(w => w.status === 'active');
          if (activeWeek) {
            setExpandedWeeks(prev => ({ ...prev, [activeWeek.weekNumber]: true }));
          } else if (mappedWeeks.length > 0) {
            setExpandedWeeks(prev => ({ ...prev, [mappedWeeks[mappedWeeks.length - 1].weekNumber]: true }));
          }
        }
      } catch (roadmapErr: unknown) {
        const error = roadmapErr as AxiosErrorLike;
        if (error.response?.status === 404) {
          await handleGenerateRoadmap();
        } else {
          throw roadmapErr;
        }
      }
    } catch (err: unknown) {
      console.error('Gagal mengambil data:', err);
      const error = err as AxiosErrorLike;
      if (error.response?.status === 400 && error.response?.data?.message?.includes('target karier')) {
        setErrorState('no_career');
        setErrorMessage('Anda belum memilih target karier Anda.');
      } else if (error.response?.status === 404) {
        setErrorState('no_career');
        setErrorMessage('Anda belum memilih target karier Anda.');
      } else {
        setErrorState('other');
        setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat memuat data belajar Anda.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    setErrorState('none');
    
    try {
      await roadmapService.generateRoadmap(); 
      await fetchActiveRoadmap(false);
    } catch (err: unknown) {
      console.error('Gagal mengenerate roadmap:', err);
      const error = err as AxiosErrorLike;
      if (error.response?.status === 400 && error.response?.data?.message?.includes('target karier')) {
        setErrorState('no_career');
        setErrorMessage('Anda belum memilih target karier. Silakan pilih karier target terlebih dahulu.');
      } else {
        setErrorState('other');
        setErrorMessage(error.response?.data?.message || 'AI Advisor gagal menyusun roadmap Anda. Silakan coba lagi.');
      }
    } finally { 
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActiveRoadmap();
    }, 0);
    
    return () => clearTimeout(timer);
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

  const handleToggleMaterialCheckbox = async (matId: string, isCompleted: boolean) => {
    if (isCompleted) return; 

    setActionLoadingId(matId);
    try {
      await roadmapService.completeMaterial(matId); 
      await fetchActiveRoadmap(false);
    } catch (err) {
      console.error('Gagal menyelesaikan materi:', err);
      alert('Gagal memperbarui status materi. Silakan coba lagi.');
    } finally { 
      setActionLoadingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full transition-all flex flex-col relative pb-6">

        {isLoading && !isGenerating && (
          <div className="bg-white border border-slate-200/60 rounded-[20px] p-12 xl:p-16 shadow-sm flex flex-col items-center justify-center text-center">
            <Loader2 className="animate-spin text-[#1E3A5F] mb-3" size={40} />
            <h3 className="text-[#1E3A5F] text-[16px] md:text-[18px] font-bold">Memuat Roadmap Belajar Anda...</h3>
            <p className="text-[#6B7280] text-[13px] md:text-[14px] mt-1">Mengambil kurikulum terstruktur Anda.</p>
          </div>
        )}

        {isGenerating && (
          <div className="bg-white border border-[#3B82F6]/30 rounded-[20px] p-10 xl:p-16 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-[#1E3A5F] animate-pulse"></div>
            <div className="w-[72px] h-[72px] rounded-full border-[3px] border-[#1E3A5F] flex items-center justify-center mb-5 relative">
              <div className="absolute inset-[-3px] rounded-full border-[3px] border-t-transparent border-r-transparent border-b-transparent border-l-[#3B82F6] animate-spin"></div>
              <Sparkles size={32} className="text-[#1E3A5F] animate-bounce" />
            </div>
            <h2 className="text-[#1E3A5F] text-[20px] md:text-[24px] font-black tracking-tight mb-2">AI Advisor Sedang Meracik Peta Belajarmu!</h2>
            <p className="text-[#6B7280] text-[13.5px] md:text-[14.5px] max-w-[550px] leading-relaxed mb-6 font-medium">
              Kami sedang menyusun modul belajar terstruktur, realistis, dan personal berdasarkan berkas CV dan profil belajar mingguan Anda.
            </p>
            <div className="w-full max-w-[300px] space-y-2">
              <div className="h-2.5 bg-[#F3F4F6] rounded-full w-full animate-pulse"></div>
              <div className="h-2.5 bg-[#F3F4F6] rounded-full w-[85%] animate-pulse mx-auto"></div>
            </div>
          </div>
        )}

        {errorState === 'no_career' && !isLoading && !isGenerating && (
          <div className="bg-white border border-slate-200/60 rounded-[20px] p-10 text-center max-w-[600px] mx-auto">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4 border border-amber-200 mx-auto">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-[#1E3A5F] text-[18px] md:text-[20px] font-bold mb-2">Target Karier Belum Dipilih</h2>
            <p className="text-[#6B7280] text-[13.5px] md:text-[14px] leading-relaxed mb-6">
              Untuk membuat roadmap belajar yang relevan dan disesuaikan AI, Anda perlu memilih target karier terlebih dahulu melalui hasil asesmen.
            </p>
            <button
              onClick={() => navigate('/assessment/results')}
              className="h-[44px] px-6 bg-[#1E3A5F] hover:bg-[#152A44] text-white font-bold text-[13.5px] rounded-[10px] flex items-center gap-2 shadow-md transition-all mx-auto active:scale-95"
            >
              Pilih Target Karier Anda <ArrowRight size={15} />
            </button>
          </div>
        )}

        {errorState === 'other' && !isLoading && !isGenerating && (
          <div className="bg-white border border-slate-200/60 rounded-[20px] p-10 text-center max-w-[500px] mx-auto">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 border border-rose-200 mx-auto">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-[#1E3A5F] text-[18px] font-bold mb-2">Terjadi Kesalahan</h2>
            <p className="text-[#6B7280] text-[13.5px] leading-relaxed mb-5">{errorMessage}</p>
            <button
              onClick={() => fetchActiveRoadmap(true)}
              className="h-[40px] px-5 bg-slate-100 hover:bg-slate-200 text-[#1E3A5F] font-bold text-[13px] rounded-[8px] transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {roadmap && !isLoading && !isGenerating && errorState === 'none' && (
          <>
            <div className="bg-white border border-slate-200/60 rounded-[20px] p-4 md:p-5 xl:p-6 shadow-sm mb-6 space-y-4 md:space-y-5 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-slate-400 text-[10.5px] font-extrabold uppercase tracking-widest block mb-0.5">Peta Pembelajaran Terstruktur AI</span>
                  <h1 className="text-[#1E3A5F] text-[20px] md:text-[24px] xl:text-[26px] font-black tracking-tight flex items-center gap-2 flex-wrap">
                    Roadmap Belajar: {roadmap.professionTitle} <Sparkles size={20} className="text-[#3B82F6]" />
                  </h1>
                  <span className="text-slate-500 text-[12px] md:text-[12.5px] font-medium mt-1 flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" /> Alokasi intensif {roadmap.weeklyHours} jam/minggu berbasis kompetensi personal Anda
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button 
                    onClick={scrollToActiveWeek}
                    className="h-[38px] px-4 bg-[#EFF6FF] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white font-bold text-[12.5px] rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    Lihat Minggu Ini
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/career')}
                    className="h-[38px] px-4 bg-white border-2 border-slate-200 text-[#1E3A5F] hover:bg-slate-50 font-bold text-[12.5px] rounded-xl transition-colors"
                  >
                    Ganti Target Karier
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[12px] md:text-[13px] font-bold">
                  <span className="text-[#1E3A5F] uppercase tracking-wider">Total Progress Kurikulum</span>
                  <span className="text-[#10B981] font-black">{roadmap.progress?.percent ?? 0}% Selesai ({roadmap.progress?.completed ?? 0}/{roadmap.progress?.total ?? 0} Modul)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/20">
                  <div 
                    className="bg-gradient-to-r from-[#10B981] to-[#059669] h-full rounded-full transition-all duration-700"
                    style={{ width: `${roadmap.progress?.percent ?? 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="relative border-l-2 border-slate-200 pl-4 md:pl-5 xl:pl-6 ml-3 md:ml-4 space-y-4 my-5 md:my-6">
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
                    
                    <div className={`absolute -left-[29px] md:-left-[32px] xl:-left-[35px] top-3.5 w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                      node.status === 'completed' ? 'bg-[#10B981] border-[#10B981] text-white' :
                      node.status === 'active' ? 'bg-white border-[#3B82F6] text-[#3B82F6] scale-110 shadow-sm' :
                      'bg-slate-100 border-slate-300 text-slate-400'
                    }`}>
                      {node.status === 'completed' ? <CheckCircle2 size={11} strokeWidth={3} /> : 
                       node.status === 'locked' ? <Lock size={9} strokeWidth={2.5} /> : 
                       <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>

                    <div 
                      className={`bg-white border rounded-2xl p-4 md:p-5 transition-all shadow-sm ${
                        node.status === 'active' ? 'border-[#3B82F6] shadow-sm shadow-blue-50/50' : 'border-slate-200/70 hover:border-slate-300'
                      } ${node.status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      onClick={() => toggleWeekExpand(node.weekNumber, node.status === 'locked')}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[#1E3A5F] text-[14px] md:text-[15.5px] font-extrabold tracking-tight">
                              Minggu {node.weekNumber}: {node.topic}
                            </h3>
                            {node.status === 'active' && (
                              <span className="bg-[#EFF6FF] text-[#3B82F6] text-[9.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#DBEAFE]">
                                Sedang Jalan
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px] font-bold block">
                            Periode Keaktifan: {node.startDate} - {node.endDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {node.status !== 'locked' && (
                            <span className={`text-[11.5px] md:text-[12px] font-black ${weekProgress === 100 ? 'text-[#10B981]' : 'text-slate-500'}`}>
                              {weekProgress}%
                            </span>
                          )}
                          {node.status !== 'locked' && (
                            <div className="text-slate-400">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          )}
                        </div>
                      </div>

                      {isExpanded && node.status !== 'locked' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fadeIn">
                          
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mb-3">
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
                                    handleToggleMaterialCheckbox(material.id, material.completed);
                                  }}
                                  className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                                    material.completed 
                                      ? 'bg-slate-50/60 border-slate-200/40 opacity-75' 
                                      : 'bg-white border-slate-100 hover:border-slate-200 cursor-pointer'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-all shrink-0 ${
                                        material.completed ? 'bg-[#10B981] border-[#10B981] text-white' : 'border-slate-300 bg-white'
                                      }`}>
                                        {isChecking ? (
                                          <Loader2 className="animate-spin text-slate-400" size={10} />
                                        ) : material.completed ? (
                                          <CheckCircle2 size={11} strokeWidth={3} />
                                        ) : null}
                                      </div>
                                      <p className={`text-[13px] md:text-[13.5px] font-bold tracking-tight ${material.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                        {material.title}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 shrink-0 text-[11px] font-bold">
                                      <PlayCircle size={14} />
                                      <span>{material.duration}</span>
                                    </div>
                                  </div>

                                  {material.description && (
                                    <p className="text-slate-500 text-[11.5px] leading-relaxed font-medium pl-7">
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

      </div>
    </DashboardLayout>
  );
};

export default RoadmapPage;