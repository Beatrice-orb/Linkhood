# 搭把手 PR #6｜居民答疑 Agent 与匿名需求桥接协作入口

> 适用目录：本仓库及其子目录。
> 当前分支：`agent/pr6-resident-agent-bridge`。
> 本入口只约束 PR #6 的双端融合、居民答疑 Agent、匿名需求信号和演示闭环。

## 启动读取

进入本工作树后，按顺序读取：

1. 本文件。
2. `docs/integration-sources.json`。
3. `docs/agent/resident-service-agent.md`。
4. `docs/contracts/anonymous-demand-signal-v1.md`。
5. `docs/architecture/resident-agent-demand-bridge.md`。
6. `docs/demo/resident-agent-demo-script.md`。
7. 涉及居民端界面时，再读取根目录现有 `README.md`、`DESIGN.md` 和相关实现。
8. 涉及 ToG 时，只读检查 `vendor/tog-linkhood/`；先确认其上游提交，再决定同步或适配方式。

## 固定来源

| 端 | 仓库 | 基线 |
|---|---|---|
| ToC 居民端与 PR #6 目标仓库 | `Beatrice-orb/TOC-Linkhood` | `main@3e3b604` |
| ToG 社区电脑端上游 | `Beatrice-orb/TOG-Linkhood` | `main@7160abc` |

精确提交与 subtree 信息以 `docs/integration-sources.json` 为准。

## 当前产品边界

- 只保留社区工作人员使用的 ToG 电脑端，不恢复旧 ToG 手机端或社工手机端。
- 居民答疑 Agent 只回答社区服务、社区活动及其行动方式。
- Agent 只能依据提供的社区知识回答；资料未覆盖时必须明确说明“当前已核验的演示资料中暂未找到”。
- Agent 可以展示白名单科室与模拟电话，但不能自行编造科室、号码、余量、资格、时间或办理承诺。
- 对明确且未被现有供给覆盖的需求，系统内部自动生成匿名需求信号；不询问居民是否提交。
- 居民端不得出现“提交需求”“已记录”“提交成功”“已受理”“工作人员将联系”等按钮、Toast、回执或承诺。
- 匿名需求信号只在社区端可见；社区端必须标注“匿名需求信号 · 非工单 · 演示数据”。
- 匿名信号不是投诉、工单、个案或正式受理记录，不能自动派单、自动入档或承诺回复时限。
- 单条匿名信号可以进入社区端“居民声音”；聚合洞察只能按信号次数表述，不能在没有身份数据时声称“涉及 X 位居民”。

## 数据与隐私

- 不写入或展示真实姓名、手机号、身份证号、精确楼栋门牌、真实个案、原始录音或完整聊天记录。
- 自动记录不得读取居民档案，也不得与信用分、风险分、画像 ID 或其他个人标识关联。
- 只允许保留需求主题、未覆盖部分、脱敏短语、非敏感情境标签、知识覆盖状态和建议承接科室。
- 居民主动输入个人信息时，必须在进入模型和写入信号前脱敏；无法可靠脱敏时不保留原话片段。
- 模拟问答、模拟科室、模拟电话和模拟信号必须显著标注为演示数据。
- P0 的浏览器本地存储只用于同源演示，不代表生产级权限隔离；真实跨设备与权限系统必须改为服务端存储。

## AI 与工具边界

- 真模型必须通过服务端代理；API Key 不得进入浏览器、提交历史或 GitHub。
- 模型负责基于资料生成回答、判断覆盖程度和提出匿名需求候选。
- 服务端策略负责白名单路由、PII 脱敏、触发判断、幂等去重和最终写入；不能完全信任模型自由调用写入工具。
- 真模型不可成为演示单点故障；超时、无 Key 或返回非法结构时使用确定性回退。
- Agent 没有报名、预约、通知、派单、建档、正式提交、受理确认或居民档案查询工具。

## 仓库与融合规则

- ToC 是本仓库原生代码；ToG 以 `vendor/tog-linkhood/` 的 Git subtree 快照存在。
- 不直接修改 `vendor/tog-linkhood/`。ToG 需要改动时，先进入 `TOG-Linkhood` 上游，再将新提交同步到 subtree。
- 集成壳、共享契约、Agent、桥接仓库和作用域样式必须位于 vendor 之外。
- 不同时导入两套 `main.tsx`、`index.html` 或全局 `index.css`；ToG 主题必须限定在社区端作用域内。
- 每次同步任一上游后，更新 `docs/integration-sources.json`，核对依赖变化，并重新运行构建与双视口验收。
- 不把旧 PR #5 的 ToG 实现重新合入 PR #6。

## 验收

- 至少验证一次“已有活动答疑 → 追问未覆盖需求 → 社区端出现匿名信号”的完整链路。
- 居民端 390×844：AI 入口、对话、来源和科室路由可用，不遮挡主导航。
- 社区端约 1440×900：匿名信号进入现有“需求反馈 / 留言板”，原话片段已脱敏，且明确不是工单；首页不新增大型悬浮面板。
- 已完整回答的问题不生成信号；重复追问不重复生成同一会话同一主题的信号。
- 紧急事项、越权请求和包含 PII 的问题通过对应安全测试。
- 至少运行 `npm run lint`、`npm run build`；接入服务端函数后还需验证完整部署构建和无 Key 回退。

## 写回

- Agent 行为或话术变化更新 `docs/agent/resident-service-agent.md`。
- 字段、去重或隐私规则变化更新 `docs/contracts/anonymous-demand-signal-v1.md`。
- 双端拓扑、存储或同步方式变化更新 `docs/architecture/resident-agent-demand-bridge.md`。
- 演示步骤变化更新 `docs/demo/resident-agent-demo-script.md`。
- 上游仓库、分支或 commit 变化更新 `docs/integration-sources.json`。
