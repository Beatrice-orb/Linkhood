import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  Megaphone,
  Home,
  Store,
  HeartHandshake,
  Users,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
}: SidebarProps) {

  const menuGroups = [
    {
      title: '综合驾驶舱',
      items: [
        { id: 'dashboard', label: '数据看板', icon: BarChart3 },
      ],
    },
    {
      title: '自治管理控制台',
      items: [
        { id: 'activities', label: '活动管理', icon: Calendar },
        { id: 'notices', label: '公告管理', icon: Megaphone },
        { id: 'spaces', label: '空间管理', icon: Home },
        { id: 'services', label: '服务管理', icon: Store },
        { id: 'workers', label: '社工管理', icon: HeartHandshake },
        { id: 'residents', label: '居民管理', icon: Users },
      ],
    },
    {
      title: '诉求闭环中心',
      items: [
        { id: 'feedback', label: '需求反馈/留言板', icon: MessageSquare },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-hairline flex flex-col h-screen fixed left-0 top-0 z-20 font-sans select-none animate-fade-in">
      {/* Brand logo */}
      <div className="p-5 border-b border-hairline flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-jade text-canvas flex items-center justify-center font-bold text-base shadow-sm">
          搭
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-ink block font-display">
            搭把手 COMMUNITY
          </span>
          <span className="text-caption text-jade tracking-wider uppercase block font-mono">
            TO G GOVERNANCE v2.0
          </span>
        </div>
      </div>

      {/* User profile (Static, no switching) */}
      <div className="p-4 border-b border-hairline">
        <div className="p-3 bg-canvas/50 border border-hairline rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              杨
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-ink truncate">
                杨主任
              </div>
              <div className="text-caption text-ink-muted flex items-center gap-1 mt-0.5 font-sans">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
                西红门街道 · 泊寓社区
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2.5 px-1.5 text-caption text-ink-muted flex flex-col gap-0.5 font-sans">
          <div className="flex items-center gap-1">
            <span className="text-jade font-semibold">身份:</span>
            <span className="text-ink truncate">社区/居委会主任</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-jade font-semibold">权限:</span>
            <span className="text-ink-subtle truncate">本社区全要素管理</span>
          </div>
        </div>
      </div>

      {/* Navigation menus */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Independent Top-level Workbench Button */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('workbench')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left ${
              activeTab === 'workbench'
                ? 'bg-primary text-canvas font-semibold shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-canvas-light'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeTab === 'workbench' ? 'text-canvas' : 'text-ink-subtle'}`} />
            <span className="font-bold">工作台首页</span>
            {activeTab === 'workbench' && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-canvas" />
            )}
          </button>
        </div>

        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5 pt-3">
            <div className="px-3 py-1.5 flex items-center gap-2 mb-1.5 bg-canvas-light border border-primary/5 border-l-2 border-primary rounded-r-xl transition-all shadow-card">
              <span className="text-caption font-bold tracking-wider text-primary uppercase font-sans">
                {group.title}
              </span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary/40" />
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left ${
                    isActive
                      ? 'bg-primary text-canvas font-semibold shadow-sm'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas-light'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-canvas' : 'text-ink-subtle'}`} />
                  <span>{item.label}</span>
                  {item.id === 'feedback' && (
                    <span className="ml-auto flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-coral"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom info & sign out */}
      <div className="p-3 border-t border-hairline bg-canvas-light/40">
        <button
          onClick={onLogout}
          className="w-full py-2.5 bg-surface hover:bg-coral-light/25 text-ink-muted hover:text-coral border border-hairline hover:border-coral/30 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          退出登录
        </button>
      </div>
    </aside>
  );
}
