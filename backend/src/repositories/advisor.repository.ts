import { prisma } from '../lib/prisma.js';
import type { AdvisorContext } from '../../types/advisor.js';

export const buildAdvisorContext = async (userId: string): Promise<AdvisorContext> => {
  const [user, selectedCareer, activeRoadmap, lastEvaluation] = await Promise.all([
    prisma.user.findUnique({
      where:   { id: userId },
      include: {
        profile: true,
        skills: true,
      },
    }),

    prisma.careerRecommendation.findFirst({
      where: {
        isSelected: true,
        session:    { userId, status: 'ACTIVE' },
      },
      select: {
        professionTitle:  true,
        readinessPercent: true,
        skills:           true,
      },
    }),

    prisma.roadmap.findFirst({
      where:   { userId, status: 'ACTIVE' },
      include: {
        materials: {
          orderBy: { order: 'asc' },
          select:  { phase: true, isCompleted: true },
        },
      },
    }),

    prisma.periodicEvaluation.findFirst({
      where:   { userId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      select: {
        paceComfort:     true,
        interestShifted: true,
        freeNotes:       true,
        createdAt:       true,
      },
    }),
  ]);

  let roadmapCtx: AdvisorContext['roadmap'] = null;
  if (activeRoadmap) {
    const total     = activeRoadmap.materials.length;
    const completed = activeRoadmap.materials.filter(m => m.isCompleted).length;

    const phaseMap = new Map<string, { completed: number; total: number }>();
    for (const m of activeRoadmap.materials) {
      const entry = phaseMap.get(m.phase) ?? { completed: 0, total: 0 };
      entry.total++;
      if (m.isCompleted) entry.completed++;
      phaseMap.set(m.phase, entry);
    }

    roadmapCtx = {
      status:      activeRoadmap.status,
      weeklyHours: activeRoadmap.weeklyHoursAtCreation,
      progress: {
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      phases: Array.from(phaseMap.entries()).map(([phase, data]) => ({
        phase,
        completed: data.completed,
        total:     data.total,
      })),
    };
  }

  const extractedSkills = user?.skills && user.skills.length > 0
    ? user.skills.map(s => s.name)
    : (user?.profile?.extractedSkills || []);

  return {
    user: {
      name:     user?.name ?? 'Pengguna',
      category: user?.category ?? null,
    },
    profile: user?.profile
      ? {
          itBackground:       user.profile.itBackground,
          itInterests:        user.profile.itInterests,
          weeklyHours:        user.profile.weeklyHours,
          preferredStudyTime: user.profile.preferredStudyTime,
          extractedSkills,
        }
      : null,
    selectedCareer: selectedCareer ?? null,
    roadmap:        roadmapCtx,
    lastEvaluation: lastEvaluation ?? null,
  };
};