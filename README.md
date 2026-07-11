# 搭把手 Linkhood

搭把手是面向社区居民、社区运营人员与社工的社区服务协作平台。项目保留原居民社区生活端，并整合 PR #4 的公共服务三端闭环。

## 产品端

- `#/resident`：居民社区生活端，包括社区地图、活动、空间、邻里圈、互助、聊天、积分信用与关怀版。
- `#/resident/services`：居民公共服务入口。
- `#/tog/desktop/services`：社区公共服务接入、核验与发布。
- `#/tog/desktop/workbench`：社区今日工作台。
- `#/tog/desktop/residents`：居民服务档案与跟进概览。
- `#/tog/desktop/permissions`：角色权限与审计日志。
- `#/tog/desktop/activities`：社区活动运营。
- `#/tog/desktop/insights`：居民需求与服务反馈。
- `#/tog/mobile/workbench`：社工今日工作台。
- `#/tog/mobile/activities`：社工活动入口。
- `#/tog/mobile/followup`：社工居民跟进任务。
- `#/tog/mobile/me`：社工账号与权限说明。
- `#/tog/mobile/visit`：社工走访记录与审核提交。
- `#/government`：G端社区治理驾驶舱，包括全域总览、活动公告、空间服务、居民社工、防诈骗与需求反馈。
- `#/demo`：三端演示启动页。

## 技术架构

```text
React 19 + TypeScript + Vite
            |
        /api HTTPS
            |
Express + TypeScript + RBAC
            |
      SQLite 数据库
```

SQLite 使用 Node.js 内置 `node:sqlite`，无需额外数据库驱动。开发环境由 Express 同时启动 API 与 Vite 中间件，生产环境由 Express 提供 API 并托管 `dist`。

G端通过 `/api/government/bootstrap` 读取治理工作区，通过 `/api/government/state` 持久化页面操作。活动、公告、社区空间和便民服务会同步写入居民端使用的业务表；居民与社工扩展档案、反馈、反诈提醒、热线和待办保存在 `government_workspaces`，并记录操作审计。

## 本地运行

前置条件：Node.js 24+。

```bash
npm install
npm run dev
```

打开 `http://localhost:3000/#/demo`。首次启动会自动创建 `data/linkhood.sqlite` 并写入单社区 MVP 种子数据。

其他命令：

```bash
npm run lint       # TypeScript 检查
npm run test       # 后端领域与 API 测试
npm run build      # 前端生产构建
npm start          # 运行生产服务，需先 build
npm run db:reset   # 重建本地开发数据库
npm run db:backup  # 创建 SQLite 在线备份
npm run data:import # 幂等导入西红门真实公共服务与活动素材
```

启动服务时也会自动执行同一套幂等导入。真实供给数据会写入 `public_service_sources`、`public_services` 和 `activities`；活动表中的记录标记为来源素材，不会直接变成居民端可报名活动。公开来源仅用于信息核验和活动策划，不代表项目已与来源机构建立合作。

## MVP 业务闭环

```text
社区接入公共服务
→ 工作人员核验并发布
→ 居民查看并表达办理意向
→ 社区接收脱敏聚合信号
→ 社工领取跟进任务并提交走访记录
```

居民社区生活端同时支持：

```text
发布邻里互助 → 邻居响应 → 私聊协作 → 双方确认完成
→ 积分结算 → 信用与帮助次数更新 → 运营指标沉淀
```

## 数据和权限

系统内置四类角色：居民、社工、社区运营、平台管理员。开发环境使用受控的 Demo 登录接口自动建立会话；公开部署时应关闭 `ALLOW_DEMO_LOGIN` 并接入微信登录或组织账号体系。

隐私与业务边界：

- “我想办理”仅代表居民意向，不代表官方报名或资格审核成功。
- 居民行动默认按社区聚合，社区运营端不展示不必要的个人信息。
- 社工走访记录需要授权、任务分配和审核权限。
- 医疗急救、借贷、进门照护等高风险事项不进入普通邻里互助。
- 所有发布、审核、积分和任务状态变更写入审计日志。

## 项目结构

```text
server/                  # Express API、SQLite、RBAC 与领域服务
src/api/                 # 前端 API 客户端与仓储适配
src/demo/                # PR4 共享契约和离线演示状态
src/resident/            # 公共服务居民端
src/tog/                 # 社区电脑端与社工手机端
src/government/          # 镇街、居委会、党群中心与妇联使用的 G 端治理 UI
src/App.tsx              # 原居民社区生活端
src/components/          # 共享组件与关怀版
data/public-service/     # 公共服务来源数据集
docs/                    # 演示和工程文档
```

PR #4 原始演示说明见 [docs/dual-ended-demo-v0.1.md](docs/dual-ended-demo-v0.1.md)。

视觉系统、普通版/关怀版设计规范及 G/B/C 端页面说明见 [DESIGN.md](DESIGN.md)。
