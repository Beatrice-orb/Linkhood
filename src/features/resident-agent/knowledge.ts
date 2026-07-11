import type { DepartmentRoute, ResidentAgentSourceRef } from './types';

export interface ResidentKnowledgeRecord {
  id: string;
  kind: 'service' | 'activity' | 'place' | 'policy';
  title: string;
  userGoals: string[];
  supportedTasks: string[];
  schedule?: string;
  location?: string;
  format?: string;
  interactionStyle?: string;
  privacyRules?: string[];
  participationMethod?: string;
  capacityStatus?: string;
  caveats?: string[];
  source: ResidentAgentSourceRef;
}

export const DIGITAL_SERVICE_SOURCE: ResidentAgentSourceRef = {
  id: 'demo-digital-life-service-2026-07',
  label: '社区数字生活服务演示清单',
  verifiedAt: '2026-07-12',
  isDemo: true,
};

export const COMMUNITY_ACTIVITY_SOURCE: ResidentAgentSourceRef = {
  id: 'demo-neighbour-activity-2026-07',
  label: '社区邻里活动演示目录',
  verifiedAt: '2026-07-12',
  isDemo: true,
};

export const COMMUNITY_ROUTE_SOURCE: ResidentAgentSourceRef = {
  id: 'demo-community-route-directory-2026-07',
  label: '社区服务联系目录（演示）',
  verifiedAt: '2026-07-12',
  isDemo: true,
};

export const RESIDENT_KNOWLEDGE: ResidentKnowledgeRecord[] = [
  {
    id: 'digital-helpdesk-weekday',
    kind: 'service',
    title: '数字生活帮办桌',
    userGoals: ['独立挂号', '生活缴费页面导航', '乘车码使用'],
    supportedTasks: ['医院小程序挂号', '水电缴费入口定位', '乘车码打开'],
    schedule: '每周二、周四 14:00—16:00',
    location: '党群服务中心一层，从社区南门步行约 6 分钟',
    format: '一对一短时陪练，每次约 20 分钟',
    interactionStyle: '围绕居民自己的两三个生活任务逐步练习，不是大班讲座',
    privacyRules: ['居民本人持机操作', '不索要或保存密码、短信验证码', '不代替居民付款'],
    participationMethod: '第一次可直接到一层帮办桌，建议把最想学的两件事写在纸上',
    capacityStatus: '现场时段可能排队，无实时余量数据',
    source: DIGITAL_SERVICE_SOURCE,
  },
  {
    id: 'safe-phone-saturday',
    kind: 'activity',
    title: '手机安心用小课堂',
    userGoals: ['周末陪同学习', '挂号与缴费练习', '付款安全'],
    supportedTasks: ['挂号演示', '生活缴费演示', '纸质步骤卡复练'],
    schedule: '2026 年 7 月 25 日周六 09:30；10:20 后安排一对一练习',
    location: '党群服务中心一层多功能室',
    format: '前 40 分钟演示页面讲解，之后一对一练习',
    interactionStyle: '家属可陪同，先一起操作，再让居民照纸质步骤卡重做',
    privacyRules: ['居民始终自己拿手机', '付款可停在确认页', '不查看密码或验证码'],
    participationMethod: '无需连续报课；本周场次需向社区民生服务岗确认',
    capacityStatus: '当前资料没有实时名额',
    source: DIGITAL_SERVICE_SOURCE,
  },
  {
    id: 'community-center-access',
    kind: 'place',
    title: '党群服务中心无障碍到达信息',
    userGoals: ['就近到达', '减少楼梯与绕行'],
    supportedTasks: ['一层直接进入', '南门步行路线'],
    location: '从社区南门步行约 6 分钟，一层入口可直接进入',
    source: DIGITAL_SERVICE_SOURCE,
  },
  {
    id: 'digital-service-privacy-policy',
    kind: 'policy',
    title: '数字帮办隐私与付款边界',
    userGoals: ['安全学习数字服务'],
    supportedTasks: ['操作引导', '演示页面练习'],
    privacyRules: ['工作人员不接管手机', '不询问密码和验证码', '不代居民完成交易'],
    source: DIGITAL_SERVICE_SOURCE,
  },
  {
    id: 'neighbour-exchange-table',
    kind: 'activity',
    title: '邻里交换桌',
    userGoals: ['低压力认识邻居', '独自参加社区活动'],
    supportedTasks: ['社区地图任务', '闲置小物交换', '主持人协助加入小组'],
    schedule: '每周日 16:30，约 45 分钟',
    location: '党群服务中心庭院',
    format: '无需连续报名，不轮流自我介绍，可中途离开',
    interactionStyle: '第一次参加可领取地图任务卡，由主持人安排两三人共同完成',
    capacityStatus: '当前资料没有实时人数',
    source: COMMUNITY_ACTIVITY_SOURCE,
  },
];

export const DEPARTMENT_DIRECTORY: Record<string, DepartmentRoute> = {
  public_service: {
    departmentId: 'public_service',
    departmentName: '社区民生服务岗',
    phoneDisplay: '010-0000-1001',
    serviceHours: '工作日 09:00—18:00',
    isDemo: true,
  },
  activity_operations: {
    departmentId: 'activity_operations',
    departmentName: '社区活动运营岗',
    phoneDisplay: '010-0000-1024',
    serviceHours: '工作日 09:00—18:00',
    isDemo: true,
  },
};

export const PRIMARY_DEMO_PROMPTS = [
  '我妈刚搬来这边，手机就会接电话。我白天上班，她想学会自己挂号、交水电费，但那种大课她肯定跟不上。社区有没有人能慢慢教？最好别跑太远。',
  '她下午一两点一般要休息，我也不太放心她自己弄付款的东西。我只有周六上午能陪她，那是不是就没合适的了？',
] as const;

export const BACKUP_DEMO_PROMPTS = [
  '我搬来快两个月了，周末还是一个人都不认识。想参加点社区活动，但我最怕一上来就轮流自我介绍，也不想一报名就连上十节课，有没有松一点的？',
  '我周日上午有事，下午四点以后才行。一个人过去会不会大家都已经认识，反而更尴尬？',
] as const;
