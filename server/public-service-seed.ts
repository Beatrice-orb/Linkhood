import fs from 'node:fs';
import path from 'node:path';
import type { DatabaseSync } from 'node:sqlite';

interface SourceSeed {
  source_id: string;
  name: string;
  source_url: string;
  [key: string]: unknown;
}

interface ActivitySeed {
  activity_id: string;
  title: string;
  service_type: string;
  provider: string;
  source_id: string;
  source_url: string;
  published_at: string;
  geo_scope: string;
  location: string;
  audience: string[];
  eligibility: string | null;
  event_start: string | null;
  event_end: string | null;
  signup_start: string | null;
  signup_end: string | null;
  capacity: number | null;
  fee: string | null;
  registration_method: string | null;
  status: string;
  status_basis: string;
  status_verified_at: string;
  confidence: 'high' | 'medium';
  missing_fields: string[];
  demo_use: string;
}

interface SourceFile {
  schema_version: string;
  generated_at: string;
  scope: string;
  verification_note: string;
  sources: SourceSeed[];
}

interface ActivityFile {
  schema_version: string;
  generated_at: string;
  status_disclaimer: string;
  activities: ActivitySeed[];
}

const completedStatuses = new Set(['completed', 'completed_recent']);

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function shortTitle(title: string) {
  return title.length > 20 ? `${title.slice(0, 19)}...` : title;
}

function activityType(serviceType: string) {
  const types: Record<string, string> = {
    healthcare: '健康服务',
    health_education: '健康教育',
    youth_volunteering: '志愿公益',
    community_volunteering: '志愿公益',
    women_children_education: '亲子教育',
    public_culture: '公益课程',
    childcare_and_youth: '亲子教育',
    sports_facility: '体育运动',
    employment: '就业服务',
    public_participation: '公众参与',
    community_convenience: '便民服务',
    reuse_and_neighbor_connection: '邻里活动',
    safety_education: '安全教育',
    community_event: '社区活动',
  };
  return types[serviceType] || '公共服务';
}

function dateLabel(start: string | null, end: string | null) {
  if (!start && !end) return '具体时间需向主办方确认';
  if (start && end && start !== end) return `${start} 至 ${end}`;
  return start || end || '具体时间需向主办方确认';
}

function expiryAt(activity: ActivitySeed) {
  if (!activity.event_end) return null;
  const date = activity.event_end.slice(0, 10);
  return `${date}T23:59:59+08:00`;
}

function nextReviewAt(verifiedAt: string) {
  const verified = new Date(verifiedAt);
  if (Number.isNaN(verified.getTime())) return null;
  verified.setDate(verified.getDate() + 1);
  return verified.toISOString();
}

export function importRealPublicServiceData(db: DatabaseSync, rootDir: string) {
  const dataDir = path.join(rootDir, 'data', 'public-service');
  const sourceFile = readJson<SourceFile>(path.join(dataDir, 'sources.v0.1.json'));
  const activityFile = readJson<ActivityFile>(path.join(dataDir, 'activities.v0.1.json'));
  const sourcesById = new Map(sourceFile.sources.map((source) => [source.source_id, source]));

  const upsertSource = db.prepare(`
    INSERT INTO public_service_sources (id, data_json)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET data_json = excluded.data_json, active = 1, updated_at = CURRENT_TIMESTAMP
  `);
  const upsertService = db.prepare(`
    INSERT INTO public_services (id, community_id, data_json, workflow_status, expires_at, next_review_at)
    VALUES (?, 'xihongmen', ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      data_json = excluded.data_json,
      expires_at = excluded.expires_at,
      next_review_at = excluded.next_review_at,
      updated_at = CURRENT_TIMESTAMP
  `);
  const upsertActivityMaterial = db.prepare(`
    INSERT INTO activities (id, community_id, data_json, status, created_by)
    VALUES (?, 'xihongmen', ?, ?, 'staff_li')
    ON CONFLICT(id) DO UPDATE SET data_json = excluded.data_json, status = excluded.status
  `);
  const insertReviewField = db.prepare(`
    INSERT OR IGNORE INTO service_review_fields (service_id, field_key, status)
    VALUES (?, ?, 'pending')
  `);
  const insertOperation = db.prepare('INSERT OR IGNORE INTO activity_operations (activity_id) VALUES (?)');

  db.exec('BEGIN IMMEDIATE');
  try {
    for (const source of sourceFile.sources) upsertSource.run(source.source_id, JSON.stringify(source));

    for (const activity of activityFile.activities) {
      const source = sourcesById.get(activity.source_id);
      const isCompleted = completedStatuses.has(activity.status);
      const sourceLabel = source?.name || activity.provider;
      const publicService = {
        schemaVersion: activityFile.schema_version,
        id: activity.activity_id,
        dataKind: 'real_public_source',
        workflowMode: 'mvp',
        communityId: 'xihongmen',
        geoScope: activity.geo_scope,
        title: activity.title,
        shortTitle: shortTitle(activity.title),
        serviceType: activity.service_type,
        provider: activity.provider,
        audience: activity.audience,
        eligibility: activity.eligibility,
        schedule: {
          eventStart: activity.event_start,
          eventEnd: activity.event_end,
          signupStart: activity.signup_start,
          signupEnd: activity.signup_end,
        },
        location: activity.location,
        fee: activity.fee || '原文未公开，需向主办方确认',
        capacity: activity.capacity,
        registrationMethod: activity.registration_method || '原文未公开，需向主办方确认',
        source: {
          id: activity.source_id,
          label: sourceLabel,
          url: activity.source_url,
          publishedAt: activity.published_at,
          channelUrl: source?.source_url || null,
        },
        availability: {
          status: isCompleted ? 'ended' : 'needs_confirmation',
          sourceStatus: activity.status,
          basis: `${activity.status_basis}；该状态为公开信息快照，不代表实时余量。`,
          verifiedAt: activity.status_verified_at,
        },
        missingFields: activity.missing_fields,
        confidence: activity.confidence,
        review: { status: isCompleted ? 'archived_source' : 'needs_review', confirmedUnknownFields: [] },
        publication: { status: isCompleted ? 'archived' : 'draft' },
        demoUse: activity.demo_use,
        provenance: {
          datasetGeneratedAt: activityFile.generated_at,
          disclaimer: activityFile.status_disclaimer,
          noPartnershipImplied: true,
        },
      };
      const workflowStatus = isCompleted ? 'archived' : 'pending_review';
      upsertService.run(
        activity.activity_id,
        JSON.stringify(publicService),
        workflowStatus,
        expiryAt(activity),
        isCompleted ? null : nextReviewAt(activity.status_verified_at),
      );

      for (const field of ['core', 'fee', 'capacity', 'stationHours']) {
        insertReviewField.run(activity.activity_id, field);
      }

      const materialId = `material_${activity.activity_id}`;
      const activityMaterial = {
        id: materialId,
        name: activity.title,
        type: activityType(activity.service_type),
        time: dateLabel(activity.event_start, activity.event_end),
        location: activity.location,
        organizer: activity.provider,
        signedUp: 0,
        capacity: activity.capacity,
        status: isCompleted ? '历史活动素材' : '公开信息待核验',
        fee: activity.fee || '原文未公开，需向主办方确认',
        introduction: `${activity.status_basis}。适用对象：${activity.audience.join('、') || '原文未限定'}。报名或参与方式：${activity.registration_method || '需向主办方确认'}。`,
        activeMembers: [],
        materialOnly: true,
        sourceServiceId: activity.activity_id,
        sourceUrl: activity.source_url,
        sourceLabel,
        sourcePublishedAt: activity.published_at,
        statusVerifiedAt: activity.status_verified_at,
        sourceStatus: activity.status,
        missingFields: activity.missing_fields,
        availabilityNote: '公开来源素材，不代表已与主办方合作；余量与时段需再次核验。',
      };
      upsertActivityMaterial.run(
        materialId,
        JSON.stringify(activityMaterial),
        isCompleted ? 'archived_material' : 'source_material',
      );
      insertOperation.run(materialId);
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return { sources: sourceFile.sources.length, services: activityFile.activities.length, activityMaterials: activityFile.activities.length };
}
