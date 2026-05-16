import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UploadCVPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle pilihan file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Drag & Drop Logic
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
    }
  };

  return (
    /* PERBAIKAN: Menggunakan bg-[#F8F9FF] untuk latar belakang halaman */
    <div className="min-h-screen bg-[#F8F9FF] font-sans flex flex-col antialiased">
      <Navbar minimal />

      <main className="flex-grow flex items-center justify-center py-[64px] px-4">
        {/* Card tetap bg-white agar kontras dengan latar belakang F8F9FF */}
        <div className="w-full max-w-[720px] bg-white rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-10 md:p-12">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-[#1E3A5F] text-[28px] font-bold leading-tight">Langkah Pertama: Unggah CV Kamu</h1>
            <p className="text-[#6B7280] text-[16px] mt-3">
              Biarkan AI kami menganalisis latar belakang pendidikan dan pengalamanmu untuk memberikan rekomendasi yang paling akurat.
            </p>
          </div>

          {/* Upload Area / Drop Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-[12px] p-12 flex flex-col items-center justify-center transition-all ${
              isDragging ? 'border-[#3B82F6] bg-[#3B82F6]/5' : 'border-[#D1D5DB] bg-[#F9FAFB]'
            }`}
          >
            <div className="w-16 h-16 bg-[#EFF4FF] text-[#3B82F6] rounded-full flex items-center justify-center mb-6">
              <Upload size={32} />
            </div>

            <div className="text-center space-y-2 mb-8">
              <p className="text-[18px] font-semibold text-[#1F2937]">
                {selectedFile ? selectedFile.name : 'Seret & Lepas file CV kamu di sini atau klik untuk mencari'}
              </p>
              <p className="text-[14px] text-[#6B7280]">Format yang didukung: PDF (Maks. 5MB)</p>
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
              className="px-6 h-[44px] border border-[#D1D5DB] bg-white rounded-[8px] text-[#1E3A5F] font-bold hover:bg-[#F3F4F6] transition-all shadow-sm"
            >
              {selectedFile ? 'Ganti File' : 'Pilih File'}
            </button>
          </div>

          {/* Info & Manual Action */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <button 
              type="button"
              onClick={() => navigate('/verify-data')}
              className="text-[#1E3A5F] font-bold hover:underline text-[14px]"
            >
              Belum punya CV? Isi data manual di sini
            </button>

            <div className="flex items-center gap-2 text-[#6B7280] text-[12px]">
              <AlertCircle size={14} />
              <span>Privasi Anda terjaga sepenuhnya.</span>
            </div>
          </div>

          <hr className="my-8 border-[#E5E7EB]" />

          {/* Action Button */}
          <div className="flex justify-end">
            <button 
              disabled={!selectedFile}
              onClick={() => navigate('/verify-data')}
              className={`h-[48px] px-10 rounded-[8px] font-bold text-[16px] transition-all ${
                selectedFile 
                ? 'bg-[#1E3A5F] text-white hover:bg-[#152A44] shadow-md' 
                : 'bg-[#D1D5DB] text-white cursor-not-allowed'
              }`}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadCVPage;