export type Role = 'STREET_STAFF' | 'COMMUNITY_STAFF' | 'PARTY_CENTER_OPERATOR' | 'WOMEN_FEDERATION';

export interface User {
  name: string;
  phone: string;
  role: Role;
  community: string;
}

export interface Metric {
  label: string;
  value: string | number;
  trend: number; // positive for up, negative for down, 0 for neutral
  trendLabel: string;
  source: string;
}

export interface TodoItem {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  source: string; // '活动管理' | '需求反馈' | '关怀版数据' | '帮扶管理'
  time: string;
  status: 'pending' | 'resolved';
}

export interface Activity {
  id: string;
  name: string;
  time: string;
  location: string;
  description: string;
  limit: number;
  registered: number;
  signedIn: number;
  organizer: string;
  status: '报名中' | '进行中' | '已结束';
  registrants: {
    name: string;
    phone: string;
    time: string;
    signedIn: boolean;
  }[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: '停水停电' | '活动通知' | '政策宣传' | '安全提醒';
  isScheduled: boolean;
  publishTime: string;
  isImportant: boolean;
  readCount: number;
  unreadCount: number;
}

export interface Space {
  id: string;
  name: string;
  location: string;
  openHours: string;
  capacity: number;
  facilities: string[];
  photo: string; // Emoji representing space category
  bookingType: string;
  status: '开放中' | '已满' | '维护中';
}

export interface Service {
  id: string;
  name: string;
  category: '便民商超' | '餐饮美食' | '家政维修' | '健康医疗' | '其他';
  location: string;
  hours: string;
  phone: string;
  tags: string[];
  discount: string;
  isRecommended: boolean;
}

export interface SocialWorker {
  id: string;
  name: string;
  role: string;
  area: string;
  schedule: string;
  phone: string;
  services: string[];
}

export interface Resident {
  id: string;
  name: string;
  building: string;
  room: string;
  phone: string;
  registerTime: string;
  activityCount: number;
  creditScore: number;
  redFlowers: number;
  goodReviews: number;
  tags: ('独居老人' | '困难家庭' | '志愿者' | '党员' | '退役军人' | '中青年')[];
  status: '活跃' | '常态' | '低频';
}

export interface AntiFraudReminder {
  id: string;
  content: string;
  publishDate: string;
  isActive: boolean;
  views: number;
}

export interface Feedback {
  id: string;
  residentName: string;
  residentPhone: string;
  building: string;
  room: string;
  question: string;
  helpNeeded?: string;
  time: string;
  image?: string;
  status: '待处理' | '处理中' | '已解决';
  replies: {
    sender: 'staff' | 'resident';
    content: string;
    time: string;
  }[];
}

export interface Hotline {
  id: string;
  name: string;
  phone: string;
  category: string;
}
