export interface AdjustmentProposal {
  id: string;
  roadmapId: string;
  evaluationId: string | null;
  triggeredByAdvisor: boolean;
  type: 'SCHEDULE_SPEED' | 'REORDER_MATERIAL' | 'ADD_MATERIAL' | 'CHANGE_CAREER';
  decision: 'PENDING' | 'APPROVED' | 'REJECTED';
  description: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface TriggerEvaluationResponse {
  message: string;
  evaluationId: string;
  isNew: boolean;
  snapshot?: {
    completed: number;
    total: number;
    percent: number;
  };
}

export interface SubmitReflectionBody {
  evaluationId: string;
  paceComfort: 'too_fast' | 'comfortable' | 'too_slow';
  interestShifted: boolean;
  timeAvailabilityNote?: string;
  freeNotes?: string;
}

export interface SubmitReflectionResponse {
  summary: string;
  adjustments: Array<{
    type: string;
    description: string;
    payload: Record<string, unknown>;
  }>;
  hasProposals: boolean;
}

export interface PendingProposalsResponse {
  proposals: AdjustmentProposal[];
}