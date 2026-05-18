import type { Request, Response, NextFunction } from 'express';
import {
  getProfileService,
  updatePersonalService,
  updateStatusService,
  createEducationService,
  updateEducationService,
  deleteEducationService,
  createWorkExperienceService,
  updateWorkExperienceService,
  deleteWorkExperienceService,
  createSkillService,
  deleteSkillService,
  updatePreferencesService,
} from '../services/profile.service.js';

const userId = (req: Request) => req.user!.sub;

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getProfileService(userId(req));
    res.status(200).json({ data });
  } catch (err) { next(err); }
};

export const updatePersonal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await updatePersonalService(userId(req), req.body);
    res.status(200).json({ message: 'Data diri berhasil diperbarui.', data });
  } catch (err) { next(err); }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await updateStatusService(userId(req), req.body);
    res.status(200).json({ message: 'Status berhasil diperbarui.', data });
  } catch (err) { next(err); }
};

export const createEducation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await createEducationService(userId(req), req.body);
    res.status(201).json({ message: 'Riwayat pendidikan berhasil ditambahkan.', data });
  } catch (err) { next(err); }
};

export const updateEducation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await updateEducationService(userId(req), req.params['id'] as string, req.body);
    res.status(200).json({ message: 'Riwayat pendidikan berhasil diperbarui.', data });
  } catch (err) { next(err); }
};

export const deleteEducation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteEducationService(userId(req), req.params['id'] as string);
    res.status(200).json({ message: 'Riwayat pendidikan berhasil dihapus.' });
  } catch (err) { next(err); }
};

export const createWorkExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await createWorkExperienceService(userId(req), req.body);
    res.status(201).json({ message: 'Riwayat pengalaman kerja berhasil ditambahkan.', data });
  } catch (err) { next(err); }
};

export const updateWorkExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await updateWorkExperienceService(userId(req), req.params['id'] as string, req.body);
    res.status(200).json({ message: 'Riwayat pengalaman kerja berhasil diperbarui.', data });
  } catch (err) { next(err); }
};

export const deleteWorkExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteWorkExperienceService(userId(req), req.params['id'] as string);
    res.status(200).json({ message: 'Riwayat pengalaman kerja berhasil dihapus.' });
  } catch (err) { next(err); }
};

export const createSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await createSkillService(userId(req), req.body);
    res.status(201).json({ message: 'Keahlian berhasil ditambahkan.', data });
  } catch (err) { next(err); }
};

export const deleteSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteSkillService(userId(req), req.params['id'] as string);
    res.status(200).json({ message: 'Keahlian berhasil dihapus.' });
  } catch (err) { next(err); }
};

export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await updatePreferencesService(userId(req), req.body);
    res.status(200).json({ message: 'Preferensi berhasil diperbarui.', data });
  } catch (err) { next(err); }
};