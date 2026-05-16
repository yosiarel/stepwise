export interface Skill {
  skillName:    string;
  currentLevel: string | null;
  targetLevel:  string;
}

export interface Recommendation {
  id:               string;
  rank:             number;
  professionTitle:  string;
  readinessPercent: number;
  skills:           Skill[];
  reasonSummary:    string;
  isSelected:       boolean;
  professionOverview: {
    dailyTasks:       string[];
    companyTypes:     string[];
    longTermProspect: string;
  };
}

export interface RecommendationResponse {
  isNew:           boolean;
  sessionId:       string;
  recommendations: Recommendation[];
  disclaimer:      string;
}
