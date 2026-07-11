import { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useDemoStore } from '../demo/DemoStore';
import {
  demandTopics,
  weeklyOperationsSnapshot,
  type DemandTopic,
} from '../demo/communityOperations';
import { DesktopPageHeader } from './DesktopPageHeader';

const topicStatusLabels: Record<DemandTopic['status'], string> = {
  observing: '继续观察',
  needs_response: '待回应',
  response_in_progress: '回应中',
  covered: '已有基础承接',
};

const trendLabels: Record<DemandTopic['trend'], string> = {
  rising: '较上周上升',
  stable: '较上周持平',
  falling: '较上周下降',
};

export function DemandFeedbackPage() {
  const { state } = useDemoStore();
  const [selectedTopicId, setSelectedTopicId] = useState(demandTopics[0].id);
  const [generatedTopicIds, setGeneratedTopicIds] = useState<string[]>([]);
  const [startedTopicIds, setStartedTopicIds] = useState<string[]>([]);
  const selectedTopic = useMemo(
    () => demandTopics.find((topic) => topic.id === selectedTopicId) ?? demandTopics[0],
    [selectedTopicId],
  );
  const actionEvents = state.residentEvents.filter(
    (event) => event.type === 'service_interest_expressed' && event.serviceId === 'xhm_sanfu_2026',
  );
  const uniqueActorCount = new Set(actionEvents.map((event) => event.anonymousActorId)).size;
  const reachedThreshold = uniqueActorCount >= 5;
  const planGenerated = generatedTopicIds.includes(selectedTopic.id);
  const responseStarted = selectedTopic.status === 'response_in_progress' || startedTopicIds.includes(selectedTopic.id);
  const evidence = [
    ['居民主动提出', selectedTopic.evidenceBreakdown.residentRequests],
    ['服务搜索信号', selectedTopic.evidenceBreakdown.serviceSearches],
    ['活动反馈', selectedTopic.evidenceBreakdown.activityFeedback],
    ['授权走访记录', selectedTopic.evidenceBreakdown.authorizedVisitNotes],
  ] as const;

  return (
    <div className="tog-page">
      <DesktopPageHeader
        title="需求与反馈"
        description="把居民端的诉求、搜索与反馈转成可回应的供给动作，不评价个人"
        action={<button className="button button--primary" type="button" onClick={() => setGeneratedTopicIds((topicIds) => topicIds.includes(selectedTopic.id) ? topicIds : [...topicIds, selectedTopic.id])}><Sparkles size={17} /> 生成回应草稿</button>}
      />

      <section className="desktop-summary-grid" aria-label="本周需求与反馈摘要">
        {[
          ['本周服务与互助请求', weeklyOperationsSnapshot.requests, '居民端周报安全适配', MessageSquareText, ''],
          ['已回应', weeklyOperationsSnapshot.responded, '人工确认后完成回应', CheckCircle2, ''],
          ['本周回应率', `${Math.round(weeklyOperationsSnapshot.responseRate * 100)}%`, '不等于居民满意度评分', Activity, 'coral'],
          ['新联动行动信号', uniqueActorCount, reachedThreshold ? '已达到热点候选阈值' : '低于 5 人阈值，仅记行动信号', Users, 'amber'],
        ].map(([label, value, note, Icon, tone]) => {
          const SummaryIcon = Icon as typeof Activity;
          return (
            <article className="summary-card panel" key={String(label)}>
              <span className={`summary-card__icon${tone ? ` summary-card__icon--${tone}` : ''}`}><SummaryIcon size={20} /></span>
              <span className="summary-card__copy"><small>{label}</small><strong>{value}</strong><span>{note}</span></span>
            </article>
          );
        })}
      </section>

      {actionEvents.length > 0 ? (
        <div className="signal-banner" role="status">
          <Activity size={20} />
          <div><strong>刚刚收到 {uniqueActorCount} 条三伏贴办理意向</strong><span>只包含脱敏演示主体与服务 ID；未传姓名、房号或档案正文。</span></div>
          <span className={reachedThreshold ? 'status-chip status-chip--success' : 'status-chip status-chip--warning'}>{reachedThreshold ? '热点候选' : '行动信号'}</span>
        </div>
      ) : null}

      <section className="feedback-layout">
        <aside className="feedback-topic-list panel">
          <div className="panel-heading"><span><strong>本周需求主题</strong><small>{weeklyOperationsSnapshot.period.label}</small></span><span className="status-chip status-chip--demo">演示数据</span></div>
          {demandTopics.map((topic, index) => (
            <button className={`feedback-topic-row${topic.id === selectedTopic.id ? ' is-active' : ''}`} type="button" key={topic.id} aria-pressed={topic.id === selectedTopic.id} onClick={() => setSelectedTopicId(topic.id)}>
              <span className="feedback-topic-row__rank">{index + 1}</span>
              <span className="feedback-topic-row__body"><strong>{topic.title}</strong><span>{topicStatusLabels[topic.status]} · {trendLabels[topic.trend]}</span></span>
              <em>{topic.deduplicatedSubjects}</em>
            </button>
          ))}
        </aside>

        <article className="feedback-detail panel">
          <header className="feedback-detail__title">
            <div><h2>{selectedTopic.title}</h2><p>最后更新 {selectedTopic.updatedAt} · {selectedTopic.deduplicatedSubjects} 个去重演示主体</p></div>
            <span className={selectedTopic.status === 'needs_response' ? 'status-chip status-chip--warning' : 'status-chip status-chip--success'}>{responseStarted ? '回应已启动' : topicStatusLabels[selectedTopic.status]}</span>
          </header>

          <div className="feedback-evidence-grid" aria-label="需求证据拆分">
            {evidence.map(([label, value]) => <span className="feedback-evidence" key={label}><span>{label}</span><strong>{value}</strong></span>)}
          </div>

          <section className="feedback-judgement">
            <h3>证据 → 供给缺口判断</h3>
            <p>共收到 {selectedTopic.totalSignals} 条演示信号，去重后涉及 {selectedTopic.deduplicatedSubjects} 个主体。当前已找到 {selectedTopic.currentSupply.length} 项相关供给：</p>
            <div className="record-service-list">
              {selectedTopic.currentSupply.map((supply) => <div className="record-service-row" key={supply}><span><Search size={15} /></span><div><strong>{supply}</strong><p>需要工作人员继续核验状态与行动方式。</p></div><em>待核验</em></div>)}
            </div>
          </section>

          <section className="feedback-judgement">
            <h3>建议回应动作</h3>
            <ol className="feedback-action-list">
              {selectedTopic.recommendedActions.map((action, index) => <li key={action}><span>{index + 1}</span>{action}</li>)}
            </ol>
          </section>
          <div className="feedback-detail__actions">
            <button className="button button--primary" type="button" disabled={responseStarted} onClick={() => setStartedTopicIds((topicIds) => topicIds.includes(selectedTopic.id) ? topicIds : [...topicIds, selectedTopic.id])}><CheckCircle2 size={17} /> {responseStarted ? '已进入回应' : '确认进入回应'}</button>
            <button className="button button--ghost" type="button" disabled title="本版不开放任务分配">分配跟进</button>
          </div>
        </article>

        <aside className="feedback-side panel">
          <div className="panel-heading"><span><strong>全局居民端回流</strong><small>独立于当前需求主题，不计入其证据</small></span></div>
          <div className="feedback-side__body">
            <div className="feedback-side-stat"><Users size={26} /><strong>{uniqueActorCount}</strong><span>条匿名三伏贴办理意向</span></div>
            <div className="feedback-signal-item"><strong>为什么还不是热点？</strong><p>{reachedThreshold ? '已达到 5 人阈值，仍需工作人员确认主题与原因。' : '目前低于 5 个去重主体，只记录为服务行动信号，不包装成需求热点。'}</p></div>
            <section className="report-section">
              <h3>居民核心诉求 TOP3</h3>
              <div className="ranking-list">
                {weeklyOperationsSnapshot.topTopics.map((topic) => <div className="ranking-row" key={topic.rank}><span>{topic.rank}</span><strong>{topic.label}</strong><em>{topic.count} 次</em></div>)}
              </div>
            </section>
            {planGenerated ? <div className="feedback-plan-success" role="status"><CheckCircle2 size={17} /> 回应草稿已生成，仍需工作人员核对供给状态、措辞与发布渠道。</div> : null}
            <div className="report-note"><CircleAlert size={17} /> {weeklyOperationsSnapshot.sourceAdaptationNote}</div>
          </div>
        </aside>
      </section>
      <div className="privacy-footer"><ShieldCheck size={19} /> 本页只使用脱敏聚合信号；热点默认不能反查个人，AI 只提出候选解释与回应草稿。</div>
    </div>
  );
}
