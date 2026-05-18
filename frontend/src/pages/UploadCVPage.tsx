import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import cvService from '../services/cvService';

const UploadCVPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'extracting' | 'error'>('uploading');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMsg('');
    }
  };

  const handleUploadAndExtract = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMsg('');
    setUploadStatus('uploading');

    try {
      const uploadRes = await cvService.uploadCv(selectedFile);
      const cvId = uploadRes.id;

      setUploadStatus('extracting');
      const extractRes = await cvService.extractCv(cvId);

      navigate('/verify-data', { 
        state: { 
          cvId, 
          extractedInfo: extractRes.extractedData 
        } 
      });

    } catch (err) {
      setUploadStatus('error');
      const axiosError = err as { response?: { data?: { message?: string } } };
      setErrorMsg(axiosError.response?.data?.message || 'Gagal memproses CV Anda. Pastikan CV merupakan file PDF berbasis teks (bukan hasil scan/gambar) dan coba lagi.');
    }
  };

  const handleManualEntry = async () => {
    setIsUploading(true);
    setErrorMsg('');
    setUploadStatus('uploading');

    try {
      const dummyBlob = new Blob(["StepWise Manual User Profile Entry"], { type: "application/pdf" });
      const dummyFile = new File([dummyBlob], "profil_manual.pdf", { type: "application/pdf" });

      const uploadRes = await cvService.uploadCv(dummyFile);
      const cvId = uploadRes.id;
      
      navigate('/verify-data', { 
        state: { 
          cvId, 
          extractedInfo: null 
        } 
      });
    } catch (err) {
      navigate('/verify-data');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      <main className="flex-grow flex items-center justify-center py-12 px-4 relative transition-all">
        
        <div className="w-full max-w-[720px] bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-10 md:p-12 border border-slate-100 animate-fadeIn">
          
          <div className="text-center mb-10">
            <span className="inline-flex items-center px-3.5 py-1 bg-[#EFF6FF] text-[#3B82F6] text-[11px] font-extrabold rounded-full border border-[#DBEAFE] uppercase tracking-widest mb-3">
              Langkah Pertama
            </span>
            <h1 className="text-[#1E3A5F] text-[28px] md:text-[32px] font-black leading-tight tracking-tight">Unggah CV Terbaik Kamu</h1>
            <p className="text-[#6B7280] text-[14px] md:text-[15px] mt-3 font-medium leading-relaxed max-w-[550px] mx-auto">
              Biarkan asisten AI kami menganalisis riwayat pendidikan dan pengalamanmu untuk merekomendasikan bidang IT yang paling akurat.
            </p>
          </div>

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center transition-all ${
              isDragging ? 'border-[#3B82F6] bg-[#3B82F6]/5 scale-[0.99]' : 'border-slate-200 bg-slate-50/50 hover:border-[#3B82F6]/50'
            }`}
          >
            <div className="w-16 h-16 bg-[#EFF6FF] text-[#3B82F6] rounded-2xl flex items-center justify-center mb-6 shadow-sm shadow-[#3B82F6]/10">
              <Upload size={28} />
            </div>

            <div className="text-center space-y-2 mb-8 max-w-[480px]">
              <p className="text-[16px] md:text-[18px] font-extrabold text-[#1E3A5F] tracking-tight">
                {selectedFile ? selectedFile.name : 'Seret & Lepas file CV Anda di sini'}
              </p>
              <p className="text-[13px] text-slate-400 font-bold">Format berkas didukung: PDF saja (Maks. 5MB)</p>
            </div>

            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden" 
            />
            
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 h-[44px] border border-slate-200 bg-white rounded-xl text-[#1E3A5F] font-bold text-[13px] hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              {selectedFile ? 'Ganti File CV' : 'Pilih Berkas PDF'}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-red-800 text-[13.5px] font-bold">Gagal memproses dokumen</h4>
                <p className="text-red-600 text-[12.5px] font-medium mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={handleManualEntry}
              className="text-[#1E3A5F] hover:text-[#3B82F6] font-extrabold hover:underline text-[13.5px] transition-colors cursor-pointer"
            >
              Belum punya CV? Isi data profil manual di sini ➔
            </button>

            <div className="flex items-center gap-1.5 text-[#6B7280] text-[12px] font-medium">
              <AlertCircle size={14} className="text-slate-400" />
              <span>Kerahasiaan data terjamin sepenuhnya.</span>
            </div>
          </div>

          <hr className="my-8 border-slate-100" />

          <div className="flex justify-end">
            <button 
              disabled={!selectedFile || isUploading}
              onClick={handleUploadAndExtract}
              className={`h-[50px] px-8 rounded-xl font-bold text-[15px] transition-all flex items-center gap-2 cursor-pointer ${
                selectedFile 
                ? 'bg-[#1E3A5F] text-white hover:bg-[#152A44] shadow-lg shadow-[#1E3A5F]/10 active:scale-95' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border-none'
              }`}
            >
              <span>Lanjutkan ke Analisis</span> <ArrowRight size={16} />
            </button>
          </div>

        </div>

        {isUploading && uploadStatus !== 'error' && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-[24px] max-w-[420px] w-full p-8 md:p-10 text-center shadow-2xl border border-white flex flex-col items-center">
              
              <div className="relative w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-6 shadow-md shadow-[#3B82F6]/5">
                <Loader2 className="animate-spin text-[#3B82F6]" size={28} />
              </div>
              
              <h3 className="text-[#1E3A5F] text-[18px] md:text-[20px] font-black leading-tight tracking-tight mb-2">
                {uploadStatus === 'uploading' ? 'Mengunggah CV Anda...' : 'Menganalisis dengan AI...'}
              </h3>
              
              <p className="text-[#6B7280] text-[13px] md:text-[14px] leading-relaxed font-medium mb-6">
                {uploadStatus === 'uploading' 
                  ? 'Sedang mengirimkan file PDF Anda secara aman ke server StepWise.' 
                  : 'AI kami sedang membaca dan mengekstrak keahlian serta riwayat karier Anda secara presisi.'}
              </p>

              <div className="w-full space-y-2.5">
                <div className="h-[6px] rounded-full bg-slate-100 overflow-hidden relative">
                  <div className={`h-full bg-gradient-to-r from-[#3B82F6] to-[#1E3A5F] rounded-full transition-all duration-[3000ms] ${
                    uploadStatus === 'extracting' ? 'w-full' : 'w-1/2'
                  }`}></div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default UploadCVPage;