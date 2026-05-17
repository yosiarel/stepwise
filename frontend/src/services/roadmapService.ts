import axiosInstance from '../api/axiosInstance';
import type { RoadmapResponse, RoadmapMaterial } from '../types/roadmap'; //

const roadmapService = {
  async getActiveRoadmap(): Promise<RoadmapResponse> {
    const response = await axiosInstance.get('/roadmap');
    return response.data.data;
  },

  async generateRoadmap(): Promise<RoadmapResponse> {
    const response = await axiosInstance.post('/roadmap/generate');
    return response.data.data;
  },

  // PERBAIKAN UTAMA: Mengganti Promise<any> menjadi Promise<RoadmapMaterial> agar lolos validasi strict linting
  async completeMaterial(materialId: string): Promise<RoadmapMaterial> {
    const response = await axiosInstance.patch(`/roadmap/material/${materialId}/complete`);
    return response.data.data;
  }
};

export default roadmapService;