import { redactResidentText } from './fallbackEngine';
import type {
  AnonymousDemandCandidateV1,
  AnonymousDemandSignalV1,
  DemandSignalEnvelopeV1,
  ResidentAgentMessage,
} from './types';

export const DEMAND_STORAGE_KEY = 'dabashou:anonymous-demand-signals:v1';
const DEMAND_CHANNEL = 'dabashou:anonymous-demand-signals';

const EMPTY_ENVELOPE: DemandSignalEnvelopeV1 = {
  schemaVersion: '1.0',
  signals: [],
};

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `demand-${crypto.randomUUID()}`;
  }
  return `demand-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeParseEnvelope(raw: string | null): DemandSignalEnvelopeV1 {
  if (!raw) return EMPTY_ENVELOPE;
  try {
    const parsed = JSON.parse(raw) as Partial<DemandSignalEnvelopeV1>;
    if (parsed.schemaVersion !== '1.0' || !Array.isArray(parsed.signals)) {
      return EMPTY_ENVELOPE;
    }
    return {
      schemaVersion: '1.0',
      signals: parsed.signals.filter(
        (signal): signal is AnonymousDemandSignalV1 =>
          Boolean(signal) &&
          signal.schemaVersion === '1.0' &&
          signal.recordKind === 'anonymous_demand_signal',
      ),
    };
  } catch {
    return EMPTY_ENVELOPE;
  }
}

function publishChange(): void {
  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel(DEMAND_CHANNEL);
  channel.postMessage({ type: 'demand-signals-updated' });
  channel.close();
}

export function loadAnonymousDemandSignals(): AnonymousDemandSignalV1[] {
  if (typeof window === 'undefined') return [];
  return safeParseEnvelope(window.localStorage.getItem(DEMAND_STORAGE_KEY)).signals;
}

export function recordAnonymousDemandSignal(params: {
  candidate: AnonymousDemandCandidateV1;
  messages: ResidentAgentMessage[];
}): AnonymousDemandSignalV1 {
  const { candidate, messages } = params;
  const now = new Date().toISOString();
  const dedupeKey = `${candidate.domain}:${candidate.topicCode}`;
  const voiceFragments = messages
    .filter((message) => message.role === 'user')
    .slice(-2)
    .map((message) => redactResidentText(message.content))
    .filter(Boolean);
  const envelope = safeParseEnvelope(
    typeof window === 'undefined' ? null : window.localStorage.getItem(DEMAND_STORAGE_KEY),
  );
  const existing = envelope.signals.find((signal) => signal.dedupeKey === dedupeKey);

  let nextSignal: AnonymousDemandSignalV1;
  let nextSignals: AnonymousDemandSignalV1[];

  if (existing) {
    const mergedVoices = [...existing.voiceFragments, ...voiceFragments]
      .filter((value, index, values) => values.indexOf(value) === index)
      .slice(-2);
    nextSignal = {
      ...existing,
      summary: candidate.summary,
      unmetFacet: candidate.unmetFacet,
      voiceFragments: mergedVoices,
      contextTags: candidate.contextTags,
      lastSeenAt: now,
      occurrenceCount: existing.occurrenceCount + 1,
      confidence: Math.max(existing.confidence, candidate.confidence),
      routeDepartmentId: candidate.routeDepartmentId ?? existing.routeDepartmentId,
    };
    nextSignals = envelope.signals.map((signal) =>
      signal.id === existing.id ? nextSignal : signal,
    );
  } else {
    nextSignal = {
      schemaVersion: '1.0',
      id: createId(),
      isDemo: true,
      visibility: 'community_only',
      communityId: 'xihongmen-demo',
      source: 'resident_ai',
      domain: candidate.domain,
      topicCode: candidate.topicCode,
      summary: candidate.summary,
      unmetFacet: candidate.unmetFacet,
      voiceFragments,
      contextTags: candidate.contextTags,
      knowledgeCoverage: candidate.knowledgeCoverage,
      sourceRefs: candidate.sourceRefs,
      routeDepartmentId: candidate.routeDepartmentId,
      confidence: candidate.confidence,
      firstSeenAt: now,
      lastSeenAt: now,
      occurrenceCount: 1,
      dedupeKey,
      recordKind: 'anonymous_demand_signal',
      notACase: true,
      piiScan: 'passed',
    };
    nextSignals = [nextSignal, ...envelope.signals];
  }

  if (typeof window !== 'undefined') {
    const nextEnvelope: DemandSignalEnvelopeV1 = {
      schemaVersion: '1.0',
      signals: nextSignals,
    };
    window.localStorage.setItem(DEMAND_STORAGE_KEY, JSON.stringify(nextEnvelope));
    publishChange();
  }

  return nextSignal;
}

export function clearAnonymousDemandSignals(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMAND_STORAGE_KEY);
  publishChange();
}

export function subscribeToDemandSignals(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === DEMAND_STORAGE_KEY) onChange();
  };
  window.addEventListener('storage', handleStorage);

  const channel =
    typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(DEMAND_CHANNEL);
  channel?.addEventListener('message', onChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    channel?.removeEventListener('message', onChange);
    channel?.close();
  };
}
