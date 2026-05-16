import axiosInstance from '../api/axiosInstance';
import type { Recommendation, RecommendationResponse } from '../types/career';

const careerService = {
  async getRecommendations(): Promise<RecommendationResponse> {
    const response = await axiosInstance.get('/recommendation');
    return response.data.data;
  },

  async selectCareer(recommendationId: string): Promise<void> {
    await axiosInstance.post('/recommendation/select', { recommendationId });
  },

  async getSelectedCareer(): Promise<Recommendation> {
    const response = await axiosInstance.get('/recommendation/selected');
    return response.data.data;
  }
};

export default careerService;
