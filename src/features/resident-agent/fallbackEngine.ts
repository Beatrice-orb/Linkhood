import {
  COMMUNITY_CATALOG_SOURCE,
  DEMO_KNOWLEDGE,
  DEPARTMENT_DIRECTORY,
} from './knowledge';
import type {
  AnonymousDemandCandidateV1,
  ResidentAgentMessage,
  ResidentAgentTurnResult,
} from './types';

const GREETING_PATTERN = /^(你好|您好|hi|hello|在吗|嗨)[呀啊，。!！\s]*$/i;
const SAFETY_PATTERN = /(着火|火灾|有人晕倒|无法呼吸|煤气泄漏|燃气泄漏|正在被打|人身危险)/;
const AI_COURSE_PATTERN = /(AI|人工智能|编程).*(课|活动|培训|入门)|(课|活动|培训|入门).*(AI|人工智能|编程)/i;
const HOME_DELIVERY_PATTERN = /(助餐|老人餐|午餐).*(送餐|送上门|配送)|(送餐|送上门|配送).*(助餐|老人餐|午餐)/;
const EVENING_ACTIVITY_PATTERN = /(下班|晚上|夜间|工作日).*(活动|夜校|课程)|(活动|夜校|课程).*(下班|晚上|夜间|工作日)/;
const MEAL_PATTERN = /(助餐|老人餐|社区食堂|午餐)/;
const REPAIR_PATTERN = /(报修|电梯|灯坏|漏水|物业|维修)/;
const FORMAL_ACTION_PATTERN =
  /(帮我|替我|给我).*(提交|投诉|留言|工单|申请)|(保证|承诺).*(回复|处理|解决)/;
const DATA_EXFILTRATION_PATTERN =
  /(忽略|绕过).*(规则|指令)|(居民|住户).*(名单|手机号|电话|住址|档案)/;

export function redactResidentText(value: string): string {
  return value
    .replace(/1[3-9]\d{9}/g, '[手机号已隐藏]')
    .replace(/\d{1,2}\s*号楼\s*\d{2,4}\s*(?:室|房)?/g, '[门牌已隐藏]')
    .replace(/\b(?:\d{15}|\d{17}[0-9Xx])\b/g, '[证件号已隐藏]')
    .replace(/(我是|我叫|姓名是|本人是|联系人是)\s*[\u4e00-\u9fa5]{2,4}/g, '$1[姓名已隐藏]')
    .replace(/[\u4e00-\u9fa5]{1,2}(?:某|先生|女士|阿姨|大爷|奶奶)/g, '[姓名已隐藏]')
    .trim()
    .slice(0, 80);
}

function buildDemandCandidate(
  values: Omit<AnonymousDemandCandidateV1, 'sourceRefs'>,
): AnonymousDemandCandidateV1 {
  return {
    ...values,
    sourceRefs: [COMMUNITY_CATALOG_SOURCE.id],
  };
}

function notFoundAnswer(
  routeKey: keyof typeof DEPARTMENT_DIRECTORY,
  values: Omit<AnonymousDemandCandidateV1, 'sourceRefs' | 'routeDepartmentId'>,
): ResidentAgentTurnResult {
  const route = DEPARTMENT_DIRECTORY[routeKey];
  return {
    answerText: `我暂时没有在当前已核验的演示社区资料中查到这项服务。你可以联系${route.departmentName}进一步咨询：${route.phoneDisplay}（演示号码，不可拨打）。`,
    status: 'not_found',
    sourceRefs: [COMMUNITY_CATALOG_SOURCE],
    route,
    demandCandidate: buildDemandCandidate({
      ...values,
      routeDepartmentId: route.departmentId,
    }),
    usedFallback: true,
  };
}

export function runResidentAgentFallback(
  messages: ResidentAgentMessage[],
): ResidentAgentTurnResult {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  const query = lastUserMessage?.content.trim() ?? '';

  if (!query || GREETING_PATTERN.test(query)) {
    return {
      answerText:
        '你好，我可以帮你查询社区服务、社区活动和相关咨询电话。你可以问我“下班后有什么活动”或“社区有没有助餐服务”。',
      status: 'answered',
      sourceRefs: [],
      usedFallback: true,
    };
  }

  if (SAFETY_PATTERN.test(query)) {
    return {
      answerText:
        '这可能涉及紧急安全风险，请立即离开危险区域，并根据现场情况拨打 110、119 或 120。这里不能替代紧急救援或创建处置工单。',
      status: 'safety_redirect',
      sourceRefs: [],
      usedFallback: true,
    };
  }

  if (DATA_EXFILTRATION_PATTERN.test(query)) {
    return {
      answerText:
        '我不能查询、展示或猜测居民名单、电话、住址或档案。我只能依据公开的社区服务与活动演示资料提供答疑。',
      status: 'answered',
      sourceRefs: [],
      usedFallback: true,
    };
  }

  if (FORMAL_ACTION_PATTERN.test(query)) {
    return {
      answerText:
        '我不能替你正式提交投诉、创建工单，也不能承诺社区的回复或处理时间。我可以继续帮你查询公开服务信息和咨询科室。',
      status: 'answered',
      sourceRefs: [],
      usedFallback: true,
    };
  }

  if (AI_COURSE_PATTERN.test(query)) {
    return notFoundAnswer('activity_operations', {
      domain: 'activity',
      topicCode: 'weekday_evening_ai_course',
      summary: '居民希望社区提供工作日晚间的 AI 入门课程。',
      unmetFacet: '当前演示活动目录未覆盖工作日晚间 AI 入门课。',
      contextTags: ['weekday_evening', 'digital_skills'],
      knowledgeCoverage: 'none',
      confidence: 0.96,
    });
  }

  if (HOME_DELIVERY_PATTERN.test(query)) {
    const route = DEPARTMENT_DIRECTORY.public_service;
    const item = DEMO_KNOWLEDGE.find((knowledge) => knowledge.id === 'service-community-meal-point')!;
    return {
      answerText: `${item.answer} 如需进一步确认，可以联系${route.departmentName}：${route.phoneDisplay}（演示号码，不可拨打）。`,
      status: 'partial',
      sourceRefs: [item.source],
      route,
      demandCandidate: buildDemandCandidate({
        domain: 'service',
        topicCode: 'meal_home_delivery',
        summary: '居民希望社区助餐服务增加送餐上门。',
        unmetFacet: '已有助餐点，但当前资料未确认送餐上门。',
        contextTags: ['home_delivery_requested'],
        knowledgeCoverage: 'partial',
        routeDepartmentId: route.departmentId,
        confidence: 0.94,
      }),
      usedFallback: true,
    };
  }

  if (EVENING_ACTIVITY_PATTERN.test(query)) {
    const item = DEMO_KNOWLEDGE.find(
      (knowledge) => knowledge.id === 'activity-youth-night-school-2026-07',
    )!;
    return {
      answerText: item.answer,
      status: 'answered',
      sourceRefs: [item.source],
      usedFallback: true,
    };
  }

  if (MEAL_PATTERN.test(query)) {
    const item = DEMO_KNOWLEDGE.find((knowledge) => knowledge.id === 'service-community-meal-point')!;
    return {
      answerText: item.answer,
      status: 'answered',
      sourceRefs: [item.source],
      usedFallback: true,
    };
  }

  if (REPAIR_PATTERN.test(query)) {
    const item = DEMO_KNOWLEDGE.find((knowledge) => knowledge.id === 'service-property-repair')!;
    const route = DEPARTMENT_DIRECTORY.property_service;
    return {
      answerText: `${item.answer} 演示联系电话：${route.phoneDisplay}（不可拨打）。`,
      status: 'answered',
      sourceRefs: [item.source],
      route,
      usedFallback: true,
    };
  }

  return notFoundAnswer('public_service', {
    domain: 'service',
    topicCode: 'uncategorized_community_service',
    summary: '居民提出一项当前演示资料未覆盖的社区服务需求。',
    unmetFacet: redactResidentText(query),
    contextTags: ['community_service_inquiry'],
    knowledgeCoverage: 'none',
    confidence: 0.8,
  });
}
