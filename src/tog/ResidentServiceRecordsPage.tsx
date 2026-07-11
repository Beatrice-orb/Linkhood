import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  FileHeart,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import { useDemoStore } from '../demo/DemoStore';
import {
  residentServiceRecords,
  weeklyOperationsSnapshot,
  type ResidentServiceRecord,
} from '../demo/communityOperations';
import { DesktopPageHeader } from './DesktopPageHeader';

const recordStatusLabels: Record<ResidentServiceRecord['status'], string> = {
  active: '服务中',
  waiting_resident: '等待居民确认',
  follow_up_due: '待跟进',
  closed: '已结束',
};

const serviceStatusLabels = {
  matching: '匹配中',
  scheduled: '已排期',
  in_service: '服务中',
  completed: '已完成',
  needs_follow_up: '待跟进',
} as const;

function shortDueAt(value: string) {
  const [, time = value] = value.split(' ');
  return value.startsWith('2026-07-12') ? `明天 ${time}` : value;
}

export function ResidentServiceRecordsPage() {
  const { state, completeResidentFollowUp } = useDemoStore();
  const [selectedRecordId, setSelectedRecordId] = useState<ResidentServiceRecord['recordId']>('A017');
  const selectedRecord = useMemo(
    () => residentServiceRecords.find((record) => record.recordId === selectedRecordId) ?? residentServiceRecords[0],
    [selectedRecordId],
  );
  const selectedFollowUpDone = state.completedResidentFollowUps.includes(selectedRecord.recordId);
  const a017FollowedUp = state.completedResidentFollowUps.includes('A017');
  const a017Status = a017FollowedUp ? '已完成跟进' : state.visitStatus === 'submitted' ? '已提交审核' : recordStatusLabels.follow_up_due;
  const a017Resolved = a017FollowedUp || state.visitStatus === 'submitted';

  return (
    <div className="tog-page">
      <DesktopPageHeader
        title="居民服务档案"
        description="只承接经授权的服务记录、居民主动诉求与人工确认的跟进计划"
        action={<span className="status-chip status-chip--demo">A 编号脱敏 · 全页为演示档案</span>}
      />

      <section className="desktop-summary-grid" aria-label="档案工作摘要">
        {[
          ['授权服务档案', '3', '仅当前服务团队可见', UserRoundCheck, ''],
          ['今日待跟进', a017Resolved ? '0' : '1', a017Resolved ? (a017FollowedUp ? 'A017 已完成跟进' : 'A017 已提交审核') : 'A017 明天 15:00 前处理', FileHeart, 'amber'],
          ['服务中事项', '2', '助餐咨询与低风险互助说明', FileCheck2, ''],
          ['本周完成跟进', '19', '脱敏演示汇总', CheckCircle2, 'coral'],
        ].map(([label, value, note, Icon, tone]) => {
          const SummaryIcon = Icon as typeof FileHeart;
          return (
            <article className="summary-card panel" key={String(label)}>
              <span className={`summary-card__icon${tone ? ` summary-card__icon--${tone}` : ''}`}><SummaryIcon size={20} /></span>
              <span className="summary-card__copy"><small>{label}</small><strong>{value}</strong><span>{note}</span></span>
            </article>
          );
        })}
      </section>

      <section className="records-layout">
        <aside className="record-list panel">
          <div className="panel-heading"><span><strong>服务档案</strong><small>按当前任务授权可见</small></span><span className="count-badge">3</span></div>
          {residentServiceRecords.map((record) => {
            const active = record.recordId === selectedRecord.recordId;
            const firstService = record.serviceItems[0];
            const recordFollowUpDone = state.completedResidentFollowUps.includes(record.recordId);
            const recordStatus = recordFollowUpDone ? '已完成跟进' : record.recordId === 'A017' ? a017Status : recordStatusLabels[record.status];
            return (
              <button className={`record-list-row${active ? ' is-active' : ''}`} type="button" key={record.recordId} aria-pressed={active} onClick={() => setSelectedRecordId(record.recordId)}>
                <span className="record-list-row__avatar">{record.recordId}</span>
                <span className="record-list-row__body"><strong>居民 {record.recordId}</strong><span>{firstService.title}</span><small className={recordFollowUpDone || record.status === 'active' || record.status === 'closed' || (record.recordId === 'A017' && state.visitStatus === 'submitted') ? 'status-chip status-chip--success' : 'status-chip status-chip--warning'}>{recordStatus}</small></span>
                <ChevronRight size={17} />
              </button>
            );
          })}
        </aside>

        <article className="record-detail panel">
          <header className="record-detail__header">
            <div><h2>居民 {selectedRecord.recordId}</h2><p>{selectedRecord.ownerRole} · 不显示姓名、房号、手机号与评分</p></div>
            <span className={selectedFollowUpDone || selectedRecord.status === 'active' || selectedRecord.status === 'closed' || (selectedRecord.recordId === 'A017' && state.visitStatus === 'submitted') ? 'status-chip status-chip--success' : 'status-chip status-chip--warning'}>
              {selectedFollowUpDone ? '已完成跟进' : selectedRecord.recordId === 'A017' ? a017Status : recordStatusLabels[selectedRecord.status]}
            </span>
          </header>

          <div className="record-authorization">
            <ShieldCheck size={18} />
            <div><strong>授权范围</strong><span>{selectedRecord.authorization.scope.join('、')} · 有效期至 {selectedRecord.authorization.expiresAt}</span><span>{selectedRecord.authorization.restrictions.join('；')}</span></div>
          </div>

          <section className="record-section">
            <div className="record-section__heading"><h3>当前服务事项</h3><span>{selectedRecord.serviceItems.length} 项</span></div>
            <div className="record-service-list">
              {selectedRecord.serviceItems.map((item) => (
                <div className="record-service-row" key={item.id}>
                  <span><FileHeart size={16} /></span>
                  <div><strong>{item.title}</strong><p>最后更新：{item.updatedAt}</p></div>
                  <em>{serviceStatusLabels[item.status]}</em>
                </div>
              ))}
            </div>
          </section>

          <section className="record-section">
            <div className="record-section__heading"><h3>服务时间线</h3><span>仅展示已授权记录</span></div>
            <ol className="record-timeline">
              {selectedRecord.recordId === 'A017' ? (
                <li><i /><div><strong>{state.visitStatus === 'submitted' ? '走访记录已提交负责人审核' : '走访记录 AI 草稿待核对'}</strong><span>{state.visitDraft.facts} 居民原话：{state.visitDraft.quote}</span><time>今天 10:42 · 社区社工岗</time></div></li>
              ) : null}
              {selectedRecord.timeline.map((item) => (
                <li key={`${item.occurredAt}-${item.title}`}><i /><div><strong>{item.title}</strong><span>{item.note}</span><time>{item.occurredAt} · {item.actorRole}</time></div></li>
              ))}
            </ol>
          </section>

          <section className="record-section record-next-action">
            <small>{selectedFollowUpDone ? '本次跟进已标记完成（演示）' : '下一步 · 需人工确认'}</small>
            <strong>{selectedRecord.nextAction}</strong>
            <span>最晚处理：{shortDueAt(selectedRecord.nextActionDueAt)}</span>
          </section>
          <button
            className="button button--primary button--block"
            type="button"
            disabled={selectedFollowUpDone}
            onClick={() => completeResidentFollowUp(selectedRecord.recordId)}
          >
            <CheckCircle2 size={17} /> {selectedFollowUpDone ? '已标记完成' : '标记本次跟进已完成'}
          </button>
        </article>

        <aside className="record-side panel">
          <div className="panel-heading"><span><strong>档案与周报怎么连接</strong><small>只连接聚合趋势，不反查个人</small></span></div>
          <div className="record-side__body">
            <section className="report-section">
              <h3>相关社区需求脉络</h3>
              <div className="ranking-list">
                {weeklyOperationsSnapshot.topTopics.map((topic) => <div className="ranking-row" key={topic.rank}><span>{topic.rank}</span><strong>{topic.label}</strong><em>{topic.count} 次</em></div>)}
              </div>
            </section>
            <div className="report-note"><CircleAlert size={17} /> 周报主题只帮助工作人员理解供给缺口，不能据此给当前居民贴标签。</div>
            <section className="report-section">
              <h3>固定边界</h3>
              <div className="record-boundary-list">
                <span><CheckCircle2 /> 记录居民主动提出的服务需求</span>
                <span><CheckCircle2 /> 只在授权范围内展示时间线</span>
                <span><CheckCircle2 /> AI 只生成草稿，人确认后入档</span>
                <span><CheckCircle2 /> 不读取聊天与浏览行为推断结论</span>
              </div>
            </section>
          </div>
        </aside>
      </section>
      <div className="privacy-footer"><ShieldCheck size={19} /> 档案与普通居民行为数据隔离；本页所有对象均为脱敏演示记录，不对应真实居民。</div>
    </div>
  );
}
