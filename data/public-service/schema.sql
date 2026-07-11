-- 搭把手：公共服务供给最小数据库（SQLite demo schema）
-- 目标：支持公开来源 -> 服务项目 -> 多场次活动。
-- 边界：本 schema 不保存居民 PII、互助聊天或社工个案。

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS public_service_sources (
  source_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  org_level TEXT NOT NULL,
  channel_type TEXT NOT NULL,
  evidence_url TEXT NOT NULL,
  canonical_channel_url TEXT,
  wechat_name TEXT,
  wechat_alias TEXT,
  wechat_verified INTEGER CHECK (wechat_verified IN (0, 1) OR wechat_verified IS NULL),
  domains_json TEXT NOT NULL DEFAULT '[]',
  ingestion_priority TEXT NOT NULL,
  collection_mode TEXT,
  source_verified_at TEXT,
  partnership_status TEXT NOT NULL DEFAULT 'public_source_only'
    CHECK (partnership_status IN ('public_source_only', 'contacted', 'authorized', 'partner'))
);

CREATE TABLE IF NOT EXISTS service_items (
  item_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  item_kind TEXT NOT NULL DEFAULT 'activity'
    CHECK (item_kind IN ('activity', 'facility', 'service', 'recruitment', 'consultation', 'public_participation')),
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  category TEXT,
  service_type_raw TEXT NOT NULL,
  geo_scope TEXT NOT NULL,
  location_text TEXT,
  audience_json TEXT NOT NULL DEFAULT '[]',
  eligibility TEXT,
  fee_text TEXT,
  registration_method TEXT,
  source_url TEXT NOT NULL,
  published_at TEXT,
  event_start TEXT,
  event_end TEXT,
  signup_start TEXT,
  signup_end TEXT,
  capacity_total INTEGER,
  lifecycle_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (lifecycle_status IN ('open', 'upcoming', 'ended', 'paused', 'unknown')),
  availability_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (availability_status IN ('confirmed', 'unknown', 'full', 'not_applicable')),
  status_raw TEXT NOT NULL,
  status_basis TEXT,
  status_verified_at TEXT NOT NULL,
  confidence TEXT NOT NULL
    CHECK (confidence IN ('high', 'medium', 'low')),
  missing_fields_json TEXT NOT NULL DEFAULT '[]',
  quality_flags_json TEXT NOT NULL DEFAULT '[]',
  demo_use TEXT,
  FOREIGN KEY (source_id) REFERENCES public_service_sources(source_id)
);

CREATE TABLE IF NOT EXISTS service_sessions (
  session_id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  start_at TEXT,
  end_at TEXT,
  signup_start TEXT,
  signup_end TEXT,
  capacity_total INTEGER,
  spots_remaining INTEGER,
  availability_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (availability_status IN ('confirmed', 'unknown', 'full', 'not_applicable')),
  status_verified_at TEXT,
  FOREIGN KEY (item_id) REFERENCES service_items(item_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_service_items_source
  ON service_items(source_id);

CREATE INDEX IF NOT EXISTS idx_service_items_category_status
  ON service_items(category, lifecycle_status);

CREATE INDEX IF NOT EXISTS idx_service_items_geo_status
  ON service_items(geo_scope, lifecycle_status);

CREATE INDEX IF NOT EXISTS idx_service_items_verified_at
  ON service_items(status_verified_at);

CREATE INDEX IF NOT EXISTS idx_service_sessions_item_start
  ON service_sessions(item_id, start_at);

CREATE VIEW IF NOT EXISTS demo_actionable_service_items AS
SELECT
  item_id,
  title,
  provider,
  category,
  geo_scope,
  location_text,
  audience_json,
  event_start,
  event_end,
  registration_method,
  source_url,
  lifecycle_status,
  availability_status,
  status_verified_at,
  missing_fields_json
FROM service_items
WHERE lifecycle_status IN ('open', 'upcoming');
