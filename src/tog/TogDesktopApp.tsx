import { useState, type ElementType } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  FileSearch,
  Flame,
  HandHeart,
  Home,
  Info,
  Link2,
  ListChecks,
  RotateCcw,
  Send,
  Sparkles,
  Upload,
  UserRound,
} from 'lucide-react';
import moxaSourceImage from '../assets/moxa-service-source.jpg';
import { useDemoStore } from '../demo/DemoStore';
import { missingFieldLabels } from '../demo/fixtures';
import { routeTo } from '../demo/navigation';
import type { MissingFieldKey } from '../demo/types';
import { CommunityWorkbenchPage } from './CommunityWorkbenchPage';
import { DemandFeedbackPage } from './DemandFeedbackPage';
import { DesktopPageHeader } from './DesktopPageHeader';
import { ResidentServiceRecordsPage } from './ResidentServiceRecordsPage';

interface NavItem {
  route?: string;
  label: string;
  icon: ElementType;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: '今日工作台', icon: Home, route: '/tog/desktop/workbench' },
  { label: '公共服务库', icon: BookOpenCheck, route: '/tog/desktop/services' },
  { label: '活动运营', icon: CalendarDays, route: '/tog/desktop/activities' },
  { label: '居民服务档案', icon: UserRound, route: '/tog/desktop/records' },
  { label: '需求与反馈', icon: Flame, route: '/tog/desktop/insights' },
];

function DesktopSidebar({ route }: { route: string }) {
  const { resetDemo } = useDemoStore();

  return (
    <aside className="tog-sidebar">
      <button className="brand-lockup" type="button" onClick={() => routeTo('/tog/desktop/services')}>
        <span className="brand-lockup__mark"><HandHeart aria-hidden="true" /></span>
        <span>搭把手</span>
      </button>
      <button className="community-select" type="button" aria-label="当前社区：西红门社区" disabled title="本演示固定为西红门社区">
        西红门社区 <span aria-hidden="true">⌄</span>
      </button>

      <nav className="tog-sidebar__nav" aria-label="社区运营导航">
        {navItems.map(({ label, icon: Icon, route: itemRoute, disabled }) => {
          const active = itemRoute === route;
          return (
            <button
              type="button"
              key={label}
              className={`tog-nav-item${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              disabled={disabled}
              onClick={() => itemRoute && routeTo(itemRoute)}
              title={disabled ? '后续版本开放' : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
              {disabled && <small>后续</small>}
            </button>
          );
        })}
      </nav>

      <div className="tog-sidebar__footer">
        <button className="sidebar-utility" type="button" onClick={resetDemo}>
          <RotateCcw size={16} aria-hidden="true" /> 重置演示
        </button>
        <div className="operator-profile">
          <span className="operator-profile__avatar">李</span>
          <span><strong>李敏</strong><small>演示账号 · 社区运营</small></span>
        </div>
      </div>
    </aside>
  );
}

function ReviewField({ label, value, status }: { label: string; value: string; status?: 'verified' | 'extracted' | 'pending' }) {
  return (
    <div className="review-field">
      <dt>{label}</dt>
      <dd>
        <span>{value}</span>
        {status === 'verified' && <span className="status-chip status-chip--success"><Check size={13} /> 人工已核</span>}
        {status === 'extracted' && <span className="status-chip status-chip--demo">AI 已提取</span>}
        {status === 'pending' && <span className="status-chip status-chip--warning">待确认</span>}
      </dd>
    </div>
  );
}

function ServiceIntakePage() {
  const {
    state,
    primaryService,
    remainingReviewCount,
    canPublish,
    runExtraction,
    confirmCoreFields,
    confirmField,
    publish,
  } = useDemoStore();
  const extracted = state.intakePhase !== 'source';
  const published = state.intakePhase === 'published';
  const reviewGateCount = remainingReviewCount + (state.coreFieldsConfirmed ? 0 : 1);

  return (
    <div className="tog-page">
      <DesktopPageHeader
        title="新增公共服务"
        description="从原始通知到居民服务卡，每一步都可核对"
        action={
          <div className="header-actions">
            <button className="button button--ghost" type="button" disabled title="v0.2 接入真实导入"><Link2 size={17} /> 粘贴来源链接</button>
            <button className="button button--primary" type="button" disabled title="v0.2 接入真实导入"><Upload size={17} /> 上传通知或海报</button>
          </div>
        }
      />

      {published && (
        <div className="success-banner" role="status">
          <CheckCircle2 aria-hidden="true" />
          <div><strong>服务草稿已由李敏完成确认</strong><span>本轮只验证社区端流程；居民端保持 main 现状，服务卡联动留到下一轮功能迭代。</span></div>
          <button className="button button--primary" type="button" onClick={() => routeTo('/resident')}>
            查看居民端现状 <ArrowRight size={17} />
          </button>
        </div>
      )}

      <section className="intake-grid" aria-label="公共服务接入工作区">
        <aside className="source-queue panel">
          <div className="panel-heading"><strong>本轮待处理来源</strong><span className="count-badge">{published ? 0 : 1}</span></div>
          <button className="source-list-item is-active" type="button" disabled>
            <span>1</span><span><strong>西红门医院</strong><small>三伏贴服务</small></span>
            <em>{published ? '已发布' : '待核对'}</em>
          </button>
          <button className="source-list-item" type="button" disabled>
            <span>2</span><span><strong>大兴区妇联</strong><small>暑期家庭教育讲座</small></span>
          </button>
          <button className="source-list-item" type="button" disabled>
            <span>3</span><span><strong>大兴区人保局</strong><small>7 月招聘活动</small></span>
          </button>
          <div className="source-queue__tip"><Info size={16} /> 真实来源快照 · 演示前需再次核验状态</div>
        </aside>

        <article className="source-document panel">
          <div className="panel-heading">
            <span><strong>原始来源</strong><small>西红门医院公众号 · 6 月 30 日发布</small></span>
            <a href={primaryService.source.url} target="_blank" rel="noreferrer" className="icon-link" aria-label="查看原文">
              <ExternalLink size={17} />
            </a>
          </div>
          <div className="source-document__paper">
            <p className="source-document__account">大兴区西红门医院</p>
            <h2>2026 年三伏贴服务预约</h2>
            <img src={moxaSourceImage} alt="三伏贴药贴置于浅绿色瓷盘中的服务通知配图" />
            <div className="source-document__copy">
              <strong>服务时间：7 月 15 日—8 月 23 日</strong>
              <span>线上预登记后，工作日持身份证或社保卡到三楼中医科现场缴费确认。</span>
              <p>适用于慢性呼吸系统疾病、反复呼吸道感染、体虚易感冒儿童及 60 岁以上老人。</p>
            </div>
            <div className="source-document__warning"><CircleAlert size={17} /> 原文未公开价格、每日容量与各站具体时段</div>
          </div>
        </article>

        <section className="review-panel panel">
          <div className="panel-heading"><strong>居民服务卡草稿</strong><span className="status-chip status-chip--success">真实公开来源</span></div>
          {!extracted ? (
            <div className="ai-empty-state">
              <span className="ai-empty-state__icon"><Sparkles aria-hidden="true" /></span>
              <h2>让 AI 先整理原文</h2>
              <p>提取服务对象、时间、地点、行动方式和来源，同时标出不能确定的内容。</p>
              <button className="button button--primary button--large" type="button" onClick={runExtraction}>
                <Sparkles size={18} /> 生成可核对草稿
              </button>
              <small>本 Demo 使用确定性结果，关键动作仍由人确认。</small>
            </div>
          ) : (
            <>
              <div className="ai-summary">
                <Sparkles size={18} aria-hidden="true" />
                <span><strong>AI 已提取 9 个字段</strong>{reviewGateCount > 0 ? `，还需完成 ${reviewGateCount} 组人工核验` : '，人工核验已完成'}</span>
              </div>
              <dl className="review-fields">
                <ReviewField label="服务名称" value={primaryService.shortTitle} status={state.coreFieldsConfirmed ? 'verified' : 'extracted'} />
                <ReviewField label="供给单位" value="西红门医院" status={state.coreFieldsConfirmed ? 'verified' : 'extracted'} />
                <ReviewField label="服务对象" value="呼吸系统慢病、体虚儿童、60 岁以上老人" status={state.coreFieldsConfirmed ? 'verified' : 'extracted'} />
                <ReviewField label="服务时间" value="7 月 15 日—8 月 23 日" status={state.coreFieldsConfirmed ? 'verified' : 'extracted'} />
                <ReviewField label="报名方式" value="线上预登记 + 线下缴费确认" status={state.coreFieldsConfirmed ? 'verified' : 'extracted'} />
                <ReviewField label="服务地点" value="医院三楼中医科及 4 个服务站" status={state.coreFieldsConfirmed ? 'verified' : 'extracted'} />
              </dl>
              <button className={`core-review-button${state.coreFieldsConfirmed ? ' is-confirmed' : ''}`} type="button" onClick={confirmCoreFields} disabled={state.coreFieldsConfirmed || published}>
                <BookOpenCheck size={18} />
                <span><strong>{state.coreFieldsConfirmed ? '必要字段已逐项对照原文' : '逐项对照原文并确认必要字段'}</strong><small>服务对象、时间、地点和行动方式必须由工作人员确认。</small></span>
                {state.coreFieldsConfirmed ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
              </button>
              <div className="missing-fields" aria-label="需人工确认的未知字段">
                {(Object.keys(missingFieldLabels) as MissingFieldKey[]).map((field) => {
                  const meta = missingFieldLabels[field];
                  const confirmed = state.confirmedUnknownFields.includes(field);
                  return (
                    <button
                      className={`missing-field${confirmed ? ' is-confirmed' : ''}`}
                      key={field}
                      type="button"
                      onClick={() => confirmField(field)}
                      disabled={confirmed || published}
                    >
                      <span>{confirmed ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}</span>
                      <span><strong>{meta.label}</strong><em>{meta.value}</em><small>{meta.note}</small></span>
                      <b>{confirmed ? '已明确' : '确认表达'}</b>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </section>

      <footer className="intake-actionbar">
        <p><Info size={18} /> 时间、对象、地点、行动方式必须核对；非阻断未知字段需明确告诉居民。</p>
        <span className={remainingReviewCount > 0 ? 'review-remaining' : 'review-ready'}>
          {published ? <><CheckCircle2 size={17} /> 已发布</> : extracted ? `${reviewGateCount} 组待核验` : '尚未生成草稿'}
        </span>
        <button className="button button--ghost" type="button" onClick={() => window.open(primaryService.source.url, '_blank', 'noopener,noreferrer')}>对照原文</button>
        <button className="button button--primary" type="button" disabled={!canPublish || published} onClick={publish}>
          {published ? '已确认发布' : '确认并发布'}
        </button>
      </footer>
    </div>
  );
}

function ActivitiesPage() {
  const { state, toggleActivityItem, sendNotice } = useDemoStore();
  const [signInStarted, setSignInStarted] = useState(false);
  const completeCount = Object.values(state.activityChecklist).filter(Boolean).length;
  const checklistLabels = {
    qrCode: '签到二维码已生成',
    venue: '场地已确认',
    speaker: '讲师到场待确认',
  } as const;

  return (
    <div className="tog-page">
      <DesktopPageHeader
        title="活动运营"
        description="把一次活动，从发布办到有反馈"
        action={<button className="button button--primary" type="button" disabled title="v0.2 开放新建活动">新建活动</button>}
      />
      <div className="filter-row" aria-label="活动筛选">
        <button className="filter-control" type="button" disabled><CalendarDays size={16} /> 本周⌄</button>
        <button className="filter-control" type="button" disabled>全部状态⌄</button>
        <button className="filter-control" type="button" disabled>全部主办方⌄</button>
        <span className="status-chip status-chip--demo">全页均为演示数据</span>
      </div>
      <section className="operations-grid">
        <aside className="event-list panel">
          <div className="mini-calendar">
            <strong>2026 年 7 月</strong>
            <div className="mini-calendar__week"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>
            <div className="mini-calendar__days">{Array.from({ length: 14 }, (_, index) => <span className={index === 11 ? 'is-today' : ''} key={index}>{index + 1}</span>)}</div>
          </div>
          <button className="event-list-item is-active" type="button" disabled title="本版固定展示首个演示活动"><strong>银龄反诈小课堂</strong><span>7 月 11 日 14:00</span><em>即将开始</em></button>
          <button className="event-list-item" type="button" disabled title="v0.2 开放活动切换"><strong>暑期家庭教育讲座</strong><span>7 月 12 日 10:00</span><em>报名中</em></button>
          <button className="event-list-item" type="button" disabled title="v0.2 开放活动切换"><strong>就业服务专场</strong><span>7 月 15 日 09:30</span><em>草稿</em></button>
        </aside>

        <article className="event-command panel">
          <div className="event-command__title"><div><h2>银龄反诈小课堂</h2><p>西红门党群服务中心 · 容量 50 人</p><small>主办：西红门社区　|　负责人：李敏</small></div><span className="status-chip status-chip--demo">演示数据</span></div>
          <div className="stage-track" aria-label="活动阶段">
            {['草稿', '已发布', '报名中', '现场执行', '待复盘'].map((stage, index) => <span className={index < 4 ? 'is-done' : ''} key={stage}><i>{index < 3 ? <Check size={14} /> : index + 1}</i>{stage}</span>)}
          </div>
          <div className="funnel-strip">
            {[['居民端浏览', '326'], ['开始报名', '46'], ['报名成功', '38'], ['候补', '0'], ['待签到', '38']].map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}
          </div>
          <div className="checklist-heading"><h3>现场执行清单</h3><span>{completeCount}/3 已处理</span></div>
          <div className="event-checklist">
            {(Object.keys(checklistLabels) as (keyof typeof checklistLabels)[]).map((item) => (
              <button type="button" key={item} onClick={() => toggleActivityItem(item)}>
                {state.activityChecklist[item] ? <CheckCircle2 className="is-success" /> : <CircleAlert className="is-warning" />}
                <span>{checklistLabels[item]}</span><em>{state.activityChecklist[item] ? '已完成' : '待处理'}</em>
              </button>
            ))}
          </div>
          <div className="event-actions">
            <button className="button button--primary" type="button" onClick={() => setSignInStarted(true)}><ListChecks size={17} /> {signInStarted ? '已进入签到' : '进入签到'}</button>
            <button className="button button--ghost" type="button" onClick={sendNotice}><Send size={17} /> {state.noticeSent ? '已模拟发送' : '发送变更通知'}</button>
          </div>
        </article>

        <aside className="ai-operations panel">
          <div className="panel-heading"><strong>AI 运营草稿</strong><span className="status-chip status-chip--demo">演示数据</span></div>
          <div className="ai-summary"><Sparkles size={18} /> 已生成 4 份草稿，发布前逐份核对</div>
          {[
            ['居民端活动卡', '已核对', true],
            ['报名表', '2 项待确认', false],
            ['活动提醒', state.noticeSent ? '已模拟发送' : '待核对', state.noticeSent],
            ['活动后总结模板', '已生成', true],
          ].map(([label, status, done]) => <div className="draft-row" key={String(label)}><FileSearch size={18} /><strong>{label}</strong><span className={done ? 'is-success' : 'is-warning'}>{status}</span></div>)}
          <button className="button button--ghost button--block" type="button" disabled title="v0.2 开放草稿编辑">逐份核对</button>
          {signInStarted && <p className="inline-success" role="status"><CheckCircle2 size={16} /> 签到模式已开启（演示）。</p>}
          {state.noticeSent && <p className="inline-success" role="status"><CheckCircle2 size={16} /> 演示通知已生成；未向真实居民发送。</p>}
        </aside>
      </section>
    </div>
  );
}

export function TogDesktopApp({ route }: { route: string }) {
  const page = route === '/tog/desktop/workbench'
    ? <CommunityWorkbenchPage />
    : route === '/tog/desktop/services'
      ? <ServiceIntakePage />
      : route === '/tog/desktop/activities'
        ? <ActivitiesPage />
        : route === '/tog/desktop/records'
          ? <ResidentServiceRecordsPage />
          : route === '/tog/desktop/insights'
            ? <DemandFeedbackPage />
            : <CommunityWorkbenchPage />;

  return (
    <div className="tog-desktop-shell">
      <DesktopSidebar route={route} />
      <main className="tog-desktop-main">{page}</main>
    </div>
  );
}
