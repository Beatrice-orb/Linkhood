import express, { type Request, type Response } from 'express';
import { ALLOW_DEMO_LOGIN } from './config.ts';
import { authenticate, createSession, requireRoles } from './auth.ts';
import { db, getUser } from './db.ts';
import { audit, changeCredit, changePoints, ensurePrivateConversation, mapPublicService, notify, publicServiceState } from './domain.ts';
import { listActivities, listConversations, listFeed, listSpaces, residentBootstrap, weeklyReport } from './serializers.ts';
import { id, json, now } from './utils.ts';

function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`INVALID_${field.toUpperCase()}`);
  return value.trim();
}

function sendDomainError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  const status = message.startsWith('INVALID_') ? 400
    : message === 'NOT_FOUND' || message.endsWith('_NOT_FOUND') ? 404
      : message === 'FORBIDDEN' ? 403
        : message === 'CONFLICT' || message === 'ALREADY_CLAIMED' || message === 'CAPACITY_FULL' ? 409
          : 400;
  return res.status(status).json({ error: message, message });
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use(express.json({ limit: '2mb' }));

  const requestWindows = new Map<string, { count: number; resetAt: number }>();
  app.use('/api', (req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
    const key = `${req.ip}:${req.path.startsWith('/auth/') ? 'auth' : 'mutation'}`;
    const limit = req.path.startsWith('/auth/') ? 20 : 120;
    const current = requestWindows.get(key);
    const timestamp = Date.now();
    if (!current || current.resetAt <= timestamp) requestWindows.set(key, { count: 1, resetAt: timestamp + 60_000 });
    else {
      current.count += 1;
      if (current.count > limit) return res.status(429).json({ error: 'RATE_LIMITED', message: '操作过于频繁，请稍后再试' });
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    const database = db.prepare('SELECT 1 AS ok').get() as { ok: number };
    res.json({ ok: database.ok === 1, time: now() });
  });

  app.post('/api/auth/demo-login', (req, res) => {
    if (!ALLOW_DEMO_LOGIN) return res.status(404).json({ error: 'NOT_FOUND' });
    const userId = typeof req.body?.userId === 'string' ? req.body.userId : '';
    const session = createSession(userId);
    if (!session) return res.status(404).json({ error: 'USER_NOT_FOUND', message: '演示账号不存在' });
    res.json(session);
  });

  app.get('/api/auth/me', authenticate, (req, res) => res.json({ user: req.authUser }));

  app.post('/api/auth/logout', authenticate, (req, res) => {
    const token = req.header('authorization')?.slice(7);
    if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    res.json({ ok: true });
  });

  app.get('/api/resident/bootstrap', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    const payload = residentBootstrap(req.authUser!.id);
    if (!payload) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    audit(req.authUser!.id, req.authUser!.communityId, 'resident.bootstrap.view', 'resident_app');
    res.json(payload);
  });

  app.get('/api/public-services', authenticate, (req, res) => {
    db.prepare("UPDATE public_services SET workflow_status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE workflow_status = 'published' AND expires_at IS NOT NULL AND expires_at <= CURRENT_TIMESTAMP").run();
    const staff = req.authUser!.role !== 'resident';
    const rows = db.prepare(`
      SELECT * FROM public_services
      WHERE community_id = ? ${staff ? '' : "AND workflow_status = 'published'"}
      ORDER BY created_at DESC
    `).all(req.authUser!.communityId) as Array<Record<string, unknown>>;
    res.json({ services: rows.map(mapPublicService) });
  });

  app.get('/api/public-services/actions/mine', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    const actions = db.prepare(`
      SELECT id, service_id, action_type, created_at FROM resident_service_actions
      WHERE user_id = ? ORDER BY created_at
    `).all(req.authUser!.id);
    res.json({ actions });
  });

  app.get('/api/public-services/:serviceId/state', authenticate, (req, res) => {
    const state = publicServiceState(req.params.serviceId);
    if (!state) return res.status(404).json({ error: 'SERVICE_NOT_FOUND' });
    res.json(state);
  });

  app.post('/api/public-services', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    try {
      const title = requiredString(req.body?.title, 'title');
      const serviceId = id('service');
      const service = {
        schemaVersion: '0.1',
        id: serviceId,
        dataKind: 'real_public_source',
        workflowMode: 'mvp',
        communityId: req.authUser!.communityId,
        geoScope: 'xihongmen_local',
        title,
        shortTitle: req.body.shortTitle || title,
        serviceType: req.body.serviceType || 'education',
        provider: requiredString(req.body?.provider, 'provider'),
        audience: Array.isArray(req.body.audience) ? req.body.audience : [],
        eligibility: req.body.eligibility || null,
        schedule: req.body.schedule || { eventStart: '', eventEnd: '' },
        location: req.body.location || '待确认',
        fee: req.body.fee || '待确认',
        capacity: Number.isFinite(req.body.capacity) ? req.body.capacity : null,
        registrationMethod: req.body.registrationMethod || '待确认',
        source: req.body.source || { id: id('source'), label: '社区录入', url: '', publishedAt: now().slice(0, 10) },
        availability: { status: 'needs_confirmation', basis: '待工作人员核验', verifiedAt: now() },
        missingFields: [],
        confidence: 'medium',
        review: { status: 'ai_draft', confirmedUnknownFields: [] },
        publication: { status: 'draft' },
        demoUse: 'secondary_card',
      };
      db.prepare('INSERT INTO public_services (id, community_id, data_json, workflow_status) VALUES (?, ?, ?, ?)')
        .run(serviceId, req.authUser!.communityId, JSON.stringify(service), 'draft');
      for (const field of ['core', 'fee', 'capacity', 'stationHours']) {
        db.prepare('INSERT INTO service_review_fields (service_id, field_key, status) VALUES (?, ?, ?)').run(serviceId, field, 'pending');
      }
      audit(req.authUser!.id, req.authUser!.communityId, 'service.create', 'public_service', serviceId);
      res.status(201).json(publicServiceState(serviceId));
    } catch (error) {
      sendDomainError(res, error);
    }
  });

  app.post('/api/public-services/:serviceId/extract', authenticate, requireRoles('community_operator', 'social_worker', 'admin'), (req, res) => {
    const result = db.prepare("UPDATE public_services SET workflow_status = 'pending_review', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND community_id = ? AND workflow_status = 'draft'")
      .run(req.params.serviceId, req.authUser!.communityId);
    if (!result.changes) return res.status(409).json({ error: 'INVALID_SERVICE_STATE' });
    audit(req.authUser!.id, req.authUser!.communityId, 'service.extract', 'public_service', req.params.serviceId);
    res.json(publicServiceState(req.params.serviceId));
  });

  app.post('/api/public-services/:serviceId/review/:field', authenticate, requireRoles('community_operator', 'social_worker', 'admin'), (req, res) => {
    const field = req.params.field;
    if (!['core', 'fee', 'capacity', 'stationHours'].includes(field)) return res.status(400).json({ error: 'INVALID_FIELD' });
    const status = field === 'core' ? 'confirmed' : 'unknown_confirmed';
    const result = db.prepare(`
      UPDATE service_review_fields SET status = ?, reviewer_id = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE service_id = ? AND field_key = ?
    `).run(status, req.authUser!.id, req.params.serviceId, field);
    if (!result.changes) return res.status(404).json({ error: 'SERVICE_FIELD_NOT_FOUND' });
    db.prepare('UPDATE public_services SET reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(req.authUser!.id, req.params.serviceId);
    audit(req.authUser!.id, req.authUser!.communityId, 'service.review_field', 'public_service', req.params.serviceId, { field, status });
    res.json(publicServiceState(req.params.serviceId));
  });

  app.post('/api/public-services/:serviceId/publish', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    const fields = db.prepare('SELECT field_key, status FROM service_review_fields WHERE service_id = ?').all(req.params.serviceId) as Array<{ field_key: string; status: string }>;
    const ready = fields.length >= 4 && fields.every((field) => field.status !== 'pending');
    if (!ready) return res.status(409).json({ error: 'REVIEW_REQUIRED', message: '必要字段和未知字段表达尚未全部确认' });
    db.prepare(`
      UPDATE public_services SET workflow_status = 'published', published_by = ?, published_at = CURRENT_TIMESTAMP,
        next_review_at = COALESCE(next_review_at, datetime('now', '+7 days')), updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND community_id = ?
    `).run(req.authUser!.id, req.params.serviceId, req.authUser!.communityId);
    audit(req.authUser!.id, req.authUser!.communityId, 'service.publish', 'public_service', req.params.serviceId);
    res.json(publicServiceState(req.params.serviceId));
  });

  app.post('/api/public-services/:serviceId/withdraw', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    db.prepare("UPDATE public_services SET workflow_status = 'withdrawn', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND community_id = ?")
      .run(req.params.serviceId, req.authUser!.communityId);
    audit(req.authUser!.id, req.authUser!.communityId, 'service.withdraw', 'public_service', req.params.serviceId, { reason: req.body?.reason || '' });
    res.json(publicServiceState(req.params.serviceId));
  });

  app.post('/api/public-services/:serviceId/actions', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    const actionType = req.body?.type;
    if (!['view_card', 'view_source', 'express_interest', 'withdraw_interest'].includes(actionType)) return res.status(400).json({ error: 'INVALID_ACTION' });
    const service = db.prepare("SELECT id FROM public_services WHERE id = ? AND community_id = ? AND workflow_status = 'published'").get(req.params.serviceId, req.authUser!.communityId);
    if (!service) return res.status(404).json({ error: 'SERVICE_NOT_FOUND' });
    db.prepare(`INSERT INTO resident_service_actions (id, service_id, community_id, user_id, action_type) VALUES (?, ?, ?, ?, ?)`)
      .run(id('action'), req.params.serviceId, req.authUser!.communityId, req.authUser!.id, actionType);
    if (actionType === 'express_interest' || actionType === 'withdraw_interest') {
      db.prepare(`
        INSERT INTO resident_service_interests (service_id, community_id, user_id, active)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(service_id, user_id) DO UPDATE SET active = excluded.active, updated_at = CURRENT_TIMESTAMP
      `).run(req.params.serviceId, req.authUser!.communityId, req.authUser!.id, actionType === 'express_interest' ? 1 : 0);
    }
    audit(req.authUser!.id, req.authUser!.communityId, `service.${actionType}`, 'public_service', req.params.serviceId);
    res.status(201).json({ ok: true });
  });

  app.get('/api/insights', authenticate, requireRoles('community_operator', 'social_worker', 'admin'), (req, res) => {
    const signals = db.prepare(`
      SELECT service_id, COUNT(DISTINCT user_id) AS uniqueActors, COUNT(*) AS actions
      FROM resident_service_interests
      WHERE community_id = ? AND active = 1
      GROUP BY service_id
    `).all(req.authUser!.communityId);
    res.json({ signals, weeklyReport: weeklyReport(req.authUser!.communityId) });
  });

  app.get('/api/community/dashboard', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    const scalar = (sql: string) => (db.prepare(sql).get(req.authUser!.communityId) as { count: number }).count;
    res.json({
      residents: scalar("SELECT COUNT(*) AS count FROM community_memberships WHERE community_id = ? AND role = 'resident'"),
      pendingServices: scalar("SELECT COUNT(*) AS count FROM public_services WHERE community_id = ? AND workflow_status IN ('draft', 'pending_review')"),
      openTasks: scalar("SELECT COUNT(*) AS count FROM social_work_tasks WHERE community_id = ? AND status NOT IN ('completed', 'cancelled')"),
      pendingReports: scalar("SELECT COUNT(*) AS count FROM content_reports WHERE community_id = ? AND status IN ('pending', 'reviewing')"),
      weeklyReport: weeklyReport(req.authUser!.communityId),
    });
  });

  app.get('/api/community/residents', authenticate, requireRoles('community_operator', 'social_worker', 'admin'), (req, res) => {
    const residents = db.prepare(`
      SELECT u.id, u.name,
        CASE WHEN ? = 'social_worker' THEN substr(u.room, 1, instr(u.room || '-', '-') - 1) || '号楼' ELSE u.room END AS room,
        u.profession, u.credit_score, u.help_count, m.verified,
        (SELECT COUNT(*) FROM social_work_tasks t WHERE t.resident_id = u.id AND t.status NOT IN ('completed', 'cancelled')) AS open_tasks
      FROM users u JOIN community_memberships m ON m.user_id = u.id
      WHERE m.community_id = ? AND m.role = 'resident'
      ORDER BY u.name
    `).all(req.authUser!.role, req.authUser!.communityId);
    res.json({ residents });
  });

  app.get('/api/social-work/tasks', authenticate, requireRoles('social_worker', 'community_operator', 'admin'), (req, res) => {
    const where = req.authUser!.role === 'social_worker' ? 'AND t.assignee_id = ?' : '';
    const params = req.authUser!.role === 'social_worker' ? [req.authUser!.communityId, req.authUser!.id] : [req.authUser!.communityId];
    const tasks = db.prepare(`
      SELECT t.*, r.name AS resident_name, a.name AS assignee_name
      FROM social_work_tasks t
      LEFT JOIN users r ON r.id = t.resident_id
      LEFT JOIN users a ON a.id = t.assignee_id
      WHERE t.community_id = ? ${where}
      ORDER BY t.updated_at DESC
    `).all(...params);
    res.json({ tasks });
  });

  app.post('/api/social-work/tasks', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    try {
      const taskId = id('task');
      const title = requiredString(req.body?.title, 'title');
      const assigneeId = requiredString(req.body?.assigneeId, 'assigneeId');
      const assignee = getUser(assigneeId);
      if (!assignee || assignee.communityId !== req.authUser!.communityId || assignee.role !== 'social_worker') throw new Error('ASSIGNEE_NOT_FOUND');
      db.prepare(`
        INSERT INTO social_work_tasks (id, community_id, resident_id, service_id, assignee_id, title, description, due_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(taskId, req.authUser!.communityId, req.body.residentId || null, req.body.serviceId || null, assigneeId, title, req.body.description || '', req.body.dueAt || null, req.authUser!.id);
      notify(assigneeId, 'task_assigned', '新的居民跟进任务', title, 'social_work_task', taskId);
      audit(req.authUser!.id, req.authUser!.communityId, 'task.assign', 'social_work_task', taskId);
      res.status(201).json({ id: taskId });
    } catch (error) {
      sendDomainError(res, error);
    }
  });

  app.put('/api/social-work/tasks/:taskId/visit', authenticate, requireRoles('social_worker', 'admin'), (req, res) => {
    try {
      const task = db.prepare('SELECT * FROM social_work_tasks WHERE id = ? AND assignee_id = ?').get(req.params.taskId, req.authUser!.id) as Record<string, any> | undefined;
      if (!task) throw new Error('TASK_NOT_FOUND');
      const facts = requiredString(req.body?.facts, 'facts');
      const quote = requiredString(req.body?.quote, 'quote');
      const existing = db.prepare("SELECT * FROM visit_records WHERE task_id = ? AND author_id = ? ORDER BY version DESC LIMIT 1").get(req.params.taskId, req.authUser!.id) as Record<string, any> | undefined;
      if (existing?.status === 'submitted' || existing?.status === 'approved') throw new Error('CONFLICT');
      if (existing) {
        db.prepare(`UPDATE visit_records SET facts = ?, resident_quote = ?, worker_assessment = ?, uncertain_notes = ?, consent_confirmed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .run(facts, quote, req.body.assessment || '', req.body.uncertainNotes || '', req.body.consentConfirmed ? 1 : 0, existing.id);
        res.json({ id: existing.id, status: 'draft' });
      } else {
        const visitId = id('visit');
        db.prepare(`
          INSERT INTO visit_records (id, task_id, author_id, facts, resident_quote, worker_assessment, uncertain_notes, consent_confirmed)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(visitId, req.params.taskId, req.authUser!.id, facts, quote, req.body.assessment || '', req.body.uncertainNotes || '', req.body.consentConfirmed ? 1 : 0);
        res.status(201).json({ id: visitId, status: 'draft' });
      }
      audit(req.authUser!.id, req.authUser!.communityId, 'visit.save', 'social_work_task', req.params.taskId);
    } catch (error) {
      sendDomainError(res, error);
    }
  });

  app.post('/api/social-work/tasks/:taskId/visit/submit', authenticate, requireRoles('social_worker', 'admin'), (req, res) => {
    const visit = db.prepare("SELECT * FROM visit_records WHERE task_id = ? AND author_id = ? AND status = 'draft' ORDER BY version DESC LIMIT 1")
      .get(req.params.taskId, req.authUser!.id) as Record<string, any> | undefined;
    if (!visit) return res.status(404).json({ error: 'VISIT_DRAFT_NOT_FOUND' });
    if (!visit.consent_confirmed) return res.status(409).json({ error: 'CONSENT_REQUIRED' });
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare("UPDATE visit_records SET status = 'submitted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(visit.id);
      db.prepare("UPDATE social_work_tasks SET status = 'submitted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.taskId);
      const operators = db.prepare("SELECT user_id FROM community_memberships WHERE community_id = ? AND role IN ('community_operator', 'admin')").all(req.authUser!.communityId) as Array<{ user_id: string }>;
      for (const operator of operators) notify(operator.user_id, 'visit_submitted', '走访记录待审核', '社工已提交居民走访记录', 'social_work_task', req.params.taskId);
      audit(req.authUser!.id, req.authUser!.communityId, 'visit.submit', 'visit_record', visit.id);
      db.exec('COMMIT');
      res.json({ id: visit.id, status: 'submitted' });
    } catch (error) {
      db.exec('ROLLBACK');
      sendDomainError(res, error);
    }
  });

  app.post('/api/social-work/tasks/:taskId/visit/review', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    const approved = req.body?.approved === true;
    const visit = db.prepare("SELECT * FROM visit_records WHERE task_id = ? AND status = 'submitted' ORDER BY version DESC LIMIT 1").get(req.params.taskId) as Record<string, any> | undefined;
    if (!visit) return res.status(404).json({ error: 'VISIT_NOT_FOUND' });
    const status = approved ? 'approved' : 'rejected';
    db.prepare('UPDATE visit_records SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, req.authUser!.id, visit.id);
    db.prepare('UPDATE social_work_tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(approved ? 'completed' : 'rejected', req.params.taskId);
    notify(visit.author_id, 'visit_reviewed', approved ? '走访记录审核通过' : '走访记录需要修改', req.body?.comment || '', 'social_work_task', req.params.taskId);
    audit(req.authUser!.id, req.authUser!.communityId, 'visit.review', 'visit_record', visit.id, { approved });
    res.json({ status });
  });

  app.post('/api/spaces/:spaceId/bookings', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    try {
      const timeSlot = requiredString(req.body?.timeSlot, 'timeSlot');
      const space = db.prepare('SELECT id FROM spaces WHERE id = ? AND community_id = ? AND active = 1').get(req.params.spaceId, req.authUser!.communityId);
      if (!space) throw new Error('SPACE_NOT_FOUND');
      const bookingId = id('booking');
      db.prepare('INSERT INTO space_bookings (id, space_id, user_id, time_slot) VALUES (?, ?, ?, ?)').run(bookingId, req.params.spaceId, req.authUser!.id, timeSlot);
      audit(req.authUser!.id, req.authUser!.communityId, 'space.book', 'space', req.params.spaceId, { timeSlot });
      res.status(201).json({ id: bookingId, spaces: listSpaces(req.authUser!.communityId) });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('UNIQUE constraint')) return res.status(409).json({ error: 'SLOT_BOOKED', message: '该时段已被预约' });
      sendDomainError(res, error);
    }
  });

  app.delete('/api/spaces/:spaceId/bookings', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    try {
      const timeSlot = requiredString(req.body?.timeSlot, 'timeSlot');
      const result = db.prepare("UPDATE space_bookings SET status = 'cancelled' WHERE space_id = ? AND user_id = ? AND time_slot = ? AND status = 'confirmed'")
        .run(req.params.spaceId, req.authUser!.id, timeSlot);
      if (!result.changes) throw new Error('BOOKING_NOT_FOUND');
      audit(req.authUser!.id, req.authUser!.communityId, 'space.booking.cancel', 'space', req.params.spaceId, { timeSlot });
      res.json({ spaces: listSpaces(req.authUser!.communityId) });
    } catch (error) {
      sendDomainError(res, error);
    }
  });

  app.post('/api/spaces/:spaceId/reviews', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    try {
      const comment = requiredString(req.body?.comment, 'comment');
      const rating = Number(req.body?.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('INVALID_RATING');
      db.prepare('INSERT INTO space_reviews (id, space_id, author_id, rating, comment) VALUES (?, ?, ?, ?, ?)')
        .run(id('review'), req.params.spaceId, req.authUser!.id, rating, comment);
      audit(req.authUser!.id, req.authUser!.communityId, 'space.review.create', 'space', req.params.spaceId, { rating });
      res.status(201).json({ spaces: listSpaces(req.authUser!.communityId) });
    } catch (error) {
      sendDomainError(res, error);
    }
  });

  app.post('/api/activities/:activityId/registration', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    const activity = db.prepare('SELECT data_json FROM activities WHERE id = ? AND community_id = ?').get(req.params.activityId, req.authUser!.communityId) as { data_json: string } | undefined;
    if (!activity) return res.status(404).json({ error: 'ACTIVITY_NOT_FOUND' });
    const current = db.prepare('SELECT status FROM activity_registrations WHERE activity_id = ? AND user_id = ?').get(req.params.activityId, req.authUser!.id) as { status: string } | undefined;
    if (current?.status === 'registered') {
      db.prepare("UPDATE activity_registrations SET status = 'cancelled' WHERE activity_id = ? AND user_id = ?").run(req.params.activityId, req.authUser!.id);
    } else {
      const data = json<Record<string, any>>(activity.data_json, {});
      const count = (db.prepare("SELECT COUNT(*) AS count FROM activity_registrations WHERE activity_id = ? AND status = 'registered'").get(req.params.activityId) as { count: number }).count;
      if (Number(data.signedUp || 0) + count >= Number(data.capacity || 0) && Number(data.capacity || 0) > 0) return res.status(409).json({ error: 'CAPACITY_FULL' });
      db.prepare(`
        INSERT INTO activity_registrations (activity_id, user_id, status) VALUES (?, ?, 'registered')
        ON CONFLICT(activity_id, user_id) DO UPDATE SET status = 'registered'
      `).run(req.params.activityId, req.authUser!.id);
      let conversation = db.prepare("SELECT id FROM conversations WHERE reference_type = 'activity' AND reference_id = ?").get(req.params.activityId) as { id: string } | undefined;
      if (!conversation) {
        const conversationId = id('conversation');
        db.prepare("INSERT INTO conversations (id, community_id, type, name, reference_type, reference_id) VALUES (?, ?, 'group', ?, 'activity', ?)")
          .run(conversationId, req.authUser!.communityId, `${data.name || '社区活动'}交流群`, req.params.activityId);
        conversation = { id: conversationId };
      }
      db.prepare('INSERT OR IGNORE INTO conversation_members (conversation_id, user_id) VALUES (?, ?)').run(conversation.id, req.authUser!.id);
      notify(req.authUser!.id, 'activity_registered', '活动报名成功', data.name || '社区活动', 'activity', req.params.activityId);
    }
    audit(req.authUser!.id, req.authUser!.communityId, current?.status === 'registered' ? 'activity.cancel' : 'activity.register', 'activity', req.params.activityId);
    res.json({ events: listActivities(req.authUser!.communityId, req.authUser!.id) });
  });

  app.post('/api/activities', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    try {
      const activityId = id('activity');
      const activity = {
        id: activityId,
        name: requiredString(req.body?.name, 'name'),
        type: req.body?.type || '社区活动',
        time: requiredString(req.body?.time, 'time'),
        location: requiredString(req.body?.location, 'location'),
        organizer: req.body?.organizer || req.authUser!.name,
        signedUp: 0,
        capacity: Math.max(1, Number(req.body?.capacity || 20)),
        status: '报名中',
        fee: req.body?.fee || '免费',
        introduction: req.body?.introduction || '',
        activeMembers: [],
        joinedByMe: false,
      };
      db.prepare('INSERT INTO activities (id, community_id, data_json, created_by) VALUES (?, ?, ?, ?)')
        .run(activityId, req.authUser!.communityId, JSON.stringify(activity), req.authUser!.id);
      db.prepare('INSERT INTO activity_operations (activity_id) VALUES (?)').run(activityId);
      audit(req.authUser!.id, req.authUser!.communityId, 'activity.create', 'activity', activityId);
      res.status(201).json({ activity });
    } catch (error) {
      sendDomainError(res, error);
    }
  });

  app.get('/api/activity-operations/:activityId', authenticate, requireRoles('community_operator', 'social_worker', 'admin'), (req, res) => {
    const operation = db.prepare('SELECT * FROM activity_operations WHERE activity_id = ?').get(req.params.activityId) as Record<string, any> | undefined;
    if (!operation) return res.status(404).json({ error: 'ACTIVITY_OPERATION_NOT_FOUND' });
    res.json({ checklist: json(operation.checklist_json, {}), noticeSent: Boolean(operation.notice_sent) });
  });

  app.put('/api/activity-operations/:activityId/checklist', authenticate, requireRoles('community_operator', 'social_worker', 'admin'), (req, res) => {
    const item = req.body?.item;
    if (!['qrCode', 'venue', 'speaker'].includes(item)) return res.status(400).json({ error: 'INVALID_CHECKLIST_ITEM' });
    const operation = db.prepare('SELECT checklist_json FROM activity_operations WHERE activity_id = ?').get(req.params.activityId) as { checklist_json: string } | undefined;
    if (!operation) return res.status(404).json({ error: 'ACTIVITY_OPERATION_NOT_FOUND' });
    const checklist = json<Record<string, boolean>>(operation.checklist_json, { qrCode: false, venue: false, speaker: false });
    checklist[item] = !checklist[item];
    db.prepare('UPDATE activity_operations SET checklist_json = ?, updated_at = CURRENT_TIMESTAMP WHERE activity_id = ?').run(JSON.stringify(checklist), req.params.activityId);
    audit(req.authUser!.id, req.authUser!.communityId, 'activity.checklist.toggle', 'activity', req.params.activityId, { item, value: checklist[item] });
    res.json({ checklist });
  });

  app.post('/api/activity-operations/:activityId/notify', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    const activity = db.prepare('SELECT data_json FROM activities WHERE id = ? AND community_id = ?').get(req.params.activityId, req.authUser!.communityId) as { data_json: string } | undefined;
    if (!activity) return res.status(404).json({ error: 'ACTIVITY_NOT_FOUND' });
    const activityData = json<Record<string, any>>(activity.data_json, {});
    const recipients = db.prepare(`
      SELECT user_id FROM activity_registrations WHERE activity_id = ? AND status = 'registered'
    `).all(req.params.activityId) as Array<{ user_id: string }>;
    for (const recipient of recipients) notify(recipient.user_id, 'activity_update', `${activityData.name || '社区活动'}通知`, req.body?.content || '活动安排有更新，请查看最新信息。', 'activity', req.params.activityId);
    db.prepare('UPDATE activity_operations SET notice_sent = 1, updated_at = CURRENT_TIMESTAMP WHERE activity_id = ?').run(req.params.activityId);
    audit(req.authUser!.id, req.authUser!.communityId, 'activity.notice.send', 'activity', req.params.activityId, { recipientCount: recipients.length });
    res.json({ sent: recipients.length, noticeSent: true });
  });

  app.post('/api/announcements', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    try {
      const announcement = {
        id: id('announcement'),
        type: req.body?.type || '公告',
        title: requiredString(req.body?.title, 'title'),
        content: requiredString(req.body?.content, 'content'),
        time: '刚刚',
        importance: req.body?.importance || '🟡一般',
      };
      db.prepare('INSERT INTO announcements (id, community_id, data_json, published_by) VALUES (?, ?, ?, ?)')
        .run(announcement.id, req.authUser!.communityId, JSON.stringify(announcement), req.authUser!.id);
      const residents = db.prepare("SELECT user_id FROM community_memberships WHERE community_id = ? AND role = 'resident'").all(req.authUser!.communityId) as Array<{ user_id: string }>;
      for (const resident of residents) notify(resident.user_id, 'announcement', announcement.title, announcement.content, 'announcement', announcement.id);
      audit(req.authUser!.id, req.authUser!.communityId, 'announcement.publish', 'announcement', announcement.id, { recipientCount: residents.length });
      res.status(201).json({ announcement, sent: residents.length });
    } catch (error) {
      sendDomainError(res, error);
    }
  });

  app.get('/api/posts', authenticate, requireRoles('resident', 'admin'), (req, res) => res.json({ feedItems: listFeed(req.authUser!.communityId, req.authUser!.id) }));

  app.post('/api/posts', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    try {
      const type = req.body?.type;
      if (!['help', 'moment', 'rally', 'topic'].includes(type)) throw new Error('INVALID_TYPE');
      const content = requiredString(req.body?.content, 'content');
      if (type === 'help' && /急救|昏迷|胸痛|呼吸困难|借钱|贷款|进家门照护|上门照护/.test(content)) {
        return res.status(422).json({ error: 'HIGH_RISK_HELP', message: '该需求涉及紧急、借贷或进门照护，请联系专业机构或社区人工服务' });
      }
      const bounty = type === 'help' ? Math.max(0, Math.min(100, Number(req.body?.bountyPoints || 0))) : 0;
      if (bounty > req.authUser!.points) throw new Error('INSUFFICIENT_POINTS');
      const postId = id('post');
      db.exec('BEGIN IMMEDIATE');
      try {
        if (bounty) changePoints(req.authUser!.id, -bounty, '发布互助，积分进入托管', 'help', postId);
        db.prepare(`
          INSERT INTO posts (id, community_id, author_id, type, category, content, meeting_time, bounty_points, escrow_status, metadata_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(postId, req.authUser!.communityId, req.authUser!.id, type, req.body?.category || null, content, req.body?.meetingTime || null, bounty, bounty > 0 ? 'held' : 'none', JSON.stringify({ distance: 0, actionText: type === 'help' ? '我来帮' : undefined, tags: type === 'moment' ? ['新发布', '日常分享'] : [] }));
        audit(req.authUser!.id, req.authUser!.communityId, 'post.create', 'post', postId, { type, bounty });
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      res.status(201).json({ feedItems: listFeed(req.authUser!.communityId, req.authUser!.id), user: getUser(req.authUser!.id) });
    } catch (error) {
      sendDomainError(res, error);
    }
  });

  app.post('/api/posts/:postId/like', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    const liked = db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(req.params.postId, req.authUser!.id);
    if (liked) db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(req.params.postId, req.authUser!.id);
    else db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)').run(req.params.postId, req.authUser!.id);
    res.json({ feedItems: listFeed(req.authUser!.communityId, req.authUser!.id) });
  });

  app.post('/api/posts/:postId/comments', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    try {
      const content = requiredString(req.body?.content, 'content');
      db.prepare('INSERT INTO post_comments (id, post_id, author_id, content) VALUES (?, ?, ?, ?)').run(id('comment'), req.params.postId, req.authUser!.id, content);
      const post = db.prepare('SELECT author_id FROM posts WHERE id = ?').get(req.params.postId) as { author_id: string } | undefined;
      if (post && post.author_id !== req.authUser!.id) notify(post.author_id, 'post_comment', '邻里圈有新评论', content, 'post', req.params.postId);
      res.status(201).json({ feedItems: listFeed(req.authUser!.communityId, req.authUser!.id) });
    } catch (error) {
      sendDomainError(res, error);
    }
  });

  app.post('/api/reports', authenticate, (req, res) => {
    try {
      const entityType = req.body?.entityType;
      if (!['post', 'comment', 'message', 'user'].includes(entityType)) throw new Error('INVALID_ENTITY_TYPE');
      const entityId = requiredString(req.body?.entityId, 'entityId');
      const reason = requiredString(req.body?.reason, 'reason');
      const reportId = id('report');
      db.prepare('INSERT INTO content_reports (id, community_id, reporter_id, entity_type, entity_id, reason) VALUES (?, ?, ?, ?, ?, ?)')
        .run(reportId, req.authUser!.communityId, req.authUser!.id, entityType, entityId, reason);
      audit(req.authUser!.id, req.authUser!.communityId, 'content.report', entityType, entityId, { reportId });
      res.status(201).json({ id: reportId, status: 'pending' });
    } catch (error) {
      sendDomainError(res, error);
    }
  });

  app.post('/api/users/:userId/block', authenticate, (req, res) => {
    if (req.params.userId === req.authUser!.id) return res.status(400).json({ error: 'CANNOT_BLOCK_SELF' });
    db.prepare('INSERT OR IGNORE INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?)').run(req.authUser!.id, req.params.userId);
    res.json({ feedItems: listFeed(req.authUser!.communityId, req.authUser!.id) });
  });

  app.get('/api/moderation/reports', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    const reports = db.prepare(`
      SELECT r.*, u.name AS reporter_name FROM content_reports r
      JOIN users u ON u.id = r.reporter_id
      WHERE r.community_id = ? ORDER BY r.created_at DESC
    `).all(req.authUser!.communityId);
    res.json({ reports });
  });

  app.post('/api/moderation/reports/:reportId/resolve', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    const report = db.prepare("SELECT * FROM content_reports WHERE id = ? AND community_id = ? AND status IN ('pending', 'reviewing')")
      .get(req.params.reportId, req.authUser!.communityId) as Record<string, any> | undefined;
    if (!report) return res.status(404).json({ error: 'REPORT_NOT_FOUND' });
    const resolution = req.body?.resolution === 'dismissed' ? 'dismissed' : 'resolved';
    if (resolution === 'resolved' && req.body?.hideContent === true && report.entity_type === 'post') {
      db.prepare("UPDATE posts SET status = 'hidden', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(report.entity_id);
    }
    db.prepare('UPDATE content_reports SET status = ?, handled_by = ?, handled_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(resolution, req.authUser!.id, report.id);
    audit(req.authUser!.id, req.authUser!.communityId, 'content.report.resolve', report.entity_type, report.entity_id, { resolution, hideContent: req.body?.hideContent === true });
    res.json({ status: resolution });
  });

  app.get('/api/audit-logs', authenticate, requireRoles('community_operator', 'admin'), (req, res) => {
    const logs = db.prepare('SELECT * FROM audit_logs WHERE community_id = ? ORDER BY created_at DESC LIMIT 500').all(req.authUser!.communityId);
    res.json({ logs });
  });

  app.post('/api/help/:postId/claim', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    const post = db.prepare("SELECT * FROM posts WHERE id = ? AND community_id = ? AND type = 'help'").get(req.params.postId, req.authUser!.communityId) as Record<string, any> | undefined;
    if (!post) return res.status(404).json({ error: 'HELP_NOT_FOUND' });
    if (post.author_id === req.authUser!.id) return res.status(403).json({ error: 'CANNOT_HELP_SELF' });
    if (post.status !== 'active') return res.status(409).json({ error: 'ALREADY_CLAIMED' });
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare("UPDATE posts SET status = 'claimed', helper_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'").run(req.authUser!.id, req.params.postId);
      const conversationId = ensurePrivateConversation(req.authUser!.communityId, post.author_id, req.authUser!.id, '邻里互助', 'help', req.params.postId);
      db.prepare('INSERT INTO messages (id, conversation_id, sender_id, content, message_type) VALUES (?, ?, NULL, ?, ?)')
        .run(id('message'), conversationId, `${req.authUser!.name} 已响应这条互助需求，请在保护隐私的前提下协商交接。`, 'system');
      notify(post.author_id, 'help_claimed', '有邻居响应了你的需求', `${req.authUser!.name}愿意搭把手`, 'post', req.params.postId);
      audit(req.authUser!.id, req.authUser!.communityId, 'help.claim', 'post', req.params.postId);
      db.exec('COMMIT');
      res.json({ feedItems: listFeed(req.authUser!.communityId, req.authUser!.id), chatSessions: listConversations(req.authUser!.communityId, req.authUser!.id) });
    } catch (error) {
      db.exec('ROLLBACK');
      sendDomainError(res, error);
    }
  });

  app.post('/api/help/:postId/complete', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    const post = db.prepare("SELECT * FROM posts WHERE id = ? AND community_id = ? AND type = 'help'").get(req.params.postId, req.authUser!.communityId) as Record<string, any> | undefined;
    if (!post) return res.status(404).json({ error: 'HELP_NOT_FOUND' });
    if (post.author_id !== req.authUser!.id && req.authUser!.role !== 'admin') return res.status(403).json({ error: 'ONLY_REQUESTER_CAN_COMPLETE' });
    if (post.status !== 'claimed' || !post.helper_id) return res.status(409).json({ error: 'INVALID_HELP_STATE' });
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare("UPDATE posts SET status = 'completed', escrow_status = CASE WHEN escrow_status = 'held' THEN 'released' ELSE escrow_status END, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.postId);
      if (post.bounty_points > 0 && post.escrow_status === 'held') changePoints(post.helper_id, post.bounty_points, '完成邻里互助', 'help', post.id);
      changeCredit(post.helper_id, 1, '完成邻里互助', post.id);
      db.prepare('UPDATE users SET help_count = help_count + 1 WHERE id = ?').run(post.helper_id);
      notify(post.helper_id, 'help_completed', '互助已确认完成', `获得 ${post.bounty_points} 积分，信用记录已更新`, 'post', post.id);
      audit(req.authUser!.id, req.authUser!.communityId, 'help.complete', 'post', post.id);
      db.exec('COMMIT');
      res.json({ feedItems: listFeed(req.authUser!.communityId, req.authUser!.id), user: getUser(req.authUser!.id) });
    } catch (error) {
      db.exec('ROLLBACK');
      sendDomainError(res, error);
    }
  });

  app.post('/api/help/:postId/cancel', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    const post = db.prepare("SELECT * FROM posts WHERE id = ? AND community_id = ? AND type = 'help'").get(req.params.postId, req.authUser!.communityId) as Record<string, any> | undefined;
    if (!post) return res.status(404).json({ error: 'HELP_NOT_FOUND' });
    if (post.author_id !== req.authUser!.id && req.authUser!.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    if (!['active', 'claimed'].includes(post.status)) return res.status(409).json({ error: 'INVALID_HELP_STATE' });
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare("UPDATE posts SET status = 'cancelled', escrow_status = CASE WHEN escrow_status = 'held' THEN 'refunded' ELSE escrow_status END, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(post.id);
      if (post.bounty_points > 0 && post.escrow_status === 'held') changePoints(post.author_id, post.bounty_points, '取消互助，退回托管积分', 'help', post.id);
      if (post.helper_id) notify(post.helper_id, 'help_cancelled', '互助需求已取消', post.content, 'post', post.id);
      audit(req.authUser!.id, req.authUser!.communityId, 'help.cancel', 'post', post.id);
      db.exec('COMMIT');
      res.json({ feedItems: listFeed(req.authUser!.communityId, req.authUser!.id), user: getUser(req.authUser!.id) });
    } catch (error) {
      db.exec('ROLLBACK');
      sendDomainError(res, error);
    }
  });

  app.get('/api/points', authenticate, (req, res) => {
    const transactions = db.prepare('SELECT * FROM point_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.authUser!.id);
    const creditEvents = db.prepare('SELECT * FROM credit_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.authUser!.id);
    res.json({ user: getUser(req.authUser!.id), transactions, creditEvents });
  });

  app.post('/api/rewards/onboarding', authenticate, requireRoles('resident', 'admin'), (req, res) => {
    const existing = db.prepare("SELECT 1 FROM user_rewards WHERE user_id = ? AND reward_key = 'onboarding_complete'").get(req.authUser!.id);
    if (existing) return res.status(409).json({ error: 'REWARD_ALREADY_CLAIMED' });
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare("INSERT INTO user_rewards (user_id, reward_key) VALUES (?, 'onboarding_complete')").run(req.authUser!.id);
      changePoints(req.authUser!.id, 30, '完成社区新手指南', 'reward', 'onboarding_complete');
      audit(req.authUser!.id, req.authUser!.communityId, 'reward.onboarding.claim', 'user_reward', 'onboarding_complete');
      db.exec('COMMIT');
      res.json({ user: getUser(req.authUser!.id) });
    } catch (error) {
      db.exec('ROLLBACK');
      sendDomainError(res, error);
    }
  });

  app.get('/api/conversations', authenticate, (req, res) => res.json({ chatSessions: listConversations(req.authUser!.communityId, req.authUser!.id) }));

  app.post('/api/conversations/private', authenticate, requireRoles('resident', 'social_worker', 'community_operator', 'admin'), (req, res) => {
    const targetUserId = req.body?.targetUserId;
    const target = typeof targetUserId === 'string' ? getUser(targetUserId) : null;
    if (!target || target.communityId !== req.authUser!.communityId) return res.status(404).json({ error: 'TARGET_NOT_FOUND' });
    if (target.id === req.authUser!.id) return res.status(400).json({ error: 'CANNOT_CHAT_WITH_SELF' });
    const conversationId = ensurePrivateConversation(req.authUser!.communityId, req.authUser!.id, target.id, req.body?.name);
    res.status(201).json({ conversationId, chatSessions: listConversations(req.authUser!.communityId, req.authUser!.id) });
  });

  app.post('/api/conversations/:conversationId/messages', authenticate, (req, res) => {
    try {
      const content = requiredString(req.body?.content, 'content');
      const member = db.prepare('SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(req.params.conversationId, req.authUser!.id);
      if (!member) throw new Error('FORBIDDEN');
      const messageId = id('message');
      db.prepare('INSERT INTO messages (id, conversation_id, sender_id, content) VALUES (?, ?, ?, ?)')
        .run(messageId, req.params.conversationId, req.authUser!.id, content);
      const recipients = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?').all(req.params.conversationId, req.authUser!.id) as Array<{ user_id: string }>;
      for (const recipient of recipients) notify(recipient.user_id, 'chat_message', `${req.authUser!.name}发来消息`, content, 'conversation', req.params.conversationId);
      res.status(201).json({ chatSessions: listConversations(req.authUser!.communityId, req.authUser!.id) });
    } catch (error) {
      sendDomainError(res, error);
    }
  });

  app.get('/api/notifications', authenticate, (req, res) => {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').all(req.authUser!.id);
    res.json({ notifications });
  });

  app.post('/api/notifications/:notificationId/read', authenticate, (req, res) => {
    db.prepare('UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(req.params.notificationId, req.authUser!.id);
    res.json({ ok: true });
  });

  app.post('/api/demo/reset', authenticate, requireRoles('community_operator', 'admin'), (_req, res) => {
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare("UPDATE public_services SET workflow_status = 'draft', reviewed_by = NULL, reviewed_at = NULL, published_by = NULL, published_at = NULL WHERE id = 'xhm_sanfu_2026'").run();
      db.prepare("UPDATE service_review_fields SET status = 'pending', reviewer_id = NULL, reviewed_at = NULL WHERE service_id = 'xhm_sanfu_2026'").run();
      db.prepare("DELETE FROM resident_service_actions WHERE service_id = 'xhm_sanfu_2026'").run();
      db.prepare("DELETE FROM resident_service_interests WHERE service_id = 'xhm_sanfu_2026'").run();
      db.prepare("DELETE FROM visit_records WHERE task_id = 'task_visit_a017'").run();
      db.prepare("UPDATE social_work_tasks SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = 'task_visit_a017'").run();
      db.exec('COMMIT');
      res.json({ ok: true });
    } catch (error) {
      db.exec('ROLLBACK');
      sendDomainError(res, error);
    }
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'API_NOT_FOUND' }));
  return app;
}
