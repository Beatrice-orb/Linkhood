import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileHeart,
  MessageSquareText,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useDemoStore } from '../demo/DemoStore';
import {
  desktopWorkTasks,
  weeklyOperationsSnapshot,
  type DesktopRoute,
  type WorkTask,
} from '../demo/communityOperations';
import { routeTo } from '../demo/navigation';
import { DesktopPageHeader } from './DesktopPageHeader';

const routePaths: Record<DesktopRoute, string> = {
  workbench: '/tog/desktop/workbench',
  services: '/tog/desktop/services',
  activities: '/tog/desktop/activities',
  records: '/tog/desktop/records',
  insights: '/tog/desktop/insights',
};

const taskIcons: Record<WorkTask['category'], typeof BookOpenCheck> = {
  service: BookOpenCheck,
  activity: CalendarDays,
  record: UserRound,
  feedback: MessageSquareText,
};

const priorityLabels: Record<WorkTask['priority'], string> = {
  high: '优先处理',
  medium: '今日跟进',
  low: '可稍后',
};

function formatDueAt(value: string) {
  const [, time = value] = value.split(' ');
  return value.startsWith('2026-07-11') ? `今天 ${time}` : `明天 ${time}`;
}

export function CommunityWorkbenchPage() {
  const { state } = useDemoStore();
  const activityReadyCount = Object.values(state.activityChecklist).filter(Boolean).length;
  const uniqueSignalCount = new Set(
    state.residentEvents
      .filter((event) => event.type === 'service_interest_expressed')
      .map((event) => event.anonymousActorId),
  ).size;

  const residentFollowUpDone = state.visitStatus === 'submitted' || state.completedResidentFollowUps.includes('A017');

  const resolveTaskState = (task: WorkTask) => {
    if (task.category === 'service') {
      if (state.intakePhase === 'published') return { label: '已发布', tone: 'success' } as const;
      if (state.intakePhase === 'review') return { label: '人工核验中', tone: 'warning' } as const;
      return { label: '待生成草稿', tone: 'warning' } as const;
    }
    if (task.category === 'activity') {
      return activityReadyCount === 3
        ? { label: '3/3 已就绪', tone: 'success' } as const
        : { label: `${activityReadyCount}/3 已就绪`, tone: 'warning' } as const;
    }
    if (task.category === 'record') {
      return residentFollowUpDone
        ? { label: state.visitStatus === 'submitted' ? '已提交审核' : '已完成跟进', tone: 'success' } as const
        : { label: 'AI 草稿待核', tone: 'warning' } as const;
    }
    return uniqueSignalCount > 0
      ? { label: `${uniqueSignalCount} 条新信号`, tone: 'warning' } as const
      : { label: '待回应', tone: 'warning' } as const;
  };

  const summaryItems = [
    {
      label: '公共服务待核验',
      value: state.intakePhase === 'published' ? 0 : 1,
      note: state.intakePhase === 'review' ? '正在人工核验' : state.intakePhase === 'published' ? '本轮已清空' : '三伏贴来源待处理',
      icon: BookOpenCheck,
      tone: '',
    },
    {
      label: '活动现场待确认',
      value: 3 - activityReadyCount,
      note: `${activityReadyCount}/3 项执行准备已就绪`,
      icon: CalendarDays,
      tone: 'amber',
    },
    {
      label: '居民跟进待处理',
      value: residentFollowUpDone ? 0 : 1,
      note: residentFollowUpDone ? (state.visitStatus === 'submitted' ? 'A017 已提交审核' : 'A017 已完成跟进') : 'A017 授权走访草稿',
      icon: FileHeart,
      tone: '',
    },
    {
      label: '居民端新行动信号',
      value: uniqueSignalCount,
      note: uniqueSignalCount < 5 ? '低于 5 人阈值，不展示为热点' : '达到热点候选阈值',
      icon: Activity,
      tone: 'coral',
    },
  ];

  return (
    <div className="tog-page">
      <DesktopPageHeader
        title="今日工作台"
        description="从具体任务出发，处理今天的服务、活动、居民跟进与反馈回应"
        action={<span className="status-chip status-chip--demo">7 月 11 日 · 全页为演示数据</span>}
      />

      <section className="desktop-summary-grid" aria-label="今日任务摘要">
        {summaryItems.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="summary-card panel" key={label}>
            <span className={`summary-card__icon${tone ? ` summary-card__icon--${tone}` : ''}`}><Icon size={20} /></span>
            <span className="summary-card__copy"><small>{label}</small><strong>{value}</strong><span>{note}</span></span>
          </article>
        ))}
      </section>

      <section className="workbench-grid">
        <article className="work-queue panel">
          <div className="panel-heading">
            <span><strong>今天先做什么</strong><small>4 类任务由现有 DemoStore 状态实时派生</small></span>
            <span className="status-chip status-chip--success">按优先级</span>
          </div>
          <div className="work-task-list">
            {desktopWorkTasks.map((task) => {
              const Icon = taskIcons[task.category];
              const taskState = resolveTaskState(task);
              return (
                <button className="work-task-row" type="button" key={task.id} onClick={() => routeTo(routePaths[task.route])}>
                  <span className="work-task-row__icon"><Icon size={20} /></span>
                  <span className="work-task-row__body">
                    <span>
                      <strong>{task.title}</strong>
                      {task.category === 'service' || task.category === 'record' ? <small className="task-ai-tag">AI 草稿需人审</small> : null}
                    </span>
                    <p>{task.summary}</p>
                  </span>
                  <span className="work-task-row__meta">
                    <small className={`task-priority${task.priority === 'high' ? ' task-priority--urgent' : ''}`}>{priorityLabels[task.priority]}</small>
                    <small><Clock3 size={12} /> {formatDueAt(task.dueAt)}</small>
                    <span className={`status-chip status-chip--${taskState.tone}`}>{taskState.label}</span>
                  </span>
                  <ArrowRight size={18} />
                </button>
              );
            })}
          </div>
        </article>

        <aside className="weekly-brief panel">
          <div className="panel-heading">
            <span><strong>社区运营周报</strong><small>居民端信息结构的安全适配</small></span>
            <span className="status-chip status-chip--demo">演示数据</span>
          </div>
          <div className="weekly-brief__body">
            <div className="weekly-period"><span>统计区间</span><strong>{weeklyOperationsSnapshot.period.label}</strong></div>
            <div className="weekly-metric-grid">
              <span className="weekly-metric"><small>服务与互助请求</small><strong>{weeklyOperationsSnapshot.requests}</strong></span>
              <span className="weekly-metric"><small>已回应</small><strong>{weeklyOperationsSnapshot.responded}</strong></span>
              <span className="weekly-metric is-highlight"><small>回应率</small><strong>{Math.round(weeklyOperationsSnapshot.responseRate * 100)}%</strong></span>
              <span className="weekly-metric"><small>待跟进</small><strong>{weeklyOperationsSnapshot.requests - weeklyOperationsSnapshot.responded}</strong></span>
            </div>
            <section className="report-section">
              <h3>居民核心诉求 TOP3</h3>
              <div className="ranking-list">
                {weeklyOperationsSnapshot.topTopics.map((topic) => (
                  <div className="ranking-row" key={topic.rank}><span>{topic.rank}</span><strong>{topic.label}</strong><em>{topic.count} 次</em></div>
                ))}
              </div>
            </section>
            <div className="report-note"><CircleAlert size={17} /> {weeklyOperationsSnapshot.sourceAdaptationNote}</div>
          </div>
        </aside>
      </section>

      <div className="privacy-footer"><ShieldCheck size={19} /> 今日摘要只使用任务状态与脱敏聚合信号；不展示居民排行，也不暗示已接入真实账号、权限或跨设备系统。</div>
    </div>
  );
}
