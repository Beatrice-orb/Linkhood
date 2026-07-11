export interface UserProfile {
  id: string;
  name: string;
  room: string; // e.g., '3-502'
  age: number;
  profession: string;
  tags: string[];
  creditScore: number;
  points: number;
  helpCount: number;
  frequency: string;
  badges: string[];
  joinedDays: number;
  isMe?: boolean;
}

export interface Review {
  rating: number;
  comment: string;
  authorName: string;
  authorRoom: string;
  date: string;
}

export interface Booking {
  timeSlot: string;
  isBooked: boolean;
  bookerName?: string;
  bookerRoom?: string;
}

export interface Space {
  id: string;
  name: string;
  location: string;
  time: string;
  bookingMethod: string;
  capacity: string;
  facilities: string[];
  status: '开放中' | '开放预约' | '可预约' | '使用中' | '认领中';
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  bookings: Booking[];
  description: string;
  notices: string[];
  image: string; // Tailwind color grade or emoji representation
}

export interface Service {
  id: string;
  name: string;
  type: string;
  location: string;
  hours: string;
  phone: string;
  rating: number;
  tags: string[];
  reviews: string[];
  hasDiscount: boolean;
  discountText: string;
  image: string;
}

export interface Event {
  id: string;
  name: string;
  type: string;
  time: string;
  location: string;
  organizer: string;
  signedUp: number;
  capacity: number;
  status: '报名中' | '即将满员' | '长期有效' | '已截止';
  fee: string;
  introduction: string;
  activeMembers: string[];
  joinedByMe?: boolean;
}

export interface FeedComment {
  id: string;
  authorName: string;
  authorRoom?: string;
  content: string;
  replyTo?: string;
  time?: string;
}

export interface FeedItem {
  id: string;
  type: 'help' | 'moment' | 'rally' | 'topic';
  category?: '拼单' | '代取' | '照看' | '闲置' | '交换';
  authorName: string;
  authorRoom: string;
  distance: number;
  time: string;
  content: string;
  image?: string; // Icon or color string
  likes: number;
  hasLiked?: boolean;
  comments: FeedComment[];
  commentsCount?: number;
  meetingTime?: string;
  bountyPoints?: number;
  creditScore?: number;
  helpCount?: number;
  expiresHour?: number;
  actionText?: string;
  actionStatus?: 'idle' | 'success' | 'claimed'; // claimed means helped by me
  tags?: string[];
  authorId?: string;
  helperId?: string;
  helpStatus?: 'active' | 'claimed' | 'completed' | 'cancelled' | 'expired' | 'hidden';
}

export interface Announcement {
  id: string;
  type: '停水通知' | '活动通知' | '安全提醒' | '公告' | '活动回顾' | '紧急';
  title: string;
  content: string;
  time: string;
  importance: '🔴重要' | '🔴紧急' | '🟡一般' | '🟢已结束';
}

export interface WeeklyReport {
  weekRange: string;
  activeUsers: number;
  newUser: number;
  retention: string;
  helpRequests: number;
  helpCompleted: number;
  helpRate: string;
  feedPosts: number;
  activitiesCount: number;
  satisfaction: number;
  hotTopics: { topic: string; count: number }[];
  activeBuildings: { building: string; count: number }[];
  residentDemands: { demand: string; count: number }[];
  followUpItems: string[];
}
