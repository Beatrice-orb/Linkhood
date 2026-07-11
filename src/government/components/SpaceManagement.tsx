import React, { useState } from 'react';
import { Home, Clock, Users, Wrench, Check, Plus, Edit, X, Building2 } from 'lucide-react';
import { Space } from '../types';

interface SpaceManagementProps {
  spaces: Space[];
  setSpaces: React.Dispatch<React.SetStateAction<Space[]>>;
}

export default function SpaceManagement({ spaces, setSpaces }: SpaceManagementProps) {
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);

  // Edit states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [newFacility, setNewFacility] = useState('');
  const [bookingType, setBookingType] = useState('');

  // Handle status toggle instantly
  const handleStatusToggle = (id: string, newStatus: '开放中' | '已满' | '维护中') => {
    setSpaces(prev =>
      prev.map(sp => (sp.id === id ? { ...sp, status: newStatus } : sp))
    );
  };

  // Setup edit form
  const handleStartEdit = (sp: Space) => {
    setEditingSpaceId(sp.id);
    setName(sp.name);
    setLocation(sp.location);
    setHours(sp.openHours);
    setCapacity(sp.capacity);
    setFacilities([...sp.facilities]);
    setBookingType(sp.bookingType);
  };

  // Submit edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    setSpaces(prev =>
      prev.map(sp =>
        sp.id === editingSpaceId
          ? {
              ...sp,
              name,
              location,
              openHours: hours,
              capacity: Number(capacity) || 20,
              facilities,
              bookingType,
            }
          : sp
      )
    );
    setEditingSpaceId(null);
  };

  const handleAddFacility = () => {
    if (newFacility.trim()) {
      setFacilities([...facilities, newFacility.trim()]);
      setNewFacility('');
    }
  };

  const handleRemoveFacility = (idx: number) => {
    setFacilities(facilities.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans selection:bg-jade/30 selection:text-jade pb-12">
      {/* Header */}
      <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
        <div className="text-2xs text-jade font-mono uppercase tracking-widest font-bold">
          PUBLIC PROPERTY & SHARED FACILITIES
        </div>
        <h1 className="text-lg font-bold font-display text-ink mt-0.5 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-jade shrink-0" />
          <span>社区公共共享空间阵地维护</span>
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          更新公共空间、共享自习室、老年棋牌室等日常运行状态、配置配套设施并设定预约模式。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Spaces cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {spaces.map(sp => {
              const statusColor =
                sp.status === '开放中'
                  ? 'bg-jade-light/25 text-jade border-jade/20'
                  : sp.status === '已满'
                  ? 'bg-amber-light/25 text-amber border-amber/20'
                  : 'bg-coral-light/25 text-coral border-coral/20';

              return (
                <div
                  key={sp.id}
                  className="bg-surface border border-hairline hover:border-jade/30 rounded-2xl p-4 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-8 h-8 rounded-lg bg-jade-light/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-jade" />
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 border rounded-full font-bold ${statusColor}`}>
                        {sp.status}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-ink leading-tight">{sp.name}</h3>
                    <p className="text-4xs text-ink-subtle mt-1">{sp.location}</p>

                    <div className="mt-3.5 space-y-1.5 text-4xs text-ink-muted border-t border-hairline/40 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                        <span>开放时间: {sp.openHours}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                        <span>容纳上限: {sp.capacity}人</span>
                      </div>
                    </div>

                    {/* Facilities badges list */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {sp.facilities.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.2 rounded-md bg-canvas text-ink-muted border border-hairline">
                          {f}
                        </span>
                      ))}
                      {sp.facilities.length > 3 && (
                        <span className="text-[9px] px-1 text-ink-subtle font-semibold">
                          +{sp.facilities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Status change dropdown/toggles & edit) */}
                  <div className="mt-4 pt-3 border-t border-hairline/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex gap-1 bg-canvas/60 border border-hairline rounded-lg p-0.5">
                      {(['开放中', '已满', '维护中'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => handleStatusToggle(sp.id, st)}
                          className={`px-1.5 py-0.5 text-4xs font-semibold rounded transition-all ${
                            sp.status === st
                              ? st === '开放中'
                                ? 'bg-jade text-canvas font-bold'
                                : st === '已满'
                                ? 'bg-amber text-canvas font-bold'
                                : 'bg-coral text-canvas font-bold'
                              : 'text-ink-subtle hover:text-ink'
                          }`}
                        >
                          {st.split('中')[0]}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleStartEdit(sp)}
                      className="px-2.5 py-1 text-4xs bg-surface border border-hairline hover:border-jade text-ink-muted hover:text-jade rounded-lg transition-all flex items-center justify-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      修改资料
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Edit Space details (5 cols) */}
        <div className="lg:col-span-5 bg-surface border border-hairline rounded-2xl p-5 shadow-sm min-h-[500px]">
          {editingSpaceId ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-hairline mb-3">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-jade shrink-0" />
                  <h3 className="text-sm font-bold text-ink">修改空间阵地资料</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSpaceId(null)}
                  className="text-ink-muted hover:text-ink hover:bg-canvas p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  空间名称
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  空间位置
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                    开放时间
                  </label>
                  <input
                    type="text"
                    value={hours}
                    onChange={e => setHours(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                    最大容量 (人次)
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  预约规则方式
                </label>
                <input
                  type="text"
                  value={bookingType}
                  onChange={e => setBookingType(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              {/* Edit facilities tags */}
              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  内部配套设施清单 (实时在小程序页签显示)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="如: 手工饼干烤箱*2"
                    value={newFacility}
                    onChange={e => setNewFacility(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddFacility}
                    className="px-3 bg-jade hover:bg-jade-hover text-canvas text-xs rounded-xl flex items-center justify-center cursor-pointer"
                  >
                    添加
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto p-1.5 bg-canvas/30 border border-hairline rounded-xl">
                  {facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="text-4xs px-2 py-0.5 rounded-full bg-surface text-ink border border-hairline flex items-center gap-1"
                    >
                      {fac}
                      <button
                        type="button"
                        onClick={() => handleRemoveFacility(idx)}
                        className="text-ink-subtle hover:text-coral transition-colors"
                      >
                        <X className="w-2.5 h-2.5 stroke-[3px]" />
                      </button>
                    </span>
                  ))}
                  {facilities.length === 0 && (
                    <span className="text-4xs text-ink-subtle p-1">暂无设施标签。</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-hairline flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSpaceId(null)}
                  className="px-4 py-2 bg-surface hover:bg-canvas text-xs text-ink-muted hover:text-ink border border-hairline rounded-xl transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-jade hover:bg-jade-hover text-canvas text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  保存并同步小程序
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-xs text-ink-subtle p-8 space-y-4">
              <Home className="w-8 h-8 text-ink-subtle" />
              <div>
                <p className="font-bold text-ink mb-1">未选中编辑项</p>
                <p className="text-3xs text-ink-muted max-w-[240px] mx-auto leading-relaxed">
                  请点击左侧任一空间的“修改资料”按钮。您可以实时变更配套硬件，新增减标签，在C端同步更新。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
