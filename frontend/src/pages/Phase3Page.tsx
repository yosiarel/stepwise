import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/assessment/ProgressBar';
import OptionCard from '../components/assessment/OptionCard';
import { useAssessmentStore } from '../store/useAssessmentStore';
import assessmentService from '../services/assessmentService';

const Phase3Page = () => {
  const navigate = useNavigate();
  const { sessionId, currentQuestion, setCurrentQuestion } = useAssessmentStore();
  
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dataset Pertanyaan Fase 3 (Lengkap 3-1 sampai 3-4)
  const questions = [
    {
      id: '3-1',
      question: "Bagaimana kamu paling nyaman mempelajari hal baru?",
      instruction: "Pilih satu",
      maxSelect: 1,
      options: [
        { 
          id: 'A', 
          label: 'Visual', 
          desc: 'Paling mudah paham dengan menonton video, melihat diagram, atau membaca infografis.' 
        },
        { 
          id: 'B', 
          label: 'Auditori', 
          desc: 'Paling mudah paham dengan mendengarkan penjelasan, podcast, atau diskusi verbal.' 
        },
        { 
          id: 'C', 
          label: 'Praktik Langsung', 
          desc: 'Paling mudah paham dengan langsung mencoba sendiri dan belajar dari kesalahan.' 
        },
        { 
          id: 'D', 
          label: 'Membaca & Menulis', 
          desc: 'Paling mudah paham dengan membaca dokumentasi, artikel panjang, and membuat catatan.' 
        }
      ]
    },
    {
      id: '3-2',
      question: "Lingkungan kerja seperti apa yang paling membuatmu nyaman?",
      instruction: "Pilih satu",
      maxSelect: 1,
      options: [
        { 
          id: 'A', 
          label: 'Bekerja sendiri dengan fokus penuh', 
          desc: 'Paling produktif saat bisa fokus tanpa gangguan.' 
        },
        { 
          id: 'B', 
          label: 'Bekerja dalam tim kecil yang erat (2–5 orang)', 
          desc: 'Suka kolaborasi intens dengan tim kecil.' 
        },
        { 
          id: 'C', 
          label: 'Bekerja dalam tim besar dengan struktur jelas', 
          desc: 'Nyaman dengan peran yang terdefinisi baik.' 
        },
        { 
          id: 'D', 
          label: 'Fleksibel — kadang sendiri, kadang tim', 
          desc: 'Bisa menyesuaikan di berbagai situasi.' 
        }
      ]
    },
    {
      id: '3-3',
      question: "Tipe perusahaan seperti apa yang paling kamu idamkan?",
      instruction: "Pilih satu",
      maxSelect: 1,
      options: [
        { 
          id: 'A', 
          label: 'Startup', 
          desc: 'Perusahaan rintisan yang fokus on inovasi baru, pertumbuhan sangat cepat, and peran ganda dalam tim kecil yang dinamis.' 
        },
        { 
          id: 'B', 
          label: 'Korporat / Perusahaan Mapan', 
          desc: 'Perusahaan non-IT skala besar dengan struktur formal, jenjang karier yang pasti, dan stabilitas tinggi.' 
        },
        { 
          id: 'C', 
          label: 'Freelance / Mandiri', 
          desc: 'Bekerja secara independen, mengelola klien sendiri, dan memiliki kendali penuh atas waktu kerja.' 
        },
        { 
          id: 'D', 
          label: 'Tech Company / Digital Agency', 
          desc: 'Perusahaan teknologi yang sudah mapan dengan sistem kerja teratur, menangani produk skala global atau proyek klien secara profesional.' 
        },
        { 
          id: 'E', 
          label: 'Belum terpikirkan', 
          desc: 'Masih mengeksplorasi berbagai kemungkinan dan belum memiliki preferensi khusus.' 
        }
      ]
    },
    {
      id: '3-4',
      question: "Berapa jam per minggu yang secara realistis bisa kamu sisihkan untuk belajar sekarang?",
      instruction: "Pilih satu yang paling mendekati",
      maxSelect: 1,
      options: [
        { 
          id: 'A', 
          label: 'Kurang dari 5 jam', 
          desc: 'Cocok untuk pembelajaran santai di sela kesibukan yang padat.' 
        },
        { 
          id: 'B', 
          label: '5–10 jam', 
          desc: 'Komitmen waktu yang cukup untuk progres yang stabil setiap minggunya.' 
        },
        { 
          id: 'C', 
          label: '10–20 jam', 
          desc: 'Sangat baik untuk kamu yang ingin akselerasi pemahaman lebih cepat.' 
        },
        { 
          id: 'D', 
          label: 'Lebih dari 20 jam', 
          desc: 'Fokus penuh (intensive) untuk mendalami bidang baru dalam waktu singkat.' 
        }
      ]
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
        
        // Tetap di Phase 3 selama key masih FASE3
        if (!response.nextQuestion.key.startsWith('FASE3')) {
          // Jika pindah fase lain (misal ada fase 4 di masa depan)
          navigate('/assessment/question'); 
        }
      } else {
        // Selesai semua pertanyaan
        navigate('/assessment/analysis');
      }
    } catch (error) {
      console.error('Gagal mengirim jawaban:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      {/* PERBAIKAN TAKTIS: Menambahkan flex items-center justify-center agar posisi vertikal konsisten presisi di tengah */}
      <main className="flex-grow py-6 md:py-8 px-4 flex items-center justify-center">
        
        {/* REVISI TAKTIS: Mengubah max-w-[960px] menjadi w-full dengan kombinasi xl & 2xl agar grid opsi memuai proporsional di monitor desktop lebar */}
        <div className="w-full max-w-[960px] xl:max-w-[1140px] 2xl:max-w-[1240px] mx-auto transition-all">
          
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#6B7280] hover:text-[#1E3A5F] font-bold text-[13px] mb-4 transition-colors">
            <ChevronLeft size={18} /> Kembali
          </button>

          <ProgressBar phase="Fase 3: Gaya & Preferensi" percentage={85} />

          <div className="text-center mb-6">
            <h2 className="text-[#1E3A5F] text-[22px] md:text-[26px] font-bold leading-tight mb-4 max-w-[750px] xl:max-w-[900px] mx-auto">
              {currentData.question}
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
                description={''}
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
                  {currentQuestion.key === 'FASE3_5' ? 'Selesaikan Asesmen' : 'Lanjutkan'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Phase3Page;