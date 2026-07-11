import type {
  ResidentNeedInsightCandidateV1,
  ResidentNeedInsightEnvelopeV1,
  ResidentNeedInsightV1,
} from './types';

export const INSIGHT_STORAGE_KEY = 'dabashou:resident-need-insights:v1';

const DOMAINS = new Set(['digital_public_service', 'community_activity', 'community_service']);
const GOAL_TAGS = new Set([
  'independent_life_tasks',
  'medical_registration_guidance',
  'utility_payment_navigation',
  'local_social_connection',
  'needs_clarification',
]);
const CONSTRAINT_TAGS = new Set([
  'slow_paced_guidance',
  'nearby_service',
  'weekend_morning',
  'companion_preferred',
  'privacy_conscious',
  'low_commitment',
  'solo_attendance',
  'no_public_introduction',
  'sunday_late_afternoon',
  'facilitated_entry',
]);
const SUPPLY_IDS = new Set([
  'digital-helpdesk-weekday',
  'safe-phone-saturday',
  'community-center-access',
  'digital-service-privacy-policy',
  'neighbour-exchange-table',
]);
const COVERAGE = new Set(['full', 'partial', 'none']);

const EMPTY_ENVELOPE: ResidentNeedInsightEnvelopeV1 = {
  schemaVersion: '1.0',
  insights: [],
};

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `insight-${crypto.randomUUID()}`;
  }
  return `insight-${Date.now()}`;
}

function allowlistedStrings(value: unknown, allowed: Set<string>, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && allowed.has(item)))].slice(0, limit);
}

function sanitizeCandidate(value: unknown): ResidentNeedInsightCandidateV1 | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<ResidentNeedInsightCandidateV1>;
  if (!DOMAINS.has(String(candidate.domain)) || !COVERAGE.has(String(candidate.knowledgeCoverage))) {
    return null;
  }
  const confidence = Number(candidate.confidence);
  if (!Number.isFinite(confidence)) return null;
  return {
    domain: candidate.domain as ResidentNeedInsightCandidateV1['domain'],
    goalTags: allowlistedStrings(candidate.goalTags, GOAL_TAGS, 6),
    constraintTags: allowlistedStrings(candidate.constraintTags, CONSTRAINT_TAGS, 8),
    matchedSupplyIds: allowlistedStrings(candidate.matchedSupplyIds, SUPPLY_IDS, 5),
    knowledgeCoverage: candidate.knowledgeCoverage as ResidentNeedInsightCandidateV1['knowledgeCoverage'],
    confidence: Math.min(1, Math.max(0, confidence)),
  };
}

function dedupeKeyFor(candidate: ResidentNeedInsightCandidateV1): string {
  return `${candidate.domain}:${[...candidate.goalTags].sort().join(',')}`;
}

function positiveInteger(value: unknown, fallback: number, maximum: number): number {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? Math.min(number, maximum) : fallback;
}

function safeTimestamp(value: unknown): string {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) return new Date(0).toISOString();
  return value;
}

function sanitizeStoredInsight(value: unknown): ResidentNeedInsightV1 | null {
  if (!value || typeof value !== 'object') return null;
  const stored = value as Partial<ResidentNeedInsightV1>;
  const candidate = sanitizeCandidate(stored);
  if (
    !candidate ||
    stored.schemaVersion !== '1.0' ||
    stored.source !== 'resident_ai' ||
    stored.isDemo !== true ||
    typeof stored.id !== 'string' ||
    !/^insight-[A-Za-z0-9-]+$/.test(stored.id)
  ) {
    return null;
  }
  return {
    schemaVersion: '1.0',
    id: stored.id.slice(0, 96),
    isDemo: true,
    source: 'resident_ai',
    ...candidate,
    firstSeenAt: safeTimestamp(stored.firstSeenAt),
    lastSeenAt: safeTimestamp(stored.lastSeenAt),
    turnCount: positiveInteger(stored.turnCount, 1, 20),
    occurrenceCount: positiveInteger(stored.occurrenceCount, 1, 10_000),
    dedupeKey: dedupeKeyFor(candidate),
  };
}

function safeParse(raw: string | null): ResidentNeedInsightEnvelopeV1 {
  if (!raw) return EMPTY_ENVELOPE;
  try {
    const parsed = JSON.parse(raw) as Partial<ResidentNeedInsightEnvelopeV1>;
    if (parsed.schemaVersion !== '1.0' || !Array.isArray(parsed.insights)) return EMPTY_ENVELOPE;
    const insights = parsed.insights
      .map(sanitizeStoredInsight)
      .filter((item): item is ResidentNeedInsightV1 => item !== null);
    return { schemaVersion: '1.0', insights };
  } catch {
    return EMPTY_ENVELOPE;
  }
}

export function loadResidentNeedInsights(): ResidentNeedInsightV1[] {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(INSIGHT_STORAGE_KEY)).insights;
}

export function recordResidentNeedInsight(
  candidateValue: ResidentNeedInsightCandidateV1,
  rawTurnCount: number,
): ResidentNeedInsightV1 | null {
  const candidate = sanitizeCandidate(candidateValue);
  if (!candidate) return null;

  const now = new Date().toISOString();
  const turnCount = positiveInteger(rawTurnCount, 1, 20);
  const dedupeKey = dedupeKeyFor(candidate);
  const envelope = safeParse(
    typeof window === 'undefined' ? null : window.localStorage.getItem(INSIGHT_STORAGE_KEY),
  );
  const existing = envelope.insights.find((item) => item.dedupeKey === dedupeKey);

  const next: ResidentNeedInsightV1 = existing
    ? {
        schemaVersion: '1.0',
        id: existing.id,
        isDemo: true,
        source: 'resident_ai',
        domain: candidate.domain,
        goalTags: [...new Set([...existing.goalTags, ...candidate.goalTags])],
        constraintTags: [...new Set([...existing.constraintTags, ...candidate.constraintTags])],
        matchedSupplyIds: [...new Set([...existing.matchedSupplyIds, ...candidate.matchedSupplyIds])],
        knowledgeCoverage: candidate.knowledgeCoverage,
        confidence: Math.max(existing.confidence, candidate.confidence),
        firstSeenAt: existing.firstSeenAt,
        lastSeenAt: now,
        turnCount: Math.max(existing.turnCount, turnCount),
        occurrenceCount: turnCount === 1 ? existing.occurrenceCount + 1 : existing.occurrenceCount,
        dedupeKey,
      }
    : {
        schemaVersion: '1.0',
        id: createId(),
        isDemo: true,
        source: 'resident_ai',
        ...candidate,
        firstSeenAt: now,
        lastSeenAt: now,
        turnCount,
        occurrenceCount: 1,
        dedupeKey,
      };

  if (typeof window !== 'undefined') {
    const insights = existing
      ? envelope.insights.map((item) => (item.id === existing.id ? next : item))
      : [next, ...envelope.insights];
    window.localStorage.setItem(
      INSIGHT_STORAGE_KEY,
      JSON.stringify({ schemaVersion: '1.0', insights } satisfies ResidentNeedInsightEnvelopeV1),
    );
  }

  return next;
}

export function clearResidentNeedInsights(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(INSIGHT_STORAGE_KEY);
}
