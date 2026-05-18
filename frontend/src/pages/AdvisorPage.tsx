import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Paperclip, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Bot,
  Menu,
  Loader2
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import advisorService from '../services/advisorService';
import evaluationService from '../services/evaluationService';

interface LocalMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  proposal?: {
    id: string;
    type: 'SCHEDULE_SPEED' | 'ADD_MATERIAL' | 'CHANGE_CAREER' | 'REORDER_MATERIAL';
    description: string;
    status: 'pending' | 'approved' | 'rejected';
  };
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  active: boolean;
}

const AdvisorPage = () => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(window.innerWidth >= 768);
  const [inputText, setInputText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: 'session-current', title: 'Sesi Diskusi Aktif', date: 'Hari ini', active: true }
  ]);

  useEffect(() => {
    const handleResize = () => {
      setIsHistoryExpanded(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const backendHistory = await advisorService.getHistory();
        
        if (backendHistory && backendHistory.length > 0) {
          const mappedMessages: LocalMessage[] = backendHistory.map((msg, index) => ({
            id: `hist-${index}-${Date.now()}`,
            sender: (msg.role === 'user') ? 'user' : 'ai',
            text: msg.content,
            time: 'Tersimpan'
          }));
          setMessages(mappedMessages);
        } else {
          setMessages([
            {
              id: 'init-msg',
              sender: 'ai',
              text: 'Halo! Saya AI Career Advisor Anda. Saya memahami seluruh profil, target karier, dan progres belajar Anda di StepWise. Ada yang bisa saya bantu atau evaluasi hari ini?',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } catch (error) {
        setMessages([
          {
            id: 'init-msg',
            sender: 'ai',
            text: 'Halo! Selamat datang kembali. Berdiskusi denganku mengenai rencana belajar atau perubahan target karier IT kapan saja.',
            time: 'Aktif'
          }
        ]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userRawText = inputText.trim();
    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: LocalMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userRawText,
      time: currentTimeStr
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    try {
      setIsSending(true);
      const responseData = await advisorService.sendMessage(userRawText);
      
      let proposalId = responseData.proposal?.id;
      
      if (responseData.proposal && !proposalId) {
        try {
          const pendingData = await evaluationService.getPendingProposals();
          const proposals = pendingData.proposals || [];
          const matchedProposal = proposals.find(p => 
            p.type === responseData.proposal?.type && 
            p.description === responseData.proposal?.description && 
            p.decision === 'PENDING'
          );
          if (matchedProposal) {
            proposalId = matchedProposal.id;
          } else {
            const latestAdvisorProposal = [...proposals].reverse().find(p => p.triggeredByAdvisor && p.decision === 'PENDING');
            if (latestAdvisorProposal) proposalId = latestAdvisorProposal.id;
          }
        } catch (err) {
        }
      }
      
      const aiMessage: LocalMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseData.reply,
        time: currentTimeStr,
        proposal: responseData.proposal ? {
          id: proposalId || 'unknown',
          type: responseData.proposal.type,
          description: responseData.proposal.description,
          status: 'pending'
        } : undefined
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'Maaf, koneksi menuju pusat kecerdasan AI terputus. Harap periksa jaringan internet atau server backend Anda.',
          time: 'Error'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectHistory = (id: string) => {
    setSessions(prev => prev.map(item => ({ ...item, active: item.id === id })));
    if (window.innerWidth < 768) {
      setIsHistoryExpanded(false); 
    }
  };

  const handleNewChat = async () => {
    try {
      setIsSending(true);
      await advisorService.clearHistory();
      
      setSessions(prev => [
        { id: `session-${Date.now()}`, title: 'Sesi Diskusi Baru', date: 'Baru saja', active: true },
        ...prev.map(item => ({ ...item, active: false }))
      ]);

      setMessages([
        {
          id: `init-${Date.now()}`,
          sender: 'ai',
          text: 'Sesi percakapan baru telah berhasil dimulai. Silakan utarakan kendala belajar, target baru, atau minta evaluasi kesiapan kerja pada saya!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (window.innerWidth < 768) {
        setIsHistoryExpanded(false); 
      }
    } catch (error) {
      alert('Gagal memulai sesi baru. Pastikan koneksi server backend berjalan normal.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestionAction = async (messageId: string, action: 'approve' | 'reject', proposalId?: string, description?: string) => {
    if (!proposalId) {
      alert('ID proposal tidak valid atau tidak terdeteksi oleh sistem.');
      return;
    }

    try {
      const decisionParam = action === 'approve' ? 'APPROVED' : 'REJECTED';
      
      await advisorService.respondToProposal(proposalId, decisionParam);

      setMessages(prevMessages => prevMessages.map(msg => {
        if (msg.id === messageId && msg.proposal) {
          return { ...msg, proposal: { ...msg.proposal, status: action === 'approve' ? 'approved' : 'rejected' } };
        }
        return msg;
      }));

      if (action === 'approve' && description) {
        setToastMessage(`Sukses menyetujui perubahan: ${description}`);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setToastMessage("Usulan perubahan kurikulum berhasil ditolak.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Gagal mengirimkan keputusan ke server. Silakan coba kembali.');
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full flex bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-140px)] md:h-[calc(100vh-210px)] xl:h-[calc(100vh-240px)] 2xl:h-[calc(100vh-290px)] min-h-[550px] relative transition-all">
        
        {isHistoryExpanded && (
          <div 
            className="md:hidden absolute inset-0 bg-slate-900/40 z-30 backdrop-blur-sm"
            onClick={() => setIsHistoryExpanded(false)}
          />
        )}

        <aside className={`bg-slate-50 border-r border-slate-200/60 flex flex-col justify-between transition-transform duration-300 absolute md:relative z-40 h-full shrink-0 ${
          isHistoryExpanded ? 'translate-x-0 w-[260px] xl:w-[280px]' : '-translate-x-full md:translate-x-0 md:w-[60px]'
        }`}>
          <div className="p-3 xl:p-4 flex flex-col gap-3 xl:gap-4 overflow-y-auto flex-grow overflow-x-hidden">
            
            <button 
              onClick={handleNewChat}
              disabled={isSending || isLoadingHistory}
              className="h-[38px] xl:h-[42px] bg-white border border-slate-200 hover:border-[#3B82F6] text-[#1E3A5F] hover:text-[#3B82F6] disabled:opacity-50 font-bold text-[12.5px] xl:text-[13px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 w-full cursor-pointer"
            >
              <Plus size={16} />
              {isHistoryExpanded && <span className="truncate">Mulai Chat Baru</span>}
            </button>

            {isHistoryExpanded && (
              <span className="text-slate-400 text-[10.5px] xl:text-[11px] font-extrabold uppercase tracking-widest block mt-1 xl:mt-2 whitespace-nowrap px-1">
                Riwayat Sesi
              </span>
            )}

            <div className="flex flex-col gap-1 w-full">
              {sessions.map((chat) => (
                <button
                  key={chat.id}
                  disabled={isLoadingHistory}
                  onClick={() => handleSelectHistory(chat.id)}
                  className={`w-full p-2.5 xl:p-3 rounded-xl flex flex-col gap-1 text-left transition-all overflow-hidden cursor-pointer ${
                    chat.active ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'text-slate-600 hover:bg-slate-100/70'
                  } ${!isHistoryExpanded && 'items-center justify-center'}`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <MessageSquare size={15} className="shrink-0 xl:w-4 xl:h-4" />
                    {isHistoryExpanded && (
                      <span className="text-[12.5px] xl:text-[13px] font-bold truncate flex-grow animate-fadeIn">
                        {chat.title}
                      </span>
                    )}
                  </div>
                  {isHistoryExpanded && (
                    <span className={`text-[10.5px] xl:text-[11px] pl-6 block font-medium truncate ${chat.active ? 'text-[#3B82F6]/70' : 'text-slate-400'}`}>
                      {chat.date}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="hidden md:flex w-full h-10 xl:h-11 border-t border-slate-200/60 items-center justify-center text-slate-400 hover:text-[#1E3A5F] hover:bg-slate-100/50 transition-colors bg-slate-50 shrink-0 cursor-pointer"
          >
            {isHistoryExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </aside>

        <section className="flex-grow flex flex-col justify-between bg-white min-w-0 relative h-full">
          
          <div className="px-4 md:px-5 xl:px-6 py-2.5 xl:py-4 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsHistoryExpanded(true)}
                className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg cursor-pointer"
              >
                <Menu size={18} />
              </button>

              <div className="w-8 h-8 md:w-9 md:h-9 xl:w-10 xl:h-10 bg-[#1E3A5F] text-white rounded-xl flex items-center justify-center shadow-sm shadow-[#1E3A5F]/10 shrink-0">
                <Bot size={18} className="text-white xl:w-[22px] xl:h-[22px]" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[#1E3A5F] text-[14px] md:text-[15px] xl:text-[16px] font-black tracking-tight truncate">AI Career Advisor</h2>
                  <span className="flex items-center gap-1.5 text-[10px] xl:text-[11px] font-bold text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span> Online
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] xl:text-[12px] font-medium mt-0.5 truncate">
                  Asisten karier cerdas yang siap membantumu.
                </p>
              </div>
            </div>
          </div>

          <div ref={chatContainerRef} className="flex-grow p-4 xl:p-6 overflow-y-auto space-y-4 md:space-y-5 xl:space-y-6 bg-slate-50/40">
            {isLoadingHistory ? (
              <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={24} className="animate-spin text-[#1E3A5F]" />
                <span className="text-[12px] font-bold">Membuka lembar riwayat lama...</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'} w-full animate-fadeIn`}>
                    <div className={`flex gap-2.5 md:gap-3 max-w-[85%] md:max-w-[75%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                      
                      {isAi && (
                        <div className="w-6 h-6 md:w-7 md:h-7 bg-[#1E3A5F] text-white rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-[10px] md:text-[12px] font-bold shadow-sm">
                          AI
                        </div>
                      )}
                      
                      <div className="space-y-1 min-w-0">
                        <div className={`px-3.5 py-3 xl:p-4 rounded-2xl shadow-sm text-[13px] md:text-[13.5px] xl:text-[14.5px] leading-relaxed break-words ${
                          isAi ? 'bg-white border border-slate-200/80 text-slate-700 rounded-tl-none font-medium' : 'bg-[#1E3A5F] text-white rounded-tr-none font-medium'
                        }`}>
                          {msg.text}
                        </div>

                        {isAi && msg.proposal && (
                          <div className="mt-2 md:mt-3 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/80 p-3.5 xl:p-4 rounded-2xl space-y-2.5 md:space-y-3 shadow-sm max-w-[500px]">
                            <div className="flex gap-2 text-[#1E3A5F]">
                              <Sparkles size={16} className="shrink-0 mt-0.5 text-[#3B82F6]" />
                              <p className="text-[12.5px] md:text-[13px] xl:text-[13.5px] font-bold leading-normal text-slate-700">
                                {msg.proposal.description}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              {msg.proposal.status === 'pending' ? (
                                <>
                                  <button 
                                    onClick={() => handleSuggestionAction(msg.id, 'approve', msg.proposal?.id, msg.proposal?.description)}
                                    className="h-7 md:h-8 px-3.5 md:px-4 bg-[#1E3A5F] hover:bg-[#152A44] text-white text-[11px] md:text-[11.5px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm shadow-[#1E3A5F]/10 shrink-0 cursor-pointer"
                                  >
                                    <Check size={13} strokeWidth={3} /> Setujui Perubahan
                                  </button>
                                  <button 
                                    onClick={() => handleSuggestionAction(msg.id, 'reject', msg.proposal?.id)}
                                    className="h-7 md:h-8 px-3.5 md:px-4 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-500 border border-slate-200 hover:border-rose-200 text-[11px] md:text-[11.5px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                                  >
                                    <X size={13} strokeWidth={3} /> Usulan Ditolak
                                  </button>
                                </>
                              ) : (
                                <div className={`text-[11px] md:text-[12px] font-extrabold uppercase tracking-wider px-2.5 md:px-3 py-1 rounded-md border shrink-0 ${
                                  msg.proposal.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-[#10B981]' : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                                }`}>
                                  {msg.proposal.status === 'approved' ? '✓ Disetujui' : '✕ Ditolak'}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <span className={`text-[9.5px] md:text-[10px] font-bold text-slate-400 block pt-0.5 ${isAi ? 'text-left pl-1' : 'text-right pr-1'}`}>
                          {msg.time}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })
            )}

            {isSending && (
              <div className="flex justify-start w-full animate-fadeIn">
                <div className="flex gap-2.5 md:gap-3 max-w-[75%] flex-row">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-[#1E3A5F] text-white rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-[10px] md:text-[12px] font-bold shadow-sm">
                    AI
                  </div>
                  <div className="bg-white border border-slate-200/80 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-[13px] font-semibold flex items-center gap-2 shadow-sm">
                    <Loader2 size={14} className="animate-spin text-[#1E3A5F]" />
                    <span>AI Advisor sedang menganalisis kurikulum Anda...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 xl:p-4 border-t border-slate-200/80 bg-white shrink-0">
            <form onSubmit={handleSendMessage} className="w-full flex items-center gap-1.5 md:gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 xl:px-3 h-[42px] xl:h-[48px] focus-within:border-[#3B82F6] focus-within:bg-white transition-all shadow-inner">
              <button 
                type="button" 
                onClick={() => alert("Mengunggah lampiran berkas pendukung kurikulum...")}
                className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg text-slate-400 hover:text-[#1E3A5F] hover:bg-slate-200/50 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <Paperclip size={16} className="xl:w-[18px] xl:h-[18px]" />
              </button>
              
              <input 
                type="text" 
                value={inputText}
                disabled={isSending || isLoadingHistory}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isSending ? "Menunggu tanggapan AI..." : "Tanya sesuatu tentang karier atau roadmap IT-mu..."}
                className="flex-grow bg-transparent outline-none border-none text-slate-700 text-[13px] md:text-[13.5px] xl:text-[14.5px] px-1 font-medium placeholder-slate-400"
              />
              
              <button 
                type="submit"
                disabled={!inputText.trim() || isSending || isLoadingHistory}
                className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-[#1E3A5F] hover:bg-[#152A44] disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition-colors shrink-0 shadow-sm cursor-pointer"
              >
                <Send size={14} className="xl:w-[15px] xl:h-[15px] ml-0.5" />
              </button>
            </form>
            <span className="text-[10px] xl:text-[11px] text-slate-400 font-medium block text-center mt-1.5 xl:mt-2 tracking-wide truncate px-2">
              AI dapat membuat kesalahan. Harap verifikasi informasi penting.
            </span>
          </div>

          {toastMessage && (
            <div className="absolute top-16 md:top-20 right-4 md:right-6 bg-emerald-600 text-white px-4 md:px-5 py-2.5 md:py-3 rounded-xl shadow-xl font-bold text-[12px] md:text-[13px] tracking-wide animate-slideInRight z-50 flex items-center gap-2 border border-emerald-500 max-w-[80vw]">
              <Check size={16} strokeWidth={3} className="shrink-0" /> 
              <span className="truncate">{toastMessage}</span>
            </div>
          )}

        </section>
      </div>
    </DashboardLayout>
  );
};

export default AdvisorPage;