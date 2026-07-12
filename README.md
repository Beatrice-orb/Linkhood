# 搭把手 Linkhood

搭把手是连接居民真实需求与社区公共服务供给的社区协作平台，让居民更容易找到、理解和使用身边服务，也让社区更准确地看见需求、优化运营。

当前公开预览只包含两个产品表面：居民端和社区驾驶舱。当前版本没有“小搭”AI 助手，也没有智能撮合算法；居民通过地图、列表、筛选和沟通自主发现、判断和使用服务。

## 当前产品入口

启动后打开：

```text
http://localhost:3000/#/resident
```

页面顶部提供一个小型切换器：

- `#/resident`：居民社区生活端。
- `#/community`：社区运营驾驶舱。

除 `/resident` 和 `/community` 外的旧 Hash 路由会自动回到 `/resident`。当前版本不展示旧 Demo 启动台，也不提供社工移动端入口。

## 当前产品结构

```text
RootApp
├── 居民端 /resident
│   └── 原居民 Portal（src/App.tsx）
│       ├── 社区地图
│       ├── 活动与空间
│       ├── 公共服务
│       ├── 邻里互助
│       ├── 聊天
│       ├── 积分信用
│       └── 关怀模式
└── 社区端 /community
    └── CommunitySurface
        └── iframe → /tog.html → vendor/tog-linkhood
```

居民端与社区端通过顶部轻量切换器互相切换，不再通过多端 Launchpad 分流。

## 居民端

居民端继续使用原有 Portal，不挂载 AI 助手。当前主要能力包括：

- 在社区地图和列表中发现附近活动、空间、服务和社区资源。
- 浏览公共服务的时间、地点、适用对象、参与方式和来源信息。
- 发布、浏览和响应邻里互助需求。
- 通过聊天完成双方沟通。
- 查看积分、信用和帮助记录。
- 在普通模式与关怀模式之间切换。

当前版本不应宣称：

- AI 自动理解居民自然语言需求。
- 系统根据居民画像进行智能推荐。
- 算法自动撮合居民、邻居和公共服务。
- 系统代替居民报名、预约、申请或提交社区工单。
- 居民操作会自动形成社区工作人员任务。

居民对服务和互助的选择由居民基于公开信息、筛选条件和实际沟通自主完成。

## 社区驾驶舱

社区端入口：

```text
http://localhost:3000/#/community
```

运行链路：

```text
RootApp
→ CommunitySurface
→ iframe /tog.html
→ vendor/tog-linkhood/src/App.tsx
```

iframe 用于隔离 ToG 上游项目的主题、全局样式和运行状态，避免污染居民端。

社区驾驶舱用于展示：

- 社区运营总览与待办。
- 活动和公告管理。
- 空间与公共服务资源。
- 居民、社工和反馈相关运营页面。

当前社区驾驶舱使用上游演示数据，是完整 UI 产品预览。它不等同于已连接生产数据库的社区管理系统，也不应宣称已经与居民端、SQLite 或社区正式业务实时同步。

当前 ToG vendor 快照来源：

```text
Beatrice-orb/TOG-Linkhood@e2ea5a233e856fd478197b2bd79a5ef644195894
```

该版本将社区驾驶舱主题更新为茱萸红：主色 `#B22222`，浅色背景 `#F5E8E8`。

## 后端与数据库

仓库保留 Express、SQLite 和已有业务模块，包括：

- 公共服务与来源数据。
- 活动、公告与空间。
- 邻里互助状态。
- 积分信用。
- 聊天和通知。
- 审计与历史治理模块。

需要区分两件事：

1. 仓库中存在后端与 SQLite 业务实现。
2. 当前 iframe 社区驾驶舱仍是独立 UI 快照，尚未完成与这些业务表的正式生产接入。

后续接入需要明确的数据接口、来源核验、状态维护、社区隔离、角色权限和审计机制。

## 本地运行

建议使用 Node.js 22 或更高版本。

```bash
cd /Users/apple/code/NeighborHelp/Linkhood
npm install
npm run dev
```

打开：

```text
http://localhost:3000/#/resident
```

常用命令：

```bash
npm run lint
npm run test
npm run build
npm run dev
```

## 演示建议

建议按以下顺序演示：

1. 打开 `#/resident`，展示居民端真实首页。
2. 展示社区地图、活动、空间和公共服务入口。
3. 展示邻里互助的发布、浏览、响应和聊天页面。
4. 展示积分信用与关怀模式。
5. 切换到 `#/community`，展示最新版社区驾驶舱。
6. 明确说明当前没有 AI 助手和智能撮合算法。
7. 明确说明社区驾驶舱是 ToG UI 快照，正式数据接入属于下一阶段。

## 真实公开素材边界

仓库中的西红门与大兴公共服务素材来自可追溯公开来源，用于验证服务目录、信息呈现和居民行动路径。

- 公开来源不等于项目已与相关机构建立合作。
- 文章中的历史活动不等于当前仍可报名。
- 公开预登记不等于官方报名成功。
- 演示看板数据不等于真实社区运营成效。
- 名额、费用、地点和有效状态需要在试点中持续核验。

## 当前与历史模块

当前 RootApp 只暴露居民端和社区端。

仓库仍可能保留以下历史或实验模块：

- `src/demo/`
- `src/government/`
- `src/tog/`
- `src/resident/ResidentWithAgent.tsx`
- `src/features/resident-agent/`
- `api/resident-agent.js`
- `docs/agent/`

这些文件用于保留前期验证成果和迁移参考，不属于当前产品入口、当前 MVP 功能清单或路演主线。尤其不能因为仓库中仍有实验代码，就宣称当前产品已经具备 AI 助手或智能撮合能力。

## 关键文件

```text
src/RootApp.tsx                         # 双端入口和轻量切换
src/App.tsx                             # 当前居民 Portal
src/integration/CommunitySurface.tsx   # 社区 iframe 集成层
tog.html                               # 社区端独立 HTML 入口
vendor/tog-linkhood/                   # ToG 上游只读快照
server/                                # Express、SQLite 与已有业务模块
data/public-service/                   # 可追溯公共服务素材
docs/integration-sources.json          # ToC 与 ToG 来源台账
搭把手_9页PPT内容与逐字稿.md             # 最新路演内容与逐字稿
搭把手_9页路演演示.html                 # 可编辑、全屏和打印的 HTML 路演
```

## 当前事实边界

- 只有居民端和社区驾驶舱两个公开入口。
- 没有社工移动端产品入口。
- 没有“小搭”AI 助手入口。
- 没有智能撮合算法。
- 当前社区驾驶舱不宣称与 SQLite 实时同步。
- 当前演示数据不包装成真实社区试点成效。
