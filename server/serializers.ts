import { db, getUser } from './db.ts';
import { json } from './utils.ts';
import { toTimeLabel } from './domain.ts';

export function listSpaces(communityId: string) {
  const rows = db.prepare('SELECT id, data_json FROM spaces WHERE community_id = ? AND active = 1').all(communityId) as Array<{ id: string; data_json: string }>;
  const bookings = db.prepare(`
    SELECT b.space_id, b.time_slot, u.name, u.room
    FROM space_bookings b JOIN users u ON u.id = b.user_id
    WHERE b.status = 'confirmed' AND b.space_id IN (SELECT id FROM spaces WHERE community_id = ?)
  `).all(communityId) as Array<{ space_id: string; time_slot: string; name: string; room: string }>;
  const reviews = db.prepare(`
    SELECT r.space_id, r.rating, r.comment, r.created_at, u.name, u.room
    FROM space_reviews r JOIN users u ON u.id = r.author_id
    WHERE r.space_id IN (SELECT id FROM spaces WHERE community_id = ?)
    ORDER BY r.created_at DESC
  `).all(communityId) as Array<{ space_id: string; rating: number; comment: string; created_at: string; name: string; room: string }>;
  return rows.map((row) => {
    const data = json<Record<string, any>>(row.data_json, {});
    const addedReviews = reviews.filter((review) => review.space_id === row.id);
    const originalReviews = Array.isArray(data.reviews) ? data.reviews : [];
    const combinedReviews = [
      ...addedReviews.map((review) => ({ rating: review.rating, comment: review.comment, authorName: review.name, authorRoom: review.room, date: toTimeLabel(review.created_at) })),
      ...originalReviews,
    ];
    const originalCount = Number(data.reviewsCount || 0);
    const originalRating = Number(data.rating || 0);
    const addedTotal = addedReviews.reduce((sum, review) => sum + review.rating, 0);
    const totalCount = originalCount + addedReviews.length;
    return {
      ...data,
      reviews: combinedReviews,
      reviewsCount: totalCount,
      rating: totalCount ? Number(((originalRating * originalCount + addedTotal) / totalCount).toFixed(1)) : originalRating,
      bookings: (data.bookings || []).map((slot: { timeSlot: string }) => {
        const booking = bookings.find((item) => item.space_id === row.id && item.time_slot === slot.timeSlot);
        return booking ? { ...slot, isBooked: true, bookerName: booking.name, bookerRoom: booking.room } : { ...slot, isBooked: false };
      }),
    };
  });
}

export function listLocalServices(communityId: string) {
  return (db.prepare('SELECT data_json FROM local_services WHERE community_id = ? AND active = 1').all(communityId) as Array<{ data_json: string }>)
    .map((row) => json(row.data_json, {}));
}

export function listActivities(communityId: string, userId: string) {
  const rows = db.prepare('SELECT id, data_json FROM activities WHERE community_id = ?').all(communityId) as Array<{ id: string; data_json: string }>;
  const registrations = db.prepare("SELECT activity_id, user_id FROM activity_registrations WHERE status = 'registered'").all() as Array<{ activity_id: string; user_id: string }>;
  return rows.map((row) => {
    const data = json<Record<string, any>>(row.data_json, {});
    const active = registrations.filter((registration) => registration.activity_id === row.id);
    return {
      ...data,
      signedUp: Number(data.signedUp || 0) + active.length,
      joinedByMe: active.some((registration) => registration.user_id === userId),
    };
  });
}

export function listAnnouncements(communityId: string) {
  return (db.prepare('SELECT data_json FROM announcements WHERE community_id = ? ORDER BY created_at DESC').all(communityId) as Array<{ data_json: string }>)
    .map((row) => json(row.data_json, {}));
}

export function listFeed(communityId: string, currentUserId: string) {
  const blocked = new Set((db.prepare('SELECT blocked_id FROM user_blocks WHERE blocker_id = ?').all(currentUserId) as Array<{ blocked_id: string }>).map((row) => row.blocked_id));
  const posts = db.prepare(`
    SELECT p.*, u.name AS author_name, u.room AS author_room, u.credit_score, u.help_count
    FROM posts p JOIN users u ON u.id = p.author_id
    WHERE p.community_id = ? AND p.status != 'hidden'
    ORDER BY p.created_at DESC
  `).all(communityId) as Array<Record<string, any>>;
  const comments = db.prepare(`
    SELECT c.*, u.name AS author_name, u.room AS author_room
    FROM post_comments c JOIN users u ON u.id = c.author_id
    WHERE c.post_id IN (SELECT id FROM posts WHERE community_id = ?)
    ORDER BY c.created_at
  `).all(communityId) as Array<Record<string, any>>;
  const likes = db.prepare('SELECT post_id, user_id FROM post_likes WHERE post_id IN (SELECT id FROM posts WHERE community_id = ?)').all(communityId) as Array<{ post_id: string; user_id: string }>;
  return posts.filter((post) => !blocked.has(post.author_id)).map((post) => {
    const meta = json<Record<string, any>>(post.metadata_json, {});
    const postLikes = likes.filter((like) => like.post_id === post.id);
    const isAuthor = post.author_id === currentUserId;
    const isHelper = post.helper_id === currentUserId;
    const actionStatus = post.status === 'claimed'
      ? isAuthor ? 'idle' : isHelper ? 'claimed' : 'success'
      : post.status === 'completed' ? 'success' : 'idle';
    const actionText = post.status === 'claimed'
      ? isAuthor ? '确认完成' : isHelper ? meta.actionText : undefined
      : post.status === 'completed' || post.status === 'cancelled' ? undefined
        : post.type === 'help' && isAuthor ? '取消需求' : meta.actionText;
    return {
      id: post.id,
      type: post.type,
      category: post.category || undefined,
      authorName: post.author_name,
      authorRoom: post.author_room,
      authorId: post.author_id,
      helperId: post.helper_id || undefined,
      distance: meta.distance ?? 50,
      time: toTimeLabel(post.created_at),
      content: post.content,
      image: post.image || undefined,
      likes: post.base_likes + postLikes.length,
      hasLiked: postLikes.some((like) => like.user_id === currentUserId),
      comments: comments.filter((comment) => comment.post_id === post.id).map((comment) => ({
        id: comment.id,
        authorName: comment.author_name,
        authorRoom: comment.author_room,
        content: comment.content,
        time: toTimeLabel(comment.created_at),
      })),
      meetingTime: post.meeting_time || undefined,
      bountyPoints: post.bounty_points || undefined,
      creditScore: post.credit_score,
      helpCount: post.help_count,
      actionText,
      actionStatus,
      helpStatus: post.status,
      tags: meta.tags || [],
    };
  });
}

export function listConversations(communityId: string, userId: string) {
  const rows = db.prepare(`
    SELECT c.* FROM conversations c
    JOIN conversation_members cm ON cm.conversation_id = c.id
    WHERE c.community_id = ? AND cm.user_id = ?
    ORDER BY COALESCE((SELECT MAX(created_at) FROM messages m WHERE m.conversation_id = c.id), c.created_at) DESC
  `).all(communityId, userId) as Array<Record<string, any>>;
  return rows.map((conversation) => {
    const messages = db.prepare(`
      SELECT m.*, u.name AS sender_name FROM messages m
      LEFT JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ? ORDER BY m.created_at
    `).all(conversation.id) as Array<Record<string, any>>;
    const members = db.prepare(`
      SELECT u.id, u.name, u.room FROM conversation_members cm JOIN users u ON u.id = cm.user_id
      WHERE cm.conversation_id = ?
    `).all(conversation.id) as Array<{ id: string; name: string; room: string }>;
    const counterpart = members.find((member) => member.id !== userId);
    const last = messages[messages.length - 1];
    return {
      id: conversation.id,
      name: conversation.name || counterpart?.name || '邻里会话',
      type: conversation.type,
      avatar: conversation.type === 'group' ? '👥' : counterpart?.name?.charAt(0) || '邻',
      lastMessage: last?.content || '暂无消息',
      lastTime: last ? toTimeLabel(last.created_at) : '',
      unreadCount: 0,
      subLabel: conversation.reference_type === 'help' ? '邻里互助' : conversation.type === 'group' ? '活动群聊' : '邻里私聊',
      messages: messages.map((message) => ({
        id: message.id,
        sender: message.sender_id === userId ? '我' : message.sender_name || '系统',
        content: message.content,
        time: toTimeLabel(message.created_at),
        isMe: message.sender_id === userId,
      })),
    };
  });
}

export function weeklyReport(communityId: string) {
  const activeUsers = (db.prepare(`SELECT COUNT(DISTINCT actor_id) AS count FROM audit_logs WHERE community_id = ? AND created_at >= datetime('now', '-7 days')`).get(communityId) as { count: number }).count;
  const helpRequests = (db.prepare("SELECT COUNT(*) AS count FROM posts WHERE community_id = ? AND type = 'help' AND created_at >= datetime('now', '-7 days')").get(communityId) as { count: number }).count;
  const helpCompleted = (db.prepare("SELECT COUNT(*) AS count FROM posts WHERE community_id = ? AND type = 'help' AND status = 'completed' AND updated_at >= datetime('now', '-7 days')").get(communityId) as { count: number }).count;
  const feedPosts = (db.prepare("SELECT COUNT(*) AS count FROM posts WHERE community_id = ? AND created_at >= datetime('now', '-7 days')").get(communityId) as { count: number }).count;
  const spaceRatings = listSpaces(communityId).map((space: any) => Number(space.rating || 0)).filter((rating) => rating > 0);
  const activeBuildings = (db.prepare(`
    SELECT substr(u.room, 1, instr(u.room || '-', '-') - 1) AS building, COUNT(a.id) AS count
    FROM audit_logs a JOIN users u ON u.id = a.actor_id
    WHERE a.community_id = ? AND a.created_at >= datetime('now', '-7 days') AND instr(u.room || '-', '-') > 1
    GROUP BY building ORDER BY count DESC LIMIT 3
  `).all(communityId) as Array<{ building: string; count: number }>).map((item) => ({ building: `${item.building}号楼`, count: item.count }));
  const followUpItems = (db.prepare(`
    SELECT title, status FROM social_work_tasks WHERE community_id = ? AND status NOT IN ('completed', 'cancelled') ORDER BY due_at LIMIT 5
  `).all(communityId) as Array<{ title: string; status: string }>).map((item) => `${item.title}（${item.status}）`);
  const hotTopics = (db.prepare(`
    SELECT substr(content, 1, 18) AS topic, base_likes + (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id) AS count
    FROM posts p WHERE community_id = ? AND type IN ('topic', 'moment') AND status != 'hidden'
    ORDER BY count DESC LIMIT 3
  `).all(communityId) as Array<{ topic: string; count: number }>);
  return {
    weekRange: '最近 7 天',
    activeUsers,
    newUser: (db.prepare("SELECT COUNT(*) AS count FROM users u JOIN community_memberships m ON m.user_id = u.id WHERE m.community_id = ? AND u.created_at >= datetime('now', '-7 days')").get(communityId) as { count: number }).count,
    retention: '待试点统计',
    helpRequests,
    helpCompleted,
    helpRate: helpRequests ? `${Math.round(helpCompleted / helpRequests * 100)}%` : '0%',
    feedPosts,
    activitiesCount: (db.prepare('SELECT COUNT(*) AS count FROM activities WHERE community_id = ?').get(communityId) as { count: number }).count,
    satisfaction: spaceRatings.length ? Number((spaceRatings.reduce((sum, rating) => sum + rating, 0) / spaceRatings.length).toFixed(1)) : 0,
    hotTopics,
    activeBuildings,
    residentDemands: (db.prepare(`SELECT COALESCE(category, '其他') AS demand, COUNT(*) AS count FROM posts WHERE community_id = ? AND type = 'help' GROUP BY category ORDER BY count DESC LIMIT 3`).all(communityId) as Array<{ demand: string; count: number }>),
    followUpItems,
  };
}

export function residentBootstrap(userId: string) {
  const user = getUser(userId);
  if (!user) return null;
  return {
    user,
    spaces: listSpaces(user.communityId),
    services: listLocalServices(user.communityId),
    events: listActivities(user.communityId, userId),
    feedItems: listFeed(user.communityId, userId),
    announcements: listAnnouncements(user.communityId),
    chatSessions: listConversations(user.communityId, userId),
    weeklyReport: weeklyReport(user.communityId),
  };
}
