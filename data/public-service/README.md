# 搭把手｜真实公共服务种子数据

> 快照时间：2026-07-11 13:30–14:31（UTC+8）
> 范围：西红门镇 / 地区优先，大兴区级公共服务和相邻可达资源补充。
> 用途：黑客松居民端 Demo、社区端待确认列表和数据库建模。它不是实时余量接口。

## 文件

| 文件 | 内容 |
|---|---|
| `sources.v0.1.json` | 18 个公开来源节点，含机构层级、渠道、领域和接入优先级 |
| `activities.v0.1.json` | 16 条真实服务 / 活动记录，含来源、对象、地点、时间、状态、核验时间和缺失字段 |
| `schema.sql` | SQLite 兼容的公共服务最小 schema：来源、服务项目、活动场次 |
| `../../docs/research/2026-07-11_西红门公共服务供给扫描.md` | 来源矩阵、真实案例、数据问题和治理建议 |

## 数据概况

- 来源：18 条。
- 服务 / 活动：16 条。
- 当前开放、进行中或待核验：11 条。
- 近期已结束、仅作服务模板：5 条。
- 16 条记录均保留原文链接；主键唯一，`source_id` 外键完整。
- 数据没有复制居民姓名、手机号、报名者名单、本机路径、密钥或登录信息。

## 前端直接使用

`activities.v0.1.json` 的顶层不是数组，使用 `activities` 字段：

```ts
import publicServiceSeed from './data/public-service/activities.v0.1.json';

const visibleItems = publicServiceSeed.activities.filter(
  item => !['completed', 'completed_recent'].includes(item.status)
);
```

居民端每张真实供给卡至少显示：

- `title`
- `provider`
- `geo_scope`
- `audience`
- `event_start / event_end`
- `status`
- `status_verified_at`
- `source_url`
- `registration_method`
- `missing_fields`

推荐先替换 3 张虚构卡：

1. 西红门医院 2026 三伏贴预约：本地、来源明确、可演示缺失价格 / 容量。
2. 暑期研学营或社区青年汇成长营：可演示人群资格与余量未知。
3. 7 月招聘活动或公众意见征集：证明产品不只是兴趣活动聚合。

## 状态与容量红线

- `capacity` 是公开页面中的计划容量，不是“剩余名额”。
- 11 条当前记录中有 10 条仍存在余量或字段未核验。
- 未接主办方库存接口时，前台写“余量请向主办方确认”，不要写“仅剩 X 名”。
- `completed` / `completed_recent` 只能用于历史案例、服务模板或运营复盘，不能出现在“正在报名”。
- `status_verified_at` 是一次公开信息快照；演示前必须复核主故事服务。

## 数据库映射

项目启动时会调用 `server/public-service-seed.ts` 幂等导入，也可以手动执行：

```bash
npm run data:import
```

导入结果：

- `public_service_sources`：18 个公开来源节点，保留来源机构、渠道、领域和采集方式。
- `public_services`：16 条可核验服务供给；进行中记录进入待审核，已结束记录进入归档。
- `activities`：16 条带 `material_` 前缀的活动素材；状态为 `source_material` 或 `archived_material`，不会直接出现在居民端报名列表。
- `service_review_fields`：为每条供给创建必要字段、价格、容量和服务站时段的核验项。
- `activity_operations`：为活动素材预建运营记录，供社区确认后再转为正式活动。

`capacity` 始终表示公开页面中的计划容量；数据库不会根据它推导实时余量。多场次活动后续应拆分独立场次，再分别记录报名窗口、计划容量和核验状态。

## 来源与合作边界

- `source_url` 是公开证据或原文入口，不代表已获得该机构合作授权。
- 部分公众号来源只能用政府矩阵页做账号佐证；后续正式接入时应拆成 `evidence_url` 与 `canonical_channel_url`。
- “公开来源”不等于“已合作”，产品和路演中不得声称已与相关单位达成合作。

## 隐私边界

- 公开 seed 只保存服务供给事实，不创建居民或互助个人信息表。
- 志愿服务页面可能公开报名者姓名和联系人，采集时必须排除。
- 社区需求趋势只使用脱敏聚合数据。
- 专业社工个案记录应进入独立授权系统，不与普通推荐、社交或居民信用混用。
