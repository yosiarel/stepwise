import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-center px-4 font-sans text-[#1F2937]">
      <div className="max-w-md w-full flex flex-col items-center space-y-6 animate-fadeIn">
        
        {/* AREA IKON HERO ERROR STATE */}
        {/* Menggunakan ikon Lucide dengan ukuran besar (hero style) & stroke-width: 2 sesuai DESIGN.md */}
        <div className="w-20 h-20 bg-[#F3F4F6] rounded-full flex items-center justify-center border border-[#D1D5DB] shadow-sm text-[#3B82F6]">
          <FileQuestion size={36} strokeWidth={2} />
        </div>

        {/* AREA TEKS INFORMASI */}
        <div className="space-y-2">
          {/* Kode Status Error */}
          <span className="text-[14px] font-semibold text-[#3B82F6] uppercase tracking-widest block">
            Error Code: 404
          </span>
          {/* Display H1: 28px, Bold (700), leading 36px, text-[#1F2937] */}
          <h1 className="text-[28px] font-bold leading-[36px] text-[#1F2937] tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          {/* Body M: 16px, Regular (400), leading 24px, text-[#6B7280] */}
          <p className="text-[16px] font-normal leading-[24px] text-[#6B7280] max-w-sm mx-auto">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan ke alamat rute lain.
          </p>
        </div>

        {/* BUTTON ACTION UTAMA */}
        {/* Spesifikasi Button Primary Sesuai DESIGN.md: h-[48px], px-6, bg-[#1E3A5F], text-[16px], rounded-[8px] */}
        <button
          onClick={() => navigate('/dashboard')}
          className="h-[48px] px-6 bg-[#1E3A5F] hover:bg-[#152A44] active:bg-[#0F1E33] text-white font-medium text-[16px] rounded-[8px] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer w-full sm:w-auto"
        >
          <ArrowLeft size={16} strokeWidth={2} /> Kembali ke Dashboard
        </button>

        {/* PENAFIAN TRANSPARANSI / FOOTER KECIL */}
        <span className="text-[12px] font-normal text-[#9CA3AF] block pt-4 tracking-wide">
          StepWise © 2026
        </span>

      </div>
    </div>
  );
};

export default NotFoundPage;