# Design QA — 搭把手双端联动 Demo v0.1

## Visual truth sources

- `/Users/bera/Library/Mobile Documents/com~apple~CloudDocs/CodexWorkspaces/职业发展与求职/黑客松·社区数字化/搭把手/product/toG-demo-v0.1/visuals/01_手机端_今日工作台.png`
- `/Users/bera/Library/Mobile Documents/com~apple~CloudDocs/CodexWorkspaces/职业发展与求职/黑客松·社区数字化/搭把手/product/toG-demo-v0.1/visuals/02_手机端_走访记录核对.png`
- `/Users/bera/Library/Mobile Documents/com~apple~CloudDocs/CodexWorkspaces/职业发展与求职/黑客松·社区数字化/搭把手/product/toG-demo-v0.1/visuals/03_电脑端_公共服务接入台.png`
- `/Users/bera/Library/Mobile Documents/com~apple~CloudDocs/CodexWorkspaces/职业发展与求职/黑客松·社区数字化/搭把手/product/toG-demo-v0.1/visuals/04_电脑端_活动运营台.png`
- `/Users/bera/Library/Mobile Documents/com~apple~CloudDocs/CodexWorkspaces/职业发展与求职/黑客松·社区数字化/搭把手/product/toG-demo-v0.1/visuals/05_电脑端_需求热点追踪.png`

## Implementation captures

- Desktop service intake, 1440 × 900, AI-extracted state: `/tmp/dabashou-tog-desktop-final-v3.jpg`
- ToG mobile workbench, 390 × 844, review-pending state: `/tmp/dabashou-tog-mobile-final.jpg`
- Resident mobile, 390 × 844, published state: `/tmp/dabashou-resident-mobile-final.jpg`

## Comparison method

- Compared the desktop implementation and `03_电脑端_公共服务接入台.png` together at the same 1440 × 900 viewport.
- Compared the ToG mobile implementation and `01_手机端_今日工作台.png` together at the same 390 × 844 viewport.
- Checked both full-page structure and focused states for source intake, resident service detail, anonymous feedback, and visit submission.

## Findings and fixes

### P0

- Historical resident route exposed simulated room, credit, chat and personal-profile data. Fixed by removing the public legacy route while retaining the source file for future controlled reuse.
- A published state could be restored from malformed browser storage without all review gates. Fixed with schema normalization and cross-field publication validation.

### P1

- Resident action naming overstated the event as an action start. Renamed to `service_interest_expressed` and mapped it to “表达办理意向”.
- The page could imply live institutional integration. Added an always-visible public-source/no-partnership disclaimer and changed “实时联动” to “演示联动”.
- Published queue counts included non-operational sample cards. Changed the current queue count to one actionable source and zero after publication.
- Submitted visit drafts remained editable. All draft controls now become read-only after submission.

### P2

- Disabled filters, inactive navigation and fixed sample rows now communicate that they are future/demo-only instead of acting like broken controls.
- Resident “搭把手” paths now return visible feedback; “我的进度” resolves each intent against the actual service card.
- Desktop typography and density are slightly more compact than the visual source so the full three-column review workspace remains usable at 1440 × 900. Visual hierarchy, jade/coral palette, panel rhythm and primary action placement remain aligned.

## Functional browser checks

- Public source → AI extraction → core-field confirmation → three unknown-field confirmations → publish.
- Resident search → service detail → source/boundary visibility → express interest.
- Anonymous feedback appears in ToG insights; one unique actor stays below the five-actor hotspot threshold.
- ToG mobile visit draft saves across reload, submits to reviewer state, and becomes read-only.
- Desktop: 1440 × 900, no horizontal overflow. Mobile: 390 × 844, document width exactly 390 on both resident and ToG routes.
- Console inspected: no runtime errors or warnings; only Vite development and React DevTools informational messages.
- `npm run lint`, `npm run build`, and `git diff --check` pass.

final result: passed
