import { useState, useRef } from 'react';
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

  return (
    <DashboardLayout>
      {/* ROADMAP DASHBOARD MACRO HEADER BANNER */}
      <div className="bg-white border border-slate-200/60 rounded-[20px] p-6 xl:p-8 shadow-sm mb-6 xl:mb-8 space-y-6 xl:space-y-8 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 xl:pb-6">
          <div>
            <span className="text-slate-400 text-[11px] xl:text-[12px] font-extrabold uppercase tracking-widest block mb-1">Peta Pembelajaran Terstruktur</span>
            <h1 className="text-[#1E3A5F] text-[24px] md:text-[28px] xl:text-[32px] font-black tracking-tight flex items-center gap-2">
              Roadmap Belajar: Frontend Developer <Sparkles size={22} className="text-[#3B82F6] xl:w-7 xl:h-7" />
            </h1>
            <span className="text-slate-500 text-[12.5px] xl:text-[14px] font-medium block mt-1.5 flex items-center gap-1.5">
              <Clock size={15} className="text-slate-400 xl:w-4 xl:h-4" /> Estimasi 16 minggu dengan alokasi intensif 8 jam/minggu
            </span>
          </div>

          {/* Top Action Button Triggers */}
          <div className="flex flex-wrap gap-2.5">
            <button 
              onClick={scrollToActiveWeek}
              className="h-[42px] xl:h-[48px] px-4 xl:px-6 bg-[#EFF6FF] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white font-bold text-[13px] xl:text-[14.5px] rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-blue-100"
            >
              Lihat Minggu Ini
            </button>
            <button 
              onClick={() => alert("Membuka Modul Evaluasi Karier Berkala!")}
              className="h-[42px] xl:h-[48px] px-4 xl:px-6 bg-white border-2 border-slate-200 text-[#1E3A5F] hover:bg-slate-50 font-bold text-[13px] xl:text-[14.5px] rounded-xl transition-colors"
            >
              Evaluasi Karier
            </button>
          </div>
        </div>

        {/* MACRO PROGRESS DISPLAY BAR CONTAINER */}
        <div className="space-y-2 xl:space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[#1E3A5F] text-[13px] xl:text-[14px] font-extrabold uppercase tracking-wider">Total Progress Kurikulum</span>
            <span className="text-[#10B981] text-[14px] xl:text-[15px] font-black">{calculatedReadiness}% Selesai ({checkedSubMaterials}/{totalSubMaterials} Modul)</span>
          </div>
          <div className="w-full bg-slate-100 h-3 xl:h-4 rounded-full overflow-hidden border border-slate-200/20">
            <div 
              className="bg-gradient-to-r from-[#10B981] to-[#059669] h-full rounded-full transition-all duration-700 shadow-inner"
              style={{ width: `${calculatedReadiness}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* TIMELINE SECTION CONTAINER (ACCORDION TIMELINE) */}
      <div className="relative border-l-2 border-slate-200 pl-6 xl:pl-8 ml-4 md:ml-6 xl:ml-8 space-y-4 xl:space-y-6 my-8 xl:my-10 transition-all">
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
              <div className={`absolute -left-[35px] xl:-left-[45px] top-4 xl:top-5 w-6 h-6 xl:w-7 xl:h-7 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                node.status === 'completed' ? 'bg-[#10B981] border-[#10B981] text-white' :
                node.status === 'active' ? 'bg-white border-[#3B82F6] text-[#3B82F6] scale-110 shadow-md shadow-blue-100' :
                node.status === 'overdue' ? 'bg-[#F59E0B] border-[#F59E0B] text-white' :
                'bg-slate-100 border-slate-300 text-slate-400'
              }`}>
                {node.status === 'completed' ? <CheckCircle2 size={14} strokeWidth={3} className="xl:w-4 xl:h-4" /> : 
                  node.status === 'locked' ? <Lock size={11} strokeWidth={2.5} className="xl:w-3.5 xl:h-3.5" /> : 
                  <div className="w-2 h-2 xl:w-2.5 xl:h-2.5 rounded-full bg-current" />}
              </div>
            )}

              {/* WEEK CARD LAYOUT ACCORDION */}
              <div 
                className={`bg-white border rounded-2xl p-4 md:p-5 xl:p-6 transition-all shadow-sm ${
                  node.status === 'active' ? 'border-[#3B82F6] shadow-md shadow-blue-50/50' : 'border-slate-200/70 hover:border-slate-300'
                } ${node.status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                onClick={() => toggleWeekExpand(node.weekNumber, node.status === 'locked')}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 xl:space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[#1E3A5F] text-[15px] md:text-[16px] xl:text-[18px] font-black tracking-tight">
                        Minggu {node.weekNumber}: {node.topic}
                      </h3>
                      {node.status === 'active' && (
                        <span className="bg-[#EFF6FF] text-[#3B82F6] text-[10px] xl:text-[11px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#DBEAFE]">
                          Sedang Jalan
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11px] xl:text-[12.5px] font-bold block">
                      Durasi Periode: {node.startDate} - {node.endDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 xl:gap-4">
                    {node.status !== 'locked' && (
                      <span className={`text-[12px] xl:text-[14px] font-extrabold ${weekProgress === 100 ? 'text-[#10B981]' : 'text-slate-500'}`}>
                        {weekProgress}%
                      </span>
                    )}
                    {node.status !== 'locked' && (
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={18} className="xl:w-5 xl:h-5" /> : <ChevronDown size={18} className="xl:w-5 xl:h-5" />}
                      </div>
                    )}
                  </div>
                </div>

                {/* INTERNAL EXPANDABLE SUB-MATERIAL ELEMENT */}
                {isExpanded && node.status !== 'locked' && (
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 xl:space-y-4 animate-fadeIn">
                    
                    <div className="w-full bg-slate-100 h-1.5 xl:h-2 rounded-full overflow-hidden mb-4 xl:mb-5">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${weekProgress === 100 ? 'bg-[#10B981]' : 'bg-[#3B82F6]'}`}
                        style={{ width: `${weekProgress}%` }}
                      ></div>
                    </div>

                    <div className="space-y-2 xl:space-y-3">
                      {node.materials.map((material) => (
                        <div 
                          key={material.id}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleToggleMaterialCheckbox(node.weekNumber, material.id);
                          }}
                          className={`p-3 xl:p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                            material.completed 
                              ? 'bg-slate-50/60 border-slate-200/40 opacity-75' 
                              : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 xl:gap-4">
                            <div className={`w-4.5 h-4.5 xl:w-5 xl:h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
                              material.completed 
                                ? 'bg-[#10B981] border-[#10B981] text-white' 
                                : 'border-slate-300 bg-white'
                            }`}>
                              {material.completed && <CheckCircle2 size={12} strokeWidth={3} className="xl:w-3.5 xl:h-3.5" />}
                            </div>
                            <p className={`text-[13px] xl:text-[14.5px] font-semibold tracking-tight ${material.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {material.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 xl:gap-2 text-slate-400 shrink-0">
                            <PlayCircle size={15} className="hover:text-[#3B82F6] transition-colors xl:w-4.5 xl:h-4.5" />
                            <span className="text-[11px] xl:text-[12px] font-bold">{material.duration}</span>
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
    </DashboardLayout>
  );
};

export default RoadmapPage;