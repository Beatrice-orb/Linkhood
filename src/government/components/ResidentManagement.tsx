import React, { useState } from 'react';
import { Users, Search, Heart, Shield, Award, UserCheck, Star, Edit3, CheckSquare, Plus, PlusCircle } from 'lucide-react';
import { Resident } from '../types';

interface ResidentProps {
  residents: Resident[];
  setResidents: React.Dispatch<React.SetStateAction<Resident[]>>;
}

export default function ResidentManagement({ residents, setResidents }: ResidentProps) {
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('全部');
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(residents[0]?.id || null);

  const selectedResident = residents.find(r => r.id === selectedResidentId);

  // Toggle resident tag
  const handleToggleTag = (residentId: string, tag: '独居老人' | '困难家庭' | '志愿者' | '党员' | '退役军人' | '中青年') => {
    setResidents(prev =>
      prev.map(r => {
        if (r.id === residentId) {
          const hasTag = r.tags.includes(tag);
          const updatedTags = hasTag
            ? r.tags.filter(t => t !== tag)
            : [...r.tags, tag];
          return { ...r, tags: updatedTags };
        }
        return r;
      })
    );
  };

  const handleAdjustCredit = (residentId: string, amount: number) => {
    setResidents(prev =>
      prev.map(r => {
        if (r.id === residentId) {
          return { ...r, creditScore: Math.max(80, Math.min(150, r.creditScore + amount)) };
        }
        return r;
      })
    );
  };

  const handleAddFlower = (residentId: string) => {
    setResidents(prev =>
      prev.map(r => {
        if (r.id === residentId) {
          return { ...r, redFlowers: r.redFlowers + 1 };
        }
        return r;
      })
    );
  };

  const filteredResidents = residents.filter(r => {
    const matchesTag = filterTag === '全部' || r.tags.includes(filterTag as any);
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.building.toLowerCase().includes(search.toLowerCase()) ||
      r.room.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const availableTags: ('独居老人' | '困难家庭' | '志愿者' | '党员' | '退役军人' | '中青年')[] = [
    '独居老人',
    '困难家庭',
    '志愿者',
    '党员',
    '退役军人',
    '中青年',
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans selection:bg-jade/30 selection:text-jade pb-12">
      {/* Header */}
      <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
        <div className="text-2xs text-jade font-mono uppercase tracking-widest font-bold">
          REGISTERED CITIZENS DIRECTORY
        </div>
        <h1 className="text-lg font-bold font-display text-ink mt-0.5">
          👥 常住注册居民电子档案库
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          查阅常住居民自治信任分（小红花、好评数）、标记“空巢老人”、“困难家庭”等关怀标签，防范特殊事件。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left column: List (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-hairline rounded-2xl p-5 shadow-sm flex flex-col min-h-[500px]">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center border-b border-hairline pb-4 mb-4">
            <div className="flex overflow-x-auto pb-1.5 sm:pb-0 gap-1 scrollbar-none">
              {['全部', '独居老人', '困难家庭', '志愿者', '党员'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-2 py-1 text-4xs font-bold rounded-lg border transition-all shrink-0 ${
                    filterTag === tag
                      ? 'bg-jade border-jade text-canvas shadow-sm'
                      : 'border-hairline text-ink-muted hover:text-ink hover:bg-canvas/40 bg-canvas/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="搜索姓名、房号、手机号..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-hairline rounded-xl text-3xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-jade transition-all"
              />
            </div>
          </div>

          {/* List content */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {filteredResidents.map(r => {
              const isSelected = r.id === selectedResidentId;
              const isElderly = r.tags.includes('独居老人');

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedResidentId(r.id)}
                  className={`p-3.5 border rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-jade bg-jade-light/10 shadow-sm'
                      : 'border-hairline hover:border-hairline hover:bg-canvas/40'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isElderly ? 'bg-coral/20 text-coral' : 'bg-jade-light/20 text-jade'
                    }`}>
                      {r.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-ink truncate">{r.name}</h3>
                        <span className="text-4xs text-ink-subtle font-mono">
                          {r.building}{r.room}
                        </span>
                      </div>
                      <p className="text-4xs text-ink-muted mt-0.5 truncate">{r.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Tags group */}
                    <div className="hidden sm:flex flex-wrap gap-1 justify-end max-w-[150px]">
                      {r.tags.slice(0, 2).map((t, i) => (
                        <span
                          key={i}
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            t === '独居老人'
                              ? 'bg-coral-light/25 text-coral border border-coral/20'
                              : t === '党员'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-jade-light/25 text-jade border border-jade/20'
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                      {r.tags.length > 2 && (
                        <span className="text-[10px] text-ink-subtle">+{r.tags.length - 2}</span>
                      )}
                    </div>

                    <div className="text-right font-mono text-3xs">
                      <div className="text-ink font-bold flex items-center gap-0.5 justify-end">
                        <Award className="w-3 h-3 text-amber shrink-0" />
                        {r.creditScore}分
                      </div>
                      <span className="text-ink-subtle text-4xs">好评x{r.goodReviews}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredResidents.length === 0 && (
              <div className="py-16 text-center text-xs text-ink-subtle">
                🔍 暂无符合检索条件的常住居民档案。
              </div>
            )}
          </div>
        </div>

        {/* Right column: Profile Detail Card (5 cols) */}
        <div className="lg:col-span-5 bg-surface border border-hairline rounded-2xl p-5 shadow-sm min-h-[500px] flex flex-col justify-between">
          {selectedResident ? (
            <>
              <div>
                <div className="flex items-center gap-2 pb-3.5 border-b border-hairline mb-4">
                  <Users className="w-4 h-4 text-jade shrink-0" />
                  <h2 className="text-sm font-bold tracking-tight text-ink">
                    居民详细自治档案卡
                  </h2>
                </div>

                {/* Profile detail */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-canvas/40 border border-hairline rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-jade-light/30 border border-jade/25 text-jade flex items-center justify-center font-bold text-base font-display">
                      {selectedResident.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">{selectedResident.name}</h3>
                      <p className="text-xs text-ink-muted mt-0.5">
                        📍 房号: {selectedResident.building} {selectedResident.room}
                      </p>
                      <span className="text-4xs text-ink-subtle font-mono mt-0.5 block">
                        系统登记时间: {selectedResident.registerTime}
                      </span>
                    </div>
                  </div>

                  {/* Citizen Trust Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-canvas/30 border border-hairline rounded-xl">
                      <span className="text-4xs text-ink-subtle block">自治信任分</span>
                      <span className="text-sm font-bold font-mono text-ink block mt-0.5">
                        🛡️ {selectedResident.creditScore}
                      </span>
                      <div className="flex justify-center gap-1 mt-1 text-[9px] font-mono">
                        <button
                          onClick={() => handleAdjustCredit(selectedResident.id, 5)}
                          className="px-1 text-jade hover:bg-jade/10 rounded"
                          title="奖励5学分"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleAdjustCredit(selectedResident.id, -5)}
                          className="px-1 text-coral hover:bg-coral/10 rounded"
                          title="扣减5学分"
                        >
                          -5
                        </button>
                      </div>
                    </div>

                    <div className="p-2 bg-canvas/30 border border-hairline rounded-xl">
                      <span className="text-4xs text-ink-subtle block">小红花徽章</span>
                      <span className="text-sm font-bold font-mono text-coral block mt-0.5">
                        🌺 {selectedResident.redFlowers}朵
                      </span>
                      <button
                        onClick={() => handleAddFlower(selectedResident.id)}
                        className="mt-1 text-[9px] text-coral hover:underline flex items-center gap-0.5 mx-auto cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        赠送朵
                      </button>
                    </div>

                    <div className="p-2 bg-canvas/30 border border-hairline rounded-xl flex flex-col justify-center">
                      <span className="text-4xs text-ink-subtle block">互助被好评</span>
                      <span className="text-sm font-bold font-mono text-amber block mt-0.5">
                        ⭐ {selectedResident.goodReviews}次
                      </span>
                      <span className="text-[9px] text-ink-subtle mt-1 block">参与活动: {selectedResident.activityCount}场</span>
                    </div>
                  </div>

                  {/* Toggle Special group Tags */}
                  <div className="space-y-2 pt-3 border-t border-hairline">
                    <span className="text-3xs font-bold text-ink-muted uppercase tracking-wider block">
                      🏷️ 群组标记配置 (点击快速增删同步)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableTags.map((t) => {
                        const hasTag = selectedResident.tags.includes(t);
                        return (
                          <button
                            key={t}
                            onClick={() => handleToggleTag(selectedResident.id, t)}
                            className={`px-2.5 py-1 text-4xs rounded-lg transition-all border flex items-center gap-1 cursor-pointer ${
                              hasTag
                                ? 'bg-jade border-jade text-canvas font-bold'
                                : 'bg-surface hover:bg-canvas border-hairline text-ink-muted'
                            }`}
                          >
                            {hasTag ? '✓ ' : '+ '}
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-jade-light/10 border border-jade/10 rounded-xl mt-4">
                <span className="text-[10px] text-ink-subtle block leading-relaxed text-center">
                  * 信用评分、好评、小红花替代传统的积分规则，专为配合 C端“关怀版”做更简单直观的积分激励呈现。
                </span>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-xs text-ink-subtle p-8">
              📥 请选择左侧列表中的居民查看详细的学分记录与打标签操作。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
