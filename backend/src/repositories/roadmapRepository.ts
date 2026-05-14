import { prisma } from '../lib/prisma.js';

export const findActiveRoadmap = async (userId: string) => {
  return prisma.roadmap.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: {
      materials:      { orderBy: { order: 'asc' } },
      recommendation: true,
    },
  });
};

export const deactivateActiveRoadmaps = async (userId: string) => {
  const actives = await prisma.roadmap.findMany({
    where: { userId, status: 'ACTIVE' },
    select: { id: true },
  });

  for (const r of actives) {
    await prisma.roadmap.update({
      where: { id: r.id },
      data:  { status: 'REPLACED', activeForUserId: null },
    });
  }
};

export const createRoadmapWithMaterials = async (
  userId:           string,
  recommendationId: string,
  weeklyHours:      number,
  materials: Array<{
    order:        number;
    phase:        string;
    title:        string;
    description?: string | null;
    scheduledAt?: Date | null;
  }>
) => {
  return prisma.roadmap.create({
    data: {
      userId,
      recommendationId,
      weeklyHoursAtCreation: weeklyHours,
      activeForUserId:       userId,
      materials: { create: materials },
    },
    include: {
      materials: { orderBy: { order: 'asc' } },
    },
  });
};

export const findMaterialById = async (materialId: string) => {
  return prisma.roadmapMaterial.findUnique({
    where:   { id: materialId },
    include: { roadmap: true },
  });
};

export const markMaterialComplete = async (materialId: string) => {
  return prisma.roadmapMaterial.update({
    where: { id: materialId },
    data:  { isCompleted: true, completedAt: new Date() },
  });
};

export const getRoadmapProgressSummary = async (userId: string) => {
  const roadmap = await prisma.roadmap.findFirst({
    where:   { userId, status: 'ACTIVE' },
    include: { materials: true },
  });

  if (!roadmap) return null;

  const total     = roadmap.materials.length;
  const completed = roadmap.materials.filter(m => m.isCompleted).length;
  const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { roadmapId: roadmap.id, total, completed, percent };
};
