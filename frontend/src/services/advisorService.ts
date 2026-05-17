import axiosInstance from '../api/axiosInstance';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AdvisorProposal {
  type: 'SCHEDULE_SPEED' | 'ADD_MATERIAL' | 'CHANGE_CAREER' | 'REORDER_MATERIAL';
  description: string;
}

export interface ChatResponse {
  reply: string;
  proposal: AdvisorProposal | null;
  history: number;
}

const advisorService = {
  // Ambil histori percakapan lama dari server
  async getHistory(): Promise<ChatMessage[]> {
    const response = await axiosInstance.get('/advisor/history');
    return response.data.data.history;
  },

  // Kirim pesan baru ke AI Advisor
  async sendMessage(message: string): Promise<ChatResponse> {
    const response = await axiosInstance.post('/advisor/chat', { message });
    return response.data.data;
  },

  // Hapus histori obrolan (Mulai Sesi Baru)
  async clearHistory(): Promise<void> {
    await axiosInstance.delete('/advisor/history');
  }
};

export default advisorService;