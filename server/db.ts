import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DATABASE_PATH, ROOT_DIR } from './config.ts';
import { id, json } from './utils.ts';
import {
  mockAnnouncements,
  mockEvents,
  mockFeedItems,
  mockServices,
  mockSpaces,
  mockUsers,
} from '../src/mockData.ts';
import { primaryService, secondaryServices } from '../src/demo/fixtures.ts';

fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });

export const db = new DatabaseSync(DATABASE_PATH);
db.exec(fs.readFileSync(path.join(ROOT_DIR, 'server', 'schema.sql'), 'utf8'));

function seed() {
  const exists = db.prepare('SELECT COUNT(*) AS count FROM communities').get() as { count: number };
  if (exists.count > 0) return;

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('INSERT INTO communities (id, name, district) VALUES (?, ?, ?)')
      .run('xihongmen', '西红门社区', '北京市大兴区');

    const extraUsers = [
      { id: 'staff_li', name: '李敏', room: '社区服务中心', age: 34, profession: '社区运营', tags: ['公共服务', '活动运营'], creditScore: 100, points: 0, helpCount: 0, badges: ['社区运营'] },
      { id: 'social_li', name: '李老师', room: '社工服务站', age: 32, profession: '社区社工', tags: ['居民走访', '服务跟进'], creditScore: 100, points: 0, helpCount: 0, badges: ['认证社工'] },
      { id: 'admin_1', name: '平台管理员', room: '平台', age: 30, profession: '平台管理', tags: ['系统管理'], creditScore: 100, points: 0, helpCount: 0, badges: ['管理员'] },
    ];
    const users = [...mockUsers, ...extraUsers];
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, room, age, profession, tags_json, credit_score, points, help_count, badges_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMembership = db.prepare('INSERT INTO community_memberships (community_id, user_id, role) VALUES (?, ?, ?)');
    for (const user of users) {
      insertUser.run(user.id, user.name, user.room, user.age, user.profession, JSON.stringify(user.tags), user.creditScore, user.points, user.helpCount, JSON.stringify(user.badges));
      const role = user.id === 'staff_li' ? 'community_operator' : user.id === 'social_li' ? 'social_worker' : user.id === 'admin_1' ? 'admin' : 'resident';
      insertMembership.run('xihongmen', user.id, role);
      db.prepare('INSERT INTO point_transactions (id, user_id, amount, balance_after, reason, reference_type) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id('pt'), user.id, user.points, user.points, '账户初始化', 'seed');
    }

    const insertSpace = db.prepare('INSERT INTO spaces (id, community_id, data_json) VALUES (?, ?, ?)');
    const insertBooking = db.prepare('INSERT OR IGNORE INTO space_bookings (id, space_id, user_id, time_slot) VALUES (?, ?, ?, ?)');
    for (const space of mockSpaces) {
      insertSpace.run(space.id, 'xihongmen', JSON.stringify({
        ...space,
        bookings: space.bookings.map((booking) => ({ timeSlot: booking.timeSlot, isBooked: false })),
      }));
      for (const booking of space.bookings.filter((item) => item.isBooked)) {
        const matched = mockUsers.find((user) => user.name === booking.bookerName);
        if (matched) insertBooking.run(id('booking'), space.id, matched.id, booking.timeSlot);
      }
    }

    const insertLocalService = db.prepare('INSERT INTO local_services (id, community_id, data_json) VALUES (?, ?, ?)');
    for (const service of mockServices) insertLocalService.run(service.id, 'xihongmen', JSON.stringify(service));

    const insertActivity = db.prepare('INSERT INTO activities (id, community_id, data_json, created_by) VALUES (?, ?, ?, ?)');
    for (const activity of mockEvents) insertActivity.run(activity.id, 'xihongmen', JSON.stringify(activity), 'staff_li');
    insertActivity.run('event_anti_fraud', 'xihongmen', JSON.stringify({
      id: 'event_anti_fraud', name: '银龄反诈小课堂', type: '公益课堂', time: '7/11 14:00-16:00',
      location: '西红门党群服务中心', organizer: '西红门社区', signedUp: 38, capacity: 50,
      status: '报名中', fee: '免费', introduction: '面向社区长者的防诈骗公益课堂。', activeMembers: [], joinedByMe: false,
    }), 'staff_li');
    db.prepare('INSERT INTO activity_operations (activity_id, checklist_json) VALUES (?, ?)')
      .run('event_anti_fraud', JSON.stringify({ qrCode: true, venue: true, speaker: false }));
    db.prepare("INSERT INTO activity_registrations (activity_id, user_id, status) VALUES ('event_anti_fraud', ?, 'registered')")
      .run('user_zhangayi');
    db.prepare("INSERT INTO activity_registrations (activity_id, user_id, status) VALUES ('event_anti_fraud', ?, 'registered')")
      .run('user_wangshu');

    const insertAnnouncement = db.prepare('INSERT INTO announcements (id, community_id, data_json, published_by) VALUES (?, ?, ?, ?)');
    for (const announcement of mockAnnouncements) insertAnnouncement.run(announcement.id, 'xihongmen', JSON.stringify(announcement), 'staff_li');

    const insertPost = db.prepare(`
      INSERT INTO posts (id, community_id, author_id, type, category, content, image, meeting_time, bounty_points, status, base_likes, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);
    const insertComment = db.prepare('INSERT INTO post_comments (id, post_id, author_id, content) VALUES (?, ?, ?, ?)');
    mockFeedItems.forEach((post, index) => {
      const author = mockUsers.find((user) => user.name === post.authorName) || mockUsers[0];
      insertPost.run(
        post.id,
        'xihongmen',
        author.id,
        post.type,
        post.category || null,
        post.content,
        post.image || null,
        post.meetingTime || null,
        post.bountyPoints || 0,
        post.actionStatus === 'claimed' ? 'claimed' : 'active',
        post.likes,
        JSON.stringify({ distance: post.distance, actionText: post.actionText, tags: post.tags || [] }),
        `-${index + 1} hours`,
      );
      for (const comment of post.comments) {
        const commentAuthor = mockUsers.find((user) => user.name === comment.authorName) || mockUsers[0];
        insertComment.run(comment.id, post.id, commentAuthor.id, comment.content);
      }
    });

    const insertPublicService = db.prepare(`
      INSERT INTO public_services (id, community_id, data_json, workflow_status, reviewed_by, reviewed_at, published_by, published_at, next_review_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPublicService.run(primaryService.id, 'xihongmen', JSON.stringify(primaryService), 'draft', null, null, null, null, '2026-07-14T00:00:00.000Z');
    for (const service of secondaryServices) {
      insertPublicService.run(service.id, 'xihongmen', JSON.stringify(service), 'published', 'staff_li', service.review.reviewedAt || new Date().toISOString(), 'staff_li', service.publication.publishedAt || new Date().toISOString(), '2026-07-18T00:00:00.000Z');
    }
    for (const field of ['core', 'fee', 'capacity', 'stationHours']) {
      db.prepare('INSERT INTO service_review_fields (service_id, field_key, status) VALUES (?, ?, ?)').run(primaryService.id, field, 'pending');
    }

    db.prepare(`
      INSERT INTO social_work_tasks (id, community_id, resident_id, assignee_id, title, description, status, due_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('task_visit_a017', 'xihongmen', 'user_zhangayi', 'social_li', '助餐需求走访跟进', '核验助餐申请资格与所需材料，不自动作出资格结论。', 'in_progress', '2026-07-17T18:00:00.000Z', 'staff_li');

    seedConversations();
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function seedConversations() {
  const conversations = [
    { id: 'chat_system_1', type: 'private', name: '居委会小张', members: ['user_xiaoya', 'staff_li'], messages: [
      ['staff_li', '您好，欢迎咨询！请问有什么我可以帮到您的？'],
      ['user_xiaoya', '小张您好，我想咨询一下青年人才租房补贴申请流程。'],
      ['staff_li', '已收到您的咨询。建议先准备实名认证和社保缴纳证明，我会同步最新指南。'],
    ] },
    { id: 'chat_ajie_1', type: 'private', name: '阿杰 (3-308)', members: ['user_xiaoya', 'user_ajie'], messages: [
      ['user_ajie', '小雅，听说你要拼牛肉卷？算我一个！'],
      ['user_xiaoya', '好呀！那下班回家顺路带上。'],
      ['user_ajie', '收到啦，六点半我拿到 502 给你。'],
    ] },
    { id: 'chat_group_1', type: 'group', name: '周末烘焙分享群', members: ['user_xiaoya', 'user_ajie', 'user_ahua'], messages: [
      [null, '“周末烘焙课”活动群聊已创建。'],
      ['user_xiaoya', '这周六下午两点，共享厨房，不见不散！'],
      ['user_ahua', '我会准时参加，顺便带个保温盒！'],
    ] },
  ];
  for (const conversation of conversations) {
    db.prepare('INSERT INTO conversations (id, community_id, type, name) VALUES (?, ?, ?, ?)').run(conversation.id, 'xihongmen', conversation.type, conversation.name);
    for (const member of conversation.members) db.prepare('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)').run(conversation.id, member);
    conversation.messages.forEach(([senderId, content], index) => {
      db.prepare("INSERT INTO messages (id, conversation_id, sender_id, content, created_at) VALUES (?, ?, ?, ?, datetime('now', ?))")
        .run(id('msg'), conversation.id, senderId, content, `-${conversation.messages.length - index} hours`);
    });
  }
}

seed();

export function getUser(userId: string) {
  const row = db.prepare(`
    SELECT u.*, m.community_id, m.role, m.verified
    FROM users u JOIN community_memberships m ON m.user_id = u.id
    WHERE u.id = ? AND u.status = 'active'
  `).get(userId) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: row.id as string,
    name: row.name as string,
    room: row.room as string,
    age: row.age as number,
    profession: row.profession as string,
    tags: json<string[]>(row.tags_json as string, []),
    creditScore: row.credit_score as number,
    points: row.points as number,
    helpCount: row.help_count as number,
    badges: json<string[]>(row.badges_json as string, []),
    frequency: '实时',
    joinedDays: 0,
    isMe: false,
    communityId: row.community_id as string,
    role: row.role as string,
    verified: Boolean(row.verified),
  };
}
