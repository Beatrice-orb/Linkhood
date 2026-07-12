import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  X,
  Clock,
  Eye,
  AlertOctagon,
  BellRing,
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { Announcement } from '../types';

interface NoticeManagementProps {
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  showPublishModal: boolean;
  setShowPublishModal: (show: boolean) => void;
}

export default function NoticeManagement({
  announcements,
  setAnnouncements,
  showPublishModal,
  setShowPublishModal,
}: NoticeManagementProps) {
  const [filterCategory, setFilterCategory] = useState<'全部' | '停水停电' | '活动通知' | '政策宣传' | '安全提醒'>('全部');
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(announcements[0]?.id || null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'停水停电' | '活动通知' | '政策宣传' | '安全提醒'>('政策宣传');
  const [isScheduled, setIsScheduled] = useState(false);
  const [isImportant, setIsImportant] = useState(false);

  const selectedNotice = announcements.find(n => n.id === selectedNoticeId);

  // Handle publishing new notices
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newNotice: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      category,
      isScheduled,
      publishTime: isScheduled ? '2026-07-12 09:00 (定时发布)' : '2026-07-11 08:32 (刚刚发布)',
      isImportant,
      readCount: 0,
      unreadCount: 347, // assuming all registered residents
    };

    setAnnouncements(prev => [newNotice, ...prev]);
    setSelectedNoticeId(newNotice.id);
    setShowPublishModal(false);

    // Reset
    setTitle('');
    setContent('');
    setCategory('政策宣传');
    setIsScheduled(false);
    setIsImportant(false);
  };

  // Delete notice
  const handleDeleteNotice = (id: string) => {
    if (confirm('是否撤回该公告？撤回后居民端将不再显示。')) {
      const remaining = announcements.filter(n => n.id !== id);
      setAnnouncements(remaining);
      if (selectedNoticeId === id) {
        setSelectedNoticeId(remaining[0]?.id || null);
      }
    }
  };

  const filteredNotices = announcements.filter(n => {
    return filterCategory === '全部' || n.category === filterCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans selection:bg-primary/30 selection:text-primary pb-12">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
        <div>
          <div className="text-2xs text-primary font-mono uppercase tracking-widest font-bold">
            COMMUNITY ALERTS & COMMUNICATIONS
          </div>
          <h1 className="text-lg font-bold font-display text-ink mt-0.5 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary shrink-0" />
            <span>社区最新公告与已读状态追踪</span>
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            发布街道政策宣传、水电停运通知、气象及防诈骗安全提醒，实时监控覆盖率。
          </p>
        </div>
        <button
          onClick={() => setShowPublishModal(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-canvas text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          撰写并发布新公告
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left column: List (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-hairline rounded-2xl p-5 shadow-sm flex flex-col min-h-[500px]">
          {/* Tabs */}
          <div className="flex overflow-x-auto pb-3 mb-4 border-b border-hairline scrollbar-none gap-2">
            {(['全部', '停水停电', '活动通知', '政策宣传', '安全提醒'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterCategory(tab)}
                className={`px-3 py-1.5 text-4xs font-bold rounded-xl border transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  filterCategory === tab
                    ? 'bg-primary border-primary text-canvas shadow-sm'
                    : 'border-hairline text-ink-muted hover:text-ink hover:border-hairline/80 bg-canvas/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List content */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {filteredNotices.map(notice => {
              const isSelected = notice.id === selectedNoticeId;
              const readPct = notice.readCount + notice.unreadCount > 0
                ? Math.round((notice.readCount / (notice.readCount + notice.unreadCount)) * 100)
                : 0;

              return (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNoticeId(notice.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col gap-2 relative ${
                    isSelected
                      ? 'border-primary bg-primary-light/10 shadow-sm'
                      : 'border-hairline hover:border-hairline hover:bg-canvas/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface text-ink-muted border border-hairline font-bold">
                          {notice.category}
                        </span>
                        {notice.isImportant && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-coral-light/20 text-coral border border-coral/25 font-bold animate-pulse flex items-center gap-0.5">
                            <AlertOctagon className="w-2.5 h-2.5 shrink-0" />
                            置顶置顶
                          </span>
                        )}
                        {notice.isScheduled && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-light/20 text-amber border border-amber/25 font-bold">
                            定时
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-ink leading-snug truncate">
                        {notice.title}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotice(notice.id);
                      }}
                      className="text-ink-subtle hover:text-coral hover:bg-coral-light/20 p-1 rounded transition-colors shrink-0"
                      title="撤回公告"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Content preview */}
                  <p className="text-3xs text-ink-muted line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-hairline/40 text-[10px] text-ink-subtle mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      发布：{notice.publishTime}
                    </span>
                    <span className="font-semibold text-primary flex items-center gap-1 font-mono">
                      <Eye className="w-3 h-3" />
                      覆盖率: {readPct}% ({notice.readCount}人已读)
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredNotices.length === 0 && (
              <div className="py-16 text-center text-caption text-ink-subtle">
                暂无此分类下的公告内容。请点击右上角撰写发布。
              </div>
            )}
          </div>
        </div>

        {/* Right column: Statistics & Detail Review (5 cols) */}
        <div className="lg:col-span-5 bg-surface border border-hairline rounded-2xl p-5 shadow-sm min-h-[500px] flex flex-col justify-between">
          {selectedNotice ? (
            <>
              <div>
                <div className="flex items-center gap-2 pb-3.5 border-b border-hairline mb-4">
                  <BellRing className="w-4 h-4 text-primary shrink-0" />
                  <h2 className="text-sm font-bold tracking-tight text-ink">
                    公告覆盖率已读追踪
                  </h2>
                </div>

                <div className="space-y-4 pb-4 border-b border-hairline/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary-light text-primary border border-primary/10 font-bold">
                      {selectedNotice.category}
                    </span>
                    <span className="text-3xs text-ink-subtle">{selectedNotice.publishTime}</span>
                  </div>
                  <h3 className="text-xs font-bold text-ink leading-relaxed">
                    {selectedNotice.title}
                  </h3>
                  <div className="p-4 bg-canvas/50 border border-hairline rounded-xl text-3xs text-ink-muted leading-relaxed whitespace-pre-wrap">
                    {selectedNotice.content}
                  </div>
                </div>

                {/* Read receipt breakdown */}
                <div className="mt-4">
                  <span className="text-caption font-bold text-ink-muted uppercase tracking-wider block mb-3">
                    公告触达数据分析 (已读统计)
                  </span>

                  {/* Progress ratio */}
                  <div className="p-4 bg-canvas/30 border border-hairline rounded-xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-primary">
                          {selectedNotice.readCount}人
                        </span>
                        <span className="text-[10px] text-ink-muted block mt-0.5">小程序上已点开</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-ink-subtle">
                          {selectedNotice.unreadCount}人
                        </span>
                        <span className="text-[10px] text-ink-muted block mt-0.5">未读提醒通知</span>
                      </div>
                    </div>

                    {/* Visual Gauge Bar */}
                    <div>
                      <div className="w-full h-2.5 bg-canvas border border-hairline/20 rounded-full overflow-hidden flex">
                        <div
                          style={{
                            width: `${
                              (selectedNotice.readCount /
                                (selectedNotice.readCount + selectedNotice.unreadCount || 1)) *
                              100
                            }%`,
                          }}
                          className="h-full bg-primary"
                        />
                        <div className="flex-1 h-full bg-canvas/80" />
                      </div>
                      <div className="flex justify-between text-[10px] text-ink-subtle mt-1.5">
                        <span>已阅占比</span>
                        <span>总常住注册居民: {selectedNotice.readCount + selectedNotice.unreadCount}人</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-primary-light/10 border border-primary/10 rounded-xl mt-4 text-center">
                <span className="text-[10px] text-ink-subtle leading-relaxed flex items-center justify-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  已读追踪算法会自动通过微信小助手对未阅老人、网格组长进行定时二次触达。
                </span>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-caption text-ink-subtle p-8">
              请选择左侧的公告内容查看详细的阅读覆盖报表。
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-canvas/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-hairline rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-hairline mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-ink font-display">
                  撰写并群发社区通知公告
                </h3>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-ink-muted hover:text-ink hover:bg-canvas p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  公告标题 (必填)
                </label>
                <input
                  type="text"
                  required
                  placeholder="如: 关于西红门街道社区7月13日配电房停电维护的公示"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                    公告分类 (必填)
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="停水停电">停水停电通知</option>
                    <option value="活动通知">活动招募通知</option>
                    <option value="政策宣传">政策福利宣传</option>
                    <option value="安全提醒">安全、防诈防暑提醒</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end pb-1.5 pl-2 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isImportant}
                      onChange={e => setIsImportant(e.target.checked)}
                      className="rounded border-hairline bg-canvas text-primary focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-[10px] font-semibold text-coral">置顶展示 (紧急)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={e => setIsScheduled(e.target.checked)}
                      className="rounded border-hairline bg-canvas text-primary focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-[10px] text-ink-muted">定时发布</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  公告详细文本内容 (必填)
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="请输入公告正文信息，如停运具体时间、恢复供水保障电话、安全避暑小常识等..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="pt-3 border-t border-hairline flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-canvas text-xs text-ink-muted hover:text-ink border border-hairline rounded-xl transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-canvas text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  群发公示到居民端
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
