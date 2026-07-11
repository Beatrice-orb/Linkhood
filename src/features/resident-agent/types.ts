export type ResidentAgentMessageRole = 'user' | 'assistant';

export interface ResidentAgentMessage {
  id: string;
  role: ResidentAgentMessageRole;
  content: string;
  createdAt: string;
  sourceRefs?: ResidentAgentSourceRef[];
}

export type ResidentAgentAnswerStatus =
  | 'answered'
  | 'partial'
  | 'not_found'
  | 'safety_redirect';

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

export interface AnonymousDemandCandidateV1 {
  domain: 'service' | 'activity';
  topicCode: string;
  summary: string;
  unmetFacet: string;
  contextTags: string[];
  knowledgeCoverage: 'partial' | 'none';
  sourceRefs: string[];
  routeDepartmentId?: string;
  confidence: number;
}

export interface ResidentAgentTurnResult {
  answerText: string;
  status: ResidentAgentAnswerStatus;
  sourceRefs: ResidentAgentSourceRef[];
  route?: DepartmentRoute;
  demandCandidate?: AnonymousDemandCandidateV1;
  usedFallback: boolean;
}

export interface AnonymousDemandSignalV1 {
  schemaVersion: '1.0';
  id: string;
  isDemo: true;
  visibility: 'community_only';
  communityId: 'xihongmen-demo';
  source: 'resident_ai';
  domain: 'service' | 'activity';
  topicCode: string;
  summary: string;
  unmetFacet: string;
  voiceFragments: string[];
  contextTags: string[];
  knowledgeCoverage: 'partial' | 'none';
  sourceRefs: string[];
  routeDepartmentId?: string;
  confidence: number;
  firstSeenAt: string;
  lastSeenAt: string;
  occurrenceCount: number;
  dedupeKey: string;
  recordKind: 'anonymous_demand_signal';
  notACase: true;
  piiScan: 'passed';
}

export interface DemandSignalEnvelopeV1 {
  schemaVersion: '1.0';
  signals: AnonymousDemandSignalV1[];
}
