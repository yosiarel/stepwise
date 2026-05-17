import { prisma } from '../lib/prisma.js';
import type {
  UpdatePersonalBody,
  UpdateStatusBody,
  CreateEducationBody,
  UpdateEducationBody,
  CreateWorkExperienceBody,
  UpdateWorkExperienceBody,
  CreateSkillBody,
  UpdatePreferencesBody,
} from '../../types/profile.js';

/**
 * Helper function to remove undefined fields from an object to respect
 * exactOptionalPropertyTypes: true
 */
function cleanUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key as keyof T] = value;
    }
  }
  return clean;
}

export const findFullProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      birthDate: true,
      phone: true,
      category: true,
      profile: true,
      educationHistories: {
        orderBy: { createdAt: 'desc' },
      },
      workExperiences: {
        orderBy: { createdAt: 'desc' },
      },
      skills: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
};

export const updatePersonal = async (userId: string, body: UpdatePersonalBody) => {
  const data: any = {
    name: body.name,
    email: body.email,
  };

  if (body.birthDate !== undefined) {
    data.birthDate = body.birthDate ? new Date(body.birthDate) : null;
  }
  if (body.phone !== undefined) {
    data.phone = body.phone || null;
  }

  return prisma.user.update({
    where: { id: userId },
    data: data as any,
  });
};

export const updateStatus = async (userId: string, body: UpdateStatusBody) => {
  const data: any = {
    currentStatus: body.currentStatus,
    statusSince: body.statusSince ? new Date(body.statusSince) : null,
  };

  if (body.currentJobTitle !== undefined) {
    data.currentJobTitle = body.currentJobTitle || null;
  }
  if (body.currentJobDesc !== undefined) {
    data.currentJobDesc = body.currentJobDesc || null;
  }
  if (body.institutionName !== undefined) {
    data.institutionName = body.institutionName || null;
  }

  return prisma.userProfile.upsert({
    where: { userId },
    create: { userId, ...data } as any,
    update: data as any,
  });
};

export const createEducation = async (userId: string, body: CreateEducationBody) => {
  const data: any = {
    userId,
    level: body.level,
    major: body.major,
    status: body.status,
  };

  if (body.semester !== undefined) data.semester = body.semester || null;
  if (body.yearGraduated !== undefined) data.yearGraduated = body.yearGraduated || null;
  if (body.institution !== undefined) data.institution = body.institution || null;

  return prisma.educationHistory.create({
    data: data as any,
  });
};

export const updateEducation = async (id: string, body: UpdateEducationBody) => {
  const data = cleanUndefined(body);

  return prisma.educationHistory.update({
    where: { id },
    data: data as any,
  });
};

export const deleteEducation = async (id: string) => {
  return prisma.educationHistory.delete({
    where: { id },
  });
};

export const findEducationById = async (id: string) => {
  return prisma.educationHistory.findUnique({
    where: { id },
  });
};

export const createWorkExperience = async (userId: string, body: CreateWorkExperienceBody) => {
  const data: any = {
    userId,
    workType: body.workType,
    jobTitle: body.jobTitle,
    duration: body.duration,
  };

  if (body.companyName !== undefined) data.companyName = body.companyName || null;
  if (body.description !== undefined) data.description = body.description || null;

  return prisma.workExperience.create({
    data: data as any,
  });
};

export const updateWorkExperience = async (id: string, body: UpdateWorkExperienceBody) => {
  const data = cleanUndefined(body);

  return prisma.workExperience.update({
    where: { id },
    data: data as any,
  });
};

export const deleteWorkExperience = async (id: string) => {
  return prisma.workExperience.delete({
    where: { id },
  });
};

export const findWorkExperienceById = async (id: string) => {
  return prisma.workExperience.findUnique({
    where: { id },
  });
};

export const createSkill = async (userId: string, body: CreateSkillBody) => {
  return prisma.userSkill.create({
    data: {
      userId,
      name: body.name,
      category: body.category,
      level: body.level,
    },
  });
};

export const deleteSkill = async (id: string) => {
  return prisma.userSkill.delete({
    where: { id },
  });
};

export const findSkillById = async (id: string) => {
  return prisma.userSkill.findUnique({
    where: { id },
  });
};

export const updatePreferences = async (userId: string, body: UpdatePreferencesBody) => {
  const data = cleanUndefined(body);

  return prisma.userProfile.upsert({
    where: { userId },
    create: { userId, ...data } as any,
    update: data as any,
  });
};