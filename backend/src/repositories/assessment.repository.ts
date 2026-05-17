import { prisma } from '../lib/prisma.js';
import type { LearningStyle, WorkEnvPreference } from '../../generated/prisma/index.js';

export const findQuestionByKey = async (key: string) => {
  return prisma.assessmentQuestion.findUnique({
    where: { key, isActive: true },
    select: {
      id: true,
      key: true,
      text: true,
      helpText: true,
      inputType: true,
      options: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          label: true,
          value: true,
          order: true,
          nextQuestionKey: true,
        },
      },
    },
  });
};

export const findInProgressSession = async (userId: string) => {
  return prisma.assessmentSession.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
    include: {
      answers: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { question: true },
      },
    },
  });
};

export const findOptionByQuestionAndValue = async (questionId: string, value: string) => {
  return prisma.assessmentOption.findFirst({
    where: {
      questionId,
      value,
    },
  });
};

export const createSession = async (userId: string) => {
  return prisma.assessmentSession.create({ data: { userId } });
};

export const findSessionById = async (sessionId: string) => {
  return prisma.assessmentSession.findUnique({ where: { id: sessionId } });
};

export const findQuestionByKeyWithAllOptions = async (key: string) => {
  return prisma.assessmentQuestion.findUnique({
    where: { key },
    include: { options: true },
  });
};

export const upsertAnswer = async (
  sessionId: string,
  questionId: string,
  questionKey: string,
  answerValue: string
) => {
  return prisma.assessmentAnswer.upsert({
    where: {
      sessionId_questionId: { sessionId, questionId },
    },
    create: {
      sessionId,
      questionId,
      questionKey,
      answerValue,
    },
    update: { answerValue },
  });
};

export const findSessionWithAnswersAndQuestions = async (sessionId: string) => {
  return prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: {
        include: { question: true },
      },
    },
  });
};

export const upsertUserProfileData = async (
  userId: string,
  data: {
    itInterests:        string[];
    learningStyle?:     LearningStyle | null;
    workEnvPreference?: WorkEnvPreference | null;
    weeklyHours:        number | null;
    itBackground:       boolean | null;
    preferredStudyTime?: string[];
  }
) => {
  // Filter out undefined values to satisfy exactOptionalPropertyTypes: true
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  ) as any;

  return prisma.userProfile.upsert({
    where: { userId },
    create: { userId, ...cleanData },
    update: cleanData,
  });
};

export const updateSessionStatus = async (sessionId: string, status: any) => {
  return prisma.assessmentSession.update({
    where: { id: sessionId },
    data: { status },
  });
};

export const findSessionWithAnswersAndQuestionSummary = async (sessionId: string) => {
  return prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: {
        orderBy: { createdAt: 'asc' },
        include: {
          question: {
            select: { key: true, text: true, inputType: true },
          },
        },
      },
    },
  });
};
