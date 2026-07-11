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
  ShieldAlert,
  MessageSquare,
  ChevronDown,
  LogOut,
  Sparkles,
  Building2,
  Flag,
  Heart
} from 'lucide-react';
import { Role, User } from '../types';
import { ROLE_INFO } from '../mockData';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onRoleChange: (role: Role) => void;
}

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onRoleChange,
}: SidebarProps) {
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);

  const rolesList = [
    { id: 'COMMUNITY_STAFF' as Role, label: '社区/居委会工作人员', icon: Home },
    { id: 'STREET_STAFF' as Role, label: '街道办工作人员', icon: Building2 },
    { id: 'PARTY_CENTER_OPERATOR' as Role, label: '党群服务中心运营人员', icon: Flag },
    { id: 'WOMEN_FEDERATION' as Role, label: '妇联/群团组织工作人员', icon: Heart },
  ];

  const currentRoleDetails = ROLE_INFO[currentUser.role];

  const menuGroups = [
    {
      title: '综合驾驶舱',
      items: [
        { id: 'workbench', label: '工作台首页', icon: LayoutDashboard },
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
        { id: 'antifraud', label: '防诈骗管理', icon: ShieldAlert },
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
    <aside className="w-64 bg-surface border-r border-hairline flex flex-col h-screen fixed left-0 top-0 z-20 font-sans select-none">
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

      {/* User profile with active role switcher */}
      <div className="p-4 border-b border-hairline relative">
        <div
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className="p-3 bg-canvas/40 hover:bg-canvas/80 border border-hairline hover:border-jade/30 rounded-xl cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-jade/20 text-jade flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name[0]}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-ink truncate">
                {currentUser.name}
              </div>
              <div className="text-caption text-ink-muted flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
                {currentUser.community.split('·')[1] || '泊寓公寓'}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-ink-subtle transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
        </div>

        {showRoleMenu && (
          <div className="absolute top-22 left-4 right-4 bg-surface border border-hairline rounded-xl shadow-xl z-30 p-1.5 animate-scale-up">
            <div className="text-caption text-ink-subtle px-2.5 py-1.5 font-semibold">
              切换当前工作身份：
            </div>
            {rolesList.map((r) => {
              const RoleIcon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    onRoleChange(r.id);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 text-xs rounded-lg transition-colors flex items-center gap-2 ${
                    currentUser.role === r.id
                      ? 'bg-jade-light/25 text-jade font-medium'
                      : 'text-ink-muted hover:bg-canvas/50 hover:text-ink'
                  }`}
                >
                  <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{r.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-2.5 px-1.5 text-caption text-ink-muted flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span className="text-jade font-semibold">身份:</span>
            <span className="text-ink truncate">{currentRoleDetails.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-jade font-semibold">权限:</span>
            <span className="text-ink-subtle truncate">{currentRoleDetails.perms}</span>
          </div>
        </div>
      </div>

      {/* Navigation menus */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className="px-3 text-caption font-semibold tracking-widest text-ink-subtle uppercase pb-1">
              {group.title}
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
                      ? 'bg-jade text-canvas font-semibold shadow-sm'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas/30'
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
      <div className="p-3 border-t border-hairline bg-canvas/20">
        <div className="p-3 bg-jade-light/10 border border-jade/10 rounded-xl mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-jade shrink-0" />
          <div className="text-caption text-ink-muted leading-relaxed">
            数据来源于 <span className="text-jade font-medium">To C端小程序</span> 真实居民自治行为，全自动采集无负担。
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full py-2.5 bg-surface hover:bg-coral-light/20 text-ink-muted hover:text-coral border border-hairline hover:border-coral/30 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          退出登录
        </button>
      </div>
    </aside>
  );
}
