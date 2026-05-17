import axiosInstance from '../api/axiosInstance';
import type {
  StartAssessmentResponse,
  SubmitAnswerBody,
  SubmitAnswerResponse
} from '../types/assessment';

const assessmentService = {
  async startAssessment(): Promise<StartAssessmentResponse> {
    const response = await axiosInstance.post('/assessment/start');
    return response.data.data;
  },

  async submitAnswer(data: SubmitAnswerBody): Promise<SubmitAnswerResponse> {
    const { sessionId, questionKey, answerValue } = data;
    const response = await axiosInstance.post(`/assessment/${sessionId}/answer`, {
      questionKey,
      answerValue
    });
    return response.data.data;
  },

  async completeAssessment(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "Assessment completed automatically" };
  }
};

export default assessmentService;