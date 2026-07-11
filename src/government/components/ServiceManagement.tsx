import React, { useState } from 'react';
import { Store, Phone, Clock, Award, Plus, Edit, X, Wrench, Search, Star, Gift } from 'lucide-react';
import { Service } from '../types';

interface ServiceManagementProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

export default function ServiceManagement({ services, setServices }: ServiceManagementProps) {
  const [filterCategory, setFilterCategory] = useState<'全部' | '便民商超' | '餐饮美食' | '家政维修' | '健康医疗'>('全部');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Search & form states
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'便民商超' | '餐饮美食' | '家政维修' | '健康医疗' | '其他'>('便民商超');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState('');
  const [phone, setPhone] = useState('');
  const [discount, setDiscount] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleToggleRecommend = (id: string) => {
    setServices(prev =>
      prev.map(svc => (svc.id === id ? { ...svc, isRecommended: !svc.isRecommended } : svc))
    );
  };

  const handleStartEdit = (svc: Service) => {
    setEditingServiceId(svc.id);
    setName(svc.name);
    setCategory(svc.category);
    setLocation(svc.location);
    setHours(svc.hours);
    setPhone(svc.phone);
    setDiscount(svc.discount);
    setTags([...svc.tags]);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    setServices(prev =>
      prev.map(svc =>
        svc.id === editingServiceId
          ? {
              ...svc,
              name,
              category,
              location,
              hours,
              phone,
              discount,
              tags,
            }
          : svc
      )
    );
    setEditingServiceId(null);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  const filteredServices = services.filter(svc => {
    const matchesCategory = filterCategory === '全部' || svc.category === filterCategory;
    const matchesSearch =
      svc.name.toLowerCase().includes(search.toLowerCase()) ||
      svc.location.toLowerCase().includes(search.toLowerCase()) ||
      svc.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans selection:bg-jade/30 selection:text-jade pb-12">
      {/* Header */}
      <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
        <div className="text-2xs text-jade font-mono uppercase tracking-widest font-bold">
          CONVENIENT NEIGHBORHOOD SERVICES
        </div>
        <h1 className="text-lg font-bold font-display text-ink mt-0.5 flex items-center gap-2">
          <Store className="w-5 h-5 text-jade shrink-0" />
          <span>社区周边生活服务商户管理</span>
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          审核并展示辖区15分钟生活圈优质加盟商，设置“红色暖心折扣”、一键置顶推荐优质商家。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left column: Services lists (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-hairline rounded-2xl p-5 shadow-sm flex flex-col min-h-[500px]">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center border-b border-hairline pb-4 mb-4">
            <div className="flex overflow-x-auto pb-1.5 sm:pb-0 gap-1 scrollbar-none">
              {(['全部', '便民商超', '餐饮美食', '家政维修', '健康医疗'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterCategory(tab)}
                  className={`px-2 py-1 text-4xs font-bold rounded-lg border transition-all shrink-0 ${
                    filterCategory === tab
                      ? 'bg-jade border-jade text-canvas shadow-sm'
                      : 'border-hairline text-ink-muted hover:text-ink hover:bg-canvas/40 bg-canvas/20'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="搜索商户名、位置、标签..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-all"
              />
            </div>
          </div>

          {/* Grid display */}
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {filteredServices.map(svc => (
              <div
                key={svc.id}
                className="p-4 bg-canvas/30 border border-hairline rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-start"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface text-ink-muted border border-hairline font-bold font-mono">
                      {svc.category}
                    </span>
                    {svc.isRecommended && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-light/35 text-amber border border-amber/25 font-bold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber" />
                        置顶置顶
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-ink leading-tight">{svc.name}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-4xs text-ink-muted">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                      <span>营业：{svc.hours}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                      <span>联系：{svc.phone}</span>
                    </div>
                  </div>

                  <p className="p-2.5 bg-surface border border-hairline rounded-xl text-caption text-ink-muted leading-relaxed">
                    <span className="text-amber font-bold flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-amber shrink-0" />
                      暖心优惠：
                    </span>
                    {svc.discount}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {svc.tags.map((t, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-surface text-ink-subtle border border-hairline">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions (Toggle recommendation, Edit) */}
                <div className="flex sm:flex-col justify-end gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 sm:border-l border-hairline/60 sm:pl-4">
                  <button
                    onClick={() => handleToggleRecommend(svc.id)}
                    className={`px-3 py-1.5 rounded-lg text-4xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      svc.isRecommended
                        ? 'bg-amber-light/20 text-amber border border-amber/20'
                        : 'bg-surface hover:bg-canvas text-ink-subtle border border-hairline'
                    }`}
                  >
                    置顶推荐
                  </button>
                  <button
                    onClick={() => handleStartEdit(svc)}
                    className="px-3 py-1.5 bg-jade hover:bg-jade-hover text-canvas text-4xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    修改资料
                  </button>
                </div>
              </div>
            ))}

            {filteredServices.length === 0 && (
              <div className="py-16 text-center text-caption text-ink-subtle">
                暂无符合条件的周边商户服务。
              </div>
            )}
          </div>
        </div>

        {/* Right column: Edit Form (5 cols) */}
        <div className="lg:col-span-5 bg-surface border border-hairline rounded-2xl p-5 shadow-sm min-h-[500px]">
          {editingServiceId ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-hairline mb-3">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-jade shrink-0" />
                  <h3 className="text-sm font-bold text-ink font-display">配置生活商户资料</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingServiceId(null)}
                  className="text-ink-muted hover:text-ink hover:bg-canvas p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  商户店名
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                    服务类型
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink focus:outline-none focus:border-jade transition-colors"
                  >
                    <option value="便民商超">便民商超</option>
                    <option value="餐饮美食">餐饮美食</option>
                    <option value="家政维修">家政维修</option>
                    <option value="健康医疗">健康医疗</option>
                    <option value="其他">其他类别</option>
                  </select>
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
                  经营地址位置
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                />
              </div>

              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  营业时间区间
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
                  红色居民暖心专属折扣方案
                </label>
                <textarea
                  rows={2}
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  placeholder="如: 凭社区APP注册卡，大米和豆油享受九折优惠"
                  className="w-full px-3 py-2 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors resize-none"
                />
              </div>

              {/* Tags list */}
              <div>
                <label className="block text-4xs font-medium uppercase tracking-wider text-ink-muted mb-1.5">
                  经营特色商圈标签
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="如: 免费寄存"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 bg-jade hover:bg-jade-hover text-canvas text-xs rounded-xl flex items-center justify-center cursor-pointer"
                  >
                    增加
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto p-1.5 bg-canvas/30 border border-hairline rounded-xl">
                  {tags.map((tg, idx) => (
                    <span
                      key={idx}
                      className="text-4xs px-2 py-0.5 rounded-full bg-surface text-ink border border-hairline flex items-center gap-1 animate-scale-up"
                    >
                      {tg}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-ink-subtle hover:text-coral transition-colors"
                      >
                        <X className="w-2.5 h-2.5 stroke-[3px]" />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-4xs text-ink-subtle p-1">暂无标签特色。</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-hairline flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingServiceId(null)}
                  className="px-4 py-2 bg-surface hover:bg-canvas text-xs text-ink-muted hover:text-ink border border-hairline rounded-xl transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-jade hover:bg-jade-hover text-canvas text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  确认同步商家列表
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-xs text-ink-subtle p-8 space-y-4">
              <Store className="w-8 h-8 text-ink-subtle" />
              <div>
                <p className="font-bold text-ink mb-1">未选中编辑项</p>
                <p className="text-3xs text-ink-muted max-w-[240px] mx-auto leading-relaxed">
                  请点击左侧商户列表中的“修改资料”。加盟商家暖心福利、联系人电话、服务标签均可随改随存，在C端小程序实时上线。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
