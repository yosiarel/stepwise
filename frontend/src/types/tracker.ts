export interface TrackerProgress {
  completed: number;
  total: number;
  percent: number;
}

export interface TrackerStreak {
  currentStreak: number;
  longestStreak: number;
}

export interface TrackerProjection {
  averagePerDay: number;
  estimatedDaysLeft: number | null;
  projectedFinishDate: string | null;
  onTrackStatus: 'AHEAD' | 'ON_TRACK' | 'BEHIND' | 'NO_DATA';
}

export interface TrackerSummaryResponse {
  roadmapId: string;
  professionTitle: string;
  overallProgress: TrackerProgress;
  streak: TrackerStreak;
  projection: TrackerProjection;
}

export interface ActivityDay {
  date: string;
  count: number;
}

export interface TrackerActivityResponse {
  period: number;
  activity: ActivityDay[];
}

export interface PhaseBreakdown {
  phase: string;
  completed: number;
  total: number;
  status: 'Selesai' | 'Berjalan' | 'Belum Dimulai';
}

export interface TrackerPhasesResponse {
  phases: PhaseBreakdown[];
}