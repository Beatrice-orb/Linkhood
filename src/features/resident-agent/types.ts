export type ResidentAgentMessageRole = 'user' | 'assistant';

export interface ResidentAgentMessage {
  id: string;
  role: ResidentAgentMessageRole;
  content: string;
  createdAt: string;
  sourceRefs?: ResidentAgentSourceRef[];
  deliveryMode?: 'model' | 'fallback';
}

export type ResidentAgentAnswerStatus = 'answered' | 'needs_context' | 'safety_redirect';

export interface ResidentAgentSourceRef {
  id: string;
  label: string;
  verifiedAt: string;
  isDemo: true;
}

export interface DepartmentRoute {
  departmentId: string;
  departmentName: string;
  phoneDisplay: string;
  serviceHours: string;
  isDemo: true;
}

export interface ResidentNeedInsightCandidateV1 {
  domain: 'digital_public_service' | 'community_activity' | 'community_service';
  goalTags: string[];
  constraintTags: string[];
  matchedSupplyIds: string[];
  knowledgeCoverage: 'full' | 'partial' | 'none';
  confidence: number;
}

export interface ResidentAgentTurnResult {
  answerText: string;
  status: ResidentAgentAnswerStatus;
  sourceRefs: ResidentAgentSourceRef[];
  route?: DepartmentRoute;
  insightCandidate?: ResidentNeedInsightCandidateV1;
  usedFallback: boolean;
}

export interface ResidentNeedInsightV1 extends ResidentNeedInsightCandidateV1 {
  schemaVersion: '1.0';
  id: string;
  isDemo: true;
  source: 'resident_ai';
  firstSeenAt: string;
  lastSeenAt: string;
  turnCount: number;
  occurrenceCount: number;
  dedupeKey: string;
}

export interface ResidentNeedInsightEnvelopeV1 {
  schemaVersion: '1.0';
  insights: ResidentNeedInsightV1[];
}
