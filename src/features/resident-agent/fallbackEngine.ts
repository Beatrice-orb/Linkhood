import {
  COMMUNITY_ACTIVITY_SOURCE,
  COMMUNITY_ROUTE_SOURCE,
  DEPARTMENT_DIRECTORY,
  DIGITAL_SERVICE_SOURCE,
} from './knowledge';
import type {
  ResidentAgentMessage,
  ResidentAgentTurnResult,
  ResidentNeedInsightCandidateV1,
} from './types';

const GREETING_PATTERN = /^(你好|您好|hi|hello|在吗|嗨)[呀啊，。!！\s]*$/i;
const SAFETY_PATTERN = /(着火|火灾|有人晕倒|无法呼吸|煤气泄漏|燃气泄漏|正在被打|人身危险)/;
const DIGITAL_LIFE_PATTERN = /(手机|挂号|水电费|缴费|乘车码|大课|慢慢教)/;
const WEEKEND_CONSTRAINT_PATTERN = /(周六|周末|上午|陪她|陪他|付款|午休|休息)/;
const LOW_PRESSURE_ACTIVITY_PATTERN = /(搬来|不认识|自我介绍|十节课|松一点|一个人).*(活动|邻居|认识)|活动.*(尴尬|一个人|自我介绍)/;
const ACTIVITY_FOLLOWUP_PATTERN = /(周日|下午四点|四点以后|尴尬|已经认识)/;
const FORMAL_ACTION_PATTERN = /(帮我|替我|给我).*(提交|投诉|留言|工单|申请)|(保证|承诺).*(回复|处理|解决)/;
const DATA_EXFILTRATION_PATTERN = /(忽略|绕过).*(规则|指令)|(居民|住户).*(名单|手机号|电话|住址|档案)/;

function insight(
  values: ResidentNeedInsightCandidateV1,
): ResidentNeedInsightCandidateV1 {
  return values;
}

function userMessages(messages: ResidentAgentMessage[]) {
  return messages.filter((message) => message.role === 'user');
}

function containsDigitalScenario(messages: ResidentAgentMessage[]) {
  return userMessages(messages).some((message) => DIGITAL_LIFE_PATTERN.test(message.content));
}

function containsActivityScenario(messages: ResidentAgentMessage[]) {
  return userMessages(messages).some((message) => LOW_PRESSURE_ACTIVITY_PATTERN.test(message.content));
}

export function runResidentAgentFallback(
  messages: ResidentAgentMessage[],
): ResidentAgentTurnResult {
  const users = userMessages(messages);
  const query = users.at(-1)?.content.trim() ?? '';

  if (!query || GREETING_PATTERN.test(query)) {
    return {
      answerText:
        '你好，我是社区生活助理。你可以把生活里真正卡住的事情讲完整一点，比如时间、距离、陪同方式或你最在意的感受；我会结合演示社区资料，帮你找更合适的服务和活动。',
      status: 'needs_context',
      sourceRefs: [],
      usedFallback: true,
    };
  }

  if (SAFETY_PATTERN.test(query)) {
    return {
      answerText:
        '这可能涉及紧急安全风险，请立即离开危险区域，并根据现场情况拨打 110、119 或 120。这里不能替代紧急救援。',
      status: 'safety_redirect',
      sourceRefs: [],
      usedFallback: true,
    };
  }

  if (DATA_EXFILTRATION_PATTERN.test(query)) {
    return {
      answerText:
        '我不能查询、展示或猜测居民名单、电话、住址或档案。我只能依据公开的社区服务与活动演示资料提供建议。',
      status: 'answered',
      sourceRefs: [],
      usedFallback: true,
    };
  }

  if (FORMAL_ACTION_PATTERN.test(query)) {
    return {
      answerText:
        '我不能替你正式提交投诉、创建工单，也不能承诺社区的回复或处理时间。我可以继续帮你把生活目标和限制条件梳理清楚，再查找公开服务与活动。',
      status: 'answered',
      sourceRefs: [],
      usedFallback: true,
    };
  }

  if (containsDigitalScenario(messages) && users.length >= 2 && WEEKEND_CONSTRAINT_PATTERN.test(query)) {
    const route = DEPARTMENT_DIRECTORY.public_service;
    return {
      answerText:
        `不是没有，更合适的选择需要从工作日下午的帮办桌换成周六专场。\n\n当前演示安排里，7 月 25 日周六 09:30 有一场「手机安心用小课堂」：前 40 分钟会用演示页面讲挂号和生活缴费，10:20 以后留有一对一练习时间。你可以陪她先把两个任务各操作一次，再让她照着纸质步骤卡自己重做一遍，这比工作日下午的帮办桌更符合你们的时间。\n\n关于付款安全，居民始终自己拿手机，工作人员只指步骤，不查看支付密码或短信验证码；涉及付款时可以练到确认页，最后一步不必真的支付。当前资料没有实时名额，请先确认当周场次。\n\n可联系${route.departmentName}：${route.phoneDisplay}，${route.serviceHours}（模拟号码，不可拨打）。`,
      status: 'answered',
      sourceRefs: [DIGITAL_SERVICE_SOURCE, COMMUNITY_ROUTE_SOURCE],
      route,
      insightCandidate: insight({
        domain: 'digital_public_service',
        goalTags: [
          'independent_life_tasks',
          'medical_registration_guidance',
          'utility_payment_navigation',
        ],
        constraintTags: [
          'slow_paced_guidance',
          'weekend_morning',
          'companion_preferred',
          'privacy_conscious',
        ],
        matchedSupplyIds: ['digital-helpdesk-weekday', 'safe-phone-saturday'],
        knowledgeCoverage: 'full',
        confidence: 0.98,
      }),
      usedFallback: true,
    };
  }

  if (DIGITAL_LIFE_PATTERN.test(query)) {
    return {
      answerText:
        '我理解你找的不是一节泛泛讲功能的“手机课”，而是有人围着“挂号、缴费”这两个具体任务，陪她一步一步练。\n\n当前演示资料里，更匹配的是党群服务中心一层的「数字生活帮办桌」：每周二、周四 14:00—16:00，采用一对一短时陪练，可以练医院小程序挂号、水电缴费页面怎么找、乘车码怎么打开。它不是大班讲座，第一次去可以只带自己的手机，再把最想学的两件事写在纸上，工作人员会按实际任务慢慢讲。\n\n地点从社区南门步行约 6 分钟，一层可直接进入。需要注意的是，帮办人员只做操作引导，不代替居民付款，也不会索要或保存支付密码、短信验证码。',
      status: 'answered',
      sourceRefs: [DIGITAL_SERVICE_SOURCE],
      insightCandidate: insight({
        domain: 'digital_public_service',
        goalTags: [
          'independent_life_tasks',
          'medical_registration_guidance',
          'utility_payment_navigation',
        ],
        constraintTags: ['slow_paced_guidance', 'nearby_service'],
        matchedSupplyIds: ['digital-helpdesk-weekday', 'community-center-access'],
        knowledgeCoverage: 'full',
        confidence: 0.96,
      }),
      usedFallback: true,
    };
  }

  if (containsActivityScenario(messages) && users.length >= 2 && ACTIVITY_FOLLOWUP_PATTERN.test(query)) {
    const route = DEPARTMENT_DIRECTORY.activity_operations;
    return {
      answerText:
        `这个时间正好能匹配周日 16:30 的场次，而且它专门保留了“第一次参加”入口：新参加的人会先拿一张社区地图任务卡，由主持人安排两三人一起完成，不需要自己找话题，也不会默认大家已经认识。\n\n建议你 16:25 到，在入口直接说“第一次来，想参加地图任务”即可；活动约 45 分钟，中途离开也没有影响。当前资料没有实时人数。\n\n如需确认本周是否照常开展，可联系${route.departmentName}：${route.phoneDisplay}，${route.serviceHours}（模拟号码，不可拨打）。`,
      status: 'answered',
      sourceRefs: [COMMUNITY_ACTIVITY_SOURCE, COMMUNITY_ROUTE_SOURCE],
      route,
      insightCandidate: insight({
        domain: 'community_activity',
        goalTags: ['local_social_connection'],
        constraintTags: [
          'low_commitment',
          'solo_attendance',
          'no_public_introduction',
          'sunday_late_afternoon',
          'facilitated_entry',
        ],
        matchedSupplyIds: ['neighbour-exchange-table'],
        knowledgeCoverage: 'full',
        confidence: 0.96,
      }),
      usedFallback: true,
    };
  }

  if (LOW_PRESSURE_ACTIVITY_PATTERN.test(query)) {
    return {
      answerText:
        '你想找的重点不是“学一门课”，而是能一个人去、参与压力低、随时结束，同时自然认识几个人的活动。\n\n当前演示资料里，「邻里交换桌」比连续课程更合适：每周日下午在党群服务中心庭院开放 45 分钟，不要求连续报名，也没有上台自我介绍。可以带一本看完的书或一件闲置小物，也可以空手参加；主持人会用物品和社区地图做聊天引子，一个人去也会有人协助加入小组。\n\n如果第一次只想看看，可以先参加前 20 分钟，不需要承诺后续场次。',
      status: 'answered',
      sourceRefs: [COMMUNITY_ACTIVITY_SOURCE],
      insightCandidate: insight({
        domain: 'community_activity',
        goalTags: ['local_social_connection'],
        constraintTags: ['low_commitment', 'solo_attendance', 'no_public_introduction'],
        matchedSupplyIds: ['neighbour-exchange-table'],
        knowledgeCoverage: 'full',
        confidence: 0.94,
      }),
      usedFallback: true,
    };
  }

  return {
    answerText:
      '我还需要多一点生活情境，才能避免只做关键词客服。你可以补充：最想解决的具体事情、方便的时间、能走多远，以及你最不希望发生什么。我会再结合演示社区资料给出建议。',
    status: 'needs_context',
    sourceRefs: [],
    insightCandidate: insight({
      domain: 'community_service',
      goalTags: ['needs_clarification'],
      constraintTags: [],
      matchedSupplyIds: [],
      knowledgeCoverage: 'none',
      confidence: 0.78,
    }),
    usedFallback: true,
  };
}
