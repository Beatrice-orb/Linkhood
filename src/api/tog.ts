import type { PublicServiceCard } from '../demo/types';
import type { Announcement } from '../types';
import { apiRequest, postJson, putJson } from './client';

export const ACTORS = {
  community: 'staff_li',
  socialWorker: 'social_li',
  resident: 'user_xiaoya',
} as const;

export interface ServiceStateResponse {
  service: PublicServiceCard & { workflowStatus?: string };
  fields: Array<{ field_key: string; status: string; reviewed_at?: string }>;
}

export const togApi = {
  createService: (body: unknown) => postJson<ServiceStateResponse>(ACTORS.community, '/api/public-services', body),
  listServices: (actorId: string) => apiRequest<{ services: PublicServiceCard[] }>(actorId, '/api/public-services'),
  serviceState: (actorId: string, serviceId: string) => apiRequest<ServiceStateResponse>(actorId, `/api/public-services/${serviceId}/state`),
  extract: (serviceId: string) => postJson<ServiceStateResponse>(ACTORS.community, `/api/public-services/${serviceId}/extract`, {}),
  reviewField: (serviceId: string, field: string) => postJson<ServiceStateResponse>(ACTORS.community, `/api/public-services/${serviceId}/review/${field}`, {}),
  publish: (serviceId: string) => postJson<ServiceStateResponse>(ACTORS.community, `/api/public-services/${serviceId}/publish`, {}),
  recordAction: (serviceId: string, type: 'view_card' | 'view_source' | 'express_interest' | 'withdraw_interest') => postJson<{ ok: true }>(ACTORS.resident, `/api/public-services/${serviceId}/actions`, { type }),
  mineActions: () => apiRequest<{ actions: Array<{ id: string; service_id: string; action_type: string; created_at: string }> }>(ACTORS.resident, '/api/public-services/actions/mine'),
  insights: () => apiRequest<{ signals: Array<{ service_id: string; uniqueActors: number; actions: number }> }>(ACTORS.community, '/api/insights'),
  dashboard: () => apiRequest<{ residents: number; pendingServices: number; openTasks: number; pendingReports: number; weeklyReport: Record<string, unknown> }>(ACTORS.community, '/api/community/dashboard'),
  residents: (actorId = ACTORS.community) => apiRequest<{ residents: Array<Record<string, unknown>> }>(actorId, '/api/community/residents'),
  auditLogs: () => apiRequest<{ logs: Array<Record<string, unknown>> }>(ACTORS.community, '/api/audit-logs'),
  tasks: (actorId = ACTORS.socialWorker) => apiRequest<{ tasks: Array<Record<string, unknown>> }>(actorId, '/api/social-work/tasks'),
  createTask: (body: unknown) => postJson<{ id: string }>(ACTORS.community, '/api/social-work/tasks', body),
  activityOperation: (activityId: string) => apiRequest<{ checklist: Record<'qrCode' | 'venue' | 'speaker', boolean>; noticeSent: boolean }>(ACTORS.community, `/api/activity-operations/${activityId}`),
  toggleActivityItem: (activityId: string, item: 'qrCode' | 'venue' | 'speaker') => putJson<{ checklist: Record<'qrCode' | 'venue' | 'speaker', boolean> }>(ACTORS.community, `/api/activity-operations/${activityId}/checklist`, { item }),
  sendActivityNotice: (activityId: string) => postJson<{ sent: number; noticeSent: boolean }>(ACTORS.community, `/api/activity-operations/${activityId}/notify`, { content: '活动安排有更新，请查看最新信息。' }),
  createActivity: (body: unknown) => postJson<{ activity: Record<string, unknown> }>(ACTORS.community, '/api/activities', body),
  createAnnouncement: (body: unknown) => postJson<{ announcement: Announcement; sent: number }>(ACTORS.community, '/api/announcements', body),
  saveVisit: (taskId: string, body: unknown) => putJson<{ id: string; status: string }>(ACTORS.socialWorker, `/api/social-work/tasks/${taskId}/visit`, body),
  submitVisit: (taskId: string) => postJson<{ id: string; status: string }>(ACTORS.socialWorker, `/api/social-work/tasks/${taskId}/visit/submit`, {}),
  resetDemo: () => postJson<{ ok: true }>(ACTORS.community, '/api/demo/reset', {}),
};
