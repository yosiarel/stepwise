export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
 
export type SkillEntry = {
  skillName:        string;
  currentLevel:     SkillLevel | null;
  targetLevel:      SkillLevel;
};
 
export type ProfessionOverview = {
  dailyTasks:       string[];
  companyTypes:     string[];
  longTermProspect: string;
};
 
export type CareerRecommendationItem = {
  rank:               number;
  professionTitle:    string;
  readinessPercent:   number;
  skills:             SkillEntry[];
  reasonSummary:      string;
  professionOverview: ProfessionOverview;
};
 
export type GeminiRecommendationResponse = {
  recommendations: CareerRecommendationItem[];
};
 
export type SelectCareerBody = {
  recommendationId: string;
};