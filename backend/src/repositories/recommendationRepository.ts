import { prisma } from '../lib/prisma.js';
import type { CareerRecommendationItem } from '../../types/recommendation.js';

export const findActiveSession = async (userId: string) => {
  return prisma.recommendationSession.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: {
      recommendations: {    
        orderBy: { rank: 'asc' },
      },
    },
  });
};

export const archiveActiveSessions = async (userId: string) => {
  return prisma.recommendationSession.updateMany({
    where: { userId, status: 'ACTIVE' },
    data:  { status: 'ARCHIVED' },
  });
};


export const createRecommendationSession = async (
  userId: string,
  items:  CareerRecommendationItem[]
) => {
  return prisma.recommendationSession.create({
    data: {
      userId,
      recommendations: {
        create: items.map(item => ({
          rank:               item.rank,
          professionTitle:    item.professionTitle,
          readinessPercent:   item.readinessPercent,
          ownedSkills:        item.ownedSkills,
          missingSkills:      item.missingSkills,
          reasonSummary:      item.reasonSummary,
          professionOverview: item.professionOverview,
        })),
      },
    },
    include: {
      recommendations: { orderBy: { rank: 'asc' } },
    },
  });
};

export const findRecommendationById = async (id: string) => {
  return prisma.careerRecommendation.findUnique({ where: { id } });
};

export const selectCareerTarget = async (
  sessionId:        string,
  recommendationId: string
) => {
  await prisma.careerRecommendation.updateMany({
    where: { sessionId },
    data:  { isSelected: false },
  });

  return prisma.careerRecommendation.update({
    where: { id: recommendationId },
    data:  { isSelected: true },
  });
};

export const findSelectedRecommendation = async (userId: string) => {
  return prisma.careerRecommendation.findFirst({
    where: {
      isSelected: true,
      session: { userId, status: 'ACTIVE' },
    },
    include: { session: true },
  });
};