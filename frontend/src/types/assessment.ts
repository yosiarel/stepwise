export interface AssessmentOption {
  id:              string;
  label:           string;
  value:           string;
  nextQuestionKey: string | null;
}

export interface AssessmentQuestion {
  id:            string;
  key:           string;
  text:          string;
  helpText:      string | null;
  inputType:     'single_choice' | 'multi_choice';
  maxSelections: number | null;
  options:       AssessmentOption[];
}

export interface AssessmentSession {
  id:     string;
  status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface StartAssessmentResponse {
  session:  AssessmentSession;
  question: AssessmentQuestion;
}

export interface SubmitAnswerBody {
  sessionId:   string;
  questionKey: string;
  answerValue: string | string[]; // string[] untuk multi_choice
}

export interface SubmitAnswerResponse {
  nextQuestion: AssessmentQuestion | null; // null jika sudah selesai
}
