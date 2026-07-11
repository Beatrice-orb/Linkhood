const KNOWLEDGE_SOURCES = {
  'demo-activity-catalog-2026-07': {
    id: 'demo-activity-catalog-2026-07',
    label: '社区活动演示目录（2026 年 7 月）',
    verifiedAt: '2026-07-12',
    isDemo: true,
  },
  'demo-service-catalog-2026-07': {
    id: 'demo-service-catalog-2026-07',
    label: '社区公共服务演示目录（2026 年 7 月）',
    verifiedAt: '2026-07-12',
    isDemo: true,
  },
  'demo-service-directory-2026-07': {
    id: 'demo-service-directory-2026-07',
    label: '社区服务联系目录（演示）',
    verifiedAt: '2026-07-12',
    isDemo: true,
  },
};

const ROUTES = {
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

const TOPIC_CODES = [
  'weekday_evening_ai_course',
  'meal_home_delivery',
  'uncategorized_community_service',
];
const CONTEXT_TAGS = [
  'weekday_evening',
  'digital_skills',
  'home_delivery_requested',
  'community_service_inquiry',
];

const DECISION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'answerText',
    'status',
    'sourceIds',
    'routeKey',
    'domain',
    'topicCode',
    'summary',
    'unmetFacet',
    'contextTags',
    'knowledgeCoverage',
    'confidence',
  ],
  properties: {
    answerText: { type: 'string' },
    status: {
      type: 'string',
      enum: ['answered', 'partial', 'not_found', 'safety_redirect'],
    },
    sourceIds: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.keys(KNOWLEDGE_SOURCES),
      },
    },
    routeKey: {
      type: 'string',
      enum: ['none', ...Object.keys(ROUTES)],
    },
    domain: { type: 'string', enum: ['service', 'activity'] },
    topicCode: { type: 'string', enum: ['', ...TOPIC_CODES] },
    summary: { type: 'string' },
    unmetFacet: { type: 'string' },
    contextTags: {
      type: 'array',
      items: { type: 'string', enum: CONTEXT_TAGS },
    },
    knowledgeCoverage: { type: 'string', enum: ['full', 'partial', 'none'] },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
  },
};

const INSTRUCTIONS = `你是“搭把手居民答疑助手”，只回答社区服务、社区活动和公开咨询路由。

演示知识：
1. 本周四 19:00 党群服务中心有零基础尤克里里体验；余量需向主办方确认。
2. 社区助餐点工作日 11:00—13:00 提供堂食与到店取餐；当前资料未确认送餐上门。
3. 公共区域照明、电梯和管线问题可咨询物业服务台；本助手不能创建报修工单。
4. 当前演示资料没有工作日晚间 AI 入门课程。

规则：
- 没有依据时必须说“当前已核验的演示社区资料中暂未找到”，不能断言现实中不存在。
- 不替居民报名、预约、提交留言、创建工单、通知工作人员或承诺回复。
- 不要询问居民是否提交社区，不要索要姓名、电话或门牌号。
- 电话由服务端白名单追加；answerText 中不得生成电话号码。
- 紧急安全问题只给固定安全建议，status=safety_redirect，不生成普通需求。
- 只有 partial 或 not_found 才填写明确的 topicCode、summary、unmetFacet 和 contextTags；answered 时这些字段用空字符串或空数组。
- 用简洁自然的中文回答。`;

function redact(value) {
  return String(value ?? '')
    .replace(/1[3-9]\d{9}/g, '[手机号已隐藏]')
    .replace(/\d{1,2}\s*号楼\s*\d{2,4}\s*(?:室|房)?/g, '[门牌已隐藏]')
    .replace(/\b(?:\d{15}|\d{17}[0-9Xx])\b/g, '[证件号已隐藏]')
    .replace(/(我是|我叫|姓名是|本人是|联系人是)\s*[\u4e00-\u9fa5]{2,4}/g, '$1[姓名已隐藏]')
    .replace(/[\u4e00-\u9fa5]{1,2}(?:某|先生|女士|阿姨|大爷|奶奶)/g, '[姓名已隐藏]')
    .slice(0, 1000);
}

function extractResponsesText(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text;
  for (const item of payload.output ?? []) {
    if (item?.type !== 'message') continue;
    for (const content of item.content ?? []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') {
        return content.text;
      }
    }
  }
  return '';
}

function parseDecision(value) {
  const cleaned = String(value).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

function normalizeDecision(value) {
  if (!value || typeof value !== 'object') throw new Error('invalid model decision');

  const status = ['answered', 'partial', 'not_found', 'safety_redirect'].includes(value.status)
    ? value.status
    : null;
  const routeKey = ['none', ...Object.keys(ROUTES)].includes(value.routeKey)
    ? value.routeKey
    : null;
  const domain = value.domain === 'activity' || value.domain === 'service' ? value.domain : null;
  const knowledgeCoverage = ['full', 'partial', 'none'].includes(value.knowledgeCoverage)
    ? value.knowledgeCoverage
    : null;
  if (!status || !routeKey || !domain || !knowledgeCoverage) {
    throw new Error('model decision failed allowlist validation');
  }

  const topicCode = TOPIC_CODES.includes(value.topicCode) ? value.topicCode : '';
  const confidence = Number(value.confidence);
  return {
    answerText: redact(value.answerText).slice(0, 700),
    status,
    sourceIds: Array.isArray(value.sourceIds)
      ? value.sourceIds.filter((id) => Object.hasOwn(KNOWLEDGE_SOURCES, id)).slice(0, 3)
      : [],
    routeKey,
    domain,
    topicCode,
    summary: redact(value.summary).slice(0, 120),
    unmetFacet: redact(value.unmetFacet).slice(0, 80),
    contextTags: Array.isArray(value.contextTags)
      ? value.contextTags.filter((tag) => CONTEXT_TAGS.includes(tag)).slice(0, 4)
      : [],
    knowledgeCoverage,
    confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0,
  };
}

async function callResponsesApi({ baseUrl, apiKey, model, input }) {
  const response = await fetch(`${baseUrl}/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions: INSTRUCTIONS,
      input,
      max_output_tokens: 700,
      text: {
        format: {
          type: 'json_schema',
          name: 'resident_agent_decision',
          strict: true,
          schema: DECISION_SCHEMA,
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`model provider returned ${response.status}`);
  const payload = await response.json();
  return parseDecision(extractResponsesText(payload));
}

async function callChatCompletionsApi({ baseUrl, apiKey, model, input }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: INSTRUCTIONS }, ...input],
      response_format: { type: 'json_object' },
    }),
  });
  if (!response.ok) throw new Error(`model provider returned ${response.status}`);
  const payload = await response.json();
  return parseDecision(payload.choices?.[0]?.message?.content ?? '');
}

function buildResult(decision) {
  const sourceRefs = (decision.sourceIds ?? [])
    .map((id) => KNOWLEDGE_SOURCES[id])
    .filter(Boolean);
  const route = decision.routeKey === 'none' ? undefined : ROUTES[decision.routeKey];
  const routeText = route
    ? `你可以联系${route.departmentName}进一步咨询：${route.phoneDisplay}（演示号码，不可拨打）。`
    : '';
  const needsDemand =
    (decision.status === 'partial' || decision.status === 'not_found') &&
    decision.topicCode &&
    Number(decision.confidence) >= 0.75;

  return {
    answerText: [decision.answerText, routeText].filter(Boolean).join(' '),
    status: decision.status,
    sourceRefs,
    route,
    demandCandidate: needsDemand
      ? {
          domain: decision.domain,
          topicCode: decision.topicCode,
          summary: decision.summary,
          unmetFacet: decision.unmetFacet,
          contextTags: decision.contextTags,
          knowledgeCoverage: decision.knowledgeCoverage,
          sourceRefs: decision.sourceIds,
          routeDepartmentId: route?.departmentId,
          confidence: decision.confidence,
        }
      : undefined,
    usedFallback: false,
  };
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'method_not_allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (!apiKey || !model) {
    return response.status(503).json({ error: 'resident_agent_provider_not_configured' });
  }

  const body = request.body ?? {};
  const messages = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
  const input = messages
    .filter((message) => message?.role === 'user' || message?.role === 'assistant')
    .map((message) => ({ role: message.role, content: redact(message.content) }));
  if (!input.some((message) => message.role === 'user')) {
    return response.status(400).json({ error: 'user_message_required' });
  }

  const baseUrl = String(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(
    /\/$/,
    '',
  );
  const apiStyle = process.env.OPENAI_API_STYLE || 'responses';

  try {
    const rawDecision =
      apiStyle === 'chat_completions'
        ? await callChatCompletionsApi({ baseUrl, apiKey, model, input })
        : await callResponsesApi({ baseUrl, apiKey, model, input });
    const decision = normalizeDecision(rawDecision);
    return response.status(200).json(buildResult(decision));
  } catch {
    return response.status(502).json({ error: 'resident_agent_provider_failed' });
  }
}
