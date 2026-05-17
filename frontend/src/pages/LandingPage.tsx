import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Brain, Target, Map, Bot, BarChart3, 
  CheckCircle2, AlertCircle, ChevronDown, 
  Upload, ClipboardList, Navigation, Activity 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    { icon: <FileText size={32} />, title: "Smart CV Extractor", desc: "Ekstraksi data pendidikan dan keahlian dari CV menggunakan Gemini API untuk profil instan." },
    { icon: <Brain size={32} />, title: "Hybrid Assessment", desc: "Kuesioner adaptif untuk menggali minat, gaya belajar, dan komitmen waktu belajar Anda." },
    { icon: <Target size={32} />, title: "Career Recommendation", desc: "Memberikan 3 rekomendasi profesi IT dengan persentase kesiapan dan justifikasi transparan." },
    { icon: <Map size={32} />, title: "Adaptive Roadmap", desc: "Rencana belajar bertahap yang fleksibel terhadap perubahan jadwal atau target karier Anda." },
    { icon: <Bot size={32} />, title: "AI Career Advisor", desc: "Pusat kendali cerdas yang memahami konteks pengguna dan aktif mengusulkan penyesuaian." },
    { icon: <BarChart3 size={32} />, title: "Progress Tracker", desc: "Pemberitahuan kesiapan kerja secara real-time dan siklus evaluasi belajar berkelanjutan." },
  ];

  const steps = [
    { icon: <Upload size={28} />, title: "1. Unggah CV", desc: "Sistem AI kami akan mengekstrak data keahlian dan pengalaman Anda secara otomatis." },
    { icon: <ClipboardList size={28} />, title: "2. Asesmen Minat", desc: "Ikuti tes singkat untuk menentukan gaya belajar dan kecocokan budaya kerja Anda." },
    { icon: <Navigation size={28} />, title: "3. Dapatkan Roadmap", desc: "Terima rencana belajar personal yang disesuaikan dengan target profesi impian Anda." },
    { icon: <Activity size={28} />, title: "4. Pantau Progres", desc: "Pantau perkembangan harian Anda dan dapatkan tips karier langsung dari AI Advisor." },
  ];

  const faqData = [
    { q: "Apakah StepWise cocok untuk pemula?", a: "Sangat cocok. Kami memiliki jalur khusus bagi mereka yang baru ingin memulai karier di IT tanpa latar belakang teknis sama sekali." },
    { q: "Apakah data saya aman?", a: "Tentu. Kami menggunakan enkripsi standar industri dan tidak akan membagikan data pribadi atau CV Anda kepada pihak ketiga tanpa izin." },
    { q: "Bagaimana AI memberikan rekomendasi?", a: "AI kami menganalisis data pasar kerja terkini dan mencocokkannya dengan hasil asesmen kuesioner serta keahlian yang terdeteksi di CV Anda." }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-[#1F2937] antialiased">
      <Navbar />
      
      <main className="flex-grow">
        <section className="relative bg-gradient-to-br from-[#1E3A5F] to-[#152A44] py-16 md:py-24 lg:py-28 xl:py-36 2xl:py-44 overflow-hidden">
          <div className="w-full max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 transition-all relative z-10 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">
              <div className="text-center md:text-left space-y-6">
                <h1 className="text-[32px] md:text-[44px] lg:text-[48px] xl:text-[56px] 2xl:text-[64px] font-bold leading-tight tracking-tight">
                  Navigasi Karier IT Kamu Dimulai di Sini
                </h1>
                <p className="text-white/80 text-[16px] md:text-[18px] xl:text-[20px] 2xl:text-[22px] max-w-[600px] mx-auto md:mx-0 leading-relaxed">
                  Atasi kebingungan memilih spesialisasi IT. Dapatkan rekomendasi profesi personal, roadmap belajar adaptif, dan pendampingan AI 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                  <Link to="/register" className="h-[52px] px-8 bg-white text-[#1E3A5F] rounded-[8px] flex items-center justify-center font-bold hover:bg-[#F3F4F6] transition-all shadow-lg text-[16px]">
                    Mulai Sekarang Gratis
                  </Link>
                  <button onClick={() => alert("Simulasi memutar video demo interaktif platform StepWise...")} className="h-[52px] px-8 border-2 border-white text-white rounded-[8px] flex items-center justify-center font-bold hover:bg-white/10 transition-all text-[16px] cursor-pointer">
                    Lihat Demo
                  </button>
                </div>
              </div>
              
              <div className="hidden md:block w-full">
                 <div className="bg-white/10 backdrop-blur-md p-4 rounded-[12px] border border-white/20 shadow-2xl overflow-hidden w-full transition-all">
                    <img 
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                      alt="Career Environment" 
                      className="object-cover w-full aspect-[4/3] rounded-[8px]" 
                    />
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28 xl:py-36 bg-white">
          <div className="w-full max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 transition-all">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16 xl:gap-24 justify-between">
              <div className="flex-1 space-y-6">
                <h2 className="text-[#1E3A5F] text-[28px] md:text-[32px] xl:text-[38px] 2xl:text-[44px] font-bold tracking-tight">
                  Tentang StepWise
                </h2>
                <p className="text-[#6B7280] text-[16px] md:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-relaxed">
                  StepWise adalah asisten navigasi karier cerdas yang dirancang untuk membantu talenta digital menemukan jalannya di industri IT yang dinamis. Kami menggabungkan kekuatan AI dengan metodologi asesmen karier yang terbukti.
                </p>
                <p className="text-[#6B7280] text-[16px] md:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-relaxed">
                  Misi kami adalah mendemokratisasi bimbingan karier berkualitas, memastikan setiap individu memiliki peta jalan yang jelas untuk meraih potensi maksimal mereka.
                </p>
              </div>
              
              <div className="flex-1 flex justify-center md:justify-end w-full">
                <div className="w-full max-w-[460px] xl:max-w-[520px] rounded-[20px] overflow-hidden border border-[#E5E7EB] bg-[#EFF4FF] flex items-center justify-center shadow-sm transition-all">
                  <img 
                    src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800" 
                    alt="Ilustrasi Visi Misi Navigasi Karier" 
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="fitur" className="py-20 lg:py-28 xl:py-36 bg-[#EFF4FF]">
          <div className="w-full max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 transition-all text-center">
            <h2 className="text-[#1E3A5F] text-[28px] md:text-[32px] xl:text-[38px] 2xl:text-[44px] font-bold mb-16 tracking-tight">
              Segala yang Kamu Butuhkan untuk Sukses di Dunia IT
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-[12px] shadow-sm border border-transparent hover:border-[#3B82F6] transition-all duration-300 group hover:shadow-md">
                  <div className="bg-[#EFF4FF] w-14 h-14 flex items-center justify-center rounded-full mb-6 text-[#1E3A5F] group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="text-[18px] xl:text-[20px] font-semibold text-[#1F2937] mb-3">{feature.title}</h4>
                  <p className="text-[#6B7280] text-[14px] xl:text-[15px] leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="py-20 bg-white">
          <div className="w-full max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 transition-all text-center">
            <h2 className="text-[#1E3A5F] text-[28px] md:text-[32px] xl:text-[38px] 2xl:text-[44px] font-bold mb-16 tracking-tight">
              Cara Kerja StepWise
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="space-y-4 group">
                  <div className="w-16 h-16 bg-[#1E3A5F] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-transform duration-300 group-hover:scale-105">
                    {step.icon}
                  </div>
                  <h4 className="text-[#1F2937] font-bold text-[18px] xl:text-[20px] pt-1">{step.title}</h4>
                  <p className="text-[#6B7280] text-[14px] xl:text-[15px] leading-relaxed max-w-[240px] mx-auto">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white border-t border-[#E5E7EB]/60">
          <div className="w-full max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 transition-all">
            <h2 className="text-center text-[#1E3A5F] text-[28px] md:text-[32px] xl:text-[38px] 2xl:text-[44px] font-bold mb-16 tracking-tight">
              Mengapa Memilih StepWise?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-[#FEE2E2] p-8 rounded-[12px] border border-[#EF4444]/10 shadow-sm transition-all hover:shadow-md">
                <h3 className="flex items-center gap-2 text-[#EF4444] mb-6 font-bold text-[18px] xl:text-[20px]">
                  <AlertCircle size={24} /> Masalah Umum
                </h3>
                <ul className="space-y-4 text-[#1F2937] font-medium text-[15px] xl:text-[16px]">
                  <li className="flex items-start gap-3">❌ Bingung memilih dari ratusan spesialisasi IT yang ada.</li>
                  <li className="flex items-start gap-3">❌ Roadmap belajar yang terlalu umum dan sulit diikuti pemula.</li>
                  <li className="flex items-start gap-3">❌ Tidak tahu apakah skill saat ini sudah sesuai standar industri.</li>
                </ul>
              </div>
              <div className="bg-[#D1FAE5] p-8 rounded-[12px] border border-[#10B981]/10 shadow-sm transition-all hover:shadow-md">
                <h3 className="flex items-center gap-2 text-[#10B981] mb-6 font-bold text-[18px] xl:text-[20px]">
                  <CheckCircle2 size={24} /> Solusi StepWise
                </h3>
                <ul className="space-y-4 text-[#1F2937] font-medium text-[15px] xl:text-[16px]">
                  <li className="flex items-start gap-3">✅ Rekomendasi personal berdasarkan potensi individu.</li>
                  <li className="flex items-start gap-3">✅ Roadmap adaptif yang mengikuti kecepatan belajar Anda.</li>
                  <li className="flex items-start gap-3">✅ Analisis CV berbasis AI untuk cek kesiapan kerja secara instan.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28 bg-[#1E3A5F]">
          <div className="w-full max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 transition-all text-center text-white space-y-8">
            <h2 className="text-[28px] md:text-[36px] xl:text-[42px] 2xl:text-[48px] font-bold tracking-tight">
              Siap Memulai Karier Impianmu?
            </h2>
            <p className="text-white/80 text-[16px] md:text-[18px] xl:text-[20px] 2xl:text-[22px] max-w-[700px] mx-auto leading-relaxed">
              Ribuan talenta digital telah menemukan jalan mereka bersama StepWise. Jangan biarkan keraguan menghambat masa depanmu.
            </p>
            <div className="pt-4">
              <Link to="/register" className="inline-flex h-[56px] px-10 bg-white text-[#1E3A5F] rounded-[8px] items-center justify-center font-bold text-[18px] hover:bg-[#F3F4F6] transition-all shadow-xl active:scale-95">
                Mulai Sekarang Gratis
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#F9FAFB]">
          <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 transition-all">
            <h2 className="text-center text-[#1E3A5F] text-[28px] md:text-[32px] xl:text-[38px] 2xl:text-[44px] font-bold mb-12 tracking-tight">
              Pertanyaan Umum (FAQ)
            </h2>
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="bg-white rounded-[8px] border border-[#D1D5DB] overflow-hidden shadow-sm transition-all duration-200">
                  <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full px-6 py-5 flex justify-between items-center text-left font-semibold text-[#1E3A5F] hover:bg-[#EFF4FF] transition-colors cursor-pointer">
                    <span className="text-[15px] md:text-[16px] xl:text-[17px] pr-4">{faq.q}</span>
                    <ChevronDown className={`transition-transform duration-300 text-[#6B7280] shrink-0 ${activeFaq === index ? 'rotate-180' : ''}`} size={20} />
                  </button>
                  {activeFaq === index && <div className="px-6 pb-5 text-[#6B7280] text-[14px] xl:text-[15px] leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/20">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;