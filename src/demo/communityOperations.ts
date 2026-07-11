export type DesktopRoute = 'workbench' | 'services' | 'activities' | 'records' | 'insights';

type DemoObject = { isDemo: true };
type WorkTaskCategory = 'service' | 'activity' | 'record' | 'feedback';

export interface WorkTask extends DemoObject {
  id: string;
  category: WorkTaskCategory;
  title: string;
  summary: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'waiting_confirmation' | 'done';
  ownerRole: string;
  dueAt: string;
  route: DesktopRoute;
  actionLabel: string;
  relatedRecordId?: string;
}

export interface RecordTimelineItem extends DemoObject {
  occurredAt: string;
  title: string;
  note: string;
  actorRole: string;
}

export interface RecordServiceItem extends DemoObject {
  id: string;
  title: string;
  status: 'matching' | 'scheduled' | 'in_service' | 'completed' | 'needs_follow_up';
  updatedAt: string;
}

export interface ResidentServiceRecord extends DemoObject {
  recordId: 'A017' | 'A026' | 'A041';
  authorization: DemoObject & {
    scope: string[];
    grantedAt: string;
    expiresAt: string;
    restrictions: string[];
  };
  serviceItems: RecordServiceItem[];
  ownerRole: string;
  status: 'active' | 'waiting_resident' | 'follow_up_due' | 'closed';
  nextAction: string;
  nextActionDueAt: string;
  timeline: RecordTimelineItem[];
}

interface EvidenceBreakdown extends DemoObject {
  residentRequests: number;
  serviceSearches: number;
  activityFeedback: number;
  authorizedVisitNotes: number;
}

export interface DemandTopic extends DemoObject {
  id: string;
  title: string;
  totalSignals: number;
  deduplicatedSubjects: number;
  evidenceBreakdown: EvidenceBreakdown;
  currentSupply: string[];
  trend: 'rising' | 'stable' | 'falling';
  updatedAt: string;
  status: 'observing' | 'needs_response' | 'response_in_progress' | 'covered';
  recommendedActions: string[];
}

interface WeeklyTopTopic extends DemoObject {
  rank: 1 | 2 | 3;
  label: string;
  count: number;
}

export interface WeeklyOperationsSnapshot extends DemoObject {
  period: { start: string; end: string; label: string; isDemo: true };
  requests: number;
  responded: number;
  responseRate: number;
  topTopics: WeeklyTopTopic[];
  sourceAdaptationNote: string;
}

export const desktopWorkTasks: WorkTask[] = [
  {
    id: 'task-service-verify-0711', category: 'service', title: '核验三伏贴服务发布信息',
    summary: '确认费用、服务站时段与余量表达；未获实时库存前继续提示向主办方确认。',
    priority: 'high', status: 'in_progress', ownerRole: '公共服务运营岗', dueAt: '2026-07-11 17:30',
    route: 'services', actionLabel: '继续核验', isDemo: true,
  },
  {
    id: 'task-activity-run-0711', category: 'activity', title: '完成银龄反诈小课堂执行检查',
    summary: '复核场地、签到二维码和讲师到场状态，完成后回填活动状态。',
    priority: 'high', status: 'todo', ownerRole: '活动运营岗', dueAt: '2026-07-12 09:00',
    route: 'activities', actionLabel: '打开执行清单', isDemo: true,
  },
  {
    id: 'task-visit-a017-0711', category: 'record', title: '跟进 A017 授权走访',
    summary: '仅在已授权范围内确认助餐服务匹配结果，不采集额外身份信息。',
    priority: 'medium', status: 'waiting_confirmation', ownerRole: '社区社工岗', dueAt: '2026-07-12 15:00',
    route: 'records', actionLabel: '查看脱敏档案', relatedRecordId: 'A017', isDemo: true,
  },
  {
    id: 'task-demand-response-0711', category: 'feedback', title: '回应暑期托管需求反馈',
    summary: '汇总已核验供给与仍需确认项，生成人工确认后再发布的回应草稿。',
    priority: 'medium', status: 'todo', ownerRole: '需求分析岗', dueAt: '2026-07-12 18:00',
    route: 'insights', actionLabel: '起草回应', isDemo: true,
  },
];

export const residentServiceRecords: ResidentServiceRecord[] = [
  {
    recordId: 'A017', isDemo: true, ownerRole: '社区社工岗', status: 'follow_up_due',
    authorization: { scope: ['助餐服务匹配', '一次线下走访跟进'], grantedAt: '2026-07-06', expiresAt: '2026-07-20', restrictions: ['不得转作其他用途', '不得新增采集身份信息'], isDemo: true },
    serviceItems: [{ id: 'svc-a017-meal', title: '老年助餐服务咨询', status: 'needs_follow_up', updatedAt: '2026-07-11 10:20', isDemo: true }],
    nextAction: '在授权范围内确认办理材料与服务点可达性', nextActionDueAt: '2026-07-12 15:00',
    timeline: [
      { occurredAt: '2026-07-06 14:10', title: '收到服务咨询', note: '居民主动咨询助餐办理材料。', actorRole: '社区服务岗', isDemo: true },
      { occurredAt: '2026-07-10 16:30', title: '确认走访授权', note: '授权一次服务匹配走访，未记录额外身份信息。', actorRole: '社区社工岗', isDemo: true },
    ],
  },
  {
    recordId: 'A026', isDemo: true, ownerRole: '活动运营岗', status: 'waiting_resident',
    authorization: { scope: ['暑期活动推荐', '活动状态提醒'], grantedAt: '2026-07-08', expiresAt: '2026-07-22', restrictions: ['不共享至活动主办方', '不记录未成年人身份信息'], isDemo: true },
    serviceItems: [{ id: 'svc-a026-summer', title: '暑期研学与托管供给匹配', status: 'matching', updatedAt: '2026-07-11 11:40', isDemo: true }],
    nextAction: '发送已核验活动清单并标注余量需向主办方确认', nextActionDueAt: '2026-07-12 12:00',
    timeline: [{ occurredAt: '2026-07-08 09:25', title: '登记服务偏好', note: '仅保留年龄段和时间偏好。', actorRole: '公共服务运营岗', isDemo: true }],
  },
  {
    recordId: 'A041', isDemo: true, ownerRole: '居民反馈运营岗', status: 'active',
    authorization: { scope: ['周末亲子活动反馈', '低风险邻里互助信息推荐'], grantedAt: '2026-07-09', expiresAt: '2026-07-23', restrictions: ['不用于居民评分', '不进行自动资源分配'], isDemo: true },
    serviceItems: [
      { id: 'svc-a041-family', title: '周末亲子活动反馈', status: 'completed', updatedAt: '2026-07-10 18:10', isDemo: true },
      { id: 'svc-a041-neighbor', title: '低风险邻里互助规则说明', status: 'in_service', updatedAt: '2026-07-11 13:15', isDemo: true },
    ],
    nextAction: '回复活动建议，并说明邻里互助只覆盖低风险事项', nextActionDueAt: '2026-07-12 17:00',
    timeline: [{ occurredAt: '2026-07-10 18:10', title: '收到活动反馈', note: '建议增加周末短时亲子活动。', actorRole: '居民反馈运营岗', isDemo: true }],
  },
];

export const demandTopics: DemandTopic[] = [
  {
    id: 'demand-summer-care', title: '暑期托管', totalSignals: 38, deduplicatedSubjects: 24,
    evidenceBreakdown: { residentRequests: 18, serviceSearches: 9, activityFeedback: 7, authorizedVisitNotes: 4, isDemo: true },
    currentSupply: ['区级暑期研学营（余量需向主办方确认）', '社区活动室可用时段待核验'],
    trend: 'rising', updatedAt: '2026-07-11 15:30', status: 'needs_response',
    recommendedActions: ['核验社区周边可用托管供给', '发布人工确认后的供给汇总'], isDemo: true,
  },
  {
    id: 'demand-senior-meal', title: '老年助餐', totalSignals: 32, deduplicatedSubjects: 21,
    evidenceBreakdown: { residentRequests: 14, serviceSearches: 8, activityFeedback: 3, authorizedVisitNotes: 7, isDemo: true },
    currentSupply: ['社区助餐点咨询', '办理材料说明待统一'], trend: 'rising', updatedAt: '2026-07-11 14:50',
    status: 'response_in_progress', recommendedActions: ['统一办理材料口径', '补充服务点可达性说明'], isDemo: true,
  },
  {
    id: 'demand-weekend-family', title: '周末亲子活动', totalSignals: 27, deduplicatedSubjects: 19,
    evidenceBreakdown: { residentRequests: 9, serviceSearches: 6, activityFeedback: 10, authorizedVisitNotes: 2, isDemo: true },
    currentSupply: ['周末社区亲子共读', '区级妇女儿童活动中心活动'], trend: 'stable', updatedAt: '2026-07-11 13:40',
    status: 'observing', recommendedActions: ['按年龄段整理活动', '增加周六上午短时场次'], isDemo: true,
  },
  {
    id: 'demand-low-risk-help', title: '低风险邻里互助', totalSignals: 19, deduplicatedSubjects: 15,
    evidenceBreakdown: { residentRequests: 8, serviceSearches: 2, activityFeedback: 7, authorizedVisitNotes: 2, isDemo: true },
    currentSupply: ['快递代取互助说明', '拼单团购信息交流'], trend: 'stable', updatedAt: '2026-07-11 12:20',
    status: 'covered', recommendedActions: ['继续限定低风险事项', '明确人工确认与退出机制'], isDemo: true,
  },
];

export const weeklyOperationsSnapshot: WeeklyOperationsSnapshot = {
  period: { start: '2026-07-06', end: '2026-07-12', label: '7月6日—7月12日', isDemo: true },
  requests: 45,
  responded: 41,
  responseRate: 0.91,
  topTopics: [
    { rank: 1, label: '快递代取', count: 23, isDemo: true },
    { rank: 2, label: '拼单团购', count: 15, isDemo: true },
    { rank: 3, label: '助餐材料咨询', count: 12, isDemo: true },
  ],
  sourceAdaptationNote: '由居民端社区运营周报的信息结构做安全适配；仅保留脱敏聚合数据，不用于居民画像、评分或自动处置。',
  isDemo: true,
};
