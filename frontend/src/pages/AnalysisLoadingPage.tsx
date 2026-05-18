import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/useAssessmentStore';

const AnalysisLoadingPage = () => {
  const navigate = useNavigate();
  const { sessionId, resetAssessment } = useAssessmentStore();
  const hasCompleted = useRef(false);

  useEffect(() => {
    const processAnalysis = async () => {
      if (!sessionId || hasCompleted.current) return;
      hasCompleted.current = true;

      try {
        setTimeout(() => {
          resetAssessment();
          navigate('/assessment/results');
        }, 2000);
      } catch (error) {
        alert('Terjadi kesalahan saat menganalisis profil Anda. Silakan coba lagi dari Dashboard.');
        navigate('/dashboard');
      }
    };

    processAnalysis();
  }, [sessionId, navigate, resetAssessment]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#EBF2FF] to-[#F3F7FF] flex flex-col items-center justify-center p-4 antialiased">

      <div className="flex items-center gap-2 mb-6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1E3A5F]">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
          <path d="M8 11H10M14 11H16M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="font-sans font-extrabold text-[18px] text-[#1E3A5F] tracking-wide">StepWise</span>
      </div>

      <div className="bg-white w-full max-w-[440px] rounded-[24px] shadow-xl shadow-blue-900/5 p-8 md:p-10 flex flex-col items-center border border-white">

        <div className="relative w-[84px] h-[84px] rounded-full border-[3.5px] border-[#1E3A5F] flex items-center justify-center mb-6">
          <div className="absolute inset-[-3.5px] rounded-full border-[3.5px] border-t-transparent border-r-transparent border-b-transparent border-l-[#3B82F6] animate-spin"></div>

          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#1E3A5F]">
            <path d="M12 14C14.2091 14 16 12.2091 16 10C16 7.79086 14.2091 6 12 6C9.79086 6 8 7.79086 8 10C8 12.2091 9.79086 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M6 20C6 17 9 16 12 16C15 16 18 17 18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 10C19 10.5 18.5 11 18 11C17.5 11 17 10.5 17 10C17 9.5 17.5 9 18 9C18.5 9 19 9.5 19 10Z" fill="currentColor" />
          </svg>
        </div>

        <div className="text-center space-y-3 mb-10 max-w-[340px]">
          <h3 className="text-[#1E3A5F] text-[20px] md:text-[22px] font-bold leading-tight tracking-tight">
            Sedang menganalisis profilmu...
          </h3>
          <p className="text-[#6B7280] text-[13px] md:text-[14px] leading-relaxed font-medium">
            AI Advisor kami sedang meracik rekomendasi karier dan roadmap yang paling pas untukmu.
          </p>
        </div>

        <div className="w-full space-y-3 px-2">
          <div className="h-[14px] bg-[#F3F4F6] rounded-full w-full animate-pulse"></div>
          <div className="h-[14px] bg-[#F3F4F6] rounded-full w-[85%] animate-pulse"></div>
          <div className="h-[14px] bg-[#F3F4F6] rounded-full w-[60%] animate-pulse"></div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisLoadingPage;