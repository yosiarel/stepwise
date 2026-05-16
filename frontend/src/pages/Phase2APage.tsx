import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
// REVISI: Di-comment agar tidak memicu error linter karena tidak lagi digunakan
// import Footer from '../components/Footer';
import ProgressBar from '../components/assessment/ProgressBar';
import OptionCard from '../components/assessment/OptionCard';

const Phase2APage = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const questions = [
    {
      id: '2A-1',
      question: "Bayangkan kamu diminta membantu sebuah acara amal. Kamu paling bersemangat mengambil peran yang mana?",
      instruction: "Pilih satu yang paling menggambarkan dirimu",
      maxSelect: 1,
      options: [
        { id: 'A', label: 'Perancang Visual', desc: 'Merancang tampilan dekorasi, poster, dan feed Instagram agar acara terlihat estetis.' },
        { id: 'B', label: 'Manajer Alur & Logistik', desc: 'Menyusun jadwal kerja tim, mengelola perlengkapan, dan memastikan koordinasi sistematis.' },
        { id: 'C', label: 'Analisis Data & Keuangan', desc: 'Mencatat dana masuk/keluar, menyusun anggaran, dan menganalisis tiket terjual.' },
        { id: 'D', label: 'Komunikator Kreatif', desc: 'Memikirkan ide konten persuasif, menulis caption menarik, atau memproduksi video pendek.' },
        { id: 'E', label: 'Koordinator Taktis Lapangan', desc: 'Mengawasi acara langsung, sigap mengambil keputusan saat ada kendala, dan menjaga keamanan.' },
        { id: 'F', label: 'Eksekutor Adaptif', desc: 'Membantu di berbagai bagian yang membutuhkan tenaga tambahan di lokasi.' }
      ]
    },
    {
      id: '2A-2',
      question: "Dari aktivitas berikut, mana yang paling menarik perhatianmu atau paling menggambarkan hobimu sehari-hari?",
      instruction: "Pilih maksimal 2",
      maxSelect: 2,
      options: [
        { id: 'A', label: 'Kreator Visual', desc: 'Mengedit foto atau video, membuat desain grafis (misal: poster, undangan, konten medsos), atau menata feeds agar lebih estetik' },
        { id: 'B', label: 'Riset & Eksplorasi', desc: 'Membaca artikel, buku, atau menonton video yang membahas suatu topik secara mendalam' },
        { id: 'C', label: 'Pengolah Data & Sistem', desc: 'Mengatur sesuatu agar rapi dan terstruktur (file di laptop, koleksi, daftar), atau mencari tahu data dan statistik dari suatu hal yang kamu minati (misal: rekor game, peringkat film, perbandingan spesifikasi)' },
        { id: 'D', label: 'Penulis & Konten', desc: 'Menulis cerita, caption, membuat konten, atau bermain media sosial' },
        { id: 'E', label: 'Mekanis & Troubleshooting', desc: 'Memperbaiki barang rusak, membongkar pasang mainan/elektronik, merakit sesuatu' },
        { id: 'F', label: 'Diskusi & Argumentasi', desc: 'Berdiskusi tentang isu terkini, berdebat sehat, atau menjelaskan sesuatu ke teman' },
        { id: 'G', label: 'Aktivitas Fisik', desc: 'Berolahraga, berkebun, memasak, atau melakukan aktivitas fisik lainnya' }
      ]
    },
    {
      id: '2A-3',
      question: "Dari enam deskripsi ini, mana yang paling terdengar seperti dirimu?",
      instruction: "Pilih satu yang paling dominan",
      maxSelect: 1,
      options: [
        { id: 'R', label: 'Si Praktis', desc: 'Kamu suka kegiatan nyata dan hasil yang terlihat. Lebih nyaman mengerjakan sesuatu dengan tangan atau alat daripada duduk berpikir terlalu lama. Contoh: Memperbaiki sepeda, merakit furnitur, mengatur ulang gudang.' },
        { id: 'I', label: 'Si Pemikir', desc: 'Kamu suka memahami sesuatu sampai ke akarnya. Penasaran, suka bertanya "kenapa", dan menikmati riset atau memecahkan teka-teki. Contoh: Menonton video cara kerja sesuatu, membaca ulasan sebelum membeli.' },
        { id: 'A', label: 'Si Kreatif', desc: 'Kamu suka menciptakan, mengekspresikan diri, dan membuat sesuatu yang unik atau indah. Contoh: Menggambar, menulis puisi, mendekorasi kamar, membuat konten TikTok.' },
        { id: 'S', label: 'Si Penolong', desc: 'Kamu suka membantu, mendukung, atau mengajar orang lain. Peduli dengan perasaan sekitar. Contoh: Membantu teman yang kesulitan, menjadi pendengar yang baik, mengajar adik.' },
        { id: 'E', label: 'Si Pemimpin', desc: 'Kamu suka ambil inisiatif, mempengaruhi orang, dan mencapai target. Berorientasi pada hasil. Contoh: Mengajak teman proyek bareng, menjual barang online, memimpin rapat.' },
        { id: 'C', label: 'Si Teratur', desc: 'Kamu suka keteraturan, prosedur, dan data yang rapi. Teliti dan sistematis. Contoh: Membuat jadwal harian, menyusun folder laptop, mencatat pengeluaran.' }
      ]
    },
    {
      id: '2A-4',
      question: "Saat menghadapi tugas yang benar-benar baru dan kamu tidak tahu harus mulai dari mana, apa yang biasanya kamu lakukan?",
      instruction: "Pilih satu yang paling menggambarkan dirimu",
      maxSelect: 1,
      options: [
        { 
          id: 'A', 
          label: 'Si Eksperimentatif', 
          desc: 'Langsung mencoba-coba sendiri, belajar dari kesalahan tanpa menunggu bantuan orang lain.' 
        },
        { 
          id: 'B', 
          label: 'Si Terstruktur', 
          desc: 'Mencari tutorial, membaca panduan secara mendalam, atau bertanya pada ahlinya agar langkahnya benar.' 
        },
        { 
          id: 'C', 
          label: 'Si Pengamat Hati-hati', 
          desc: 'Menunggu instruksi yang jelas atau bantuan dari orang yang lebih paham sebelum mulai mengerjakan.' 
        },
        { 
          id: 'D', 
          label: 'Si Kolaboratif', 
          desc: 'Mengajak diskusi teman atau tim untuk brainstorming bersama guna menemukan jalan keluar.' 
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
      console.log("Fase 2A Selesai. Siap lanjut ke tahap berikutnya.");
      navigate('/assessment/phase-3');
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

  const progressPercentage = 10 + (currentStep * 10);

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      <main className="flex-grow py-6 md:py-8 px-4">
        <div className="max-w-[960px] mx-auto">
          
          <button onClick={handleBack} className="flex items-center gap-2 text-[#6B7280] hover:text-[#1E3A5F] font-bold text-[13px] mb-4 transition-colors">
            <ChevronLeft size={18} /> Kembali
          </button>

          <ProgressBar phase="Fase 2: Eksplorasi Minat" percentage={progressPercentage} />

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
              {currentStep === questions.length ? 'Selesai Fase 2' : 'Lanjutkan'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Phase2APage;