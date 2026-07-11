import React, { useState } from 'react';
import { MessageSquare, Phone, X, Send, Check, AlertCircle, Plus, Search, Trash2, Edit } from 'lucide-react';
import { Feedback, Hotline } from '../types';

interface FeedbackProps {
  feedbacks: Feedback[];
  setFeedbacks: React.Dispatch<React.SetStateAction<Feedback[]>>;
  hotlines: Hotline[];
  setHotlines: React.Dispatch<React.SetStateAction<Hotline[]>>;
}

export default function FeedbackManagement({
  feedbacks,
  setFeedbacks,
  hotlines,
  setHotlines,
}: FeedbackProps) {
  const [filterStatus, setFilterStatus] = useState<'全部' | '待处理' | '处理中' | '已解决'>('全部');
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(feedbacks[0]?.id || null);

  // Conversation state
  const [replyText, setReplyText] = useState('');

  // Hotline form states
  const [showHotlineModal, setShowHotlineModal] = useState(false);
  const [hotlineName, setHotlineName] = useState('');
  const [hotlinePhone, setHotlinePhone] = useState('');
  const [hotlineCategory, setHotlineCategory] = useState('社区/居委会');

  const selectedFeedback = feedbacks.find(f => f.id === selectedFeedbackId);

  // Send staff reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedFeedback) return;

    const newReply = {
      sender: 'staff' as const,
      content: replyText.trim(),
      time: '今天 ' + new Date().toTimeString().slice(0, 5),
    };

    // Auto-update state to processing or resolved if it was pending
    const updatedStatus = selectedFeedback.status === '待处理' ? '处理中' : selectedFeedback.status;

    setFeedbacks(prev =>
      prev.map(f => {
        if (f.id === selectedFeedback.id) {
          return {
            ...f,
            status: updatedStatus as any,
            replies: [...f.replies, newReply],
          };
        }
        return f;
      })
    );

    setReplyText('');
  };

  // Resolve Ticket
  const handleMarkResolved = (id: string) => {
    setFeedbacks(prev =>
      prev.map(f => (f.id === id ? { ...f, status: '已解决' as const } : f))
    );
  };

  // Add Hotline Directory
  const handleAddHotline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotlineName || !hotlinePhone) return;

    const newHotline: Hotline = {
      id: `hot-${Date.now()}`,
      name: hotlineName,
      phone: hotlinePhone,
      category: hotlineCategory,
    };

    setHotlines(prev => [...prev, newHotline]);
    setHotlineName('');
    setHotlinePhone('');
    setShowHotlineModal(false);
  };

  const handleDeleteHotline = (id: string) => {
    setHotlines(prev => prev.filter(h => h.id !== id));
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    return filterStatus === '全部' || f.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans selection:bg-jade/30 selection:text-jade pb-12">
      {/* Header */}
      <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
        <div className="text-2xs text-jade font-mono uppercase tracking-widest font-bold">
          CITIZEN FEEDBACK & HOTLINE MATRIX
        </div>
        <h1 className="text-lg font-bold font-display text-ink mt-0.5">
          💬 居民诉求留言板与人工人工通道
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          对接居民端C端“喊一声”与“帮扶申请”无法被AI完全自主处理的工单，人工回复或指派网格，实现诉求全生命周期闭环。
        </p>
      </div>

      {/* Main Grid: Feedback Lists + Details Chatting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Complaint Board Lists (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-hairline rounded-2xl p-5 shadow-sm flex flex-col min-h-[480px]">
          {/* Filter Statuses */}
          <div className="flex border border-hairline rounded-lg p-0.5 bg-canvas/30 self-start mb-4">
            {(['全部', '待处理', '处理中', '已解决'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 text-4xs font-bold rounded-md transition-all cursor-pointer ${
                  filterStatus === tab
                    ? 'bg-jade text-canvas font-bold shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Lists */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-1">
            {filteredFeedbacks.map(fb => {
              const isSelected = fb.id === selectedFeedbackId;
              const statusColor =
                fb.status === '待处理'
                  ? 'bg-coral-light/25 text-coral border-coral/20'
                  : fb.status === '处理中'
                  ? 'bg-amber-light/25 text-amber border-amber/20'
                  : 'bg-jade-light/25 text-jade border-jade/20';

              return (
                <div
                  key={fb.id}
                  onClick={() => setSelectedFeedbackId(fb.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col gap-2 relative ${
                    isSelected
                      ? 'border-jade bg-jade-light/10 shadow-sm'
                      : 'border-hairline hover:border-hairline hover:bg-canvas/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-3xs font-bold text-ink truncate">{fb.residentName}</span>
                        <span className="text-4xs text-ink-subtle font-mono">{fb.building}{fb.room}</span>
                      </div>
                      <span className="text-4xs text-ink-subtle block">{fb.time}</span>
                    </div>

                    <span className={`text-[9px] px-2 py-0.5 border rounded-full font-bold ${statusColor}`}>
                      {fb.status}
                    </span>
                  </div>

                  <p className="text-3xs text-ink leading-relaxed font-medium line-clamp-2">
                    {fb.question}
                  </p>

                  {fb.helpNeeded && (
                    <div className="text-[10px] text-jade bg-jade-light/10 p-1.5 rounded-lg border border-jade/10 truncate">
                      💡 帮扶诉求：{fb.helpNeeded}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFeedbacks.length === 0 && (
              <div className="py-16 text-center text-xs text-ink-subtle">
                🎉 暂无符合条件的居民诉求留言。
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Dialogues Details (5 cols) */}
        <div className="lg:col-span-5 bg-surface border border-hairline rounded-2xl p-5 shadow-sm min-h-[480px] flex flex-col justify-between">
          {selectedFeedback ? (
            <>
              <div className="flex-1 flex flex-col justify-between">
                {/* Resident Details header */}
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-hairline mb-3.5">
                    <MessageSquare className="w-4 h-4 text-jade shrink-0" />
                    <h3 className="text-xs font-bold text-ink">居民对话闭环详情</h3>
                  </div>

                  <div className="space-y-2 text-4xs text-ink-muted bg-canvas/30 border border-hairline p-3 rounded-xl mb-4 leading-relaxed">
                    <div>
                      <span className="text-ink font-semibold">诉求人：</span>
                      <span>
                        {selectedFeedback.residentName} ({selectedFeedback.residentPhone})
                      </span>
                    </div>
                    <div>
                      <span className="text-ink font-semibold">地址位置：</span>
                      <span>
                        {selectedFeedback.building} {selectedFeedback.room}
                      </span>
                    </div>
                    {selectedFeedback.helpNeeded && (
                      <div>
                        <span className="text-jade font-semibold">希望协助：</span>
                        <span>{selectedFeedback.helpNeeded}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat timelines scroll log */}
                <div className="flex-1 overflow-y-auto max-h-[190px] mb-4 space-y-3.5 pr-1 border-b border-hairline pb-4 min-h-[150px]">
                  {/* Original Question from Resident */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-coral-light/20 text-coral flex items-center justify-center font-bold text-3xs shrink-0 mt-0.5">
                      居
                    </div>
                    <div className="p-2.5 bg-canvas border border-hairline rounded-xl text-3xs text-ink leading-relaxed max-w-[85%]">
                      <p className="font-semibold text-ink-muted text-4xs mb-1">
                        居民原声 ({selectedFeedback.time})
                      </p>
                      {selectedFeedback.question}
                    </div>
                  </div>

                  {/* Reply histories log */}
                  {selectedFeedback.replies.map((rep, rIdx) => {
                    const isStaff = rep.sender === 'staff';
                    return (
                      <div
                        key={rIdx}
                        className={`flex items-start gap-2.5 ${isStaff ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-3xs shrink-0 mt-0.5 ${
                          isStaff ? 'bg-jade-light/25 text-jade' : 'bg-coral-light/25 text-coral'
                        }`}>
                          {isStaff ? '干' : '居'}
                        </div>
                        <div className={`p-2.5 border rounded-xl text-3xs leading-relaxed max-w-[85%] ${
                          isStaff
                            ? 'bg-jade-light/10 border-jade/20 text-ink'
                            : 'bg-canvas border-hairline text-ink'
                        }`}>
                          <p className="font-semibold text-ink-muted text-4xs mb-1">
                            {isStaff ? '工作台反馈' : '居民回复'} ({rep.time})
                          </p>
                          {rep.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply and status controls */}
                <div className="space-y-3.5">
                  {selectedFeedback.status !== '已解决' && (
                    <button
                      onClick={() => handleMarkResolved(selectedFeedback.id)}
                      className="w-full py-1.5 bg-jade hover:bg-jade-hover text-canvas font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      标记本单已办结闭环
                    </button>
                  )}

                  <form onSubmit={handleSendReply} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="编写文字回复该业主..."
                      className="flex-1 px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink focus:outline-none focus:border-jade transition-colors"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-jade hover:bg-jade-hover text-canvas rounded-xl flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-xs text-ink-subtle p-8">
              📥 请选择左侧居民留言项开始实时在线对话，标记已办结。
            </div>
          )}
        </div>
      </div>

      {/* Hotline Section (3.4.2 电话热线) */}
      <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-hairline mb-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-jade shrink-0" />
            <h2 className="text-sm font-bold tracking-tight text-ink font-display">
              ☎️ 社区常备紧急热线电话名录
            </h2>
          </div>
          <button
            onClick={() => setShowHotlineModal(true)}
            className="px-3 py-1.5 bg-canvas hover:bg-jade-light/20 text-jade border border-hairline hover:border-jade/30 rounded-xl text-4xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3 stroke-[3px]" />
            增设热线电话
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {hotlines.map(hot => (
            <div
              key={hot.id}
              className="p-3 bg-canvas/30 border border-hairline hover:border-jade/20 rounded-xl relative group"
            >
              <button
                onClick={() => handleDeleteHotline(hot.id)}
                className="absolute top-2 right-2 text-ink-subtle hover:text-coral opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-coral-light/10"
                title="删除热线"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <span className="text-[9px] font-bold text-jade bg-jade-light/20 px-1.5 py-0.2 rounded block w-fit mb-1.5">
                {hot.category}
              </span>
              <div className="text-3xs font-bold text-ink truncate mb-1">{hot.name}</div>
              <div className="text-xs font-bold font-mono text-coral truncate">{hot.phone}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Hotline Modal */}
      {showHotlineModal && (
        <div className="fixed inset-0 bg-canvas/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-hairline rounded-2xl max-w-sm w-full p-5 shadow-2xl relative overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between pb-3.5 border-b border-hairline mb-3.5">
              <div className="flex items-center gap-1.5">
                <Phone className="w-4.5 h-4.5 text-jade" />
                <h3 className="text-sm font-bold text-ink font-display">增设人工应急电话</h3>
              </div>
              <button
                onClick={() => setShowHotlineModal(false)}
                className="text-ink-muted hover:text-ink hover:bg-canvas p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddHotline} className="space-y-4">
              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  电话名称 (必填)
                </label>
                <input
                  type="text"
                  required
                  placeholder="如: 社区一门受理热线"
                  value={hotlineName}
                  onChange={e => setHotlineName(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  拨打号码 (必填)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0571-87123456"
                  value={hotlinePhone}
                  onChange={e => setHotlinePhone(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  所属类别标签 (必填)
                </label>
                <select
                  value={hotlineCategory}
                  onChange={e => setHotlineCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink focus:outline-none focus:border-jade transition-colors"
                >
                  <option value="社区/居委会">社区/居委会</option>
                  <option value="物业管理">物业管理</option>
                  <option value="楼栋管家">楼栋管家</option>
                  <option value="社区医生">社区医生</option>
                  <option value="妇联">妇联</option>
                </select>
              </div>

              <div className="pt-3 border-t border-hairline flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowHotlineModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-canvas text-xs text-ink-muted hover:text-ink border border-hairline rounded-xl transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-jade hover:bg-jade-hover text-canvas text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  确认增设
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
