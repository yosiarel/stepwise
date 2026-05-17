import axiosInstance from '../api/axiosInstance';

export interface AdvisorMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export interface AdvisorProposal {
  id: string;
  type: 'SCHEDULE_SPEED' | 'ADD_MATERIAL' | 'CHANGE_CAREER' | 'REORDER_MATERIAL';
  description: string;
}

export interface AdvisorResponse {
  reply: string;
  proposal?: AdvisorProposal;
}

const advisorService = {
  // Mengambil seluruh riwayat obrolan lama pengguna dengan AI Advisor
  async getHistory(): Promise<AdvisorMessage[]> {
    const response = await axiosInstance.get('/advisor/history');
    return response.data.data;
  },

  // Mengirim pesan obrolan baru dan menerima respons cerdas beserta proposal (opsional)
  async sendMessage(message: string): Promise<AdvisorResponse> {
    const response = await axiosInstance.post('/advisor/message', { message });
    return response.data.data;
  },

  // Menghapus riwayat obrolan untuk memulai lembaran diskusi baru
  async clearHistory(): Promise<void> {
    await axiosInstance.delete('/advisor/history');
  },

  // Mengirim keputusan pengguna (Setuju/Tolak) atas usulan adaptif dari AI Advisor
  async respondToProposal(proposalId: string, decision: 'APPROVED' | 'REJECTED'): Promise<void> {
    await axiosInstance.post(`/advisor/proposal/${proposalId}/decision`, { decision });
  }
};

export default advisorService;