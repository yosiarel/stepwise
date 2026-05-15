export interface ChatMessage {
  role:    'user' | 'assistant';
  content: string;
}

export interface SendMessageBody {
  message: string;
}

export interface AdvisorContext {
  user: {
    name:     string;
    category: string | null;
  };
  profile: {
    itBackground:       boolean | null;
    itInterests:        string[];
    weeklyHours:        number | null;
    preferredStudyTime: string[];
    extractedSkills:    string[];
  } | null;
  selectedCareer: {
    professionTitle:  string;
    readinessPercent: number;
    ownedSkills:      string[];
    missingSkills:    string[];
  } | null;
  roadmap: {
    status:      string;
    weeklyHours: number;
    progress: {
      completed: number;
      total:     number;
      percent:   number;
    };
    phases: {
      phase:     string;
      completed: number;
      total:     number;
    }[];
  } | null;
  lastEvaluation: {
    paceComfort:     string | null;
    interestShifted: boolean | null;
    freeNotes:       string | null;
    createdAt:       Date;
  } | null;
}