import React, { useState } from 'react';
import { ShieldAlert, Plus, Eye, Check, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { AntiFraudReminder } from '../types';

interface AntiFraudProps {
  alerts: AntiFraudReminder[];
  setAlerts: React.Dispatch<React.SetStateAction<AntiFraudReminder[]>>;
}

export default function AntiFraudManagement({ alerts, setAlerts }: AntiFraudProps) {
  const [content, setContent] = useState('');

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // deactivate others
    const deactivated = alerts.map(a => ({ ...a, isActive: false }));

    const newAlert: AntiFraudReminder = {
      id: `fraud-${Date.now()}`,
      content: content.trim(),
      publishDate: new Date().toISOString().split('T')[0],
      isActive: true,
      views: 0,
    };

    setAlerts([newAlert, ...deactivated]);
    setContent('');
  };

  const handleSetActive = (id: string) => {
    setAlerts(prev =>
      prev.map(a => ({
        ...a,
        isActive: a.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('是否彻底清除此条防诈骗历史记录？')) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans selection:bg-jade/30 selection:text-jade pb-12">
      {/* Header */}
      <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
        <div className="text-2xs text-jade font-mono uppercase tracking-widest font-bold">
          CITIZEN ANTI-FRAUD SECURITY PROTOCOL
        </div>
        <h1 className="text-lg font-bold font-display text-ink mt-0.5 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-jade shrink-0" />
          <span>每日社区防诈骗警示公告配置</span>
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          专供 C端【关怀极简版】首页顶部黄金宣传位！每天推送一条针对独居老人的防诈小常识，强化防范意识。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left column: Publish card (5 cols) */}
        <form onSubmit={handlePublish} className="lg:col-span-5 bg-surface border border-hairline rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[380px]">
          <div>
            <div className="flex items-center gap-2 pb-3.5 border-b border-hairline mb-4">
              <ShieldAlert className="w-4 h-4 text-coral shrink-0" />
              <h2 className="text-sm font-bold tracking-tight text-ink font-display">
                配置今日防诈推文内容
              </h2>
            </div>
            <p className="text-caption text-ink-muted leading-relaxed mb-4">
              编写建议：字数控制在100字以内，重点突出常识和“96110咨询电话”。发布后将自动下发到居民关怀小卡片。
            </p>

            <textarea
              required
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="请输入防诈骗常识提醒正文，如：【防诈提醒】严防冒充‘公检法’退费名义的大额转账转账引导..."
              className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-jade hover:bg-jade-hover text-canvas font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            确认发布并置顶同步 (C端)
          </button>
        </form>

        {/* Right column: Historical alerts (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-hairline rounded-2xl p-5 shadow-sm flex flex-col min-h-[380px]">
          <div className="flex items-center gap-2 pb-3.5 border-b border-hairline mb-4">
            <AlertTriangle className="w-4 h-4 text-amber shrink-0" />
            <h2 className="text-sm font-bold tracking-tight text-ink font-display">
              历史防诈温馨提醒汇总
            </h2>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`p-3.5 border rounded-xl flex items-start gap-3 justify-between ${
                  a.isActive
                    ? 'border-coral bg-coral-light/15'
                    : 'border-hairline bg-canvas/30 hover:bg-canvas/50'
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface border border-hairline text-ink-subtle font-mono flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {a.publishDate}
                    </span>
                    {a.isActive && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-coral-light/25 text-coral border border-coral/20 font-bold animate-pulse">
                        C端置顶中
                      </span>
                    )}
                  </div>
                  <p className="text-3xs text-ink leading-relaxed font-medium">
                    {a.content}
                  </p>
                  <span className="text-[9px] text-ink-subtle flex items-center gap-1 font-mono">
                    <Eye className="w-3 h-3" />
                    已读次数: {a.views}次
                  </span>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {!a.isActive && (
                    <button
                      onClick={() => handleSetActive(a.id)}
                      className="px-2 py-1 text-[9px] font-bold text-canvas bg-coral hover:bg-coral-hover rounded transition-colors cursor-pointer"
                      title="重设为今日置顶展示"
                    >
                      重新置顶
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-ink-subtle hover:text-coral hover:bg-coral-light/10 p-1.5 rounded transition-colors self-end"
                    title="彻底删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="py-16 text-center text-caption text-ink-subtle">
                暂无防诈骗历史记录，请在左侧配置一条新的。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
