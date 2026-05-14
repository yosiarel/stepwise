import { prisma } from '../lib/prisma.js';

export const getActiveRoadmapWithMaterials = async (userId: string) => {
  return prisma.roadmap.findFirst({
    where:   { userId, status: 'ACTIVE' },
    include: {
      recommendation: { select: { professionTitle: true } },
      materials: {
        orderBy: { order: 'asc' },
        select: {
          id:          true,
          phase:       true,
          title:       true,
          isCompleted: true,
          completedAt: true,
          scheduledAt: true,
          order:       true,
        },
      },
    },
  });
};
