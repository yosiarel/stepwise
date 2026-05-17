export interface RoadmapMaterial {
  id: string;
  order: number;
  phase: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface RoadmapProgress {
  completed: number;
  total: number;
  percent: number;
}

export interface RoadmapResponse {
  roadmapId: string;
  professionTitle: string;
  status: 'ACTIVE' | 'COMPLETED' | 'REPLACED';
  weeklyHours: number;
  progress: RoadmapProgress;
  materials: RoadmapMaterial[];
}
