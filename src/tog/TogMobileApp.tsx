import { useEffect, useState, type ElementType } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  FileText,
  HandHeart,
  Headphones,
  Home,
  Info,
  LockKeyhole,
  Mic,
  Pause,
  PenLine,
  Play,
  Save,
  Sparkles,
  Tag,
  UserRound,
  Users,
} from 'lucide-react';
import { useDemoStore } from '../demo/DemoStore';
import { routeTo } from '../demo/navigation';
import { togApi } from '../api/tog';

function MobileBottomNav({ active }: { active: 'workbench' | 'activities' | 'followup' | 'me' }) {
  const items: { key: typeof active; label: string; icon: ElementType }[] = [
    { key: 'workbench', label: '工作台', icon: Home },
    { key: 'activities', label: '服务活动', icon: CalendarDays },
    { key: 'followup', label: '居民跟进', icon: Users },
    { key: 'me', label: '我的', icon: UserRound },
  ];
  return (
    <nav className="mobile-bottom-nav" aria-label="社区工作台导航">
      {items.map(({ key, label, icon: Icon }) => (
        <button className={key === active ? 'is-active' : ''} aria-current={key === active ? 'page' : undefined} type="button" key={key} onClick={() => routeTo(`/tog/mobile/${key}`)}>
          <Icon aria-hidden="true" /><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function MobileSectionPage({ section }: { section: 'activities' | 'followup' | 'me' }) {
  const [tasks, setTasks] = useState<Array<Record<string, any>>>([]);
  useEffect(() => {
    if (section === 'followup') togApi.tasks().then((payload) => setTasks(payload.tasks)).catch(() => undefined);
  }, [section]);

  return (
    <div className="tog-mobile-frame">
      <main className="mobile-workbench">
        <header className="mobile-workbench__header">
          <div><div className="mobile-brand"><HandHeart aria-hidden="true" /> 搭把手 · 社区工作台</div><span>西红门社区</span></div>
          <button className="mobile-avatar" type="button" onClick={() => routeTo('/demo')}>李</button>
        </header>
        {section === 'activities' && <section className="mobile-priority"><h2>服务活动</h2><WorkTaskCard icon={Users} title="银龄反诈小课堂" subtitle="14:00 · 西红门党群服务中心" meta="签到与通知状态已同步到社区电脑端" action="进入签到" tone="coral" onClick={() => routeTo('/tog/mobile/workbench')} /><WorkTaskCard icon={CalendarDays} title="活动运营台" subtitle="查看全部活动和报名情况" meta="新建活动请使用社区电脑端" action="查看电脑端" onClick={() => routeTo('/tog/desktop/activities')} /></section>}
        {section === 'followup' && <section className="mobile-priority"><h2>居民跟进</h2>{tasks.map((task) => <div key={task.id}><WorkTaskCard icon={UserRound} title={task.title} subtitle={task.resident_name ? `${task.resident_name} · 已授权任务` : '社区服务跟进'} meta={task.description || '暂无补充说明'} status={task.status} action={task.id === 'task_visit_a017' ? '记录走访' : undefined} tone="gray" onClick={() => task.id === 'task_visit_a017' && routeTo('/tog/mobile/visit')} /></div>)}{tasks.length === 0 && <div className="mobile-ai-notice"><Info /> 当前没有待处理的居民跟进任务。</div>}</section>}
        {section === 'me' && <section className="mobile-priority"><h2>我的账号</h2><WorkTaskCard icon={UserRound} title="李老师" subtitle="认证社区社工" meta="西红门社区 · 仅可访问被分配的居民任务" status="权限有效" /><div className="mobile-ai-notice"><LockKeyhole /> 所有走访保存、提交和查看操作均写入审计日志。</div></section>}
      </main>
      <MobileBottomNav active={section} />
    </div>
  );
}

function WorkTaskCard({
  icon: Icon,
  title,
  subtitle,
  meta,
  status,
  action,
  onClick,
  tone = 'green',
}: {
  icon: ElementType;
  title: string;
  subtitle: string;
  meta: string;
  status?: string;
  action?: string;
  onClick?: () => void;
  tone?: 'green' | 'coral' | 'gray';
}) {
  return (
    <article className="work-task-card">
      <span className={`work-task-card__icon work-task-card__icon--${tone}`}><Icon aria-hidden="true" /></span>
      <div className="work-task-card__copy"><h3>{title}</h3><p>{subtitle}</p><small>{meta}</small></div>
      <div className="work-task-card__action">
        {status && <span className="status-chip status-chip--warning">{status}</span>}
        {action && <button className={tone === 'coral' ? 'button button--coral' : 'button button--ghost'} type="button" onClick={onClick}>{action}</button>}
      </div>
    </article>
  );
}

function MobileWorkbench() {
  const { state, remainingReviewCount } = useDemoStore();
  const [checkedIn, setCheckedIn] = useState(false);
  const published = state.intakePhase === 'published';
  const serviceTaskMeta = state.intakePhase === 'source'
    ? '来源待整理，尚未生成 AI 草稿'
    : published
      ? '已由电脑端人工确认并发布'
      : `已提取字段，${remainingReviewCount + (state.coreFieldsConfirmed ? 0 : 1)} 组待核验`;

  return (
    <div className="tog-mobile-frame">
      <main className="mobile-workbench">
        <header className="mobile-workbench__header">
          <div><div className="mobile-brand"><HandHeart aria-hidden="true" /> 搭把手 · 社区工作台</div><span>西红门社区</span></div>
          <button className="mobile-avatar" type="button" onClick={() => routeTo('/demo')}>李</button>
        </header>
        <section className="mobile-greeting"><h1>上午好，李老师</h1><p><CalendarDays /> 今天有 2 场活动　<ClipboardCheck /> {published ? 0 : 1} 条供给待核对　<Users /> 1 次居民跟进</p></section>
        <section className="mobile-priority">
          <h2>今天先处理</h2>
          <WorkTaskCard
            icon={Users}
            title="银龄反诈小课堂"
            subtitle="14:00 开场 · 西红门党群服务中心"
            meta="已报名 38 / 50 · 演示数据"
            action={checkedIn ? '已进入签到' : '现场签到'}
            tone="coral"
            onClick={() => setCheckedIn(true)}
          />
          <WorkTaskCard
            icon={FileText}
            title={published ? '已发布服务' : 'AI 服务草稿'}
            subtitle="三伏贴服务卡"
            meta={serviceTaskMeta}
            status={published ? '已发布' : '待核对'}
            action={published ? '居民端预览' : '去核对'}
            onClick={() => routeTo(published ? '/resident/services' : '/tog/desktop/services')}
          />
          <WorkTaskCard
            icon={UserRound}
            title="居民跟进"
            subtitle="居民 A017 · 模拟档案"
            meta={state.visitStatus === 'submitted' ? '走访草稿已提交负责人审核' : '周五前确认助餐申请材料'}
            status={state.visitStatus === 'submitted' ? '已提交' : '草稿'}
            action="记录走访"
            tone="gray"
            onClick={() => routeTo('/tog/mobile/visit')}
          />
        </section>
        <div className="mobile-ai-notice"><Info aria-hidden="true" /> AI 只整理草稿；发布、入档与处置均由有权限的工作人员确认。</div>
        {checkedIn && <div className="mobile-toast" role="status"><CheckCircle2 /> 已进入签到模式（演示）</div>}
      </main>
      <MobileBottomNav active="workbench" />
    </div>
  );
}

function VisitReview() {
  const { state, saveVisitDraft, submitVisit } = useDemoStore();
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uncertainResolved, setUncertainResolved] = useState(false);
  const [facts, setFacts] = useState(state.visitDraft.facts);
  const [quote, setQuote] = useState(state.visitDraft.quote);
  const submitted = state.visitStatus === 'submitted';

  return (
    <div className="tog-mobile-frame visit-frame">
      <main className="visit-review">
        <header className="visit-header">
          <button type="button" aria-label="返回今日工作台" onClick={() => routeTo('/tog/mobile/workbench')}><ArrowLeft /></button>
          <h1>走访记录核对</h1>
          <button type="button" disabled={submitted} onClick={() => { saveVisitDraft(facts, quote); setSaved(true); }}>{submitted ? '已提交' : saved ? '已保存' : '保存草稿'}</button>
        </header>
        <section className="resident-consent-card">
          <div className="resident-consent-card__title"><span><UserRound /></span><div><h2>居民 A017 · 模拟档案</h2><p><CheckCircle2 /> 模拟授权记录</p><small><LockKeyhole /> 仅当前服务团队可见</small></div></div>
          <div className="audio-player">
            <strong>模拟走访录音 · 08:42</strong>
            <div><button type="button" aria-label={playing ? '暂停录音' : '播放录音'} onClick={() => setPlaying((value) => !value)}>{playing ? <Pause /> : <Play />}</button><span className={playing ? 'audio-wave is-playing' : 'audio-wave'} aria-hidden="true" /><button type="button" onClick={() => setPlaying((value) => !value)}><Headphones /> {playing ? '暂停回听' : '回听原音频'}</button></div>
          </div>
        </section>
        <div className="visit-ai-banner"><span><Sparkles /></span><div><strong>AI 已整理为草稿</strong><p>发现 1 处需要你核对</p></div></div>
        <section className="visit-form">
          <label><span><ClipboardCheck /> 客观事实</span><textarea disabled={submitted} value={facts} onChange={(event) => { setFacts(event.target.value); setSaved(false); }} /></label>
          <label><span><Mic /> 居民原话</span><textarea disabled={submitted} value={quote} onChange={(event) => { setQuote(event.target.value); setSaved(false); }} /></label>
          <button className="uncertain-row" type="button" disabled={submitted} onClick={() => setUncertainResolved((value) => !value)}><span>{uncertainResolved ? <CheckCircle2 /> : <CircleAlert />} 不确定内容</span><strong>{uncertainResolved ? '已标记：具体时间待下次跟进' : '“最近”需要补充具体时间'}</strong><ChevronRight /></button>
          <div className="visit-tags"><span><Tag /> 已表达需求</span><div><em><Check /> 助餐服务咨询</em><em><Check /> 申请材料说明</em></div></div>
          <label><span><UserRound /> 社工判断</span><textarea disabled={submitted} defaultValue="需先核验服务资格，不自动作出结论。" /></label>
          <div className="follow-up-plan"><span><CalendarDays /> 后续跟进</span><label><input type="checkbox" defaultChecked disabled={submitted} /> 周五前确认助餐申请材料</label><div><button type="button" disabled>责任人　李老师</button><button type="button" disabled>日期　7 月 17 日</button></div></div>
        </section>
        {submitted && <div className="visit-submitted" role="status"><CheckCircle2 /> 已提交负责人审核，记录已入库并转为只读。</div>}
      </main>
      <footer className="visit-actions">
        <p><Info /> 仅保存你确认过的内容；修改记录将被保留。</p>
        <div><button className="button button--ghost" type="button" disabled={submitted} onClick={() => setSaved(false)}><PenLine /> 继续编辑</button><button className="button button--ghost" type="button" disabled={submitted} onClick={() => { saveVisitDraft(facts, quote); setSaved(true); }}><Save /> 保存草稿</button><button className="button button--primary" type="button" disabled={submitted} onClick={() => submitVisit(facts, quote)}>{submitted ? '已提交审核' : '提交负责人审核'}</button></div>
      </footer>
    </div>
  );
}

export function TogMobileApp({ route }: { route: string }) {
  return <div className="tog-mobile-page">{route === '/tog/mobile/visit' ? <VisitReview /> : route === '/tog/mobile/activities' ? <MobileSectionPage section="activities" /> : route === '/tog/mobile/followup' ? <MobileSectionPage section="followup" /> : route === '/tog/mobile/me' ? <MobileSectionPage section="me" /> : <MobileWorkbench />}</div>;
}
