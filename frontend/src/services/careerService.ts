import axiosInstance from '../api/axiosInstance';
import type { Recommendation, RecommendationResponse } from '../types/career';

// Helper function to map backend skill schema to frontend skill schema
const mapSkills = (skills: any[]) => {
  if (!Array.isArray(skills)) return [];
  return skills.map((s: any) => ({
    skillName: s.skillName || s.nama_skill || 'Unknown Skill',
    currentLevel: s.currentLevel !== undefined ? s.currentLevel : (s.level_saat_ini || null),
    targetLevel: s.targetLevel !== undefined ? s.targetLevel : (s.level_target || 'Intermediate'),
  }));
};

const careerService = {
  async getRecommendations(): Promise<RecommendationResponse> {
    const response = await axiosInstance.get('/recommendation');
    const data = response.data.data;
    if (data && Array.isArray(data.recommendations)) {
      data.recommendations = data.recommendations.map((rec: any) => ({
        ...rec,
        skills: mapSkills(rec.skills)
      }));
    }
    return data;
  },

  async selectCareer(recommendationId: string): Promise<void> {
    await axiosInstance.post('/recommendation/select', { recommendationId });
  },

  async getSelectedCareer(): Promise<Recommendation> {
    const response = await axiosInstance.get('/recommendation/selected');
    const rec = response.data.data;
    if (rec) {
      rec.skills = mapSkills(rec.skills);
    }
    return rec;
  }
};

export default careerService;
