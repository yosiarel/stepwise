import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/assessment/ProgressBar';
import OptionCard from '../components/assessment/OptionCard';
import { useAssessmentStore } from '../store/useAssessmentStore';
import assessmentService from '../services/assessmentService';

const ProfilingPage = () => {
  const navigate = useNavigate();
  const { setSessionId, setCurrentQuestion } = useAssessmentStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const options = [
    {
      id: 'A',
      label: 'Pengguna Dasar',
      description: 'Saya biasanya hanya memakai aplikasi untuk chat, media sosial, browsing ringan, dan menonton video. Saya jarang atau belum pernah mencoba tools yang lebih teknis seperti rumus Excel kompleks, editing, apalagi coding.'
    },
    {
      id: 'B',
      label: 'Pengguna Cukup Aktif',
      description: 'Saya cukup lancar menggunakan berbagai aplikasi untuk belajar dan bekerja — mengedit dokumen, membuat konten sederhana di Canva, mengolah data dengan Excel, atau mengatur file cloud. Saya bisa beradaptasi dengan aplikasi baru tanpa banyak kesulitan.'
    },
    {
      id: 'C',
      label: 'Pengguna Mahir',
      description: 'Saya terbiasa menggunakan tools profesional untuk pekerjaan spesifik: software desain, akuntansi, manajemen proyek, atau pernah mencoba coding dan otomatisasi sederhana. Saya cukup percaya diri mengeksplorasi teknologi baru.'
    },
    {
      id: 'D',
      label: 'Pengguna Sangat Mahir',
      description: 'Saya membuat atau mengutak-atik teknologi — menulis kode, mengelola server, mengolah data dengan Python/SQL, atau merancang antarmuka aplikasi. Ini adalah bagian penting dari pekerjaan atau hobi saya.'
    }
  ];

  const handleContinue = async () => {
    if (!selectedOption) return;
    
    setIsLoading(true);
    try {
      // 1. Mulai Asesmen
      const startRes = await assessmentService.startAssessment();
      setSessionId(startRes.sessionId);
      
      // 2. Submit Jawaban FASE1
      const answerRes = await assessmentService.submitAnswer({
        sessionId: startRes.sessionId,
        questionKey: 'FASE1',
        answerValue: selectedOption
      });

      setCurrentQuestion(answerRes.nextQuestion);

      // 3. Routing berdasarkan pilihan (A/B -> 2A, C/D -> 2B)
      if (selectedOption === 'C' || selectedOption === 'D') {
        navigate('/assessment/phase-2-b');
      } else {
        navigate('/assessment/phase-2-a');
      }
    } catch (error) {
      console.error('Gagal memulai asesmen:', error);
      alert('Terjadi kesalahan saat memulai asesmen. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      <main className="flex-grow py-6 md:py-8 px-4">
        <div className="max-w-[960px] mx-auto">
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#1E3A5F] font-bold text-[13px] mb-5 transition-colors"
          >
            <ChevronLeft size={18} /> Kembali
          </button>

          <ProgressBar phase="Fase 1: Profiling" percentage={10} />

          <div className="text-center mb-8">
            <h2 className="text-[#1E3A5F] text-[22px] md:text-[26px] font-bold leading-tight mb-4 max-w-[700px] mx-auto">
              Like apa kebiasaanmu menggunakan teknologi digital sehari-hari?
            </h2>
            
            <div className="flex justify-center">
              <span className="inline-flex items-center px-4 py-1.5 bg-[#EFF6FF] text-[#3B82F6] text-[11px] md:text-[12px] font-extrabold rounded-full border border-[#DBEAFE] shadow-sm tracking-widest uppercase">
                Pilih salah satu yang paling menggambarkan dirimu
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {options.map((opt) => (
              <OptionCard 
                key={opt.id}
                label={opt.label}
                description={opt.description}
                isSelected={selectedOption === opt.id}
                onSelect={() => setSelectedOption(opt.id)}
              />
            ))}
          </div>

          <div className="flex justify-center border-t border-[#D1D5DB]/50 pt-6">
            <button
              onClick={handleContinue}
              disabled={!selectedOption || isLoading}
              className={`h-[52px] px-10 rounded-[8px] font-bold text-[16px] flex items-center gap-2 transition-all ${
                selectedOption && !isLoading
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

      {/* REVISI: Komponen Footer di sini telah dihapus sepenuhnya sesuai protokol UI anti-distraksi funnel onboarding */}
    </div>
  );
};

export default ProfilingPage;