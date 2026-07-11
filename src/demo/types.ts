export type IntakePhase = 'source' | 'review' | 'published';

export type MissingFieldKey = 'fee' | 'capacity' | 'stationHours';

export type ResidentActionType =
  | 'service_card_viewed'
  | 'service_source_opened'
  | 'service_interest_expressed';

export interface PublicServiceCard {
  schemaVersion: '0.1';
  id: string;
  dataKind: 'real_public_source';
  workflowMode: 'demo' | 'mvp';
  communityId: 'xihongmen' | 'daxing';
  geoScope: 'xihongmen_local' | 'daxing_district' | 'daxing_district_multi_site';
  title: string;
  shortTitle: string;
  serviceType: 'healthcare' | 'education' | 'employment';
  provider: string;
  audience: string[];
  eligibility: string | null;
  schedule: {
    eventStart: string;
    eventEnd: string;
  };
  location: string;
  fee: string;
  capacity: number | null;
  registrationMethod: string;
  source: {
    id: string;
    label: string;
    url: string;
    publishedAt: string;
  };
  availability: {
    status: 'registration_open' | 'needs_confirmation';
    basis: string;
    verifiedAt: string;
  };
  missingFields: string[];
  confidence: 'high' | 'medium';
  review: {
    status: 'ai_draft' | 'needs_review' | 'verified';
    reviewedBy?: string;
    reviewedAt?: string;
    confirmedUnknownFields: string[];
  };
  publication: {
    status: 'draft' | 'published';
    publishedAt?: string;
  };
  demoUse: 'primary_story' | 'secondary_card';
}

export interface ResidentActionEvent {
  schemaVersion: '0.1';
  id: string;
  type: ResidentActionType;
  serviceId: string;
  communityId: 'xihongmen';
  occurredAt: string;
  anonymousActorId: string;
  context: {
    action: 'view_card' | 'view_source' | 'express_interest';
  };
  isDemo: true;
}

export interface DemoState {
  schemaVersion: 2;
  intakePhase: IntakePhase;
  confirmedUnknownFields: MissingFieldKey[];
  coreFieldsConfirmed: boolean;
  reviewedAt?: string;
  publishedAt?: string;
  residentEvents: ResidentActionEvent[];
  visitStatus: 'draft' | 'submitted';
  visitDraft: {
    facts: string;
    quote: string;
  };
  activityChecklist: Record<'qrCode' | 'venue' | 'speaker', boolean>;
  noticeSent: boolean;
}
