import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
// REVISI: Di-comment agar tidak memicu error linter karena tidak lagi digunakan
// import Footer from '../components/Footer';
import ProgressBar from '../components/assessment/ProgressBar';
import OptionCard from '../components/assessment/OptionCard';

const Phase3Page = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

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
          desc: 'Perusahaan rintisan yang fokus on inovasi baru, pertumbuhan sangat cepat, dan peran ganda dalam tim kecil yang dinamis.' 
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
  ];

  const currentData = questions[currentStep - 1];

  const handleSelect = (id: string) => {
    if (currentData.maxSelect === 1) {
      setSelectedOptions([id]);
    } else {
      if (selectedOptions.includes(id)) {
        setSelectedOptions(selectedOptions.filter(item => item !== id));
      } else if (selectedOptions.length < currentData.maxSelect) {
        setSelectedOptions([...selectedOptions, id]);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
      setSelectedOptions([]);
      window.scrollTo(0, 0);
    } else {
      console.log("Fase 3 Lengkap. Memulai analisis profil...");
      navigate('/assessment/analysis'); 
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSelectedOptions([]);
    } else {
      navigate(-1);
    }
  };

  const progressPercentage = 50 + (currentStep * 10);

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      <main className="flex-grow py-6 md:py-8 px-4">
        <div className="max-w-[960px] mx-auto">
          
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#1E3A5F] font-bold text-[13px] mb-4 transition-colors"
          >
            <ChevronLeft size={18} /> Kembali
          </button>

          <ProgressBar phase="FASE 3: GAYA & PREFERENSI" percentage={progressPercentage} />

          <div className="text-center mb-6">
            <h2 className="text-[#1E3A5F] text-[22px] md:text-[26px] font-bold leading-tight mb-4 max-w-[750px] mx-auto">
              {currentData.question}
            </h2>
            
            <div className="flex justify-center">
              <span className="inline-flex items-center px-4 py-1.5 bg-[#EFF6FF] text-[#3B82F6] text-[11px] md:text-[12px] font-extrabold rounded-full border border-[#DBEAFE] shadow-sm tracking-widest uppercase">
                {currentData.instruction}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentData.options.map((opt) => (
              <OptionCard 
                key={opt.id}
                label={opt.label}
                description={opt.desc}
                isSelected={selectedOptions.includes(opt.id)}
                onSelect={() => handleSelect(opt.id)}
              />
            ))}
          </div>

          <div className="flex justify-center border-t border-[#D1D5DB]/50 pt-6">
            <button
              onClick={handleNext}
              disabled={selectedOptions.length === 0}
              className={`h-[52px] px-12 rounded-[8px] font-bold text-[16px] flex items-center gap-2 transition-all ${
                selectedOptions.length > 0
                ? 'bg-[#1E3A5F] text-white hover:bg-[#152A44] shadow-lg active:scale-95' 
                : 'bg-[#D1D5DB] text-white cursor-not-allowed'
              }`}
            >
              {currentStep === questions.length ? 'Lihat Hasil Rangkuman' : 'Lanjutkan'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>

      {/* REVISI: Komponen Footer di sini telah dihapus sepenuhnya sesuai protokol UI anti-distraksi funnel onboarding */}
    </div>
  );
};

export default Phase3Page;