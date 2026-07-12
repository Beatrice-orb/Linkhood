# 搭把手 Linkhood

搭把手是面向社区居民与社区运营人员的社区生活服务协作产品。PR #6 将原居民端、完整社区运营驾驶舱和居民社区生活助理合并到同一个 Web 入口，当前公开预览只保留两个产品表面：居民端与社区端。

## 当前产品入口

启动后打开：

```text
http://localhost:3000/#/resident
```

页面顶部提供一个小型切换器：

- `#/resident`：居民社区生活端。保留社区地图、活动、空间、邻里圈、互助、聊天、积分信用、关怀模式等原有功能，并在手机界面右下角增加居民社区生活助理“小搭”。
- `#/community`：社区运营驾驶舱。通过独立 `tog.html` 和 iframe 隔离加载完整的 ToG 社区桌面 UI。

除 `/resident` 和 `/community` 外的旧 Hash 路由会自动回到 `/resident`。当前版本不再展示旧 Demo 启动台，也不再提供社工移动端产品入口。

## 产品结构

```text
同一网页
├── 居民端 /resident
│   ├── 原居民社区生活 Portal
│   └── 居民社区生活助理“小搭”
└── 社区端 /community
    └── iframe → /tog.html → vendor/tog-linkhood
```

居民端和社区端使用顶部轻量切换器互相切换，不再通过多端 Launchpad 分流。

## 居民社区生活助理

小搭的定位是“社区服务理解与推荐助手”，不是社区工作人员、报名系统、留言板、工单系统或个案系统。

### 已实现能力

- 理解居民口语中的生活目标、时间偏好、参与方式和非敏感约束。
- 在已核验的演示服务、活动、地点和规则中检索并组合建议。
- 支持两轮对话，第二轮能够继承第一轮目标和约束。
- 解释推荐理由，而不是只复述公告标题。
- 明确未知的实时名额、资格和状态，不使用模型常识补造社区事实。
- 确有人工确认价值时，在第二轮结尾提供服务端白名单中的模拟科室电话。
- 真模型无 Key、超时或结构异常时自动使用确定性本地知识回退。
- 生成无居民原话、无 PII、无敏感画像的演示需求洞察标签。

### 明确不做

- 不替居民报名、预约、申请或投诉。
- 不创建留言、工单或匿名需求信号。
- 不把单条居民对话写入社区端留言板。
- 不承诺工作人员会联系、回复、受理或建设服务。
- 不索要姓名、手机号、住址、证件、账号、密码或验证码。
- 不保存居民原话、完整回答、居民 ID、设备指纹或跨会话标识。
- 不推断年龄、健康、收入、政治身份、家庭风险或心理状态。

完整规格见 [docs/agent/resident-service-agent.md](docs/agent/resident-service-agent.md)，90 秒演示脚本见 [docs/demo/resident-agent-demo-script.md](docs/demo/resident-agent-demo-script.md)。

## AI 数据边界

AI 请求入口：

```http
POST /api/resident-agent
```

请求失败时，居民端自动切换到 `fallbackEngine.ts` 中的确定性知识回退，不向居民暴露模型供应商错误。

允许沉淀的洞察只包含：

```text
domain
goalTags
constraintTags
knowledgeCoverage
matchedSupplyIds
turnCount
isDemo
```

当前洞察由 `insightRepository.ts` 在居民浏览器本地保存，用于演示聚合主题和趋势，不会写入社区留言板或 SQLite 个案表。禁止保存居民原话、姓名、电话、精确地址、居民 ID、跨会话标识和敏感推断。

## 本机模型配置

本地开发环境可以在 AI 助手中配置兼容 OpenAI Responses API 或 Chat Completions 的模型提供方。

相关接口只允许 localhost 请求：

```http
GET    /api/resident-agent/session-config
POST   /api/resident-agent/session-config
DELETE /api/resident-agent/session-config
```

API Key 只保存在当前本地服务进程内存中：

- 不写入 `localStorage`、`sessionStorage`、Cookie 或 URL。
- 不写入日志、项目文件或 Git 历史。
- 页面提交后不回显完整 Key。
- 停止本地服务后配置失效。
- 非 localhost Preview 不显示个人 Key 输入入口。

也可以通过服务端环境变量配置：

```bash
OPENAI_API_KEY=""
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL=""
OPENAI_API_STYLE="responses"
```

不要使用 `VITE_` 前缀保存服务端密钥。

## 社区运营驾驶舱

社区端来源于 `TOG-Linkhood@dc2dd60`，以只读 vendor 快照形式保存在：

```text
vendor/tog-linkhood/
```

运行时通过：

```text
#/community
→ src/integration/CommunitySurface.tsx
→ iframe /tog.html
→ vendor/tog-linkhood/src/App.tsx
```

iframe 用于隔离 ToG 上游项目的 Tailwind 主题、全局样式和运行状态，避免污染居民端。

当前社区驾驶舱是完整 UI 产品预览，使用上游演示数据。PR #6 不把居民 AI 单条对话、留言或工单桥接到社区驾驶舱，也不应宣称社区端已经消费 AI 聚合洞察。后续如需生产整合，应通过正式聚合 API、最小展示阈值、社区级数据隔离和角色权限接入，而不是读取居民原始对话。

## 技术架构

```text
React 19 + TypeScript + Vite
│
├── ResidentWithAgent
│   ├── 原居民 App
│   └── ResidentAgentWidget（Portal 挂载）
│       ├── /api/resident-agent
│       ├── 本地结构化知识
│       ├── 真模型 / 确定性回退
│       └── 本地白名单化洞察标签
│
├── CommunitySurface
│   └── iframe → tog.html → vendor/tog-linkhood
│
└── Express + TypeScript
    ├── 居民业务 API、认证、RBAC、审计
    ├── Resident Agent API
    └── node:sqlite / SQLite
```

现有 Express、SQLite、公共服务、邻里互助、活动、空间、积分信用、聊天和审计代码仍保留。需要注意：PR #6 的社区 iframe 是独立 UI 快照，不等同于此前 `src/government` 与 SQLite 的同步实现。

## 本地运行

前置条件：Node.js 24+。

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000/#/resident
```

首次启动会自动创建 `data/linkhood.sqlite` 并写入单社区 MVP 种子数据。

常用命令：

```bash
npm run lint        # TypeScript 检查
npm run test        # Express / SQLite 领域与 API 测试
npm run test:agent  # 居民 Agent 安全边界与回退测试
npm run build       # main.html + tog.html 双入口生产构建
npm start           # 生产模式运行，需先 build
npm run db:reset    # 重建本地开发数据库
npm run db:backup   # 创建 SQLite 在线备份
npm run data:import # 幂等导入西红门公开服务与活动素材
```

## 演示建议

居民 Agent 主演示采用两轮对话：

1. 居民说明家人需要慢节奏学习手机挂号和缴费。
2. Agent 推荐工作日一对一“数字生活帮办桌”，解释地点、任务和隐私规则。
3. 居民补充只能周六上午陪同且担心付款安全。
4. Agent 继承约束，切换推荐到周六“手机安心用小课堂”。
5. 第二轮结尾给出白名单模拟民生服务岗电话，并明确名额仍需确认。
6. 切换到社区端，只展示运营驾驶舱能力；不要声称该对话已形成留言或被工作人员受理。

全部服务、活动、地点、来源、科室和电话号码均为演示数据。

## 真实公开素材边界

西红门与大兴公开服务素材来自政府官网、认证公众号和志愿服务平台，保留来源链接和核验状态。公开来源仅用于信息核验、服务推荐和活动策划：

- 不代表项目已与来源机构建立合作。
- “我想办理”不等于官方报名、预约或资格审核成功。
- 余量、资格、价格和临时调整仍需向主办方确认。
- AI 只能基于提供的知识事实回答，不能自动确认现实状态。

## 当前与历史模块

当前公开前端只包含居民端和社区端。仓库仍保留部分历史模块，例如 `src/tog/`、`src/government/`、`src/demo/` 和相关后端表，用于保留前期验证成果和迁移参考；它们不再由当前 `RootApp` 暴露为产品入口。尤其是旧社工移动端，不应再出现在当前架构图、路演主线或功能清单中。

## 项目结构

```text
api/resident-agent.js                  # 居民 Agent 服务端处理器
server/                                # Express、SQLite、认证、RBAC 与业务 API
src/App.tsx                            # 原居民社区生活 Portal
src/resident/ResidentWithAgent.tsx     # 居民 Portal + AI 助手组合入口
src/features/resident-agent/           # 助手 UI、知识、回退、客户端与洞察
src/integration/CommunitySurface.tsx   # 社区 iframe 集成层
vendor/tog-linkhood/                   # ToG 上游只读快照
tog.html                               # 社区端独立 Vite 入口
data/public-service/                   # 西红门公开服务来源数据
docs/agent/                            # AI 助手规格
docs/demo/                             # PR #6 演示脚本
docs/integration-sources.json          # ToC、ToG 与 Agent 来源台账
```

## PR #6 集成基线

- ToC：`TOC-Linkhood@6e5bf2b`
- ToG：`TOG-Linkhood@dc2dd60`
- 合并分支：`agent/pr6-resident-agent-bridge`
- 当前集成提交：`1b8110e`
- 边界台账：[docs/integration-sources.json](docs/integration-sources.json)
