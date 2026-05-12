export type InputType = 'single_choice' | 'multi_choice' | 'number' | 'time_multi';
 
export interface QuestionOption {
  id:              string;
  label:           string;
  value:           string;
  order:           number;
  nextQuestionKey: string | null;
}
 
export interface QuestionResponse {
  id:        string;
  key:       string;
  text:      string;
  helpText:  string | null;
  inputType: InputType;
  options:   QuestionOption[];
}
 
export interface SubmitAnswerBody {
  questionKey: string;
  answerValue: string | string[]; 
}
 