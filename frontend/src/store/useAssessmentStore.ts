import { create } from 'zustand';
import type { AssessmentQuestion } from '../types/assessment';

interface AssessmentState {
  sessionId:       string | null;
  currentQuestion: AssessmentQuestion | null;
  setSessionId:    (id: string) => void;
  setCurrentQuestion: (question: AssessmentQuestion | null) => void;
  resetAssessment: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  sessionId:       null,
  currentQuestion: null,
  setSessionId:    (id) => set({ sessionId: id }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  resetAssessment: () => set({ sessionId: null, currentQuestion: null }),
}));
