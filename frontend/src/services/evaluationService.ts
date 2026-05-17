import axiosInstance from '../api/axiosInstance';
import type {
  TriggerEvaluationResponse,
  SubmitReflectionBody,
  SubmitReflectionResponse,
  PendingProposalsResponse,
  AdjustmentProposal
} from '../types/evaluation';

const evaluationService = {
  async triggerEvaluation(): Promise<TriggerEvaluationResponse> {
    const response = await axiosInstance.post('/evaluation/trigger');
    return response.data;
  },

  async submitReflection(body: SubmitReflectionBody): Promise<SubmitReflectionResponse> {
    const response = await axiosInstance.post('/evaluation/submit', body);
    return response.data.data;
  },

  async getPendingProposals(): Promise<PendingProposalsResponse> {
    const response = await axiosInstance.get('/evaluation/proposals');
    return response.data.data;
  },

  async decideProposal(id: string, decision: 'APPROVED' | 'REJECTED'): Promise<AdjustmentProposal> {
    const response = await axiosInstance.patch(`/evaluation/proposal/${id}/decide`, { decision });
    return response.data.data;
  }
};

export default evaluationService;