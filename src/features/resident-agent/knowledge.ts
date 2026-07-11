import type { DepartmentRoute, ResidentAgentSourceRef } from './types';

export interface DemoKnowledgeItem {
  id: string;
  domain: 'service' | 'activity';
  title: string;
  answer: string;
  keywords: string[];
  source: ResidentAgentSourceRef;
}

export const DEMO_KNOWLEDGE: DemoKnowledgeItem[] = [
  {
    id: 'activity-youth-night-school-2026-07',
    domain: 'activity',
    title: '青年夜校与下班后活动',
    answer:
      '演示社区资料显示，本周四 19:00 有一场零基础尤克里里体验活动，地点在党群服务中心。活动余量请向主办方确认。',
    keywords: ['下班', '晚上', '夜间', '青年夜校', '尤克里里', '活动'],
    source: {
      id: 'demo-activity-catalog-2026-07',
      label: '社区活动演示目录（2026 年 7 月）',
      verifiedAt: '2026-07-12',
      isDemo: true,
    },
  },
  {
    id: 'service-community-meal-point',
    domain: 'service',
    title: '社区助餐点',
    answer:
      '演示社区资料中有社区助餐点，工作日 11:00—13:00 提供堂食与到店取餐。当前资料没有确认送餐上门服务。',
    keywords: ['助餐', '老人餐', '吃饭', '午餐', '堂食'],
    source: {
      id: 'demo-service-catalog-2026-07',
      label: '社区公共服务演示目录（2026 年 7 月）',
      verifiedAt: '2026-07-12',
      isDemo: true,
    },
  },
  {
    id: 'service-property-repair',
    domain: 'service',
    title: '公共设施报修咨询',
    answer:
      '公共区域照明、电梯和管线问题可先联系物业服务台核实。当前页面只提供咨询路由，不会自动创建报修工单。',
    keywords: ['报修', '电梯', '灯坏', '漏水', '物业', '维修'],
    source: {
      id: 'demo-service-directory-2026-07',
      label: '社区服务联系目录（演示）',
      verifiedAt: '2026-07-12',
      isDemo: true,
    },
  },
];

export const DEPARTMENT_DIRECTORY: Record<string, DepartmentRoute> = {
  activity_operations: {
    departmentId: 'activity_operations',
    departmentName: '社区活动运营岗',
    phoneDisplay: '010-0000-1024',
    serviceHours: '周一至周五 09:00—18:00',
    isDemo: true,
  },
  public_service: {
    departmentId: 'public_service',
    departmentName: '社区民生服务岗',
    phoneDisplay: '010-0000-1001',
    serviceHours: '周一至周五 09:00—18:00',
    isDemo: true,
  },
  property_service: {
    departmentId: 'property_service',
    departmentName: '物业服务台',
    phoneDisplay: '010-0000-2001',
    serviceHours: '每日 08:00—20:00',
    isDemo: true,
  },
};

export function getDepartmentRoute(departmentId?: string): DepartmentRoute | undefined {
  return departmentId ? DEPARTMENT_DIRECTORY[departmentId] : undefined;
}

export const COMMUNITY_CATALOG_SOURCE: ResidentAgentSourceRef = {
  id: 'demo-community-catalog-2026-07',
  label: '社区服务与活动演示资料',
  verifiedAt: '2026-07-12',
  isDemo: true,
};
