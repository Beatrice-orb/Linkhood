import { useEffect, useState, type ElementType, type FormEvent, type ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  Database,
  ExternalLink,
  FileSearch,
  Flame,
  HandHeart,
  Home,
  Info,
  Link2,
  ListChecks,
  MonitorSmartphone,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users,
} from 'lucide-react';
import moxaSourceImage from '../assets/moxa-service-source.jpg';
import { useDemoStore } from '../demo/DemoStore';
import { missingFieldLabels } from '../demo/fixtures';
import { routeTo } from '../demo/navigation';
import type { MissingFieldKey } from '../demo/types';
import { togApi } from '../api/tog';

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
  { label: '居民服务档案', icon: UserRound, route: '/tog/desktop/residents' },
  { label: '需求与反馈', icon: Flame, route: '/tog/desktop/insights' },
  { label: '数据与权限', icon: ShieldCheck, route: '/tog/desktop/permissions' },
];

function DesktopSidebar({ route }: { route: string }) {
  const { resetDemo } = useDemoStore();

  return (
    <aside className="tog-sidebar">
      <button className="brand-lockup" type="button" onClick={() => routeTo('/demo')}>
        <span className="brand-lockup__mark"><HandHeart aria-hidden="true" /></span>
        <span>搭把手</span>
      </button>
      <button className="community-select" type="button" aria-label="当前社区：西红门社区" disabled title="单社区 MVP 当前固定为西红门社区">
        西红门社区 <span aria-hidden="true">⌄</span>
      </button>

      <nav className="tog-sidebar__nav" aria-label="社区运营导航">
        {navItems.map(({ label, icon: Icon, route: itemRoute, disabled }) => {
          const active = Boolean(itemRoute && (itemRoute === route || route.startsWith(`${itemRoute}/`)));
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

function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <header className="tog-page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
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

function NewServicePage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const created = await togApi.createService({
        title: form.get('title'),
        shortTitle: form.get('shortTitle'),
        provider: form.get('provider'),
        serviceType: form.get('serviceType'),
        audience: String(form.get('audience') || '').split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
        location: form.get('location'),
        fee: form.get('fee'),
        capacity: Number(form.get('capacity') || 0) || null,
        registrationMethod: form.get('registrationMethod'),
        schedule: { eventStart: form.get('eventStart'), eventEnd: form.get('eventEnd') },
        source: { id: `manual_${Date.now()}`, label: form.get('sourceLabel') || '社区人工录入', url: form.get('sourceUrl'), publishedAt: new Date().toISOString().slice(0, 10) },
      });
      const serviceId = created.service.id;
      await togApi.extract(serviceId);
      for (const field of ['core', 'fee', 'capacity', 'stationHours']) await togApi.reviewField(serviceId, field);
      await togApi.publish(serviceId);
      window.dispatchEvent(new Event('linkhood:data-changed'));
      routeTo('/tog/desktop/services');
    } catch {
      setError('保存失败，请检查必填字段或稍后重试。');
      setSubmitting(false);
    }
  };

  return (
    <div className="tog-page">
      <PageHeader title="新增公共服务" description="人工确认结构化字段后发布，AI/OCR 不作为阻断项" />
      <form className="review-panel panel" onSubmit={submit}>
        <div className="panel-heading"><strong>服务信息</strong><span className="status-chip status-chip--success">人工录入</span></div>
        <dl className="review-fields">
          {[
            ['title', '完整名称', '例如：西红门医院健康服务', true],
            ['shortTitle', '居民端简称', '例如：社区健康服务', true],
            ['provider', '供给单位', '服务主办或承接单位', true],
            ['audience', '适用对象', '使用顿号分隔', true],
            ['location', '服务地点', '主地点及服务站', true],
            ['registrationMethod', '办理方式', '居民下一步该做什么', true],
            ['fee', '价格表达', '免费、金额或“现场确认”', false],
            ['capacity', '容量', '未知可留空', false],
            ['sourceLabel', '来源名称', '政府网站、公众号或机构通知', true],
            ['sourceUrl', '来源链接', 'https://...', false],
          ].map(([name, label, placeholder, required]) => (
            <div className="review-field" key={name}><dt>{label}</dt><dd><input className="filter-control" name={name} placeholder={placeholder} required={Boolean(required)} /></dd></div>
          ))}
          <div className="review-field"><dt>服务类型</dt><dd><select className="filter-control" name="serviceType"><option value="healthcare">健康服务</option><option value="education">教育服务</option><option value="employment">就业服务</option></select></dd></div>
          <div className="review-field"><dt>开始日期</dt><dd><input className="filter-control" type="date" name="eventStart" required /></dd></div>
          <div className="review-field"><dt>结束日期</dt><dd><input className="filter-control" type="date" name="eventEnd" required /></dd></div>
        </dl>
        {error && <p className="inline-success" role="alert"><CircleAlert size={16} /> {error}</p>}
        <footer className="intake-actionbar"><p><Info size={18} /> 点击发布表示工作人员已对照来源确认必要字段。</p><button className="button button--ghost" type="button" onClick={() => routeTo('/tog/desktop/services')}>取消</button><button className="button button--primary" type="submit" disabled={submitting}>{submitting ? '正在发布…' : '确认并发布'}</button></footer>
      </form>
    </div>
  );
}

function NewActivityPage() {
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await togApi.createActivity(Object.fromEntries(form.entries()));
      window.dispatchEvent(new Event('linkhood:data-changed'));
      routeTo('/tog/desktop/activities');
    } catch {
      setSubmitting(false);
    }
  };
  return (
    <div className="tog-page">
      <PageHeader title="新建活动" description="发布后居民端可报名，系统自动生成报名记录" />
      <form className="review-panel panel" onSubmit={submit}>
        <div className="panel-heading"><strong>活动信息</strong><span className="status-chip status-chip--success">社区发布</span></div>
        <dl className="review-fields">
          {[
            ['name', '活动名称', '活动名称'], ['type', '活动类型', '公益课堂 / 兴趣课程'], ['time', '活动时间', '日期和时间段'],
            ['location', '活动地点', '具体地点'], ['organizer', '主办方', '社区或合作单位'], ['capacity', '活动容量', '20'],
            ['fee', '费用说明', '免费'], ['introduction', '活动介绍', '居民需要了解的内容'],
          ].map(([name, label, placeholder]) => <div className="review-field" key={name}><dt>{label}</dt><dd><input className="filter-control" name={name} placeholder={placeholder} required={!['fee', 'organizer'].includes(name)} /></dd></div>)}
        </dl>
        <footer className="intake-actionbar"><p><Info size={18} /> 发布后可在活动运营页管理签到和通知。</p><button className="button button--ghost" type="button" onClick={() => routeTo('/tog/desktop/activities')}>取消</button><button className="button button--primary" type="submit" disabled={submitting}>{submitting ? '正在创建…' : '发布活动'}</button></footer>
      </form>
    </div>
  );
}

function DashboardPage() {
  const [data, setData] = useState<{ residents: number; pendingServices: number; openTasks: number; pendingReports: number } | null>(null);
  useEffect(() => { togApi.dashboard().then(setData).catch(() => undefined); }, []);
  const metrics: Array<[string, number | string]> = [
    ['认证居民', data?.residents ?? '—'],
    ['待核服务', data?.pendingServices ?? '—'],
    ['进行中任务', data?.openTasks ?? '—'],
    ['待处理举报', data?.pendingReports ?? '—'],
  ];
  return (
    <div className="tog-page">
      <PageHeader title="今日工作台" description="先处理需要人工确认和居民响应的事项" />
      <section className="operations-grid">
        <article className="event-command panel"><div className="panel-heading"><strong>社区运行概览</strong><span className="status-chip status-chip--success">数据库实时</span></div><div className="funnel-strip">{metrics.map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}</div><div className="event-actions"><button className="button button--primary" type="button" onClick={() => routeTo('/tog/desktop/services')}>处理公共服务</button><button className="button button--ghost" type="button" onClick={() => routeTo('/tog/desktop/insights')}>查看需求反馈</button></div></article>
        <aside className="ai-operations panel"><div className="panel-heading"><strong>优先事项</strong></div><div className="draft-row"><FileSearch size={18} /><strong>待核服务</strong><span className={data?.pendingServices ? 'is-warning' : 'is-success'}>{data?.pendingServices || 0} 项</span></div><div className="draft-row"><Users size={18} /><strong>社工任务</strong><span className={data?.openTasks ? 'is-warning' : 'is-success'}>{data?.openTasks || 0} 项</span></div><div className="draft-row"><ShieldCheck size={18} /><strong>内容举报</strong><span className={data?.pendingReports ? 'is-warning' : 'is-success'}>{data?.pendingReports || 0} 项</span></div></aside>
      </section>
    </div>
  );
}

function ResidentsPage() {
  const [residents, setResidents] = useState<Array<Record<string, any>>>([]);
  useEffect(() => { togApi.residents().then((payload) => setResidents(payload.residents)).catch(() => undefined); }, []);
  return <div className="tog-page"><PageHeader title="居民服务档案" description="仅展示社区服务所需的最小信息" /><section className="panel"><div className="panel-heading"><strong>认证居民</strong><span className="count-badge">{residents.length}</span></div>{residents.map((resident) => <div className="draft-row" key={resident.id}><UserRound size={18} /><strong>{resident.name} · {resident.room}</strong><span>{resident.open_tasks ? `${resident.open_tasks} 项跟进` : `信用 ${resident.credit_score}`}</span></div>)}</section></div>;
}

function PermissionsPage() {
  const [logs, setLogs] = useState<Array<Record<string, any>>>([]);
  useEffect(() => { togApi.auditLogs().then((payload) => setLogs(payload.logs)).catch(() => undefined); }, []);
  return <div className="tog-page"><PageHeader title="数据与权限" description="角色最小授权，关键操作全程留痕" /><section className="operations-grid"><article className="panel"><div className="panel-heading"><strong>角色权限</strong><span className="status-chip status-chip--success">RBAC 已启用</span></div>{[['居民', '本人服务、互助与消息'], ['社工', '仅被分配的居民任务'], ['社区运营', '服务发布、活动和审核'], ['管理员', '系统管理与应急处置']].map(([role, scope]) => <div className="draft-row" key={role}><ShieldCheck size={18} /><strong>{role}</strong><span>{scope}</span></div>)}</article><aside className="panel"><div className="panel-heading"><strong>最近审计记录</strong><span>{logs.length} 条</span></div>{logs.slice(0, 8).map((log) => <div className="draft-row" key={log.id}><Database size={18} /><strong>{log.action}</strong><span>{log.entity_type}</span></div>)}</aside></section></div>;
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
      <PageHeader
        title="新增公共服务"
        description="从原始通知到居民服务卡，每一步都可核对"
        action={
          <div className="header-actions">
            <button className="button button--ghost" type="button" onClick={() => routeTo('/tog/desktop/services/new')}><Link2 size={17} /> 录入来源链接</button>
            <button className="button button--primary" type="button" onClick={() => routeTo('/tog/desktop/services/new')}><Upload size={17} /> 手动新增服务</button>
          </div>
        }
      />

      {published && (
        <div className="success-banner" role="status">
          <CheckCircle2 aria-hidden="true" />
          <div><strong>服务已由李敏确认并发布</strong><span>居民端现在可以看到同一张服务卡，来源与未知字段均被保留。</span></div>
          <button className="button button--primary" type="button" onClick={() => routeTo('/resident/services')}>
            在居民端预览 <ArrowRight size={17} />
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
      <PageHeader
        title="活动运营"
        description="把一次活动，从发布办到有反馈"
        action={<button className="button button--primary" type="button" onClick={() => routeTo('/tog/desktop/activities/new')}>新建活动</button>}
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
          <button className="event-list-item is-active" type="button" disabled title="当前执行中的活动"><strong>银龄反诈小课堂</strong><span>7 月 11 日 14:00</span><em>即将开始</em></button>
          <button className="event-list-item" type="button" disabled title="当前页面聚焦现场执行中的活动"><strong>暑期家庭教育讲座</strong><span>7 月 12 日 10:00</span><em>报名中</em></button>
          <button className="event-list-item" type="button" disabled title="当前页面聚焦现场执行中的活动"><strong>就业服务专场</strong><span>7 月 15 日 09:30</span><em>草稿</em></button>
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
            <button className="button button--ghost" type="button" onClick={sendNotice}><Send size={17} /> {state.noticeSent ? '通知已发送' : '发送变更通知'}</button>
          </div>
        </article>

        <aside className="ai-operations panel">
          <div className="panel-heading"><strong>AI 运营草稿</strong><span className="status-chip status-chip--demo">演示数据</span></div>
          <div className="ai-summary"><Sparkles size={18} /> 已生成 4 份草稿，发布前逐份核对</div>
          {[
            ['居民端活动卡', '已核对', true],
            ['报名表', '2 项待确认', false],
            ['活动提醒', state.noticeSent ? '已发送' : '待核对', state.noticeSent],
            ['活动后总结模板', '已生成', true],
          ].map(([label, status, done]) => <div className="draft-row" key={String(label)}><FileSearch size={18} /><strong>{label}</strong><span className={done ? 'is-success' : 'is-warning'}>{status}</span></div>)}
          <button className="button button--ghost button--block" type="button" disabled title="草稿已在发布环节完成人工核对">草稿核对记录</button>
          {signInStarted && <p className="inline-success" role="status"><CheckCircle2 size={16} /> 签到模式已开启（演示）。</p>}
          {state.noticeSent && <p className="inline-success" role="status"><CheckCircle2 size={16} /> 通知已写入已报名居民的消息中心。</p>}
        </aside>
      </section>
    </div>
  );
}

function InsightsPage() {
  const { state } = useDemoStore();
  const [planGenerated, setPlanGenerated] = useState(false);
  const [serverSignalCount, setServerSignalCount] = useState<number | null>(null);
  const [taskAssigned, setTaskAssigned] = useState(false);
  const actionEvents = state.residentEvents.filter((event) => event.type === 'service_interest_expressed' && event.serviceId === 'xhm_sanfu_2026');
  useEffect(() => {
    togApi.insights().then((payload) => {
      const signal = payload.signals.find((item) => item.service_id === 'xhm_sanfu_2026');
      setServerSignalCount(signal?.uniqueActors || 0);
    }).catch(() => undefined);
  }, [actionEvents.length]);
  const uniqueActorCount = serverSignalCount ?? new Set(actionEvents.map((event) => event.anonymousActorId)).size;
  const reachedThreshold = uniqueActorCount >= 5;

  return (
    <div className="tog-page">
      <PageHeader
        title="需求与反馈"
        description="从居民行动信号到服务补位，不评价个人"
        action={<button className="button button--primary" type="button" onClick={() => setPlanGenerated(true)}><Sparkles size={17} /> 生成服务补位方案</button>}
      />
      <div className="filter-row"><button className="filter-control" type="button" disabled>7 月 6 日—7 月 12 日⌄</button><button className="filter-control" type="button" disabled>西红门社区⌄</button><button className="filter-control" type="button" disabled>全部服务主题⌄</button></div>
      {actionEvents.length > 0 && (
        <div className="signal-banner" role="status">
          <Activity size={20} />
          <div><strong>刚刚收到 {uniqueActorCount} 条脱敏居民办理意向</strong><span>来自三伏贴服务卡；未传姓名、房号或档案正文。</span></div>
          <span className="status-chip status-chip--success">服务端联动已连接</span>
        </div>
      )}
      <section className="insights-grid">
        <article className="insight-card panel">
          <div className="panel-heading"><strong>本周需关注</strong><span className="status-chip status-chip--demo">演示数据</span></div>
          <div className="trend-card"><span className="trend-rank">1</span><div><strong>暑期托管需求连续两周上升</strong><div className="trend-line" aria-hidden="true"><i /><i /><i /></div></div></div>
          <dl className="signal-list"><div><dt>搜索无结果</dt><dd>18 次</dd></div><div><dt>社工咨询</dt><dd>9 次</dd></div><div><dt>活动候补</dt><dd>7 人</dd></div><div><dt>去重后涉及</dt><dd>31 位居民</dd></div></dl>
          <button className="topic-row" type="button" disabled title="聚合主题仅展示统计结果"><span>2</span>老年助餐材料咨询<ArrowRight size={16} /></button>
          <button className="topic-row" type="button" disabled title="聚合主题仅展示统计结果"><span>3</span>周末亲子活动供给不足<ArrowRight size={16} /></button>
        </article>

        <article className="insight-card panel">
          <div className="panel-heading"><strong>{reachedThreshold ? '新热点判断' : '新行动信号'}</strong><span className="status-chip status-chip--success">演示联动</span></div>
          <div className="fresh-signal">
            <span><MonitorSmartphone aria-hidden="true" /></span>
            <div><small>三伏贴服务 · 演示联动</small><strong>{uniqueActorCount} 个去重演示主体已表达办理意向</strong><p>{reachedThreshold ? '达到 5 人阈值，可进入热点候选。' : `尚未达到热点阈值（5 人），当前只记录为服务行动信号。`}</p></div>
          </div>
          <div className="supply-gap">
            <h3>供给缺口判断</h3>
            <p>已核验供给：<strong>1 项</strong></p>
            <p>仍需确认：各站时段、每日容量</p>
            <div className="ai-caution"><CircleAlert size={17} /> AI 只聚类信号并提出候选解释，热点命名与原因由工作人员确认。</div>
          </div>
          <h3>建议下一步</h3>
          <ol className="next-step-list"><li><span>1</span>向医院核验各站时段</li><li><span>2</span>在居民端补充“余量需确认”</li><li><span>3</span>累计 5 人后再判断是否成为热点</li></ol>
          {planGenerated && <p className="inline-success"><CheckCircle2 size={16} /> 补位方案草稿已生成，等待工作人员核对。</p>}
        </article>

        <aside className="insight-card panel">
          <div className="panel-heading"><strong>关联跟进</strong><span>{uniqueActorCount} 项新信号</span></div>
          <p className="muted-copy">只展示当前角色被授权的聚合任务，不展示可反查个人的编号。</p>
          <div className="follow-up-summary"><Users size={24} /><strong>{uniqueActorCount}</strong><span>条匿名办理意向</span></div>
          <div className="follow-up-item"><Database size={18} /><span><strong>三伏贴服务卡</strong><small>居民办理意向入口</small></span><em>{actionEvents.length > 0 ? '已收到' : '等待中'}</em></div>
          <button
            className="button button--ghost button--block"
            type="button"
            disabled={taskAssigned || uniqueActorCount === 0}
            onClick={() => {
              togApi.createTask({
                residentId: 'user_xiaoya',
                serviceId: 'xhm_sanfu_2026',
                assigneeId: 'social_li',
                title: '三伏贴办理意向跟进',
                description: '仅核对居民是否需要办理指引，不代替医疗判断或官方报名。',
              }).then(() => setTaskAssigned(true));
            }}
          >{taskAssigned ? '已分配给李老师' : '分配跟进'}</button>
        </aside>
      </section>
      <div className="privacy-footer"><ShieldCheck size={19} /> 需求与反馈来自脱敏聚合信号；低于阈值的主题不展示为热点，也不用于评价居民个人。</div>
    </div>
  );
}

export function TogDesktopApp({ route }: { route: string }) {
  return (
    <div className="tog-desktop-shell">
      <DesktopSidebar route={route} />
      <main className="tog-desktop-main">
        {route === '/tog/desktop/workbench' ? <DashboardPage /> : route === '/tog/desktop/residents' ? <ResidentsPage /> : route === '/tog/desktop/permissions' ? <PermissionsPage /> : route === '/tog/desktop/services/new' ? <NewServicePage /> : route === '/tog/desktop/activities/new' ? <NewActivityPage /> : route === '/tog/desktop/activities' ? <ActivitiesPage /> : route === '/tog/desktop/insights' ? <InsightsPage /> : <ServiceIntakePage />}
      </main>
    </div>
  );
}
