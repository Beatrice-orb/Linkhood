const KNOWLEDGE_SOURCES = {
  'demo-digital-life-service-2026-07': {
    id: 'demo-digital-life-service-2026-07',
    label: '社区数字生活服务演示清单',
    verifiedAt: '2026-07-12',
    isDemo: true,
  },
  'demo-neighbour-activity-2026-07': {
    id: 'demo-neighbour-activity-2026-07',
    label: '社区邻里活动演示目录',
    verifiedAt: '2026-07-12',
    isDemo: true,
  },
  'demo-community-route-directory-2026-07': {
    id: 'demo-community-route-directory-2026-07',
    label: '社区服务联系目录（演示）',
    verifiedAt: '2026-07-12',
    isDemo: true,
  },
};

const ROUTES = {
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

const DOMAINS = ['none', 'digital_public_service', 'community_activity', 'community_service'];
const GOAL_TAGS = [
  'independent_life_tasks',
  'medical_registration_guidance',
  'utility_payment_navigation',
  'local_social_connection',
  'needs_clarification',
];
const CONSTRAINT_TAGS = [
  'slow_paced_guidance',
  'nearby_service',
  'weekend_morning',
  'companion_preferred',
  'privacy_conscious',
  'low_commitment',
  'solo_attendance',
  'no_public_introduction',
  'sunday_late_afternoon',
  'facilitated_entry',
];
const SUPPLY_IDS = [
  'digital-helpdesk-weekday',
  'safe-phone-saturday',
  'community-center-access',
  'digital-service-privacy-policy',
  'neighbour-exchange-table',
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
    'goalTags',
    'constraintTags',
    'matchedSupplyIds',
    'knowledgeCoverage',
    'confidence',
  ],
  properties: {
    answerText: { type: 'string' },
    status: { type: 'string', enum: ['answered', 'needs_context', 'safety_redirect'] },
    sourceIds: {
      type: 'array',
      items: { type: 'string', enum: Object.keys(KNOWLEDGE_SOURCES) },
    },
    routeKey: { type: 'string', enum: ['none', ...Object.keys(ROUTES)] },
    domain: { type: 'string', enum: DOMAINS },
    goalTags: { type: 'array', items: { type: 'string', enum: GOAL_TAGS } },
    constraintTags: { type: 'array', items: { type: 'string', enum: CONSTRAINT_TAGS } },
    matchedSupplyIds: { type: 'array', items: { type: 'string', enum: SUPPLY_IDS } },
    knowledgeCoverage: { type: 'string', enum: ['full', 'partial', 'none'] },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
  },
};

const INSTRUCTIONS = `你是“搭把手·小搭”，一个社区生活助理 Agent。你不是关键词客服。

回答方法：
1. 先用一句自然的话说清你理解到的真正生活目标和隐含限制。
2. 只组合下面演示知识中的事实，给出最匹配的服务或活动。
3. 解释为什么它适合居民的时间、距离、陪同方式、参与压力或隐私顾虑。
4. 补充公告标题里通常看不到的执行细节、安全规则和未知项。
5. 第一轮不要给电话；有第二轮追问时，才可选择 routeKey，电话由服务端白名单追加。
6. 不替居民报名、提交留言、创建工单、通知工作人员或承诺回复。
7. 不询问姓名、电话、门牌、账号、密码或验证码。
8. answerText 中不得生成电话号码。

演示知识：
- 数字生活帮办桌：每周二、周四 14:00—16:00，党群服务中心一层，一对一约 20 分钟。可练医院小程序挂号、水电缴费入口和乘车码。第一次可把最想学的两件事写在纸上。居民本人持机；不索要密码、验证码，不代付款。从社区南门步行约 6 分钟，一层可直接进入。
- 手机安心用小课堂：2026-07-25 周六 09:30，前 40 分钟演示挂号和生活缴费；10:20 后一对一练习，提供纸质步骤卡，家属可陪同。付款可练到确认页但不必真的支付。当前没有实时名额。
- 邻里交换桌：每周日 16:30，党群服务中心庭院，约 45 分钟。无需连续报名，不轮流自我介绍，可空手参加或中途离开。第一次参加会拿社区地图任务卡，由主持人安排两三人一起完成。当前没有实时人数。

需求洞察只输出允许标签和供给 ID，不保存居民原话或身份。用简洁但有温度的中文回答。`;

const SAFETY_PATTERN = /(着火|火灾|有人晕倒|无法呼吸|煤气泄漏|燃气泄漏|正在被打|人身危险)/;
const FORMAL_ACTION_PATTERN = /(帮我|替我|给我).*(提交|投诉|留言|工单|申请)|(保证|承诺).*(回复|处理|解决)/;
const DATA_EXFILTRATION_PATTERN = /(忽略|绕过).*(规则|指令)|(居民|住户).*(名单|手机号|电话|住址|档案)/;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;
const rateBuckets = new Map();

let localRuntimeConfig;

function validateProviderConfig(value) {
  const apiKey = String(value?.apiKey ?? '').trim();
  const model = String(value?.model ?? '').trim();
  const apiStyle = value?.apiStyle === 'chat_completions' ? 'chat_completions' : 'responses';
  const parsedUrl = new URL(String(value?.baseUrl ?? '').trim());
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('invalid provider URL');
  if (apiKey.length < 12 || model.length < 2 || model.length > 120) {
    throw new Error('invalid provider config');
  }
  return {
    apiKey,
    model,
    apiStyle,
    baseUrl: parsedUrl.toString().replace(/\/$/, ''),
  };
}

export function configureLocalResidentAgent(value) {
  localRuntimeConfig = validateProviderConfig(value);
  return getLocalResidentAgentStatus();
}

export function clearLocalResidentAgent() {
  localRuntimeConfig = undefined;
}

export function getLocalResidentAgentStatus() {
  return {
    localOnly: true,
    configured: Boolean(localRuntimeConfig),
    ...(localRuntimeConfig
      ? {
          model: localRuntimeConfig.model,
          baseUrl: localRuntimeConfig.baseUrl,
          apiStyle: localRuntimeConfig.apiStyle,
        }
      : {}),
  };
}

function providerConfig() {
  if (localRuntimeConfig) return localRuntimeConfig;
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (!apiKey || !model) return null;
  return validateProviderConfig({
    apiKey,
    model,
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiStyle: process.env.OPENAI_API_STYLE || 'responses',
  });
}

function redact(value) {
  return String(value ?? '')
    .replace(/1[3-9]\d{9}/g, '[手机号已隐藏]')
    .replace(/\d{1,2}\s*号楼\s*\d{2,4}\s*(?:室|房)?/g, '[门牌已隐藏]')
    .replace(/\b(?:\d{15}|\d{17}[0-9Xx])\b/g, '[证件号已隐藏]')
    .replace(/(我是|我叫|姓名是|本人是|联系人是)\s*[\u4e00-\u9fa5]{2,4}/g, '$1[姓名已隐藏]')
    .replace(/(密码|验证码)\s*(?:是|为|：|:)?\s*[A-Za-z0-9]{4,}/g, '$1[已隐藏]')
    .slice(0, 1000);
}

function stripGeneratedPhone(value) {
  return redact(value)
    .replace(/(?:0\d{2,3}[- ]?)?\d{7,8}/g, '[联系电话由系统补充]')
    .slice(0, 1800);
}

function requestClientKey(request) {
  const forwarded = request.headers?.['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return String(value || request.socket?.remoteAddress || 'local').split(',')[0].trim();
}

function isRateLimited(request) {
  const now = Date.now();
  const key = requestClientKey(request);
  const current = rateBuckets.get(key);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  if (rateBuckets.size > 500) {
    for (const [candidateKey, bucket] of rateBuckets) {
      if (now - bucket.startedAt >= RATE_WINDOW_MS) rateBuckets.delete(candidateKey);
    }
  }
  return current.count > RATE_LIMIT;
}

function policyResultFor(input) {
  const latestUser = [...input].reverse().find((message) => message.role === 'user')?.content ?? '';
  if (SAFETY_PATTERN.test(latestUser)) {
    return {
      answerText: '这可能涉及紧急安全风险，请立即离开危险区域，并根据现场情况拨打 110、119 或 120。这里不能替代紧急救援。',
      status: 'safety_redirect',
      sourceRefs: [],
      usedFallback: true,
    };
  }
  if (DATA_EXFILTRATION_PATTERN.test(latestUser)) {
    return {
      answerText: '我不能查询、展示或猜测居民名单、电话、住址或档案。我只能依据公开的社区服务与活动演示资料提供建议。',
      status: 'answered',
      sourceRefs: [],
      usedFallback: true,
    };
  }
  if (FORMAL_ACTION_PATTERN.test(latestUser)) {
    return {
      answerText: '我不能替你正式提交投诉、创建留言或工单，也不能承诺社区的回复或处理时间。我可以继续帮你梳理生活目标，再查询公开服务与活动。',
      status: 'answered',
      sourceRefs: [],
      usedFallback: true,
    };
  }
  return null;
}

function extractResponsesText(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text;
  for (const item of payload.output ?? []) {
    if (item?.type !== 'message') continue;
    for (const content of item.content ?? []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') return content.text;
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
  const status = ['answered', 'needs_context', 'safety_redirect'].includes(value.status)
    ? value.status
    : null;
  const routeKey = ['none', ...Object.keys(ROUTES)].includes(value.routeKey)
    ? value.routeKey
    : null;
  const domain = DOMAINS.includes(value.domain) ? value.domain : null;
  const knowledgeCoverage = ['full', 'partial', 'none'].includes(value.knowledgeCoverage)
    ? value.knowledgeCoverage
    : null;
  if (!status || !routeKey || !domain || !knowledgeCoverage) throw new Error('decision failed validation');

  const confidence = Number(value.confidence);
  const answerText = stripGeneratedPhone(value.answerText).trim();
  if (!answerText) throw new Error('model answer was empty');
  return {
    answerText,
    status,
    sourceIds: Array.isArray(value.sourceIds)
      ? value.sourceIds.filter((id) => Object.hasOwn(KNOWLEDGE_SOURCES, id)).slice(0, 3)
      : [],
    routeKey,
    domain,
    goalTags: Array.isArray(value.goalTags)
      ? value.goalTags.filter((tag) => GOAL_TAGS.includes(tag)).slice(0, 6)
      : [],
    constraintTags: Array.isArray(value.constraintTags)
      ? value.constraintTags.filter((tag) => CONSTRAINT_TAGS.includes(tag)).slice(0, 8)
      : [],
    matchedSupplyIds: Array.isArray(value.matchedSupplyIds)
      ? value.matchedSupplyIds.filter((id) => SUPPLY_IDS.includes(id)).slice(0, 5)
      : [],
    knowledgeCoverage,
    confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0,
  };
}

async function callResponsesApi({ baseUrl, apiKey, model, input }) {
  const response = await fetch(`${baseUrl}/responses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(13_000),
    body: JSON.stringify({
      model,
      store: false,
      instructions: INSTRUCTIONS,
      input,
      max_output_tokens: 1200,
      text: {
        format: {
          type: 'json_schema',
          name: 'resident_life_agent_decision',
          strict: true,
          schema: DECISION_SCHEMA,
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`model provider returned ${response.status}`);
  return parseDecision(extractResponsesText(await response.json()));
}

async function callChatCompletionsApi({ baseUrl, apiKey, model, input }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(13_000),
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

export function buildResult(decision, userTurnCount) {
  const sourceRefs = decision.status === 'answered'
    ? decision.sourceIds.map((id) => KNOWLEDGE_SOURCES[id]).filter(Boolean)
    : [];
  if (decision.status === 'answered' && !sourceRefs.length) {
    throw new Error('grounded answer requires a source');
  }
  const route = (
    decision.status === 'answered' &&
    sourceRefs.length > 0 &&
    userTurnCount >= 2 &&
    decision.routeKey !== 'none'
  ) ? ROUTES[decision.routeKey] : undefined;
  const routeText = route
    ? `可联系${route.departmentName}：${route.phoneDisplay}，${route.serviceHours}（模拟号码，不可拨打）。`
    : '';
  const shouldRecordInsight =
    decision.status === 'answered' &&
    sourceRefs.length > 0 &&
    decision.domain !== 'none' &&
    decision.confidence >= 0.75;

  return {
    answerText: [decision.answerText, routeText].filter(Boolean).join('\n\n'),
    status: decision.status,
    sourceRefs,
    route,
    insightCandidate: shouldRecordInsight
      ? {
          domain: decision.domain,
          goalTags: decision.goalTags,
          constraintTags: decision.constraintTags,
          matchedSupplyIds: decision.matchedSupplyIds,
          knowledgeCoverage: decision.knowledgeCoverage,
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

  if (isRateLimited(request)) {
    response.setHeader('Retry-After', '60');
    return response.status(429).json({ error: 'rate_limited' });
  }

  const body = request.body ?? {};
  const messages = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
  const input = messages
    .filter((message) => message?.role === 'user' || message?.role === 'assistant')
    .map((message) => ({ role: message.role, content: redact(message.content) }));
  const userTurnCount = input.filter((message) => message.role === 'user').length;
  if (!userTurnCount) return response.status(400).json({ error: 'user_message_required' });

  const policyResult = policyResultFor(input);
  if (policyResult) return response.status(200).json(policyResult);

  let config;
  try {
    config = providerConfig();
  } catch {
    return response.status(503).json({ error: 'resident_agent_provider_not_configured' });
  }
  if (!config) return response.status(503).json({ error: 'resident_agent_provider_not_configured' });

  try {
    const rawDecision = config.apiStyle === 'chat_completions'
      ? await callChatCompletionsApi({ ...config, input })
      : await callResponsesApi({ ...config, input });
    return response.status(200).json(buildResult(normalizeDecision(rawDecision), userTurnCount));
  } catch {
    return response.status(502).json({ error: 'resident_agent_provider_failed' });
  }
}
