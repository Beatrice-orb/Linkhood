# 搭把手｜双端联动 Demo v0.1

> 让公共服务更容易抵达居民，让邻里在可信、低风险的场景下彼此搭把手。

搭把手是以社区为入口的公共服务连接与运营协作平台。当前 Demo 只做深一条主链：把真实公开服务来源整理成可核验的居民服务卡，由工作人员确认后发布；居民表达办理意向，再以脱敏信号回流到社区端。低风险邻里互助只作为品牌第二重含义的一张侧卡，不扩成陌生人社交平台。

在线预览：[https://linkhood-demo.vercel.app/#/demo](https://linkhood-demo.vercel.app/#/demo)

> 当前 `main` 生产站仍是旧居民端；本分支未合并前，新双端闭环只在上面的 Preview 地址。

## 运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000/#/demo`，从“社区运营电脑端”开始。状态保存在当前浏览器的 `localStorage`；点击“重置演示”可从头演示。

## 可运行入口

- `#/demo`：双端演示启动页
- `#/tog/desktop/services`：公开来源接入、AI 草稿、人工核验与发布
- `#/resident/services`：居民查看服务、来源和适用对象，表达办理意向
- `#/tog/desktop/insights`：脱敏意向回流与热点阈值判断
- `#/tog/desktop/activities`：活动运营能力演示
- `#/tog/mobile/workbench`：社区工作人员今日工作台
- `#/tog/mobile/visit`：授权走访记录核对与提交审核

## 最小闭环

```text
真实公开来源
  → AI 结构化草稿与缺项提示
  → 工作人员核对核心字段和未知字段表达
  → 发布居民服务卡
  → 居民查看来源并表达办理意向
  → 社区端收到脱敏信号
  → 未达到 5 个去重主体时不升级为需求热点
```

“我想办理”只表示办理意向，不等于报名、预约或资格审核成功；Demo 不执行真实通知、入档或机构系统集成。

## 当前技术结构

```text
src/
├── demo/       # 共享契约、fixtures、localStorage 状态与启动页
├── tog/        # 社区运营电脑端和手机端
├── resident/   # 当前居民端身边服务入口
└── App.tsx     # 历史居民端原型源码，仅保留参考，不暴露公开路由
```

- React 19 + TypeScript + Vite
- hash 路由
- 两端共享 `PublicServiceCard` / `ResidentActionEvent`
- 确定性 AI 演示结果，避免真模型成为演示单点故障
- `localStorage` 串联同一浏览器内的双端状态

## 数据与隐私边界

- 三伏贴、暑期研学营和招聘活动来自真实公开来源快照，演示前仍需再次核验。
- 页面明确声明：公开来源不代表来源机构与项目存在合作关系。
- 活动运营、走访对象、报名数字和工作人员账号均为演示数据。
- 不展示真实姓名、手机号、身份证号、精确门牌号、真实个案或原始录音。
- 旧居民端中的房号、信用分、聊天和个人模拟档案不属于当前产品能力。

## 文档

- [完整演示脚本、开发步骤、后续计划与待讨论项](docs/dual-ended-demo-v0.1.md)
- [设计与交互 QA](design-qa.md)

## 质量检查

```bash
npm run lint
npm run build
```

已验证 1440×900 桌面与 390×844 手机视口；核心闭环、走访提交只读、状态持久化和隐私提示均通过浏览器验收。

## 协作与部署

当前采用手动发布：队友在本地 clone 并从 feature 分支开发，先用 PR #4 固定 Preview 验收；团队确认后合并 `main`，再由 Bera 从本机专用 worktree 使用 Vercel CLI 发布生产站。当前不连接 Git Integration。

- Vercel Project：`bera-projects-live/linkhood`
- Production Branch：`main`
- Build Command：`npm run build`
- Output Directory：`dist`
- 当前 `main` 生产站：[https://linkhood-two.vercel.app](https://linkhood-two.vercel.app)
- 本 PR Preview：[https://linkhood-demo.vercel.app/#/demo](https://linkhood-demo.vercel.app/#/demo)

合并 `main` 后的发布命令：

```bash
cd /Users/bera/dev/linkhood-main-deploy
git fetch origin
git pull --ff-only origin main
npx vercel deploy --prod --yes --scope bera-projects-live
```

部署完成后确认 `https://linkhood-two.vercel.app` 可访问，再把本次上线视为完成。

## 分支状态

- 分支：`agent/build-tog-demo-v0-1`
- 已同步基线：`origin/main@8240f90`（含 care mode 与公共服务数据 schema）
- 当前：实现已完成并通过 QA；核心 commit `948ee8f` 已推送并创建 Draft PR #4，PR 已同步 `main@8240f90`，Vercel Preview 已上线。

PR #4 与供给数据 PR #1、核心理念 PR #2、ToG PRD PR #3 保持独立，分别 Review、分别合并。
