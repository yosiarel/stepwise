import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
// REVISI: Di-comment agar tidak memicu error linter karena tidak lagi digunakan
// import Footer from '../components/Footer';
import ProgressBar from '../components/assessment/ProgressBar';
import OptionCard from '../components/assessment/OptionCard';

const Phase2BPage = () => {
  const navigate = useNavigate();
  
  // State untuk melacak urutan pertanyaan (1-3)
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Dataset Lengkap Fase 2B (3 Pertanyaan)
  const questions = [
    {
      id: '2B-1',
      question: "Dari area IT berikut, mana yang paling membuatmu bersemangat untuk digeluti lebih dalam?",
      instruction: "Pilih maksimal 2",
      maxSelect: 2,
      isCategorized: true,
      categories: [
        {
          title: "Membangun Produk Digital",
          items: [
            { id: 'frontend', label: 'Frontend & UI Development', desc: 'Membangun tampilan aplikasi yang indah dan interaktif. (HTML, CSS, React, Vue)' },
            { id: 'backend', label: 'Backend & API Development', desc: 'Membangun logika server, database, dan API yang menjadi otak aplikasi. (Node.js, Express, Laravel)' },
            { id: 'mobile', label: 'Mobile Development', desc: 'Membangun aplikasi smartphone Android/iOS. (Flutter, React Native, Swift, Kotlin)' },
          ]
        },
        {
          title: "Data & Kecerdasan Buatan",
          items: [
            { id: 'datascience', label: 'Data Science & Analytics', desc: 'Mengolah data besar untuk menemukan pola dan visualisasi insight. (Python, SQL, Pandas)' },
            { id: 'ai_ml', label: 'Artificial Intelligence & ML', desc: 'Membangun sistem yang bisa "belajar" sendiri. (Python, TensorFlow, PyTorch)' },
          ]
        },
        {
          title: "Infrastruktur, Keamanan & Kualitas",
          items: [
            { id: 'cybersecurity', label: 'Cybersecurity & Network', desc: 'Melindungi sistem dari serangan dan mengamankan jaringan. (Kali Linux, Wireshark)' },
            { id: 'devops', label: 'Cloud & DevOps', desc: 'Mengelola infrastruktur cloud dan otomatisasi deployment. (AWS, Docker, Kubernetes)' },
            { id: 'qa', label: 'QA / QC (Quality Assurance)', desc: 'Memastikan software bebas bug melalui testing secara sistematis. (Selenium, JIRA)' },
          ]
        },
        {
          title: "Desain, Produk & Inovasi",
          items: [
            { id: 'uiux', label: 'UI/UX Design', desc: 'Merancang pengalaman pengguna yang intuitif dan menarik. (Figma, Adobe XD)' },
            { id: 'product_mgmt', label: 'Product Management', desc: 'Mengelola visi produk dan kolaborasi tim teknis-bisnis. (JIRA, Notion)' },
          ]
        },
        {
          title: "Teknologi Baru & Pemasaran",
          items: [
            { id: 'gamedev', label: 'Game Development', desc: 'Membangun game 2D/3D untuk berbagai platform. (Unity, Unreal Engine)' },
            { id: 'iot', label: 'IoT & Embedded Systems', desc: 'Menghubungkan perangkat fisik ke internet. (Arduino, Raspberry Pi)' },
            { id: 'blockchain', label: 'Blockchain & Web3', desc: 'Aplikasi terdesentralisasi dan smart contract. (Solidity, Ethereum)' },
            { id: 'digimar', label: 'Digital Marketing & SEO', desc: 'Optimasi visibilitas online dan iklan digital. (Google Analytics)' },
          ]
        }
      ]
    },
    {
      id: '2B-2',
      question: "Apa yang paling mendorongmu ingin mendalami IT?",
      instruction: "Pilih maksimal 2",
      maxSelect: 2,
      isCategorized: false,
      options: [
        { id: 'A', label: 'Dampak & Produk', desc: 'Membangun produk yang dipakai banyak orang' },
        { id: 'B', label: 'Pemecahan Masalah', desc: 'Memecahkan masalah kompleks dan mencari solusi cerdas' },
        { id: 'C', label: 'Finansial & Keamanan', desc: 'Mendapatkan penghasilan tinggi dan stabilitas finansial' },
        { id: 'D', label: 'Fleksibilitas & Kebebasan', desc: 'Fleksibilitas kerja (remote, freelance, jam fleksibel)' },
        { id: 'E', label: 'Pertumbuhan & Belajar', desc: 'Terus belajar teknologi baru dan tidak stagnan' },
        { id: 'F', label: 'Kontribusi Sosial', desc: 'Berkontribusi pada proyek open source atau dampak sosial' }
      ]
    },
    {
      id: '2B-3',
      question: "Dari ambivalent deskripsi ini, mana yang paling terdengar seperti dirimu?",
      instruction: "Pilih satu yang paling dominan",
      maxSelect: 1,
      isCategorized: false,
      options: [
        { id: 'R', label: 'Si Praktis', desc: 'Kamu suka kegiatan nyata dan hasil yang terlihat. Lebih nyaman mengerjakan sesuatu dengan tangan atau alat daripada duduk berpikir terlalu lama. Contoh: Memperbaiki sepeda, merakit furnitur, menyusun barang di rak.' },
        { id: 'I', label: 'Si Pemikir', desc: 'Kamu suka memahami sesuatu sampai ke akarnya. Penasaran, suka bertanya "kenapa", dan menikmati riset atau memecahkan teka-teki. Contoh: Menonton video cara kerja sesuatu, membaca ulasan sebelum membeli.' },
        { id: 'A', label: 'Si Kreatif', desc: 'Kamu suka menciptakan, mengekspresikan diri, dan membuat sesuatu yang unik atau indah. Contoh: Menggambar, menulis puisi, mendekorasi kamar, membuat konten TikTok.' },
        { id: 'S', label: 'Si Penolong', desc: 'Kamu suka membantu, mendukung, atau mengajar orang lain. Peduli dengan perasaan sekitar. Contoh: Membantu teman yang kesulitan, mengajar adik, ikut kegiatan sosial.' },
        { id: 'E', label: 'Si Pemimpin', desc: 'Kamu suka ambil inisiatif, mempengaruhi orang, and mencapai target. Berorientasi pada hasil. Contoh: Mengajak teman proyek bareng, menjual barang online, memimpin rapat.' },
        { id: 'C', label: 'Si Teratur', desc: 'Kamu suka keteraturan, prosedur, dan data yang rapi. Teliti dan sistematis. Contoh: Membuat jadwal harian, menyusun folder laptop, mengikuti checklist.' }
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
      console.log("Fase 2B Selesai. Siap lanjut ke Fase 3.");
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

  const progressPercentage = 10 + (currentStep * 15);

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      <main className="flex-grow py-6 md:py-8 px-4">
        <div className="max-w-[1000px] mx-auto">
          
          <button onClick={handleBack} className="flex items-center gap-2 text-[#6B7280] hover:text-[#1E3A5F] font-bold text-[13px] mb-4 transition-colors">
            <ChevronLeft size={18} /> Kembali
          </button>

          <ProgressBar phase="Fase 2B: Pemetaan Kompetensi" percentage={progressPercentage} />

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

          <div className="mb-6">
            {currentData.isCategorized ? (
              <div className="space-y-5">
                {currentData.categories?.map((cat, idx) => (
                  <div key={idx} className="space-y-2.5">
                    <h3 className="text-[#1E3A5F] text-[13px] md:text-[14px] font-bold uppercase tracking-wider border-l-4 border-[#3B82F6] pl-3">
                      {cat.title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cat.items.map((opt) => (
                        <OptionCard 
                          key={opt.id}
                          label={opt.label}
                          description={opt.desc}
                          isSelected={selectedOptions.includes(opt.id)}
                          onSelect={() => handleSelect(opt.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[960px] mx-auto">
                {currentData.options?.map((opt) => (
                  <OptionCard 
                    key={opt.id}
                    label={opt.label}
                    description={opt.desc}
                    isSelected={selectedOptions.includes(opt.id)}
                    onSelect={() => handleSelect(opt.id)}
                  />
                ))}
              </div>
            )}
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

export default Phase2BPage;