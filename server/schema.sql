PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS communities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  room TEXT,
  age INTEGER,
  profession TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  credit_score INTEGER NOT NULL DEFAULT 80 CHECK (credit_score BETWEEN 0 AND 100),
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  help_count INTEGER NOT NULL DEFAULT 0,
  badges_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_memberships (
  community_id TEXT NOT NULL REFERENCES communities(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('resident', 'social_worker', 'community_operator', 'admin')),
  verified INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public_services (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id),
  data_json TEXT NOT NULL,
  workflow_status TEXT NOT NULL DEFAULT 'draft' CHECK (workflow_status IN ('draft', 'pending_review', 'approved', 'published', 'expired', 'withdrawn', 'archived')),
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  published_by TEXT REFERENCES users(id),
  published_at TEXT,
  expires_at TEXT,
  next_review_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_review_fields (
  service_id TEXT NOT NULL REFERENCES public_services(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'unknown_confirmed')),
  reviewer_id TEXT REFERENCES users(id),
  reviewed_at TEXT,
  PRIMARY KEY (service_id, field_key)
);

CREATE TABLE IF NOT EXISTS resident_service_actions (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES public_services(id),
  community_id TEXT NOT NULL REFERENCES communities(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('view_card', 'view_source', 'express_interest', 'withdraw_interest')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resident_service_interests (
  service_id TEXT NOT NULL REFERENCES public_services(id),
  community_id TEXT NOT NULL REFERENCES communities(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (service_id, user_id)
);

CREATE TABLE IF NOT EXISTS social_work_tasks (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id),
  resident_id TEXT REFERENCES users(id),
  service_id TEXT REFERENCES public_services(id),
  assignee_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'submitted', 'approved', 'rejected', 'completed', 'cancelled')),
  due_at TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visit_records (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES social_work_tasks(id),
  author_id TEXT NOT NULL REFERENCES users(id),
  facts TEXT NOT NULL,
  resident_quote TEXT NOT NULL,
  worker_assessment TEXT NOT NULL DEFAULT '',
  uncertain_notes TEXT NOT NULL DEFAULT '',
  consent_confirmed INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spaces (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id),
  data_json TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS space_bookings (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_space_slot ON space_bookings(space_id, time_slot) WHERE status = 'confirmed';

CREATE TABLE IF NOT EXISTS space_reviews (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id),
  author_id TEXT NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS local_services (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id),
  data_json TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id),
  data_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  created_by TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS activity_registrations (
  activity_id TEXT NOT NULL REFERENCES activities(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended', 'waitlisted')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (activity_id, user_id)
);

CREATE TABLE IF NOT EXISTS activity_operations (
  activity_id TEXT PRIMARY KEY REFERENCES activities(id) ON DELETE CASCADE,
  checklist_json TEXT NOT NULL DEFAULT '{"qrCode":false,"venue":false,"speaker":false}',
  notice_sent INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id),
  data_json TEXT NOT NULL,
  published_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id),
  author_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('help', 'moment', 'rally', 'topic')),
  category TEXT,
  content TEXT NOT NULL,
  image TEXT,
  meeting_time TEXT,
  bounty_points INTEGER NOT NULL DEFAULT 0,
  escrow_status TEXT NOT NULL DEFAULT 'none' CHECK (escrow_status IN ('none', 'held', 'released', 'refunded')),
  expires_at TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'completed', 'cancelled', 'expired', 'hidden')),
  helper_id TEXT REFERENCES users(id),
  base_likes INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_reports (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id),
  reporter_id TEXT NOT NULL REFERENCES users(id),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'comment', 'message', 'user')),
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  handled_by TEXT REFERENCES users(id),
  handled_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id TEXT NOT NULL REFERENCES users(id),
  blocked_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS point_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  delta INTEGER NOT NULL,
  score_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_rewards (
  user_id TEXT NOT NULL REFERENCES users(id),
  reward_key TEXT NOT NULL,
  claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, reward_key)
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id),
  type TEXT NOT NULL CHECK (type IN ('private', 'group', 'system')),
  name TEXT,
  reference_type TEXT,
  reference_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  last_read_at TEXT,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES users(id),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  read_at TEXT,
  reference_type TEXT,
  reference_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  community_id TEXT REFERENCES communities(id),
  actor_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  detail_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_actions_service ON resident_service_actions(service_id, action_type, created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON social_work_tasks(assignee_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
