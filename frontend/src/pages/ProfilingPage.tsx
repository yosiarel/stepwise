import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, ClipboardList } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/assessment/ProgressBar';
import OptionCard from '../components/assessment/OptionCard';
import { useAssessmentStore } from '../store/useAssessmentStore';
import assessmentService from '../services/assessmentService';

const ProfilingPage = () => {
  const navigate = useNavigate();
  const { sessionId, setSessionId, currentQuestion, setCurrentQuestion } = useAssessmentStore();
  
  const [selectedOption, setSelectedOption] = useState<string[]>([]);
  const [isInitLoading, setIsInitLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pemicu otomatis saat halaman dibuka: Mengambil sesi dan soal FASE 1 dari backend
  useEffect(() => {
    const initializeProfiling = async () => {
      setIsInitLoading(true);
      setErrorMsg('');
      try {
        console.log('Mengambil data kuesioner FASE 1...');
        const response = await assessmentService.startAssessment();
        console.log('Sesi Berhasil Diambil:', response);
        
        setSessionId(response.sessionId);
        setCurrentQuestion(response.question);
      } catch (err) {
        console.error('Gagal memuat pertanyaan profiling:', err);
        setErrorMsg('Gagal memuat data asesmen. Silakan segarkan halaman atau periksa jaringan Anda.');
      } finally {
        setIsInitLoading(false);
      }
    };

    initializeProfiling();
  }, [setSessionId, setCurrentQuestion]);

  const handleSelect = (value: string) => {
    // Karena FASE 1 bersifat single_choice, kita timpa array dengan opsi tunggal
    setSelectedOption([value]);
  };

  const handleNext = async () => {
    if (selectedOption.length === 0 || !sessionId || !currentQuestion) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const answerValue = selectedOption[0];
      console.log(`Mengirim jawaban FASE 1: ${answerValue}`);

      const response = await assessmentService.submitAnswer({
        sessionId,
        questionKey: currentQuestion.key,
        answerValue
      });

      if (response.nextQuestion) {
        // Simpan pertanyaan berikutnya ke dalam global state
        setCurrentQuestion(response.nextQuestion);
        
        // LOGIKA PERCABANGAN BERDASARKAN SEEDER BACKEND
        if (response.nextQuestion.key.startsWith('FASE2B')) {
          console.log('Mengarahkan ke Jalur Teknis (Phase 2B)');
          navigate('/assessment/phase-2-b');
        } else if (response.nextQuestion.key.startsWith('FASE2A')) {
          console.log('Mengarahkan ke Jalur Non-Teknis (Phase 2A)');
          navigate('/assessment/phase-2-a');
        } else if (response.nextQuestion.key.startsWith('FASE3')) {
          navigate('/assessment/phase-3');
        } else {
          navigate('/assessment/phase-2-a');
        }
      } else {
        navigate('/assessment/analysis');
      }
    } catch (err) {
      console.error('Gagal mengirim jawaban profiling:', err);
      setErrorMsg('Gagal menyimpan jawaban Anda. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tampilan Menunggu Loading Awal Saat Ambil Data dari Backend Railway
  if (isInitLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex flex-col antialiased">
        <Navbar minimal />
        <div className="flex-grow flex flex-col items-center justify-center gap-3 text-[#6B7280]">
          <Loader2 className="animate-spin text-[#3B82F6]" size={40} />
          <p className="text-sm font-bold">Menyiapkan Lembar Kuesioner Asesmen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      <main className="flex-grow py-8 px-4 flex items-center justify-center">
        <div className="w-full max-w-[960px] xl:max-w-[1140px] mx-auto transition-all">
          
          {/* Progress Bar Indikator Status Tahap Asesmen */}
          <ProgressBar 
            phase="Fase 1: Profiling & Familiaritas" 
            percentage={15} 
          />

          {currentQuestion ? (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-blue-50 text-[#3B82F6] rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                  <ClipboardList size={22} />
                </div>
                <h2 className="text-[#1E3A5F] text-[22px] md:text-[26px] font-black leading-tight mb-4 max-w-[800px] mx-auto">
                  {currentQuestion.text}
                </h2>
                <div className="flex justify-center">
                  <span className="inline-flex items-center px-4 py-1.5 bg-[#EFF6FF] text-[#3B82F6] text-[11px] md:text-[12px] font-extrabold rounded-full border border-[#DBEAFE] tracking-widest uppercase shadow-sm">
                    {currentQuestion.helpText || 'Pilih salah satu yang paling sesuai'}
                  </span>
                </div>
              </div>

              {/* Grid Pilihan Kartu Opsi */}
              <div className="grid grid-cols-1 gap-4 mb-8">
                {currentQuestion.options.map((opt) => (
                  <OptionCard 
                    key={opt.id}
                    label={opt.label}
                    description={''} 
                    isSelected={selectedOption.includes(opt.value)}
                    onSelect={() => handleSelect(opt.value)}
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 max-w-md mx-auto text-center">
                  {errorMsg}
                </div>
              )}

              {/* Tombol Aksi Lanjutkan */}
              <div className="flex justify-center border-t border-[#D1D5DB]/40 pt-6">
                <button
                  onClick={handleNext}
                  disabled={selectedOption.length === 0 || isSubmitting}
                  className={`h-[52px] px-12 rounded-xl font-bold text-[16px] flex items-center gap-2 transition-all cursor-pointer ${
                    selectedOption.length > 0 && !isSubmitting
                    ? 'bg-[#1E3A5F] text-white hover:bg-[#152A44] shadow-lg shadow-[#1E3A5F]/10 active:scale-95' 
                    : 'bg-[#D1D5DB] text-white cursor-not-allowed border-none'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Menyimpan...
                    </>
                  ) : (
                    <>
                      Lanjutkan Ke Fase berikutnya <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-red-500 font-bold">Gagal mengambil struktur kuesioner dari database server.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ProfilingPage;