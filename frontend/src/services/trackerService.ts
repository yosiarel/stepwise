import axiosInstance from '../api/axiosInstance';
import type { 
  TrackerSummaryResponse, 
  TrackerActivityResponse, 
  TrackerPhasesResponse 
} from '../types/tracker';

const trackerService = {
  async getSummary(): Promise<TrackerSummaryResponse> {
    const response = await axiosInstance.get('/tracker/summary');
    return response.data.data;
  },

  async getActivity(days: number = 7): Promise<TrackerActivityResponse> {
    const response = await axiosInstance.get(`/tracker/activity?days=${days}`);
    return response.data.data;
  },

  async getPhases(): Promise<TrackerPhasesResponse> {
    const response = await axiosInstance.get('/tracker/phases');
    return response.data.data;
  }
};

export default trackerService;