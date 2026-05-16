import { getActiveRoadmapWithMaterials } from '../repositories/tracker.repository.js';
import type { 
  TrackerMaterial, 
  ActivityDay, 
  PhaseBreakdown, 
  Streak, 
  Projection 
} from '../../types/tracker.js';

const toDateStr = (d: Date): string => d.toISOString().split('T')[0]!;

const calculateStreak = (materials: TrackerMaterial[]): Streak => {
  const completed = materials.filter(m => m.completedAt);
  if (!completed.length) return { currentStreak: 0, longestStreak: 0 };

  const dateSet = new Set(completed.map(m => toDateStr(m.completedAt!)));
  const sortedDates = Array.from(dateSet).sort().reverse(); 

  const today     = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86_400_000));
  let currentStreak = 0;
  if (dateSet.has(today) || dateSet.has(yesterday)) {
    const startDay = dateSet.has(today) ? today : yesterday;
    let cursor     = new Date(startDay);

    while (dateSet.has(toDateStr(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates.reverse()) {
    const curr = new Date(dateStr);
    if (prevDate) {
      const diff = (curr.getTime() - prevDate.getTime()) / 86_400_000;
      runningStreak = diff === 1 ? runningStreak + 1 : 1;
    } else {
      runningStreak = 1;
    }
    longestStreak = Math.max(longestStreak, runningStreak);
    prevDate      = curr;
  }

  return { currentStreak, longestStreak };
};

const buildActivityData = (materials: TrackerMaterial[], days: number): ActivityDay[] => {
  const completed = materials.filter(m => m.completedAt);
  const countMap  = new Map<string, number>();

  for (const m of completed) {
    const key = toDateStr(m.completedAt!);
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  const result: ActivityDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d    = new Date(Date.now() - i * 86_400_000);
    const key  = toDateStr(d);
    result.push({ date: key, count: countMap.get(key) ?? 0 });
  }

  return result;
};

const buildPhaseBreakdown = (materials: TrackerMaterial[]): PhaseBreakdown[] => {
  const phaseOrder = ['Fondasi', 'Inti', 'Lanjutan'];
  const map        = new Map<string, { completed: number; total: number }>();

  for (const m of materials) {
    const entry = map.get(m.phase) ?? { completed: 0, total: 0 };
    entry.total++;
    if (m.isCompleted) entry.completed++;
    map.set(m.phase, entry);
  }
  const allPhases = [
    ...phaseOrder,
    ...Array.from(map.keys()).filter(p => !phaseOrder.includes(p)),
  ];

  return allPhases
    .filter(p => map.has(p))
    .map(phase => {
      const { completed, total } = map.get(phase)!;
      const status: PhaseBreakdown['status'] =
        completed === total   ? 'Selesai'        :
        completed > 0         ? 'Berjalan'       :
                                'Belum Dimulai';
      return { phase, completed, total, status };
    });
};

const calculateProjection = (materials: TrackerMaterial[]): Projection => {
  const completed = materials.filter(m => m.completedAt);
  const remaining = materials.filter(m => !m.isCompleted);

  if (!completed.length) {
    return {
      averagePerDay:       0,
      estimatedDaysLeft:   null,
      projectedFinishDate: null,
      onTrackStatus:       'NO_DATA',
    };
  }

  const firstDone    = new Date(Math.min(...completed.map(m => m.completedAt!.getTime())));
  const daysSinceStart = Math.max(1, Math.ceil((Date.now() - firstDone.getTime()) / 86_400_000));
  const averagePerDay  = parseFloat((completed.length / daysSinceStart).toFixed(2));
  let estimatedDaysLeft:   number | null = null;
  let projectedFinishDate: string | null = null;

  if (averagePerDay > 0 && remaining.length > 0) {
    estimatedDaysLeft   = Math.ceil(remaining.length / averagePerDay);
    const finishDate    = new Date(Date.now() + estimatedDaysLeft * 86_400_000);
    projectedFinishDate = toDateStr(finishDate);
  } else if (remaining.length === 0) {
    estimatedDaysLeft   = 0;
    projectedFinishDate = toDateStr(new Date());
  }

  const nextTrackerMaterial = materials.find(m => !m.isCompleted && m.scheduledAt);
  let onTrackStatus: Projection['onTrackStatus'] = 'ON_TRACK';

  if (!nextTrackerMaterial?.scheduledAt) {
    onTrackStatus = 'NO_DATA';
  } else {
    const today      = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduled  = new Date(nextTrackerMaterial.scheduledAt);
    scheduled.setHours(0, 0, 0, 0);
    const diffDays   = Math.ceil((scheduled.getTime() - today.getTime()) / 86_400_000);

    onTrackStatus = diffDays > 2 ? 'AHEAD' : diffDays >= 0 ? 'ON_TRACK' : 'BEHIND';
  }

  return { averagePerDay, estimatedDaysLeft, projectedFinishDate, onTrackStatus };
};


const getTrackerData = async (userId: string) => {
  const roadmap = await getActiveRoadmapWithMaterials(userId);

  if (!roadmap) {
    throw { status: 404, message: 'Belum ada roadmap aktif. Generate roadmap terlebih dahulu.' };
  }

  return roadmap;
};

export const getTrackerSummaryService = async (userId: string) => {
  const roadmap = await getTrackerData(userId);
  const materials = roadmap.materials;

  const total     = materials.length;
  const completed = materials.filter(m => m.isCompleted).length;
  const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    roadmapId:       roadmap.id,
    professionTitle: roadmap.recommendation.professionTitle,
    overallProgress: { completed, total, percent },
    streak:          calculateStreak(materials),
    projection:      calculateProjection(materials),
  };
};

export const getTrackerActivityService = async (userId: string, days: number) => {
  const roadmap = await getTrackerData(userId);

  return {
    period:   days,
    activity: buildActivityData(roadmap.materials, days),
  };
};

export const getTrackerPhasesService = async (userId: string) => {
  const roadmap = await getTrackerData(userId);

  return {
    phases: buildPhaseBreakdown(roadmap.materials),
  };
};
