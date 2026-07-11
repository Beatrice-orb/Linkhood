import { Clock3, MessageSquareText, Phone, ShieldCheck } from 'lucide-react';
import { getDepartmentRoute } from '../features/resident-agent/knowledge';
import type { AnonymousDemandSignalV1 } from '../features/resident-agent/types';

const TAG_LABELS: Record<string, string> = {
  weekday_evening: '工作日晚间',
  digital_skills: '数字技能',
  home_delivery_requested: '希望送餐上门',
  community_service_inquiry: '社区服务咨询',
};

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function AnonymousDemandInbox({
  signals,
}: {
  signals: AnonymousDemandSignalV1[];
}) {
  return (
    <aside className="fixed bottom-6 right-6 top-[72px] z-[60] flex w-[430px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-modal">
      <header className="border-b border-hairline bg-surface-elevated px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-h3 font-bold text-ink">居民声音</h2>
              <p className="mt-0.5 text-caption text-ink-muted">匿名需求留言板 · 由居民答疑 Agent 整理</p>
            </div>
          </div>
          <span className="rounded-full border border-primary/20 bg-primary-light px-2 py-1 text-[10px] font-bold text-primary">
            {signals.length} 条新信号
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber/20 bg-amber-light/30 px-3 py-2 text-[10px] text-ink-muted">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-amber" />
          演示数据 · 非工单 · 不含姓名、电话或精确住址
        </div>
      </header>

      <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto bg-canvas-light p-4">
        {signals.length ? (
          signals.map((signal) => {
            const route = getDepartmentRoute(signal.routeDepartmentId);
            return (
              <article key={signal.id} className="rounded-xl border border-hairline bg-surface p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-primary">匿名需求信号 · 待人工研判</p>
                    <h3 className="mt-1 text-body-sm font-bold leading-snug text-ink">
                      {signal.summary}
                    </h3>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-[10px] text-ink-subtle">
                    <Clock3 className="h-3 w-3" />
                    {formatTime(signal.lastSeenAt)}
                  </span>
                </div>

                <div className="mt-3 rounded-lg border-l-2 border-primary bg-canvas-light px-3 py-2">
                  <p className="text-[10px] font-semibold text-ink-muted">居民原声（已脱敏）</p>
                  <div className="mt-1 space-y-1 text-caption leading-relaxed text-ink">
                    {signal.voiceFragments.map((fragment) => (
                      <p key={fragment}>“{fragment}”</p>
                    ))}
                  </div>
                </div>

                <dl className="mt-3 space-y-2 text-caption">
                  <div>
                    <dt className="font-semibold text-ink-muted">供给缺口</dt>
                    <dd className="mt-0.5 text-ink">{signal.unmetFacet}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-muted">需求情境</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {signal.contextTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-primary-light px-2 py-1 text-[10px] text-primary"
                        >
                          {TAG_LABELS[tag] ?? tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>

                {route ? (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-hairline bg-surface-elevated px-3 py-2 text-caption text-ink">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>
                      建议承接：{route.departmentName} · {route.phoneDisplay}（模拟）
                    </span>
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <MessageSquareText className="h-8 w-8 text-ink-subtle" />
            <p className="mt-3 text-body-sm font-semibold text-ink">暂无本轮匿名需求信号</p>
            <p className="mt-1 max-w-64 text-caption leading-relaxed text-ink-muted">
              居民在答疑助手中提出当前供给未覆盖的问题后，匿名信号会显示在这里。
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
