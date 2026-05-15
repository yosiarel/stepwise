import { prisma } from '../lib/prisma.js';
import type { CreateNotificationParams } from '../../types/evaluation.js';

export const getEvaluationIntervalDays = (weeklyHours: number): number => {
  if (weeklyHours < 5)  return 30;
  if (weeklyHours < 10) return 21;
  if (weeklyHours < 20) return 14;
  return 7;
};

export const findDueEvaluations = async () => {
  const roadmaps = await prisma.roadmap.findMany({
    where: { status: 'ACTIVE' },
    include: {
      user: {
        include: { profile: true },
      },
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const due = roadmaps.filter(roadmap => {
    const weeklyHours    = roadmap.user.profile?.weeklyHours ?? 10;
    const intervalDays   = getEvaluationIntervalDays(weeklyHours);
    const lastEvaluation = roadmap.evaluations[0];

    const referenceDate  = lastEvaluation?.createdAt ?? roadmap.createdAt;
    const nextDueDate    = new Date(referenceDate);
    nextDueDate.setDate(nextDueDate.getDate() + intervalDays);

    return new Date() >= nextDueDate;
  });

  return due;
};

export const findPendingEvaluation = async (userId: string, roadmapId: string) => {
  return prisma.periodicEvaluation.findFirst({
    where: { userId, roadmapId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });
};

export const createPendingEvaluation = async (
  userId:    string,
  roadmapId: string,
  snapshot: {
    completedMaterials:    number;
    totalMaterials:        number;
    readinessPercentAtEval: number;
  }
) => {
  return prisma.periodicEvaluation.create({
    data: {
      userId,
      roadmapId,
      status:                 'PENDING',
      completedMaterials:     snapshot.completedMaterials,
      totalMaterials:         snapshot.totalMaterials,
      readinessPercentAtEval: snapshot.readinessPercentAtEval,
    },
  });
};

export const completeEvaluation = async (
  evaluationId: string,
  reflection: {
    paceComfort:          string;
    interestShifted:      boolean;
    timeAvailabilityNote?: string | undefined;
    freeNotes?:           string | undefined;
  }
) => {
  return prisma.periodicEvaluation.update({
    where: { id: evaluationId },
    data: {
      status:              'COMPLETED',
      paceComfort:         reflection.paceComfort,
      interestShifted:     reflection.interestShifted,
      timeAvailabilityNote: reflection.timeAvailabilityNote ?? null,
      freeNotes:           reflection.freeNotes ?? null,
      updatedAt:           new Date(),
    },
  });
};

export const findEvaluationWithContext = async (evaluationId: string) => {
  return prisma.periodicEvaluation.findUnique({
    where: { id: evaluationId },
    include: {
      roadmap: {
        include: {
          materials:      { orderBy: { order: 'asc' } },
          recommendation: true,
        },
      },
      user: {
        include: { profile: true },
      },
    },
  });
};

export const createAdjustmentProposals = async (
  userId:      string,
  roadmapId:   string,
  evaluationId: string,
  proposals: {
    type:        string;
    description: string;
    payload:     object;
  }[]
) => {
  return prisma.adjustmentProposal.createMany({
    data: proposals.map(p => ({
      userId,
      roadmapId,
      evaluationId,
      triggeredByAdvisor: false,
      type:               p.type as never,
      decision:           'PENDING',
      description:        p.description,
      payload:            p.payload as any,
    })),
  });
};

export const findPendingProposals = async (userId: string) => {
  return prisma.adjustmentProposal.findMany({
    where:   { userId, decision: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: { roadmap: { select: { id: true } } },
  });
};

export const decideProposal = async (
  proposalId: string,
  decision:   'APPROVED' | 'REJECTED'
) => {
  return prisma.adjustmentProposal.update({
    where: { id: proposalId },
    data:  { decision, decidedAt: new Date() },
  });
};

export const createNotification = async (params: CreateNotificationParams) => {
  return prisma.notification.create({
    data: {
      userId:   params.userId,
      type:     params.type,
      title:    params.title,
      body:     params.body,
      metadata: (params.metadata ?? {}) as any,
    },
  });
};

export const findUserNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
    take:    50,
  });
};

export const markNotificationRead = async (notificationId: string) => {
  return prisma.notification.update({
    where: { id: notificationId },
    data:  { status: 'READ', readAt: new Date() },
  });
};