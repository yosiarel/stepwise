import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Sparkles, 
  Check, 
  X, 
  Clock, 
  Loader2, 
  PlusCircle, 
  Bookmark 
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import evaluationService from '../services/evaluationService';
import trackerService from '../services/trackerService';
import type { AdjustmentProposal } from '../types/evaluation';

interface HistoricalReflection {
  date: string;
  paceQuestion: string;
  paceAnswer: string;
  careerQuestion: string;
  careerAnswer: string;
  notesQuestion: string;
  notesAnswer: string;
  targetPercent: number;
  actualPercent: number;
}

const EvaluationPage = () => {
  const [proposals, setProposals] = useState<AdjustmentProposal[]>([]);
  const [lastReflection, setLastReflection] = useState<HistoricalReflection | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeEvaluationId, setActiveEvaluationId] = useState<string | null>(null);
  const [paceComfort, setPaceComfort] = useState<'too_slow' | 'comfortable' | 'too_fast'>('comfortable');
  const [careerConfidence, setCareerConfidence] = useState<'Ya' | 'Ragu' | 'Tidak'>('Ya');
  const [freeNote, setFreeNote] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadEvaluationData = async () => {
    try {
      const propData = await evaluationService.getPendingProposals();
      setProposals(propData.proposals || []);

      const lastEval = await evaluationService.getLastCompleted();
      
      if (lastEval) {
        const paceComfortMap: Record<string, string> = {
          'comfortable': 'Pas (Nyaman Menyesuaikan)',
          'too_slow': 'Terlalu Lambat',
          'too_fast': 'Terlalu Cepat',
        };

        setLastReflection({
          date: new Date(lastEval.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          paceQuestion: 'Seberapa nyaman dengan kecepatan belajar?',
          paceAnswer: paceComfortMap[lastEval.paceComfort] || lastEval.paceComfort || 'Pas',
          careerQuestion: 'Apakah masih yakin dengan target karier?',
          careerAnswer: lastEval.interestShifted ? 'Ragu / Tidak Yakin' : 'Ya, Sangat Yakin',
          notesQuestion: 'Catatan tambahan',
          notesAnswer: lastEval.freeNotes || 'Tidak ada catatan.',
          targetPercent: Math.min(lastEval.readinessPercentAtEval + 12, 100), 
          actualPercent: lastEval.readinessPercentAtEval
        });
      } else {
        setLastReflection(null);
      }

    } catch (err) {
      console.error('Gagal memuat komponen data evaluasi dari backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvaluationData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenEvaluationModal = async () => {
    try {
      setIsSubmitting(true);
      const res = await evaluationService.triggerEvaluation();
      setActiveEvaluationId(res.evaluationId);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Gagal membuat sesi evaluasi baru:', err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Gagal memulai evaluasi baru. Silakan periksa kembali status target karier Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvaluationId) return;

    try {
      setIsSubmitting(true);
      
      const interestShiftedParam = careerConfidence !== 'Ya';

      const result = await evaluationService.submitReflection({
        evaluationId: activeEvaluationId,
        paceComfort,
        interestShifted: interestShiftedParam,
        freeNotes: freeNote
      });

      setIsModalOpen(false);
      setToastMessage(result.hasProposals 
        ? "Refleksi terkirim! AI menyarankan beberapa usulan penyesuaian kurikulum baru." 
        : "Refleksi terkirim! Analisis AI menyatakan kurikulum belajarmu tetap berjalan optimal! 🚀"
      );
      
      setFreeNote('');
      
      setIsLoading(true);
      await loadEvaluationData();

      setTimeout(() => setToastMessage(null), 4500);
    } catch (err) {
      console.error('Gagal mengirimkan lembar kuesioner refleksi:', err);
      alert('Terjadi kendala saat memproses analisis data AI Advisor. Silakan coba beberapa saat lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecideProposal = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      await evaluationService.decideProposal(id, action);
      
      setProposals(prev => prev.filter(p => p.id !== id));
      
      setToastMessage(action === 'APPROVED' 
        ? "Usulan perubahan kurikulum berhasil diterapkan pada roadmap aktifmu! 🛠️" 
        : "Usulan penyesuaian kurikulum berhasil ditolak."
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Gagal merekam keputusan proposal adaptif:', err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Gagal mengirimkan keputusan aksi menuju server.');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-2 text-[#6B7280]">
          <Loader2 size={32} className="animate-spin text-[#3B82F6]" />
          <p className="text-[14px] font-medium font-sans">Menyelaraskan matriks evaluasi dari server...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-[1200px] mx-auto font-sans text-[#1F2937] px-4 md:px-0 transition-all relative space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold leading-[36px] text-[#1F2937] tracking-tight mb-1 flex items-center gap-3">
              <BarChart2 className="text-[#3B82F6]" size={26} /> Evaluasi & Progres Belajar
            </h1>
            <p className="text-[16px] font-normal leading-[24px] text-[#6B7280]">
              Pantau kestabilan ritme belajar dan sesuaikan roadmap secara adaptif bersama AI Advisor.
            </p>
          </div>

          <button
            onClick={handleOpenEvaluationModal}
            className="h-[48px] px-6 bg-[#1E3A5F] hover:bg-[#152A44] active:bg-[#0F1E33] text-white font-medium text-[16px] rounded-[8px] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
          >
            <PlusCircle size={18} /> Mulai Evaluasi Baru
          </button>
        </div>

        {lastReflection && (
          <div className="bg-white rounded-[12px] p-6 border border-[#D1D5DB] shadow-[0_2px_8px_rgba(0,0,0,0.08)] space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <h3 className="text-[18px] font-semibold leading-[24px] text-[#1F2937] flex items-center gap-2">
                <Bookmark size={18} className="text-[#3B82F6]" /> Ringkasan Evaluasi Terakhir
              </h3>
              <span className="text-[14px] font-normal leading-[20px] text-[#6B7280] bg-[#F3F4F6] px-3 py-1 rounded-[8px]">
                Sesi: {lastReflection.date}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F3F4F6] p-4 rounded-[8px] border border-[#E5E7EB]">
                <span className="text-[12px] font-normal text-[#6B7280] block uppercase tracking-wide mb-1">
                  {lastReflection.paceQuestion}
                </span>
                <p className="text-[16px] font-medium text-[#1F2937]">
                  {lastReflection.paceAnswer}
                </p>
              </div>

              <div className="bg-[#F3F4F6] p-4 rounded-[8px] border border-[#E5E7EB]">
                <span className="text-[12px] font-normal text-[#6B7280] block uppercase tracking-wide mb-1">
                  {lastReflection.careerQuestion}
                </span>
                <p className="text-[16px] font-medium text-[#1F2937]">
                  {lastReflection.careerAnswer}
                </p>
              </div>

              <div className="bg-[#F3F4F6] p-4 rounded-[8px] border border-[#E5E7EB]">
                <span className="text-[12px] font-normal text-[#6B7280] block uppercase tracking-wide mb-1">
                  {lastReflection.notesQuestion}
                </span>
                <p className="text-[14px] font-normal leading-[20px] text-[#1F2937] line-clamp-2" title={lastReflection.notesAnswer}>
                  {lastReflection.notesAnswer}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
              <h4 className="text-[16px] font-medium text-[#1F2937]">Perbandingan Progres</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#F3F4F6] p-4 rounded-[8px] border border-[#E5E7EB]">
                  <div className="flex justify-between text-[14px] font-normal text-[#6B7280] mb-2">
                    <span>Target Kurikulum Ideal</span>
                    <span className="font-semibold text-[#1E3A5F]">{lastReflection.targetPercent}%</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#3B82F6] h-full rounded-full transition-all duration-500" style={{ width: `${lastReflection.targetPercent}%` }}></div>
                  </div>
                </div>

                <div className="bg-[#F3F4F6] p-4 rounded-[8px] border border-[#E5E7EB]">
                  <div className="flex justify-between text-[14px] font-normal text-[#10B981] mb-2">
                    <span className="font-medium">Realisasi Progres Aktual Anda</span>
                    <span className="font-bold text-[#10B981]">{lastReflection.actualPercent}%</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full rounded-full transition-all duration-500" style={{ width: `${lastReflection.actualPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-[18px] font-semibold leading-[24px] text-[#1F2937] flex items-center gap-2 px-1">
            <Sparkles size={18} className="text-[#F59E0B]" /> Usulan Penyesuaian dari Sistem
          </h3>

          {proposals.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#D1D5DB] shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-[12px] text-[#6B7280]">
              <Check size={24} className="mx-auto mb-2 text-[#10B981]" />
              <h4 className="text-[#1F2937] text-[16px] font-medium">Kurikulum Berjalan Optimal</h4>
              <p className="text-[14px] font-normal mt-1">Belum ada usulan modifikasi jadwal atau target kurikulum baru dari AI Advisor saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {proposals.map((prop) => (
                <div 
                  key={prop.id} 
                  className="bg-white border border-[#D1D5DB] rounded-[12px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn"
                >
                  <div className="space-y-1.5 flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-[4px] bg-[#FEF3C7] text-[#F59E0B]">
                        {prop.type.replace('_', ' ')}
                      </span>
                      <span className="text-[#6B7280] text-[12px] font-normal flex items-center gap-1">
                        <Clock size={12} /> Rekomendasi
                      </span>
                    </div>
                    <p className="text-[16px] font-medium leading-[24px] text-[#1F2937] break-words">
                      {prop.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleDecideProposal(prop.id, 'APPROVED')}
                      className="h-[48px] px-6 bg-[#1E3A5F] hover:bg-[#152A44] active:bg-[#0F1E33] text-white text-[16px] font-medium rounded-[8px] transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      Setujui
                    </button>
                    <button
                      onClick={() => handleDecideProposal(prop.id, 'REJECTED')}
                      className="h-[48px] px-6 border-[1.5px] border-[#EF4444] text-[#EF4444] hover:bg-[#FEE2E2] active:bg-[#FECACA] text-[16px] font-medium rounded-[8px] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#1F2937]/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsModalOpen(false)} />
            
            <div className="bg-white w-full max-w-lg rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[#E5E7EB] z-10 overflow-hidden transform transition-all animate-scaleIn">
              
              <div className="px-6 py-4 bg-[#F3F4F6] border-b border-[#E5E7EB] flex items-center justify-between">
                <h3 className="text-[18px] font-semibold text-[#1F2937]">Lembar Refleksi Pengguna</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-[#6B7280] hover:text-[#1F2937] p-1 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitReflection} className="p-6 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[16px] font-medium text-[#1F2937] block">Seberapa nyaman dengan kecepatan belajar?</label>
                  <select 
                    value={paceComfort}
                    onChange={(e) => setPaceComfort(e.target.value as 'too_slow' | 'comfortable' | 'too_fast')}
                    className="w-full h-[48px] px-4 rounded-[8px] border border-[#D1D5DB] outline-none focus:border-[#3B82F6] text-[16px] font-normal text-[#1F2937] bg-[#F3F4F6] cursor-pointer"
                  >
                    <option value="comfortable">Pas</option>
                    <option value="too_slow">Terlalu Lambat</option>
                    <option value="too_fast">Terlalu Cepat</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[16px] font-medium text-[#1F2937] block">Apakah masih yakin dengan target karier?</label>
                  <div className="flex gap-3">
                    {(['Ya', 'Ragu', 'Tidak'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setCareerConfidence(option)}
                        className={`flex-1 h-[48px] rounded-[8px] text-[16px] font-medium border transition-all cursor-pointer ${
                          careerConfidence === option
                            ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                            : 'bg-[#F3F4F6] border-[#D1D5DB] text-[#6B7280] hover:bg-[#E5E7EB]'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[16px] font-medium text-[#1F2937] block">Catatan tambahan</label>
                  <textarea
                    value={freeNote}
                    onChange={(e) => setFreeNote(e.target.value)}
                    rows={3}
                    placeholder="Masukkan teks bebas di sini..."
                    className="w-full p-3 bg-[#F3F4F6] border border-[#D1D5DB] rounded-[8px] text-[16px] font-normal text-[#1F2937] outline-none focus:border-[#3B82F6] resize-none"
                  />
                </div>

                <div className="text-[12px] font-normal text-[#6B7280] leading-[16px] bg-[#FEF3C7] border border-[#FEF3C7] p-3 rounded-[8px]">
                  <b>Penafian Transparansi AI:</b> Output, kesimpulan saran, dan usulan restrukturisasi materi bersifat sugestif pembantu navigasi, bukan keputusan mutlak yang mengikat kurikulum akhir Anda.
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-[48px] px-6 border-[1.5px] border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#F3F4F6] text-[16px] font-medium rounded-[8px] transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-[48px] px-6 bg-[#1E3A5F] hover:bg-[#152A44] text-white text-[16px] font-medium rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />} Kirim Refleksi
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {toastMessage && (
          <div className="fixed top-6 right-6 bg-[#1F2937] text-white px-4 py-3 rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] font-medium text-[14px] leading-[20px] animate-slideInRight z-50 flex items-center gap-2 border border-[#E5E7EB]/10 max-w-[80vw]">
            <Check size={16} strokeWidth={3} className="shrink-0 text-[#10B981]" /> 
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default EvaluationPage;