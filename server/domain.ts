import { db, getUser } from './db.ts';
import { id, json } from './utils.ts';

export function audit(actorId: string, communityId: string, action: string, entityType: string, entityId?: string, detail: unknown = {}) {
  db.prepare(`
    INSERT INTO audit_logs (id, community_id, actor_id, action, entity_type, entity_id, detail_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id('audit'), communityId, actorId, action, entityType, entityId || null, JSON.stringify(detail));
}

export function notify(userId: string, type: string, title: string, content: string, referenceType?: string, referenceId?: string) {
  db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, content, reference_type, reference_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id('notification'), userId, type, title, content, referenceType || null, referenceId || null);
}

export function changePoints(userId: string, amount: number, reason: string, referenceType?: string, referenceId?: string) {
  const user = getUser(userId);
  if (!user) throw new Error('USER_NOT_FOUND');
  const balanceAfter = user.points + amount;
  if (balanceAfter < 0) throw new Error('INSUFFICIENT_POINTS');
  db.prepare('UPDATE users SET points = ? WHERE id = ?').run(balanceAfter, userId);
  db.prepare(`
    INSERT INTO point_transactions (id, user_id, amount, balance_after, reason, reference_type, reference_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id('pt'), userId, amount, balanceAfter, reason, referenceType || null, referenceId || null);
  return balanceAfter;
}

export function changeCredit(userId: string, delta: number, reason: string, referenceId?: string) {
  const user = getUser(userId);
  if (!user) throw new Error('USER_NOT_FOUND');
  const scoreAfter = Math.max(0, Math.min(100, user.creditScore + delta));
  db.prepare('UPDATE users SET credit_score = ? WHERE id = ?').run(scoreAfter, userId);
  db.prepare('INSERT INTO credit_events (id, user_id, delta, score_after, reason, reference_id) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id('credit'), userId, delta, scoreAfter, reason, referenceId || null);
  return scoreAfter;
}

export function ensurePrivateConversation(communityId: string, firstUserId: string, secondUserId: string, name?: string, referenceType?: string, referenceId?: string) {
  const existing = db.prepare(`
    SELECT c.id FROM conversations c
    JOIN conversation_members a ON a.conversation_id = c.id AND a.user_id = ?
    JOIN conversation_members b ON b.conversation_id = c.id AND b.user_id = ?
    WHERE c.community_id = ? AND c.type = 'private'
    LIMIT 1
  `).get(firstUserId, secondUserId, communityId) as { id: string } | undefined;
  if (existing) return existing.id;

  const conversationId = id('conversation');
  db.prepare('INSERT INTO conversations (id, community_id, type, name, reference_type, reference_id) VALUES (?, ?, ?, ?, ?, ?)')
    .run(conversationId, communityId, 'private', name || null, referenceType || null, referenceId || null);
  db.prepare('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?), (?, ?)')
    .run(conversationId, firstUserId, conversationId, secondUserId);
  return conversationId;
}

export function mapPublicService(row: Record<string, unknown>) {
  const data = json<Record<string, unknown>>(row.data_json as string, {});
  return {
    ...data,
    review: {
      ...(data.review as Record<string, unknown> || {}),
      status: row.workflow_status === 'draft' ? 'ai_draft' : row.workflow_status === 'pending_review' ? 'needs_review' : 'verified',
      reviewedBy: row.reviewed_by || undefined,
      reviewedAt: row.reviewed_at || undefined,
    },
    publication: {
      status: row.workflow_status === 'published' ? 'published' : 'draft',
      publishedAt: row.published_at || undefined,
    },
    workflowStatus: row.workflow_status,
    expiresAt: row.expires_at,
    nextReviewAt: row.next_review_at,
  };
}

export function publicServiceState(serviceId: string) {
  const service = db.prepare('SELECT * FROM public_services WHERE id = ?').get(serviceId) as Record<string, unknown> | undefined;
  if (!service) return null;
  const fields = db.prepare('SELECT field_key, status, reviewed_at FROM service_review_fields WHERE service_id = ?').all(serviceId) as Array<{ field_key: string; status: string; reviewed_at: string }>;
  return { service: mapPublicService(service), fields };
}

export function toTimeLabel(createdAt: string) {
  const diff = Date.now() - new Date(`${createdAt.replace(' ', 'T')}Z`).getTime();
  if (diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))}分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}小时前`;
  return `${Math.floor(diff / 86_400_000)}天前`;
}
