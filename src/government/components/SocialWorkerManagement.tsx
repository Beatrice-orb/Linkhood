import React, { useState } from 'react';
import { HeartHandshake, Phone, Calendar, UserCheck, Plus, X, Edit, Wrench } from 'lucide-react';
import { SocialWorker } from '../types';

interface SocialWorkerProps {
  workers: SocialWorker[];
  setWorkers: React.Dispatch<React.SetStateAction<SocialWorker[]>>;
}

export default function SocialWorkerManagement({ workers, setWorkers }: SocialWorkerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [area, setArea] = useState('');
  const [schedule, setSchedule] = useState('');
  const [phone, setPhone] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [newSvc, setNewSvc] = useState('');

  const handleStartEdit = (sw: SocialWorker) => {
    setEditingId(sw.id);
    setName(sw.name);
    setRole(sw.role);
    setArea(sw.area);
    setSchedule(sw.schedule);
    setPhone(sw.phone);
    setServices([...sw.services]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    if (editingId) {
      setWorkers(prev =>
        prev.map(sw =>
          sw.id === editingId
            ? { ...sw, name, role, area, schedule, phone, services }
            : sw
        )
      );
      setEditingId(null);
    } else {
      const newSw: SocialWorker = {
        id: `sw-${Date.now()}`,
        name,
        role,
        area,
        schedule,
        phone,
        services,
      };
      setWorkers(prev => [...prev, newSw]);
      setShowAddModal(false);
    }

    // Reset
    setName('');
    setRole('');
    setArea('');
    setSchedule('');
    setPhone('');
    setServices([]);
  };

  const handleDelete = (id: string) => {
    if (confirm('是否从名册中下线该社工信息？')) {
      setWorkers(prev => prev.filter(sw => sw.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const handleAddSvc = () => {
    if (newSvc.trim() && !services.includes(newSvc.trim())) {
      setServices([...services, newSvc.trim()]);
      setNewSvc('');
    }
  };

  const handleRemoveSvc = (idx: number) => {
    setServices(services.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans selection:bg-jade/30 selection:text-jade pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
        <div>
          <div className="text-2xs text-jade font-mono uppercase tracking-widest font-bold">
            COMMUNITY SOCIAL WORKER ROSTER
          </div>
          <h1 className="text-lg font-bold font-display text-ink mt-0.5">
            🤝 社区网格员与专职社工管理
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            配置社工值班时间表、负责楼宇网格范围及专属心理咨询/帮扶审核等服务清单。
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setName('');
            setRole('');
            setArea('');
            setSchedule('');
            setPhone('');
            setServices([]);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-jade hover:bg-jade-hover text-canvas text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          登记新社工值班
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Workers cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workers.map(sw => (
              <div
                key={sw.id}
                className="bg-surface border border-hairline hover:border-jade/30 rounded-2xl p-4 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3 pb-3 border-b border-hairline">
                    <div className="w-10 h-10 rounded-full bg-jade-light/20 border border-jade/15 text-jade flex items-center justify-center font-bold text-sm">
                      {sw.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-ink">{sw.name}</h3>
                      <p className="text-4xs text-jade font-medium mt-0.5">{sw.role}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-4xs text-ink-muted">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                      <span>管辖网格: {sw.area}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                      <span>值班时间: {sw.schedule}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                      <span>联系电话: {sw.phone}</span>
                    </div>
                  </div>

                  {/* Services tags */}
                  <div className="flex flex-wrap gap-1 mt-4">
                    {sw.services.map((s, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.2 rounded-md bg-canvas text-ink-subtle border border-hairline">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-hairline/50 flex justify-end gap-2">
                  <button
                    onClick={() => handleDelete(sw.id)}
                    className="px-2.5 py-1 text-4xs hover:bg-coral-light/20 text-ink-subtle hover:text-coral border border-hairline hover:border-coral/20 rounded-lg transition-all font-semibold cursor-pointer"
                  >
                    注销
                  </button>
                  <button
                    onClick={() => handleStartEdit(sw)}
                    className="px-2.5 py-1 text-4xs bg-surface border border-hairline hover:border-jade text-ink-muted hover:text-jade rounded-lg transition-all flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Edit className="w-3 h-3" />
                    修改排班
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Edit/Create form */}
        <div className="lg:col-span-5 bg-surface border border-hairline rounded-2xl p-5 shadow-sm min-h-[500px]">
          {editingId || showAddModal ? (
            <form onSubmit={handleSave} className="space-y-4 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-hairline mb-3">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-jade shrink-0" />
                  <h3 className="text-sm font-bold text-ink">
                    {editingId ? '修改网格社工排班资料' : '登记增设新专职社工'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setShowAddModal(false);
                  }}
                  className="text-ink-muted hover:text-ink hover:bg-canvas p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  社工姓名 (必填)
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
                  职务角色职务 (必填)
                </label>
                <input
                  type="text"
                  required
                  placeholder="如: 专职网格员、心理理疗师"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                    负责楼宇网格
                  </label>
                  <input
                    type="text"
                    placeholder="1-2号楼重点网格"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                    联系电话
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  值班时段说明
                </label>
                <input
                  type="text"
                  placeholder="周一至周五 08:30-17:30"
                  value={schedule}
                  onChange={e => setSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              {/* Service list config */}
              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  承接帮扶服务专项清单
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="如: 低保初审、心理慰问"
                    value={newSvc}
                    onChange={e => setNewSvc(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddSvc}
                    className="px-3 bg-jade hover:bg-jade-hover text-canvas text-xs rounded-xl flex items-center justify-center cursor-pointer"
                  >
                    添加
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto p-1.5 bg-canvas/30 border border-hairline rounded-xl">
                  {services.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-4xs px-2 py-0.5 rounded-full bg-surface text-ink border border-hairline flex items-center gap-1 animate-scale-up"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSvc(idx)}
                        className="text-ink-subtle hover:text-coral transition-colors"
                      >
                        <X className="w-2.5 h-2.5 stroke-[3px]" />
                      </button>
                    </span>
                  ))}
                  {services.length === 0 && (
                    <span className="text-4xs text-ink-subtle p-1">尚未指派专属帮扶方向。</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-hairline flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setShowAddModal(false);
                  }}
                  className="px-4 py-2 bg-surface hover:bg-canvas text-xs text-ink-muted hover:text-ink border border-hairline rounded-xl transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-jade hover:bg-jade-hover text-canvas text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  确认登记
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-xs text-ink-subtle p-8 space-y-4">
              <HeartHandshake className="w-8 h-8 text-ink-subtle animate-pulse" />
              <div>
                <p className="font-bold text-ink mb-1">未开始编辑</p>
                <p className="text-3xs text-ink-muted max-w-[240px] mx-auto leading-relaxed">
                  可点击左侧对应卡片中的“修改排班”，或点击右上角“登记新社工值班”录入社区最新的网格工作团队。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
