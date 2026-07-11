import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  X,
  CheckCircle,
  FileSpreadsheet,
  Trash2,
  Activity as LucideActivity
} from 'lucide-react';
import { Activity } from '../types';

interface ActivityManagementProps {
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  showPublishModal: boolean;
  setShowPublishModal: (show: boolean) => void;
}

export default function ActivityManagement({
  activities,
  setActivities,
  showPublishModal,
  setShowPublishModal,
}: ActivityManagementProps) {
  const [filterTab, setFilterTab] = useState<'全部' | '报名中' | '进行中' | '已结束'>('全部');
  const [search, setSearch] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(activities[0]?.id || null);

  // Form states
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [limit, setLimit] = useState('20');
  const [organizer, setOrganizer] = useState('社区居委会');

  // Export checklist simulation
  const [exportSuccess, setExportSuccess] = useState(false);

  const selectedActivity = activities.find(a => a.id === selectedActivityId);

  // Handle publishing a new activity
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !time || !location || !description) return;

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      name,
      time,
      location,
      description,
      limit: parseInt(limit) || 20,
      registered: 0,
      signedIn: 0,
      organizer,
      status: '报名中',
      registrants: [],
    };

    setActivities(prev => [newActivity, ...prev]);
    setSelectedActivityId(newActivity.id);
    setShowPublishModal(false);

    // Reset fields
    setName('');
    setTime('');
    setLocation('');
    setDescription('');
    setLimit('20');
    setOrganizer('社区居委会');
  };

  // Toggle resident check-in
  const handleToggleSignIn = (activityId: string, phone: string) => {
    setActivities(prev =>
      prev.map(act => {
        if (act.id === activityId) {
          const updatedRegistrants = act.registrants.map(reg => {
            if (reg.phone === phone) {
              return { ...reg, signedIn: !reg.signedIn };
            }
            return reg;
          });
          const signedInCount = updatedRegistrants.filter(r => r.signedIn).length;
          return {
            ...act,
            registrants: updatedRegistrants,
            signedIn: signedInCount,
          };
        }
        return act;
      })
    );
  };

  // Delete activity
  const handleDeleteActivity = (id: string) => {
    if (confirm('确认取消/删除该社区活动吗？这将对居民端小程序同步下架。')) {
      const remaining = activities.filter(a => a.id !== id);
      setActivities(remaining);
      if (selectedActivityId === id) {
        setSelectedActivityId(remaining[0]?.id || null);
      }
    }
  };

  // Export list simulation
  const handleExportList = () => {
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
    }, 2000);
  };

  const filteredActivities = activities.filter(act => {
    const matchesTab = filterTab === '全部' || act.status === filterTab;
    const matchesSearch =
      act.name.toLowerCase().includes(search.toLowerCase()) ||
      act.location.toLowerCase().includes(search.toLowerCase()) ||
      act.organizer.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans selection:bg-jade/30 selection:text-jade pb-12">
      {/* Header card with metrics preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
        <div>
          <div className="text-2xs text-jade font-mono uppercase tracking-widest font-bold">
            NEIGHBORHOOD LIFE MAPS
          </div>
          <h1 className="text-lg font-bold font-display text-ink mt-0.5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-jade shrink-0" />
            <span>社区活动组织与报名管理</span>
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            发布本周社区活动，收集居民报名意愿，跟踪日常签到和居民参与率。
          </p>
        </div>
        <button
          onClick={() => setShowPublishModal(true)}
          className="px-4 py-2 bg-jade hover:bg-jade-hover text-canvas text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          发起新活动发布
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: List (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-hairline rounded-2xl p-5 shadow-sm flex flex-col min-h-[500px]">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center border-b border-hairline pb-4 mb-4">
            <div className="flex border border-hairline rounded-lg p-0.5 bg-canvas/30 shrink-0">
              {(['全部', '报名中', '进行中', '已结束'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-2.5 py-1 text-4xs font-semibold rounded-md transition-all ${
                    filterTab === tab
                      ? 'bg-jade text-canvas font-bold'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="搜索活动名称、地点、发起方..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:max-w-xs px-3 py-1.5 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-all"
            />
          </div>

          {/* List display */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[550px] pr-1">
            {filteredActivities.map(act => {
              const isSelected = act.id === selectedActivityId;
              const fillPct = Math.round((act.registered / act.limit) * 100);

              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedActivityId(act.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-jade bg-jade-light/10 shadow-sm'
                      : 'border-hairline hover:border-hairline hover:bg-canvas/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-jade-light text-jade border border-jade/10 font-bold font-mono">
                          {act.status}
                        </span>
                        <span className="text-4xs text-ink-subtle truncate max-w-[120px]">
                          {act.organizer}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-ink leading-snug truncate group-hover:text-jade transition-colors">
                        {act.name}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteActivity(act.id);
                      }}
                      className="text-ink-subtle hover:text-coral hover:bg-coral-light/20 p-1 rounded transition-colors shrink-0"
                      title="撤销活动"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-hairline/40">
                    <div className="text-4xs text-ink-muted flex items-center gap-1.5 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                      <span className="truncate">{act.time}</span>
                    </div>
                    <div className="text-4xs text-ink-muted flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                      <span className="truncate">{act.location}</span>
                    </div>
                  </div>

                  {/* Progress bar and counter */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-canvas border border-hairline/20 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                        className={`h-full ${fillPct >= 100 ? 'bg-coral' : 'bg-jade'}`}
                      />
                    </div>
                    <span className="text-4xs font-semibold text-ink font-mono shrink-0">
                      {act.registered}/{act.limit}人 ({fillPct}%)
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredActivities.length === 0 && (
              <div className="py-16 text-center text-caption text-ink-subtle">
                暂无符合条件的活动。您可以点击右上角创建一个。
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Registrant/Checkin View (5 cols) */}
        <div className="lg:col-span-5 bg-surface border border-hairline rounded-2xl p-5 shadow-sm min-h-[500px] flex flex-col justify-between">
          {selectedActivity ? (
            <>
              <div>
                <div className="flex items-center gap-2 pb-3.5 border-b border-hairline mb-4">
                  <LucideActivity className="w-4 h-4 text-jade shrink-0" />
                  <h2 className="text-sm font-bold tracking-tight text-ink">
                    活动详情与签到名单
                  </h2>
                </div>

                <div className="space-y-3.5 pb-4 border-b border-hairline/60">
                  <h3 className="text-xs font-bold text-ink leading-relaxed">
                    {selectedActivity.name}
                  </h3>
                  <div className="space-y-2 text-4xs text-ink-muted leading-relaxed">
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-jade shrink-0 mt-0.5" />
                      <span>时间：{selectedActivity.time}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-jade shrink-0 mt-0.5" />
                      <span>地点：{selectedActivity.location}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="w-3.5 h-3.5 text-jade shrink-0 mt-0.5" />
                      <span>
                        当前：已报名 <span className="text-jade font-bold">{selectedActivity.registered}人</span> / 名额上限 {selectedActivity.limit}人（已签到 {selectedActivity.signedIn}人）
                      </span>
                    </div>
                    <p className="p-3 bg-canvas/40 border border-hairline rounded-xl text-caption text-ink-muted leading-relaxed">
                      活动简介：{selectedActivity.description}
                    </p>
                  </div>
                </div>

                {/* Registrant Check-in Table List */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xs font-bold text-ink-muted uppercase tracking-wider">
                      报名居民花名册 ({selectedActivity.registrants.length}人)
                    </span>
                    <button
                      onClick={handleExportList}
                      className="text-3xs text-jade hover:text-jade-hover flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      {exportSuccess ? '导出成功' : '导出Excel签到本'}
                    </button>
                  </div>

                  <div className="divide-y divide-hairline max-h-[220px] overflow-y-auto pr-1">
                    {selectedActivity.registrants.map((reg) => (
                      <div key={reg.phone} className="py-2.5 flex items-center justify-between text-xs gap-2">
                        <div>
                          <div className="text-3xs font-semibold text-ink flex items-center gap-1.5">
                            {reg.name}
                            <span className="text-4xs font-normal text-ink-subtle">{reg.phone}</span>
                          </div>
                          <span className="text-4xs text-ink-subtle block mt-0.5">报名于: {reg.time}</span>
                        </div>

                        <button
                          onClick={() => handleToggleSignIn(selectedActivity.id, reg.phone)}
                          className={`px-2.5 py-1 rounded-lg text-4xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            reg.signedIn
                              ? 'bg-jade-light/20 text-jade border border-jade/20'
                              : 'bg-canvas text-ink-subtle hover:text-jade border border-hairline'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          {reg.signedIn ? '已签到' : '勾选签到'}
                        </button>
                      </div>
                    ))}

                    {selectedActivity.registrants.length === 0 && (
                      <div className="py-8 text-center text-caption text-ink-subtle">
                        该活动目前还没有居民报名。报名开启后，居民数据将自动实时流转到这里。
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-jade-light/10 border border-jade/10 rounded-xl mt-4">
                <span className="text-[10px] text-ink-subtle block text-center leading-relaxed">
                  * 居民通过 To C 微信小程序扫码或者在现场通过社工一键勾选，均可实时在此处更新并记录活动学分。
                </span>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-caption text-ink-subtle p-8">
              请选择左侧的活动查看详细报名名录与管理签到。
            </div>
          )}
        </div>
      </div>

      {/* Publish New Activity Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-canvas/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-hairline rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-hairline mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-jade" />
                <h3 className="text-sm font-bold text-ink font-display">
                  发起全新社区生活活动
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
                  活动名称 (必填)
                </label>
                <input
                  type="text"
                  required
                  placeholder="如: 社区周六烘焙课堂"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                    活动时间 (必填)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2026-07-18 14:00"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                    名额上限人次 (必填)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={limit}
                    onChange={e => setLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  活动地点 (必填)
                </label>
                <input
                  type="text"
                  required
                  placeholder="如: 党群服务中心二层多功能厨房"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  主办发起单位 / 筹划人
                </label>
                <input
                  type="text"
                  placeholder="社区居委会 / 志愿者总队"
                  value={organizer}
                  onChange={e => setOrganizer(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  活动详细介绍与报名规则 (必填)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="提供专业导师指导，提供免费烘焙礼品，需要自备围裙，限住户报名..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors resize-none"
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
                  className="px-5 py-2 bg-jade hover:bg-jade-hover text-canvas text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  确认发布到居民端
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
