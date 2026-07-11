import { apiRequest, putJson } from './client';
import type {
  Activity,
  Announcement,
  AntiFraudReminder,
  Feedback,
  Hotline,
  Resident,
  Service,
  SocialWorker,
  Space,
  TodoItem,
} from '../government/types';

export const GOVERNMENT_API_USER = 'admin_1';

export interface GovernmentState {
  todos: TodoItem[];
  activities: Activity[];
  announcements: Announcement[];
  spaces: Space[];
  services: Service[];
  workers: SocialWorker[];
  residents: Resident[];
  alerts: AntiFraudReminder[];
  feedbacks: Feedback[];
  hotlines: Hotline[];
}

export interface GovernmentBootstrap {
  state: GovernmentState;
  updatedAt: string;
  user: {
    name: string;
    communityId: string;
    role: string;
  };
}

export function fetchGovernmentBootstrap() {
  return apiRequest<GovernmentBootstrap>(GOVERNMENT_API_USER, '/api/government/bootstrap');
}

export function saveGovernmentState(state: GovernmentState) {
  return putJson<{ ok: true; updatedAt: string }>(GOVERNMENT_API_USER, '/api/government/state', { state });
}
