export type TrackerMaterial = {
  id:          string;
  phase:       string;
  title:       string;
  isCompleted: boolean;
  completedAt: Date | null;
  scheduledAt: Date | null;
  order:       number;
};

export type ActivityDay = {
  date:  string;
  count: number;
};

export type PhaseBreakdown = {
  phase:     string;
  completed: number;
  total:     number;
  status:    'Selesai' | 'Berjalan' | 'Belum Dimulai';
};

export type Streak = {
  currentStreak: number;
  longestStreak: number;
};

export type Projection = {
  averagePerDay:       number;
  estimatedDaysLeft:   number | null;
  projectedFinishDate: string | null;
  onTrackStatus:       'AHEAD' | 'ON_TRACK' | 'BEHIND' | 'NO_DATA';
};
