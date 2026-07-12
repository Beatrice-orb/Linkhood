import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  BarChart3,
  Calendar,
  Megaphone,
  Home as HomeIcon,
  Store,
  HeartHandshake,
  Users,
  ShieldAlert,
  MessageSquare,
  LogOut,
  Bell,
  CheckCircle,
  Clock,
  HelpCircle
} from 'lucide-react';

import { Role, User, TodoItem, Activity, Announcement, Space, Service, SocialWorker, Resident, AntiFraudReminder, Feedback, Hotline } from './types';
import {
  INITIAL_USER,
  INITIAL_TODOS,
  INITIAL_ACTIVITIES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SPACES,
  INITIAL_SERVICES,
  INITIAL_SOCIAL_WORKERS,
  INITIAL_RESIDENTS,
  INITIAL_FRAUD_ALERTS,
  INITIAL_FEEDBACKS,
  INITIAL_HOTLINES
} from './mockData';

// Modular Component Imports
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ActivityManagement from './components/ActivityManagement';
import NoticeManagement from './components/NoticeManagement';
import SpaceManagement from './components/SpaceManagement';
import ServiceManagement from './components/ServiceManagement';
import SocialWorkerManagement from './components/SocialWorkerManagement';
import ResidentManagement from './components/ResidentManagement';
import FeedbackManagement from './components/FeedbackManagement';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // default true for instant preview, fully supports logout
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<string>('workbench');

  // Core Mutable States
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [workers, setWorkers] = useState<SocialWorker[]>(INITIAL_SOCIAL_WORKERS);
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);
  const [hotlines, setHotlines] = useState<Hotline[]>(INITIAL_HOTLINES);

  // Modal triggers
  const [showActivityPublishModal, setShowActivityPublishModal] = useState(false);
  const [showNoticePublishModal, setShowNoticePublishModal] = useState(false);

  // Notification Toast Banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    // Show a welcoming notification on load
    showToast('「搭把手」To G端社区治理系统加载成功，当前处于：西红门街道社区。', 'success');
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Login handler
  const handleLoginSuccess = (phone: string, role: Role) => {
    let communityName = '西红门街道社区';
    if (role === 'STREET_STAFF') {
      communityName = '西红门街道办事处';
    }

    const nameMap: Record<Role, string> = {
      STREET_STAFF: '杨主任',
      COMMUNITY_STAFF: '杨主任',
      PARTY_CENTER_OPERATOR: '高站长',
      WOMEN_FEDERATION: '张大姐',
    };

    setCurrentUser({
      name: nameMap[role],
      phone,
      role,
      community: communityName,
    });
    setIsLoggedIn(true);
    setActiveTab('workbench');
    showToast(`登录成功！欢迎回来，${nameMap[role]}。已载入对应数据。`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast('已安全退出工作台。', 'info');
  };

  // Trigger publishing modals from dashboard quick actions
  const handleTriggerPublishForm = (type: 'activity' | 'notice') => {
    if (type === 'activity') {
      setActiveTab('activities');
      setShowActivityPublishModal(true);
    } else {
      setActiveTab('notices');
      setShowNoticePublishModal(true);
    }
  };

  // Main container router
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'workbench':
      case 'dashboard':
        return (
          <Dashboard
            currentUser={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            todos={todos}
            setTodos={setTodos}
            activities={activities}
            feedbacks={feedbacks}
            onTriggerPublishForm={handleTriggerPublishForm}
          />
        );
      case 'activities':
        return (
          <ActivityManagement
            activities={activities}
            setActivities={setActivities}
            showPublishModal={showActivityPublishModal}
            setShowPublishModal={setShowActivityPublishModal}
          />
        );
      case 'notices':
        return (
          <NoticeManagement
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            showPublishModal={showNoticePublishModal}
            setShowPublishModal={setShowNoticePublishModal}
          />
        );
      case 'spaces':
        return <SpaceManagement spaces={spaces} setSpaces={setSpaces} />;
      case 'services':
        return <ServiceManagement services={services} setServices={setServices} />;
      case 'workers':
        return <SocialWorkerManagement workers={workers} setWorkers={setWorkers} />;
      case 'residents':
        return <ResidentManagement residents={residents} setResidents={setResidents} />;
      case 'feedback':
        return (
          <FeedbackManagement
            feedbacks={feedbacks}
            setFeedbacks={setFeedbacks}
            hotlines={hotlines}
            setHotlines={setHotlines}
          />
        );
      default:
        return (
          <div className="py-20 text-center text-caption text-ink-subtle">
            模块正在紧密开发部署中，请通过侧边栏选择可用控制台。
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-canvas text-ink theme-governance-dark flex selection:bg-primary/30 selection:text-primary">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-surface border border-primary/40 text-primary shadow-2xl p-4 rounded-xl z-50 flex items-center gap-3 animate-slide-up max-w-sm">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          <span className="text-xs font-semibold leading-snug">{toast.message}</span>
        </div>
      )}

      {/* Side Menu Bar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab === 'workbench' || activeTab === 'dashboard' ? activeTab : activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Container Stage */}
      <main className="flex-1 pl-64 min-h-screen flex flex-col">
        {/* Top Header Rail */}
        <header className="h-16 bg-surface border-b border-hairline px-6 flex items-center justify-between sticky top-0 z-10 select-none">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-ink-muted">
              {currentUser.community}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-3xs text-ink-muted">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>当前系统时间 (UTC+8): 2026-07-11 16:32</span>
            </div>

            <div className="h-4 w-[1px] bg-hairline hidden md:block" />

            {/* Notification bell icon */}
            <div className="relative cursor-pointer p-1.5 bg-canvas/40 hover:bg-canvas rounded-lg border border-hairline transition-colors">
              <Bell className="w-4 h-4 text-ink-muted hover:text-primary" />
              <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-coral"></span>
              </span>
            </div>
          </div>
        </header>

        {/* Core view stage */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderActiveContent()}
        </div>
      </main>
    </div>
  );
}
