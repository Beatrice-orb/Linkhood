import { INITIAL_FEEDBACKS } from '../../vendor/tog-linkhood/src/mockData';
import type { Feedback } from '../../vendor/tog-linkhood/src/types';
import { getDepartmentRoute } from '../features/resident-agent/knowledge';
import type { AnonymousDemandSignalV1 } from '../features/resident-agent/types';

function formatDemandTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function toTogFeedback(signal: AnonymousDemandSignalV1): Feedback {
  const route = getDepartmentRoute(signal.routeDepartmentId);
  const routeText = route
    ? `${route.departmentName} ${route.phoneDisplay}（模拟号码）`
    : '社区工作人员补充研判';
  const quotes = signal.voiceFragments.length
    ? signal.voiceFragments.map((quote) => `“${quote}”`).join('；')
    : '未保留可展示原话';

  return {
    id: `resident-ai-${signal.id}`,
    residentName: `匿名居民 · ${signal.id.slice(-4).toUpperCase()}`,
    residentPhone: '未收集',
    building: '社区范围',
    room: '匿名信号',
    question: `匿名需求信号 · 非工单 · 演示数据｜居民原声（已脱敏）：${quotes}`,
    helpNeeded: `AI 整理：${signal.summary}｜供给缺口：${signal.unmetFacet}｜情境标签：${signal.contextTags.join(
      '、',
    )}｜建议路由：${routeText}｜演示数据，待人工研判，不是正式工单。`,
    time: formatDemandTime(signal.lastSeenAt),
    status: '待处理',
    replies: [],
  };
}

export function syncTogFeedbackFixtures(signals: AnonymousDemandSignalV1[]): void {
  const injected = signals.map(toTogFeedback);
  INITIAL_FEEDBACKS.splice(0, INITIAL_FEEDBACKS.length, ...injected);
}
