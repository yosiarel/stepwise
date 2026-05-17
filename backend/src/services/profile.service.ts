import {
  findFullProfile,
  updatePersonal,
  updateStatus,
  createEducation,
  updateEducation,
  deleteEducation,
  findEducationById,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  findWorkExperienceById,
  createSkill,
  deleteSkill,
  findSkillById,
  updatePreferences,
} from '../repositories/profile.repository.js';
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


export const getProfileService = async (userId: string) => {
  const profile = await findFullProfile(userId);
  if (!profile) throw { status: 404, message: 'Profil tidak ditemukan.' };
  return profile;
};


export const updatePersonalService = async (
  userId: string,
  body:   UpdatePersonalBody
) => {
  return updatePersonal(userId, body);
};


export const updateStatusService = async (
  userId: string,
  body:   UpdateStatusBody
) => {
  if (body.currentStatus !== 'BEKERJA') {
    delete body.currentJobTitle;
    delete body.currentJobDesc;
  }
  return updateStatus(userId, body);
};


export const createEducationService = async (
  userId: string,
  body:   CreateEducationBody
) => {
  if (body.status === 'SEDANG_DITEMPUH' && body.yearGraduated) {
    throw { status: 400, message: 'Tahun lulus tidak relevan jika masih ditempuh.' };
  }
  if (body.status === 'LULUS' && body.semester) {
    throw { status: 400, message: 'Semester tidak relevan jika sudah lulus.' };
  }
  return createEducation(userId, body);
};

export const updateEducationService = async (
  userId: string,
  id:     string,
  body:   UpdateEducationBody
) => {
  const existing = await findEducationById(id);
  if (!existing)              throw { status: 404, message: 'Riwayat pendidikan tidak ditemukan.' };
  if (existing.userId !== userId) throw { status: 403, message: 'Akses ditolak.' };
  return updateEducation(id, body);
};

export const deleteEducationService = async (userId: string, id: string) => {
  const existing = await findEducationById(id);
  if (!existing)              throw { status: 404, message: 'Riwayat pendidikan tidak ditemukan.' };
  if (existing.userId !== userId) throw { status: 403, message: 'Akses ditolak.' };
  await deleteEducation(id);
};


export const createWorkExperienceService = async (
  userId: string,
  body:   CreateWorkExperienceBody
) => {
  return createWorkExperience(userId, body);
};

export const updateWorkExperienceService = async (
  userId: string,
  id:     string,
  body:   UpdateWorkExperienceBody
) => {
  const existing = await findWorkExperienceById(id);
  if (!existing)              throw { status: 404, message: 'Riwayat pengalaman tidak ditemukan.' };
  if (existing.userId !== userId) throw { status: 403, message: 'Akses ditolak.' };
  return updateWorkExperience(id, body);
};

export const deleteWorkExperienceService = async (userId: string, id: string) => {
  const existing = await findWorkExperienceById(id);
  if (!existing)              throw { status: 404, message: 'Riwayat pengalaman tidak ditemukan.' };
  if (existing.userId !== userId) throw { status: 403, message: 'Akses ditolak.' };
  await deleteWorkExperience(id);
};

export const createSkillService = async (userId: string, body: CreateSkillBody) => {
  try {
    return await createSkill(userId, body);
  } catch (err: unknown) {
    if (
      typeof err === 'object' && err !== null &&
      'code' in err && (err as { code: string }).code === 'P2002'
    ) {
      throw { status: 409, message: `Keahlian "${body.name}" sudah ada di profilmu.` };
    }
    throw err;
  }
};

export const deleteSkillService = async (userId: string, id: string) => {
  const existing = await findSkillById(id);
  if (!existing)              throw { status: 404, message: 'Keahlian tidak ditemukan.' };
  if (existing.userId !== userId) throw { status: 403, message: 'Akses ditolak.' };
  await deleteSkill(id);
};

export const updatePreferencesService = async (
  userId: string,
  body:   UpdatePreferencesBody
) => {
  return updatePreferences(userId, body);
};