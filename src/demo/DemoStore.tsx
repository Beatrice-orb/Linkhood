import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import { togApi, ACTORS, type ServiceStateResponse } from '../api/tog';
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
  activityChecklist: { qrCode: true, venue: true, speaker: false },
  noticeSent: false,
};

type Action =
  | { type: 'hydrate'; state: DemoState }
  | { type: 'service-state'; payload: ServiceStateResponse }
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
    case 'service-state': {
      const workflowStatus = action.payload.service.workflowStatus;
      const fields = action.payload.fields;
      return {
        ...state,
        intakePhase: workflowStatus === 'published' ? 'published' : workflowStatus === 'pending_review' || workflowStatus === 'approved' ? 'review' : 'source',
        coreFieldsConfirmed: fields.some((field) => field.field_key === 'core' && field.status === 'confirmed'),
        confirmedUnknownFields: fields
          .filter((field) => field.field_key !== 'core' && field.status === 'unknown_confirmed')
          .map((field) => field.field_key as MissingFieldKey),
        reviewedAt: action.payload.service.review.reviewedAt,
        publishedAt: action.payload.service.publication.publishedAt,
      };
    }
    case 'resident-event':
      return state.residentEvents.some((event) => event.type === action.event.type && event.serviceId === action.event.serviceId)
        ? state
        : { ...state, residentEvents: [...state.residentEvents, action.event] };
    case 'save-visit':
      return { ...state, visitDraft: { facts: action.facts, quote: action.quote } };
    case 'submit-visit':
      return { ...state, visitDraft: { facts: action.facts, quote: action.quote }, visitStatus: 'submitted' };
    case 'toggle-activity-item':
      return { ...state, activityChecklist: { ...state.activityChecklist, [action.item]: !state.activityChecklist[action.item] } };
    case 'send-notice':
      return { ...state, noticeSent: true };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

function readStoredState(): DemoState {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) } as DemoState;
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

function eventFromApi(type: ResidentActionType, serviceId: string, id: string, occurredAt: string): ResidentActionEvent {
  const actionMap: Record<ResidentActionType, ResidentActionEvent['context']['action']> = {
    service_card_viewed: 'view_card',
    service_source_opened: 'view_source',
    service_interest_expressed: 'express_interest',
  };
  return {
    schemaVersion: '0.1',
    id,
    type,
    serviceId,
    communityId: 'xihongmen',
    occurredAt,
    anonymousActorId: ACTORS.resident,
    context: { action: actionMap[type] },
    isDemo: true,
  };
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, readStoredState);
  const [services, setServices] = useState<PublicServiceCard[]>([primaryService, ...secondaryServices]);

  const hydrateFromApi = useCallback(async () => {
    try {
      const [serviceList, primaryState, actions, tasks, activityOperation] = await Promise.all([
        togApi.listServices(ACTORS.community),
        togApi.serviceState(ACTORS.community, primaryService.id),
        togApi.mineActions(),
        togApi.tasks(),
        togApi.activityOperation('event_anti_fraud'),
      ]);
      setServices(serviceList.services);
      const residentEvents = actions.actions.map((action) => {
        const type = action.action_type === 'view_card' ? 'service_card_viewed'
          : action.action_type === 'view_source' ? 'service_source_opened'
            : 'service_interest_expressed';
        return eventFromApi(type, action.service_id, action.id, action.created_at);
      });
      const task = tasks.tasks.find((item) => item.id === 'task_visit_a017');
      dispatch({
        type: 'hydrate',
        state: {
          ...state,
          intakePhase: primaryState.service.workflowStatus === 'published' ? 'published' : primaryState.service.workflowStatus === 'draft' ? 'source' : 'review',
          coreFieldsConfirmed: primaryState.fields.some((field) => field.field_key === 'core' && field.status === 'confirmed'),
          confirmedUnknownFields: primaryState.fields.filter((field) => field.field_key !== 'core' && field.status === 'unknown_confirmed').map((field) => field.field_key as MissingFieldKey),
          reviewedAt: primaryState.service.review.reviewedAt,
          publishedAt: primaryState.service.publication.publishedAt,
          residentEvents,
          visitStatus: task?.status === 'submitted' || task?.status === 'completed' ? 'submitted' : 'draft',
          activityChecklist: activityOperation.checklist,
          noticeSent: activityOperation.noticeSent,
        },
      });
    } catch {
      // Keep the fixture-backed demo available when the API is offline.
    }
  }, []);

  useEffect(() => {
    void hydrateFromApi();
  }, [hydrateFromApi]);

  useEffect(() => {
    const refresh = () => { void hydrateFromApi(); };
    window.addEventListener('linkhood:data-changed', refresh);
    return () => window.removeEventListener('linkhood:data-changed', refresh);
  }, [hydrateFromApi]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The server remains the source of truth.
    }
  }, [state]);

  const applyServiceResponse = useCallback((response: ServiceStateResponse) => {
    dispatch({ type: 'service-state', payload: response });
    setServices((current) => current.map((service) => service.id === response.service.id ? response.service : service));
  }, []);

  const recordResidentEvent = useCallback((type: ResidentActionType, serviceId: string) => {
    const action = type === 'service_card_viewed' ? 'view_card' : type === 'service_source_opened' ? 'view_source' : 'express_interest';
    void togApi.recordAction(serviceId, action).catch(() => undefined);
    dispatch({ type: 'resident-event', event: eventFromApi(type, serviceId, `${type}:${serviceId}:${ACTORS.resident}`, new Date().toISOString()) });
  }, []);

  const resolvedPrimaryService = services.find((service) => service.id === primaryService.id) || primaryService;
  const value = useMemo<DemoContextValue>(() => ({
    state,
    services,
    primaryService: resolvedPrimaryService,
    remainingReviewCount: 3 - state.confirmedUnknownFields.length,
    canPublish: state.intakePhase === 'review' && state.coreFieldsConfirmed && state.confirmedUnknownFields.length === 3,
    runExtraction: () => { void togApi.extract(primaryService.id).then(applyServiceResponse); },
    confirmCoreFields: () => { void togApi.reviewField(primaryService.id, 'core').then(applyServiceResponse); },
    confirmField: (field) => { void togApi.reviewField(primaryService.id, field).then(applyServiceResponse); },
    publish: () => { void togApi.publish(primaryService.id).then(applyServiceResponse); },
    recordResidentEvent,
    saveVisitDraft: (facts, quote) => {
      dispatch({ type: 'save-visit', facts, quote });
      void togApi.saveVisit('task_visit_a017', { facts, quote, assessment: '需先核验服务资格，不自动作出结论。', consentConfirmed: true });
    },
    submitVisit: (facts, quote) => {
      void togApi.saveVisit('task_visit_a017', { facts, quote, assessment: '需先核验服务资格，不自动作出结论。', consentConfirmed: true })
        .then(() => togApi.submitVisit('task_visit_a017'))
        .then(() => dispatch({ type: 'submit-visit', facts, quote }));
    },
    toggleActivityItem: (item) => {
      void togApi.toggleActivityItem('event_anti_fraud', item)
        .then(() => dispatch({ type: 'toggle-activity-item', item }));
    },
    sendNotice: () => {
      void togApi.sendActivityNotice('event_anti_fraud')
        .then(() => dispatch({ type: 'send-notice' }));
    },
    resetDemo: () => {
      dispatch({ type: 'reset' });
      void togApi.resetDemo().then(hydrateFromApi);
    },
  }), [applyServiceResponse, hydrateFromApi, recordResidentEvent, resolvedPrimaryService, services, state]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoStore() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemoStore must be used inside DemoProvider');
  return context;
}
