import { useState } from 'react';
import { ServerCrash, RefreshCw, Check } from 'lucide-react';

const ServerErrorPage = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // HANDLER LOKAL: Simulasi aksi rekoneksi klik tombol "Coba Lagi"
  const handleRetryConnection = () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);

    // Memicu delay jaringan buatan selama 1 detik untuk memunculkan state loading button
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Mencoba menyambungkan kembali... Sistem sedang menguji ulang respons API.");
      
      // Menghapus toast secara otomatis setelah 4 detik sesuai spesifikasi DESIGN.md
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-center px-4 font-sans text-[#1F2937]">
      <div className="max-w-md w-full flex flex-col items-center space-y-6 animate-fadeIn">
        
        {/* AREA ILUSTRASI UTAMA (HERO ICON STATE) */}
        {/* Menggunakan set ikon Lucide dengan stroke-width: 2 & warna aksen bahaya/kritis #EF4444 */}
        <div className="w-20 h-20 bg-[#FEE2E2] rounded-full flex items-center justify-center border border-[#FECACA] shadow-sm text-[#EF4444]">
          <ServerCrash size={36} strokeWidth={2} />
        </div>

        {/* AREA KONTEN TEKS INFORMASI EROR */}
        <div className="space-y-2">
          {/* Kode Status Error */}
          <span className="text-[14px] font-semibold text-[#EF4444] uppercase tracking-widest block">
            Error Code: 500
          </span>
          {/* Display H1: 28px, Bold (700), leading 36px, text-[#1F2937] */}
          <h1 className="text-[28px] font-bold leading-[36px] text-[#1F2937] tracking-tight">
            Sedang Ada Gangguan
          </h1>
          {/* Body M: 16px, Regular (400), leading 24px, text-[#6B7280] */}
          <p className="text-[16px] font-normal leading-[24px] text-[#6B7280] max-w-sm mx-auto">
            Sistem kami sedang mengalami kendala teknis internal atau gangguan koneksi API server. Harap tunggu beberapa saat.
          </p>
        </div>

        {/* BUTTON ACTION UTAMA */}
        {/* Spesifikasi Button Primary Sesuai DESIGN.md: h-[48px], px-6, bg-[#1E3A5F], text-[16px], rounded-[8px] */}
        <button
          onClick={handleRetryConnection}
          disabled={isRefreshing}
          className="h-[48px] px-6 bg-[#1E3A5F] hover:bg-[#152A44] active:bg-[#0F1E33] disabled:bg-slate-200 text-white disabled:text-slate-400 font-medium text-[16px] rounded-[8px] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer w-full sm:w-auto"
        >
          {isRefreshing ? (
            <Loader2 size={16} strokeWidth={2} className="animate-spin" />
          ) : (
            <RefreshCw size={16} strokeWidth={2} />
          )}
          {isRefreshing ? 'Menghubungkan...' : 'Coba Lagi'}
        </button>

        {/* FOOTER INFORMASI SISTEM */}
        <span className="text-[12px] font-normal text-[#9CA3AF] block pt-4 tracking-wide">
          StepWise Navigation System © 2026
        </span>

      </div>

      {/* TOAST NOTIFICATION MATCH SPECS: BG #1F2937, Pojok Kanan Atas, Otomatis Hilang */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-[#1F2937] text-white px-4 py-3 rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] font-medium text-[14px] leading-[20px] animate-slideInRight z-50 flex items-center gap-2 border border-[#E5E7EB]/10 max-w-[80vw]">
          <Check size={16} strokeWidth={3} className="shrink-0 text-[#10B981]" /> 
          <span className="truncate text-left">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

// Sub-komponen internal Loader2 khusus untuk mematuhi aturan strict unreferenced variables linter
const Loader2 = ({ size, strokeWidth, className }: { size: number; strokeWidth: number; className: string }) => (
  <RefreshCw size={size} strokeWidth={strokeWidth} className={className} />
);

export default ServerErrorPage;