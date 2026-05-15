// ── Evaluation ────────────────────────────────────────────────

export type PaceComfort = 'too_fast' | 'comfortable' | 'too_slow';

export interface SubmitReflectionBody {
  evaluationId:        string;
  paceComfort:         PaceComfort;
  interestShifted:     boolean;
  timeAvailabilityNote?: string;
  freeNotes?:          string;
}

export interface AdjustmentPayload {
  newWeeklyHours?: number;
  materialsToAdd?: { title: string; phase: string; description: string }[];
  newRecommendationId?: string;
}

export interface AIEvaluationResult {
  adjustments: {
    type:        'SCHEDULE_SPEED' | 'REORDER_MATERIAL' | 'ADD_MATERIAL' | 'CHANGE_CAREER';
    description: string;
    payload:     AdjustmentPayload;
  }[];
  summary: string;
}


export interface CreateNotificationParams {
  userId:   string;
  type:     'EVALUATION_REMINDER' | 'ADJUSTMENT_PROPOSAL';
  title:    string;
  body:     string;
  metadata?: Record<string, unknown>;
}