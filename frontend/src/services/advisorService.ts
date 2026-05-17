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
  async getHistory(): Promise<AdvisorMessage[]> {
    const response = await axiosInstance.get('/advisor/history');
    return response.data.data;
  },

  async sendMessage(message: string): Promise<AdvisorResponse> {
    const response = await axiosInstance.post('/advisor/chat', { message });
    return response.data.data;
  },

  async clearHistory(): Promise<void> {
    await axiosInstance.delete('/advisor/history');
  },

  async respondToProposal(proposalId: string, decision: 'APPROVED' | 'REJECTED'): Promise<void> {
    await axiosInstance.post(`/advisor/proposal/${proposalId}/decision`, { decision });
  }
};

export default advisorService;