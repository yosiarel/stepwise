export type ProfessionOverview = {
  dailyTasks:        string[];
  companyTypes:      string[];
  longTermProspect:  string;
};

export type CareerRecommendationItem = {
  rank:               number;
  professionTitle:    string;
  readinessPercent:   number;
  ownedSkills:        string[];
  missingSkills:      string[];
  reasonSummary:      string;
  professionOverview: ProfessionOverview;
};

export type GeminiRecommendationResponse = {
  recommendations: CareerRecommendationItem[];
};

export type SelectCareerBody = {
  recommendationId: string;
};