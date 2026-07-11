# AnonymousDemandSignalV1

> 版本：`1.0`。
> 用途：居民答疑 Agent 将明确的未满足需求写成仅社区端可见的匿名需求信号。
> 本契约不是居民留言、正式工单、社工个案或受理记录。

## 1. 最小契约

```ts
interface AnonymousDemandSignalV1 {
  schemaVersion: '1.0';
  id: string;
  recordKind: 'anonymous_demand_signal';
  visibility: 'community_only';
  notACase: true;
  isDemo: true;

  communityId: 'xihongmen-demo';
  domain: 'service' | 'activity';
  topicCode: string;
  summary: string;
  unmetFacet: string;

  voiceFragments: string[];
  contextTags: string[];
  knowledgeCoverage: 'partial' | 'none';
  sourceRefs: string[];
  routeDepartmentId?: string;
  confidence: number;

  firstSeenAt: string;
  lastSeenAt: string;
  occurrenceCount: number;
  dedupeKey: string;
  piiScan: 'passed';
}
```

这是 P0 的完整持久化字段集合。正式工单状态、居民身份和联系方式不属于本契约。

## 2. 字段规则

### 固定语义

- `recordKind` 必须为 `anonymous_demand_signal`。
- `visibility` 必须为 `community_only`。
- `notACase` 必须为 `true`。
- `isDemo` 在比赛 Demo 中必须为 `true`。
- 不允许加入 `submitted`、`accepted`、`assigned`、`processing`、`resolved` 等工单状态。

### 需求描述

- `domain` 只允许 `service` 或 `activity`。
- `topicCode` 使用稳定枚举，例如 `digital_skills_activity`、`meal_home_delivery`。
- `summary` 是不含 PII 的正向需求摘要，建议不超过 120 字。
- `unmetFacet` 只描述现有供给未覆盖的部分，建议不超过 80 字。
- `knowledgeCoverage=partial` 时，不得把已存在的供给一并写成缺口。

### 居民声音

- `voiceFragments` 最多两条，每条不超过 80 字。
- 片段必须经过电话、证件、姓名和精确地址脱敏。
- 如无法可靠脱敏，必须使用空数组，不能退回完整原文。
- `contextTags` 只能使用非敏感允许列表，例如：
  - `weekday_evening`
  - `weekend`
  - `digital_skills`
  - `home_delivery_requested`
  - `accessible_location_requested`
- 不得生成年龄、健康、收入、家庭风险、政治身份、信用或人格标签。

### 证据与路由

- `sourceRefs` 记录本次判断检索过的知识 ID，不存整段知识正文。
- `routeDepartmentId` 只能来自科室白名单；没有合法路由时省略。
- `confidence` 范围为 `0` 到 `1`；低于 `0.75` 不应落库。

### 幂等与时间

- `firstSeenAt` 和 `lastSeenAt` 使用 ISO 8601。
- 初次记录时 `occurrenceCount=1`。
- 同一会话同一 `topicCode` 的后续追问只更新 `lastSeenAt`、`occurrenceCount` 和必要的脱敏短语。
- `dedupeKey` 是会话范围内的不可逆主题指纹，不是居民 ID，也不得用于跨会话画像。

## 3. 明确禁止的字段

以下字段及同义字段不得加入 v1：

```text
residentName
residentPhone
residentId
profileId
building
room
address
idCard
contactConsent
creditScore
riskScore
sensitiveTags
rawConversation
fullPrompt
caseStatus
assignee
sla
acceptedAt
resolvedAt
```

若未来需要实名留言或正式工单，必须新建独立契约和显式授权流程，不能扩展本匿名信号偷偷承载。

## 4. 示例

```json
{
  "schemaVersion": "1.0",
  "id": "ads_demo_20260712_001",
  "recordKind": "anonymous_demand_signal",
  "visibility": "community_only",
  "notACase": true,
  "isDemo": true,
  "communityId": "xihongmen-demo",
  "domain": "activity",
  "topicCode": "digital_skills_activity",
  "summary": "居民希望社区增加工作日晚间的 AI 入门活动",
  "unmetFacet": "当前活动资料没有工作日晚间 AI 入门课程",
  "voiceFragments": [
    "有没有工作日晚上的 AI 入门课"
  ],
  "contextTags": [
    "weekday_evening",
    "digital_skills"
  ],
  "knowledgeCoverage": "none",
  "sourceRefs": [
    "faq_youth_night_school_demo"
  ],
  "routeDepartmentId": "community_activity_ops_demo",
  "confidence": 0.93,
  "firstSeenAt": "2026-07-12T10:20:00+08:00",
  "lastSeenAt": "2026-07-12T10:20:00+08:00",
  "occurrenceCount": 1,
  "dedupeKey": "session-topic:demo-opaque-value",
  "piiScan": "passed"
}
```

## 5. 社区端展示映射

建议显示：

- 标题：`summary`
- 标识：`匿名需求信号 · 非工单 · 演示数据`
- 居民声音：`voiceFragments`
- 情境：`contextTags` 的中文映射
- 供给缺口：`unmetFacet`
- 建议承接：由 `routeDepartmentId` 查询科室名录
- 信号次数：`occurrenceCount`

不得显示或暗示：

- “居民已提交”
- “待受理”
- “已分派”
- “X 位居民”
- “工作人员需在 24 小时内回复”

## 6. 居民端隔离

- 居民端回答接口不返回本契约对象。
- 居民端不展示 `id`、`dedupeKey`、`occurrenceCount` 或写入结果。
- 居民端不出现与本信号对应的提交按钮、成功 Toast 或处理进度。
- P0 即使使用同源本地存储，产品界面也只能由社区端 adapter 读取并展示；生产实现必须由服务端授权保障隔离。

## 7. 版本规则

- 新增可选、非识别性字段可发布 `1.x`。
- 加入身份、联系方式、正式工作流或跨会话标识必须建立新契约，不能发布为兼容小版本。
- 读取方遇到未知大版本必须拒绝解析，不能降级成普通 `Feedback`。
