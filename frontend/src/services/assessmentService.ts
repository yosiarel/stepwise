import axiosInstance from '../api/axiosInstance';

const assessmentService = {
  // Backend menggunakan POST /api/assessment/start
  async startAssessment(): Promise<any> {
    const response = await axiosInstance.post('/assessment/start');
    // Backend membungkus datanya di response.data.data
    return response.data.data;
  },

  // Backend menggunakan POST /api/assessment/:sessionId/answer
  async submitAnswer(data: { sessionId: string; questionKey: string; answerValue: string | string[] }): Promise<any> {
    const { sessionId, questionKey, answerValue } = data;
    const response = await axiosInstance.post(`/assessment/${sessionId}/answer`, {
      questionKey,
      answerValue
    });
    // Backend membungkus datanya di response.data.data
    return response.data.data;
  },

  // Catatan: Tidak ada endpoint /assessment/complete karena otomatis diselesaikan 
  // di backend pada pertanyaan terakhir (nextQuestionKey: null). 
  // Method ini dipertahankan untuk backward compatibility jika diperlukan.
  async completeAssessment(_sessionId: string): Promise<any> {
    return { success: true, message: "Assessment completed automatically" };
  }
};

export default assessmentService;
