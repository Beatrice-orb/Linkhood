import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { primaryService, secondaryServices } from './fixtures';
import type {
  DemoState,
  MissingFieldKey,
  PublicServiceCard,
  ResidentActionEvent,
  ResidentActionType,
} from './types';

export const DEMO_STORAGE_KEY = 'dabashou:demo:v0.1:state';

const initialState: DemoState = {
  schemaVersion: 2,
  intakePhase: 'source',
  confirmedUnknownFields: [],
  coreFieldsConfirmed: false,
  residentEvents: [],
  visitStatus: 'draft',
  visitDraft: {
    facts: '7 月 11 日上午入户走访，居民本人在场。',
    quote: '最近做饭不太方便，想了解社区助餐。',
  },
  activityChecklist: {
    qrCode: true,
    venue: true,
    speaker: false,
  },
  noticeSent: false,
};

type Action =
  | { type: 'hydrate'; state: DemoState }
  | { type: 'run-extraction' }
  | { type: 'confirm-core'; reviewedAt: string }
  | { type: 'confirm-field'; field: MissingFieldKey }
  | { type: 'publish'; publishedAt: string }
  | { type: 'resident-event'; event: ResidentActionEvent }
  | { type: 'save-visit'; facts: string; quote: string }
  | { type: 'submit-visit'; facts: string; quote: string }
  | { type: 'toggle-activity-item'; item: keyof DemoState['activityChecklist'] }
  | { type: 'send-notice' }
  | { type: 'reset' };

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'run-extraction':
      return { ...state, intakePhase: 'review', coreFieldsConfirmed: false };
    case 'confirm-core':
      return { ...state, coreFieldsConfirmed: true, reviewedAt: action.reviewedAt };
    case 'confirm-field':
      return state.confirmedUnknownFields.includes(action.field)
        ? state
        : {
            ...state,
            confirmedUnknownFields: [...state.confirmedUnknownFields, action.field],
          };
    case 'publish':
      return state.coreFieldsConfirmed && Boolean(state.reviewedAt) && state.confirmedUnknownFields.length === 3
        ? { ...state, intakePhase: 'published', publishedAt: action.publishedAt }
        : state;
    case 'resident-event':
      return state.residentEvents.some(
        (event) =>
          event.type === action.event.type &&
          event.serviceId === action.event.serviceId &&
          event.anonymousActorId === action.event.anonymousActorId,
      )
        ? state
        : { ...state, residentEvents: [...state.residentEvents, action.event] };
    case 'save-visit':
      return { ...state, visitDraft: { facts: action.facts, quote: action.quote } };
    case 'submit-visit':
      return { ...state, visitDraft: { facts: action.facts, quote: action.quote }, visitStatus: 'submitted' };
    case 'toggle-activity-item':
      return {
        ...state,
        activityChecklist: {
          ...state.activityChecklist,
          [action.item]: !state.activityChecklist[action.item],
        },
      };
    case 'send-notice':
      return { ...state, noticeSent: true };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

const allowedMissingFields = new Set<MissingFieldKey>(['fee', 'capacity', 'stationHours']);
const allowedEventTypes = new Set<ResidentActionType>(['service_card_viewed', 'service_source_opened', 'service_interest_expressed']);

function normalizeState(value: unknown): DemoState {
  if (!value || typeof value !== 'object') return initialState;
  const candidate = value as Partial<DemoState>;
  const requestedIntakePhase = candidate.intakePhase === 'review' || candidate.intakePhase === 'published' ? candidate.intakePhase : 'source';
  const storedUnknownFields = Array.isArray(candidate.confirmedUnknownFields)
    ? [...new Set(candidate.confirmedUnknownFields.filter((field): field is MissingFieldKey => allowedMissingFields.has(field as MissingFieldKey)))]
    : [];
  const confirmedUnknownFields = requestedIntakePhase === 'source' ? [] : storedUnknownFields;
  const residentEvents = Array.isArray(candidate.residentEvents)
    ? candidate.residentEvents.filter((event): event is ResidentActionEvent => Boolean(
        event &&
        typeof event === 'object' &&
        typeof event.id === 'string' &&
        typeof event.serviceId === 'string' &&
        typeof event.anonymousActorId === 'string' &&
        allowedEventTypes.has(event.type),
      ))
    : [];
  const visitDraft = candidate.visitDraft && typeof candidate.visitDraft === 'object'
    ? {
        facts: typeof candidate.visitDraft.facts === 'string' ? candidate.visitDraft.facts : initialState.visitDraft.facts,
        quote: typeof candidate.visitDraft.quote === 'string' ? candidate.visitDraft.quote : initialState.visitDraft.quote,
      }
    : initialState.visitDraft;
  const checklist = candidate.activityChecklist && typeof candidate.activityChecklist === 'object'
    ? {
        qrCode: typeof candidate.activityChecklist.qrCode === 'boolean' ? candidate.activityChecklist.qrCode : true,
        venue: typeof candidate.activityChecklist.venue === 'boolean' ? candidate.activityChecklist.venue : true,
        speaker: typeof candidate.activityChecklist.speaker === 'boolean' ? candidate.activityChecklist.speaker : false,
    }
    : initialState.activityChecklist;
  const reviewedAt = requestedIntakePhase !== 'source' && typeof candidate.reviewedAt === 'string' ? candidate.reviewedAt : undefined;
  const coreFieldsConfirmed = requestedIntakePhase !== 'source' && candidate.coreFieldsConfirmed === true && Boolean(reviewedAt);
  const publishedAt = typeof candidate.publishedAt === 'string' ? candidate.publishedAt : undefined;
  const publishGateSatisfied = coreFieldsConfirmed && confirmedUnknownFields.length === 3 && Boolean(reviewedAt);
  const intakePhase = requestedIntakePhase === 'published' && (!publishGateSatisfied || !publishedAt) ? 'review' : requestedIntakePhase;

  return {
    schemaVersion: 2,
    intakePhase,
    confirmedUnknownFields,
    coreFieldsConfirmed,
    reviewedAt,
    publishedAt: intakePhase === 'published' ? publishedAt : undefined,
    residentEvents,
    visitStatus: candidate.visitStatus === 'submitted' ? 'submitted' : 'draft',
    visitDraft,
    activityChecklist: checklist,
    noticeSent: candidate.noticeSent === true,
  };
}

function readStoredState(): DemoState {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return initialState;
    return normalizeState(JSON.parse(raw));
  } catch {
    return initialState;
  }
}

interface DemoContextValue {
  state: DemoState;
  services: PublicServiceCard[];
  primaryService: PublicServiceCard;
  remainingReviewCount: number;
  canPublish: boolean;
  runExtraction: () => void;
  confirmCoreFields: () => void;
  confirmField: (field: MissingFieldKey) => void;
  publish: () => void;
  recordResidentEvent: (type: ResidentActionType, serviceId: string) => void;
  saveVisitDraft: (facts: string, quote: string) => void;
  submitVisit: (facts: string, quote: string) => void;
  toggleActivityItem: (item: keyof DemoState['activityChecklist']) => void;
  sendNotice: () => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, readStoredState);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The demo still works in memory when storage is unavailable.
    }
  }, [state]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DEMO_STORAGE_KEY || !event.newValue) return;
      try {
        dispatch({ type: 'hydrate', state: normalizeState(JSON.parse(event.newValue)) });
      } catch {
        // Ignore malformed state written by an older local prototype.
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const resolvedPrimaryService = useMemo<PublicServiceCard>(
    () => ({
      ...primaryService,
      review: {
        status: state.coreFieldsConfirmed && state.confirmedUnknownFields.length === 3 ? 'verified' : state.intakePhase === 'source' ? 'ai_draft' : 'needs_review',
        reviewedBy: state.coreFieldsConfirmed ? '演示账号 · 李敏' : undefined,
        reviewedAt: state.reviewedAt,
        confirmedUnknownFields: state.confirmedUnknownFields.map((field) => field),
      },
      publication:
        state.intakePhase === 'published'
          ? { status: 'published', publishedAt: state.publishedAt }
          : { status: 'draft' },
    }),
    [state.confirmedUnknownFields, state.coreFieldsConfirmed, state.intakePhase, state.publishedAt, state.reviewedAt],
  );

  const services = useMemo(
    () => [resolvedPrimaryService, ...secondaryServices],
    [resolvedPrimaryService],
  );

  const recordResidentEvent = useCallback((type: ResidentActionType, serviceId: string) => {
    const actionMap: Record<ResidentActionType, ResidentActionEvent['context']['action']> = {
      service_card_viewed: 'view_card',
      service_source_opened: 'view_source',
      service_interest_expressed: 'express_interest',
    };
    dispatch({
      type: 'resident-event',
      event: {
        schemaVersion: '0.1',
        id: `${type}:${serviceId}:demo-anon-01`,
        type,
        serviceId,
        communityId: 'xihongmen',
        occurredAt: new Date().toISOString(),
        anonymousActorId: 'demo-anon-01',
        context: { action: actionMap[type] },
        isDemo: true,
      },
    });
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      state,
      services,
      primaryService: resolvedPrimaryService,
      remainingReviewCount: 3 - state.confirmedUnknownFields.length,
      canPublish: state.intakePhase === 'review' && state.coreFieldsConfirmed && Boolean(state.reviewedAt) && state.confirmedUnknownFields.length === 3,
      runExtraction: () => dispatch({ type: 'run-extraction' }),
      confirmCoreFields: () => dispatch({ type: 'confirm-core', reviewedAt: new Date().toLocaleString('zh-CN', { hour12: false }) }),
      confirmField: (field) => dispatch({ type: 'confirm-field', field }),
      publish: () => dispatch({ type: 'publish', publishedAt: new Date().toLocaleString('zh-CN', { hour12: false }) }),
      recordResidentEvent,
      saveVisitDraft: (facts, quote) => dispatch({ type: 'save-visit', facts, quote }),
      submitVisit: (facts, quote) => dispatch({ type: 'submit-visit', facts, quote }),
      toggleActivityItem: (item) => dispatch({ type: 'toggle-activity-item', item }),
      sendNotice: () => dispatch({ type: 'send-notice' }),
      resetDemo: () => dispatch({ type: 'reset' }),
    }),
    [recordResidentEvent, resolvedPrimaryService, services, state],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoStore() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemoStore must be used inside DemoProvider');
  return context;
}
