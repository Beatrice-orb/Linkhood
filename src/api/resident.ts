import type { Announcement, Event, FeedItem, Service, Space, UserProfile, WeeklyReport } from '../types';
import { apiRequest, postJson } from './client';

export interface ResidentBootstrap {
  user: UserProfile;
  spaces: Space[];
  services: Service[];
  events: Event[];
  feedItems: FeedItem[];
  announcements: Announcement[];
  chatSessions: unknown[];
  weeklyReport: WeeklyReport;
}

export const residentApi = {
  bootstrap: (userId: string) => apiRequest<ResidentBootstrap>(userId, '/api/resident/bootstrap'),
  bookSpace: (userId: string, spaceId: string, timeSlot: string) => postJson<{ spaces: Space[] }>(userId, `/api/spaces/${spaceId}/bookings`, { timeSlot }),
  cancelSpaceBooking: (userId: string, spaceId: string, timeSlot: string) => apiRequest<{ spaces: Space[] }>(userId, `/api/spaces/${spaceId}/bookings`, { method: 'DELETE', body: JSON.stringify({ timeSlot }) }),
  reviewSpace: (userId: string, spaceId: string, rating: number, comment: string) => postJson<{ spaces: Space[] }>(userId, `/api/spaces/${spaceId}/reviews`, { rating, comment }),
  toggleActivity: (userId: string, activityId: string) => postJson<{ events: Event[] }>(userId, `/api/activities/${activityId}/registration`, {}),
  createPost: (userId: string, body: unknown) => postJson<{ feedItems: FeedItem[]; user: UserProfile }>(userId, '/api/posts', body),
  toggleLike: (userId: string, postId: string) => postJson<{ feedItems: FeedItem[] }>(userId, `/api/posts/${postId}/like`, {}),
  addComment: (userId: string, postId: string, content: string) => postJson<{ feedItems: FeedItem[] }>(userId, `/api/posts/${postId}/comments`, { content }),
  claimHelp: (userId: string, postId: string) => postJson<{ feedItems: FeedItem[]; chatSessions: unknown[] }>(userId, `/api/help/${postId}/claim`, {}),
  completeHelp: (userId: string, postId: string) => postJson<{ feedItems: FeedItem[]; user: UserProfile }>(userId, `/api/help/${postId}/complete`, {}),
  cancelHelp: (userId: string, postId: string) => postJson<{ feedItems: FeedItem[]; user: UserProfile }>(userId, `/api/help/${postId}/cancel`, {}),
  conversations: (userId: string) => apiRequest<{ chatSessions: unknown[] }>(userId, '/api/conversations'),
  sendMessage: (userId: string, conversationId: string, content: string) => postJson<{ chatSessions: unknown[] }>(userId, `/api/conversations/${conversationId}/messages`, { content }),
  startPrivateChat: (userId: string, targetUserId: string, name?: string) => postJson<{ conversationId: string; chatSessions: unknown[] }>(userId, '/api/conversations/private', { targetUserId, name }),
  claimOnboardingReward: (userId: string) => postJson<{ user: UserProfile }>(userId, '/api/rewards/onboarding', {}),
  reportPost: (userId: string, postId: string, reason: string) => postJson<{ id: string; status: string }>(userId, '/api/reports', { entityType: 'post', entityId: postId, reason }),
  points: (userId: string) => apiRequest<{
    user: UserProfile;
    transactions: Array<{ id: string; amount: number; balance_after: number; reason: string; created_at: string }>;
    creditEvents: Array<{ id: string; delta: number; score_after: number; reason: string; created_at: string }>;
  }>(userId, '/api/points'),
};
