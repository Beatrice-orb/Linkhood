# Linkhood 单社区 MVP 架构

## 1. 运行拓扑

```text
居民端 React / 社区电脑端 React / 社工手机端 React
                         |
                    Bearer Session
                         |
                 Express REST API
                         |
               SQLite 单实例数据库
```

开发环境由 `server/index.ts` 同时挂载 Express API 与 Vite 中间件。生产环境先执行 `npm run build`，再由同一个 Express 进程托管 `dist` 和 `/api`。

## 2. 身份和角色

| 角色 | 权限 |
|---|---|
| `resident` | 查看服务、表达意向、预约、报名、发帖、互助、聊天、积分 |
| `social_worker` | 查看被分配任务、保存并提交走访记录 |
| `community_operator` | 核验发布服务、活动运营、查看聚合信号、分派和审核任务 |
| `admin` | 跨业务管理和应急处置 |

当前前端通过 `/api/auth/demo-login` 自动建立演示会话，便于封闭试点和路演。公开上线前必须设置 `ALLOW_DEMO_LOGIN=false`，并接入微信登录或组织账号认证。

## 3. 核心状态机

### 公共服务

```text
draft → pending_review → published → expired / withdrawn / archived
```

发布前必须确认核心字段，以及价格、容量和服务站时段等未知字段的居民侧表达。

### 邻里互助

```text
active → claimed → completed
       ↘ cancelled
```

发布时悬赏积分从发起人账户扣除并进入托管；帮助者接单时不结算；发起人确认完成后才向帮助者入账，并更新信用和帮助次数。取消时仅退回仍处于托管状态的积分。

### 社工走访

```text
task pending/in_progress → visit draft → submitted → approved/rejected
```

走访记录提交前必须确认居民授权；提交后不可直接覆盖，由负责人审核并保留审计记录。

## 4. 主要 API

- `/api/auth/*`：会话和当前用户
- `/api/public-services/*`：服务接入、核验、发布、撤回和居民行动
- `/api/insights`：社区级脱敏信号
- `/api/social-work/tasks/*`：任务、走访和审核
- `/api/spaces/*`：预约、取消和评价
- `/api/activities/*`：活动报名与取消
- `/api/activity-operations/*`：现场清单和通知
- `/api/posts/*`：邻里圈、点赞、评论和举报
- `/api/help/*`：接单、完成、取消和积分结算
- `/api/points`：积分流水和信用事件
- `/api/conversations/*`：会话和消息
- `/api/notifications/*`：站内通知

## 5. 数据库

数据库 DDL 位于 `server/schema.sql`，包括 31 个业务表和索引。SQLite 采用 WAL 模式，适合单实例、数十到数百名试点用户。

以下情况应迁移 PostgreSQL：

- 多社区并行运营
- 多个 API 实例水平扩容
- 高频实时聊天
- 大量文件、录音或图片
- 复杂报表和跨区域统计

迁移时保留 REST API 和领域状态机，仅替换 `server/db.ts` 的仓储实现。

## 6. 部署

单社区试点推荐 Docker 单实例部署，并挂载 `/app/data` 持久卷：

```bash
docker compose up --build -d
```

Vercel 配置仅适合纯前端预览，因为 Serverless 文件系统不能持久保存 SQLite。完整 MVP 应部署在具备持久磁盘的云主机、容器平台或托管 Node 服务上。

## 7. 正式公开上线前仍需外部配置

- 微信小程序 AppID、登录凭证和合法域名
- 短信或组织账号认证方案
- HTTPS 域名、备案及隐私政策页面
- 腾讯云 COS 等文件存储
- 微信订阅消息模板
- 内容安全服务与人工审核值班流程
- 数据备份、告警和灾难恢复策略
