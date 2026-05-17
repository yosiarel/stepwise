import axiosInstance from '../api/axiosInstance';
import type { RoadmapResponse } from '../types/roadmap';

const roadmapService = {
  async getActiveRoadmap(): Promise<RoadmapResponse> {
    const response = await axiosInstance.get('/roadmap');
    return response.data.data;
  },

  async generateRoadmap(): Promise<RoadmapResponse> {
    const response = await axiosInstance.post('/roadmap/generate');
    return response.data.data;
  },

  async completeMaterial(materialId: string): Promise<any> {
    const response = await axiosInstance.patch(`/roadmap/material/${materialId}/complete`);
    return response.data.data;
  }
};

export default roadmapService;
