import type {
  CurrentStatus,
  EducationLevel,
  EducationStatus,
  WorkType,
  SkillCategory,
  SkillLevel,
  TechSavvyLevel,
  LearningStyle,
  WorkEnvPreference,
  CompanyTypePreference,
  WeeklyHoursRange,
  MonthlyIncomeRange,
} from '../generated/prisma/index.js';


export type UpdatePersonalBody = {
  name:      string;
  email:     string;
  birthDate?: string; // ISO string
  phone?:    string;
};


export type UpdateStatusBody = {
  currentStatus:   CurrentStatus;
  statusSince:     string; 
  currentJobTitle?: string;
  currentJobDesc?:  string;
  institutionName?: string;
};



export type CreateEducationBody = {
  level:        EducationLevel;
  major:        string;
  status:       EducationStatus;
  semester?:    number;     
  yearGraduated?: number;   
  institution?: string;
};

export type UpdateEducationBody = Partial<CreateEducationBody>;



export type CreateWorkExperienceBody = {
  workType:    WorkType;
  jobTitle:    string;
  companyName?: string;
  duration:    string;
  description?: string;
};

export type UpdateWorkExperienceBody = Partial<CreateWorkExperienceBody>;


export type CreateSkillBody = {
  name:     string;
  category: SkillCategory;
  level:    SkillLevel;
};



export type UpdatePreferencesBody = {
  techSavvyLevel?:        TechSavvyLevel;
  learningStyle?:         LearningStyle;
  workEnvPreference?:     WorkEnvPreference;
  companyTypePreference?: CompanyTypePreference;
  weeklyHoursRange?:      WeeklyHoursRange;
  weeklyHours?:           number;
  preferredStudyTime?:    string[];
  monthlyIncome?:         MonthlyIncomeRange;
};