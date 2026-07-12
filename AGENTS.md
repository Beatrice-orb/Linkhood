# 搭把手双端产品协作入口

> 适用目录：本仓库及其子目录。

## 当前目标

当前产品只包含两个公开表面：

- 居民端 `#/resident`
- 社区驾驶舱 `#/community`

当前没有“小搭”AI 助手，没有智能撮合算法，没有社工移动端。仓库中的 Agent、旧 G 端、旧 ToG 手机端和 Demo Launchpad 文件均为历史或实验代码，不得从文件存在推断为当前产品能力。

## 启动读取

进入本工作树后，按顺序读取：

1. 本文件。
2. 根目录 `README.md`。
3. `docs/integration-sources.json`。
4. 涉及居民端时读取 `DESIGN.md` 和 `src/App.tsx`。
5. 涉及 ToG 时只读检查 `vendor/tog-linkhood/`，并确认其上游提交。

`docs/agent/` 与 `docs/demo/resident-agent-demo-script.md` 仅为历史实验资料，不是当前需求规格。

## 固定来源

| 端 | 仓库 | 基线 |
|---|---|---|
| ToC 居民端与目标仓库 | `Beatrice-orb/TOC-Linkhood` | 以当前 `main` 为准 |
| ToG 社区电脑端上游 | `Beatrice-orb/TOG-Linkhood` | `main@e2ea5a233e856fd478197b2bd79a5ef644195894` |

精确提交与集成信息以 `docs/integration-sources.json` 为准。

## 当前产品边界

- 同一网页只提供“居民端 / 社区端”轻量切换，默认进入居民端。
- 居民端直接加载原版 `src/App.tsx`，不得挂载 AI 助手或重写主体。
- 居民端保留地图、活动、空间、公共服务、邻里互助、聊天、积分信用和关怀模式。
- 当前没有智能推荐或智能撮合；居民依据公开信息、筛选条件和实际沟通自主选择。
- ToG 只保留社区运营人员电脑端，不恢复旧 ToG 手机端或社工移动端。
- ToG 使用 iframe 与居民端 React 根节点、路由和全局样式隔离。
- ToG 上游快照不得在 vendor 内手工修改；需要改动时先改上游，再同步提交。
- 当前社区 iframe 不宣称与 SQLite、居民端操作或正式社区业务实时同步。
- 公开服务来源不等于项目合作，公开预登记不等于报名成功。
- 演示看板数字不等于真实社区运营成效。

## 数据与隐私

- 不写入或展示真实姓名、手机号、身份证号、精确楼栋门牌、账户、密码或验证码。
- 公共服务卡保留来源、发布时间、适用对象、地点、参与方式和最近核验时间。
- 名额、费用、容量或状态未知时必须明确提示仍需向正式渠道确认。
- 居民端操作不能自动生成社区任务、受理回执或工作人员跟进承诺。

## 仓库与同步规则

- ToC 是目标仓库原生代码；优先保留原版 Portal、页面、模式、导航与交互。
- ToG 快照位于 `vendor/tog-linkhood/`，运行入口为 `tog.html`。
- 每次同步 ToG 上游后，更新 `docs/integration-sources.json`、README 和路演材料中的主题与 commit。
- 不把 `src/resident/ResidentWithAgent.tsx`、`src/features/resident-agent/` 或 Agent API 重新接回当前入口，除非用户重新明确立项。
- 不把 `src/demo/`、`src/government/`、`src/tog/TogMobileApp.tsx` 恢复为公开路由。

## 验收

- `#/resident` 显示原居民 Portal，页面中没有小搭 AI 悬浮入口。
- `#/community` 完整显示最新版 ToG 桌面 UI，当前主题为茱萸红。
- 顶部只保留居民端和社区端两个切换项。
- 生产构建主包不包含 `resident-agent`、`ResidentAgentWidget` 或“小搭”字符串。
- 至少运行 `npm run lint`、`npm run build` 和 `git diff --check`。
- 后端测试若因沙箱禁止监听端口而无法执行，需要明确记录，不得误报为通过。

## 写回

- 上游仓库、分支、commit 或 iframe 集成变化更新 `docs/integration-sources.json`。
- 当前产品架构和运行方式更新根目录 `README.md`。
- 路演内容变化同步更新 `搭把手_9页PPT内容与逐字稿.md` 和 `搭把手_9页路演演示.html`。
