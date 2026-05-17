import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/assessment/ProgressBar';
import OptionCard from '../components/assessment/OptionCard';
import { useAssessmentStore } from '../store/useAssessmentStore';
import assessmentService from '../services/assessmentService';

const Phase2APage = () => {
  const navigate = useNavigate();
  const { sessionId, currentQuestion, setCurrentQuestion } = useAssessmentStore();
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Jika tidak ada sessionId (user refresh halaman), arahkan balik ke profiling
  useEffect(() => {
    if (!sessionId) {
      navigate('/assessment/profiling');
    }
  }, [sessionId, navigate]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1E3A5F]" size={48} />
      </div>
    );
  }

  const isMultiChoice = currentQuestion.inputType === 'multi_choice';
  const maxSelect = currentQuestion.maxSelections || 1;

  const handleSelect = (value: string) => {
    if (!isMultiChoice) {
      setSelectedOptions([value]);
    } else {
      if (selectedOptions.includes(value)) {
        setSelectedOptions(selectedOptions.filter(item => item !== value));
      } else if (selectedOptions.length < maxSelect) {
        setSelectedOptions([...selectedOptions, value]);
      }
    }
  };

  const handleNext = async () => {
    if (selectedOptions.length === 0 || !sessionId) return;

    setIsLoading(true);
    try {
      const answerValue = isMultiChoice ? selectedOptions : selectedOptions[0];
      
      const response = await assessmentService.submitAnswer({
        sessionId,
        questionKey: currentQuestion.key,
        answerValue
      });

      if (response.nextQuestion) {
        setCurrentQuestion(response.nextQuestion);
        setSelectedOptions([]);
        window.scrollTo(0, 0);
        
        // Cek jika pindah fase untuk update ProgressBar (opsional, bisa dari key)
        if (response.nextQuestion.key.startsWith('FASE3')) {
          navigate('/assessment/phase-3');
        } else if (response.nextQuestion.key.startsWith('FASE2B')) {
          navigate('/assessment/phase-2-b');
        }
      } else {
        // Jika tidak ada pertanyaan lagi, berarti selesai
        navigate('/assessment/analysis');
      }
    } catch (error) {
      console.error('Gagal mengirim jawaban:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Menentukan label progress bar berdasarkan key pertanyaan
  const getPhaseLabel = () => {
    if (currentQuestion.key.startsWith('FASE2')) return 'Fase 2: Eksplorasi Minat';
    if (currentQuestion.key.startsWith('FASE3')) return 'Fase 3: Gaya & Preferensi';
    return 'Asesmen';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      <main className="flex-grow py-6 md:py-8 px-4">
        <div className="max-w-[960px] mx-auto">
          
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#6B7280] hover:text-[#1E3A5F] font-bold text-[13px] mb-4 transition-colors">
            <ChevronLeft size={18} /> Kembali
          </button>

          <ProgressBar 
            phase={getPhaseLabel()} 
            percentage={currentQuestion.key.startsWith('FASE3') ? 70 : 40} 
          />

          <div className="text-center mb-6">
            <h2 className="text-[#1E3A5F] text-[22px] md:text-[26px] font-bold leading-tight mb-4 max-w-[750px] mx-auto">
              {currentQuestion.text}
            </h2>
            
            <div className="flex justify-center">
              <span className="inline-flex items-center px-4 py-1.5 bg-[#EFF6FF] text-[#3B82F6] text-[11px] md:text-[12px] font-extrabold rounded-full border border-[#DBEAFE] shadow-sm tracking-widest uppercase">
                {currentQuestion.helpText || (isMultiChoice ? `Pilih maksimal ${maxSelect}` : 'Pilih satu')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentQuestion.options.map((opt) => (
              <OptionCard 
                key={opt.id}
                label={opt.label}
                description={''} // Backend seeder saat ini belum ada field deskripsi per opsi
                isSelected={selectedOptions.includes(opt.value)}
                onSelect={() => handleSelect(opt.value)}
              />
            ))}
          </div>

          <div className="flex justify-center border-t border-[#D1D5DB]/50 pt-6">
            <button
              onClick={handleNext}
              disabled={selectedOptions.length === 0 || isLoading}
              className={`h-[52px] px-12 rounded-[8px] font-bold text-[16px] flex items-center gap-2 transition-all ${
                selectedOptions.length > 0 && !isLoading
                ? 'bg-[#1E3A5F] text-white hover:bg-[#152A44] shadow-lg active:scale-95' 
                : 'bg-[#D1D5DB] text-white cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Memproses...
                </>
              ) : (
                <>
                  Lanjutkan <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Phase2APage;