export interface Education {
  institution: string;
  degree: string;
  major: string;
  year: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface CvExtractedData {
  educationHistory: Education[];
  workExperiences: WorkExperience[];
  extractedSkills: string[];
}

export interface ReviewCvBody {
  educationHistory: Education[];
  workExperiences: WorkExperience[];
  extractedSkills: string[];
}
