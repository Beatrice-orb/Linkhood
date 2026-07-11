import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  Megaphone,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  Award,
  Users,
  ShieldCheck,
  Phone,
  Check,
  Send,
  UserCheck,
  FileText,
  Home,
  Heart,
  Sliders,
  Building2,
  Store,
  HeartHandshake
} from 'lucide-react';
import { User, Metric, TodoItem, Activity, Feedback } from '../types';
import {
  INITIAL_METRICS,
  CHART_VISITS,
  CHART_MUTUAL_CATEGORY,
  CHART_FEEDBACK_CATEGORY,
  POPULAR_KEYWORDS,
  CHART_CARE_DATA
} from '../mockData';

interface DashboardProps {
  currentUser: User;
  activeTab: string; // 'workbench' | 'dashboard'
  setActiveTab: (tab: string) => void;
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
  activities: Activity[];
  feedbacks: Feedback[];
  onTriggerPublishForm: (type: 'activity' | 'notice') => void;
}

export default function Dashboard({
  currentUser,
  activeTab,
  setActiveTab,
  todos,
  setTodos,
  activities,
  feedbacks,
  onTriggerPublishForm
}: DashboardProps) {
  const [metrics, setMetrics] = useState<Metric[]>(INITIAL_METRICS);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportTime, setSelectedReportTime] = useState<'weekly' | 'monthly'>('weekly');
  const [exporting, setExporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Quick action handlings
  const handleResolveTodo = (todoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, status: 'resolved' } : t))
    );
  };

  const handleTodoClick = (todo: TodoItem) => {
    if (todo.linkTab) {
      setActiveTab(todo.linkTab);
    }
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
    setReportSuccess(false);
  };

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setReportSuccess(true);
      // Simulate download
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', `社区治理报告_${selectedReportTime}.pdf`);
      document.body.appendChild(link);
      setTimeout(() => {
        alert('「搭把手」To G 专供标准 PDF 治理报告已成功排版并开始下载！已自动抄送至杨主任。');
      }, 100);
    }, 2000);
  };

  const maxVisits = Math.max(...CHART_VISITS.map((v) => v.visits));

  const renderWorkbench = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Welcome & System Summary */}
        <div className="bg-gradient-to-r from-primary/10 via-coral-light/25 to-surface border border-primary/25 rounded-2xl p-6 relative overflow-hidden shadow-card">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-20 w-48 h-48 bg-coral/5 rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="text-base font-bold tracking-tight text-ink font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            杨主任，欢迎来到「搭把手」To G 社区自治工作台！
          </h2>
          <p className="text-xs text-ink-muted mt-2 max-w-4xl leading-relaxed">
            本系统直连 <b>To C 端居民小程序</b>。通过【综合驾驶舱 + 管理控制台 + 诉求闭环中心】三大核心架构，实现社区自治活动的智能调度、居民诉求的实时闭环跟进，以及全要素自治指标的可视化统筹。西红门街道社区整体运转平稳，自治参与活跃。
          </p>
        </div>

        {/* Three Core Pillars Portal (Arranged as three horizontal rectangular cards stacked vertically) */}
        <div className="space-y-5">
          
          {/* Pillar 1: 综合驾驶舱 */}
          <div 
            className="bg-surface border border-hairline hover:border-primary hover:shadow-float rounded-2xl p-6 transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Module Intro */}
              <div className="lg:col-span-4 pb-4 lg:pb-0 lg:border-r lg:border-hairline lg:pr-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">综合驾驶舱</h3>
                    <span className="text-caption text-primary font-bold font-mono tracking-wider block">COCKPIT & ANALYTICS</span>
                  </div>
                  <span className="ml-auto lg:hidden px-2.5 py-0.5 rounded-full bg-primary-light text-primary text-caption font-bold">
                    模块 01
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-3 leading-relaxed">
                  一屏掌控全域自治态势。多维统计常住居民参与度、社区活力指数、信用学分流转，量化社区治理成效。
                </p>
              </div>

              {/* Middle Column: Core Metrics */}
              <div className="lg:col-span-5 px-0 lg:px-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-canvas-light/60 border border-hairline rounded-xl p-3 text-center">
                    <span className="text-caption text-ink-muted block truncate">自治综合指数</span>
                    <span className="text-sm font-bold text-primary block mt-1">94.2% (优)</span>
                  </div>
                  <div className="bg-canvas-light/60 border border-hairline rounded-xl p-3 text-center">
                    <span className="text-caption text-ink-muted block truncate">本周活跃居民</span>
                    <span className="text-sm font-bold text-ink block mt-1">89人 (↑8%)</span>
                  </div>
                  <div className="bg-canvas-light/60 border border-hairline rounded-xl p-3 text-center">
                    <span className="text-caption text-ink-muted block truncate">全要素覆盖</span>
                    <span className="text-sm font-bold text-coral block mt-1">100% 覆盖</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Main Buttons */}
              <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-canvas font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-sans"
                >
                  <BarChart3 className="w-4 h-4" />
                  进入数据大盘看板
                </button>
                <button
                  onClick={handleGenerateReport}
                  className="flex-1 py-2.5 bg-surface hover:bg-canvas-light text-ink hover:text-ink border border-hairline hover:border-primary/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                >
                  <FileText className="w-4 h-4 text-coral animate-pulse" />
                  智能生成分析报告
                </button>
              </div>
            </div>
          </div>

          {/* Pillar 2: 自治管理控制台 */}
          <div 
            className="bg-surface border border-hairline hover:border-primary hover:shadow-float rounded-2xl p-6 transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Module Intro */}
              <div className="lg:col-span-4 pb-4 lg:pb-0 lg:border-r lg:border-hairline lg:pr-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-coral-light/25 text-coral flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">自治管理控制台</h3>
                    <span className="text-caption text-coral font-bold font-mono tracking-wider block">AUTONOMOUS CONTROL PANEL</span>
                  </div>
                  <span className="ml-auto lg:hidden px-2.5 py-0.5 rounded-full bg-coral-light text-coral text-caption font-bold">
                    模块 02
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-3 leading-relaxed">
                  六大治理维度全要素精准维护。对辖区居民电子档案、公共空间预约、群众自治活动、周边合作商户、社会工作者和公告下发深度管理。
                </p>
              </div>

              {/* Middle Column: 6 Sub-modules Quick Grid */}
              <div className="lg:col-span-8 px-0 lg:pl-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { id: 'residents', label: '居民档案', icon: Users, count: '347人档案' },
                    { id: 'spaces', label: '空间管理', icon: Home, count: '预约与分配' },
                    { id: 'activities', label: '活动组织', icon: Calendar, count: '本周4场活动' },
                    { id: 'services', label: '服务商户', icon: Store, count: '5家合作商户' },
                    { id: 'workers', label: '社工力量', icon: HeartHandshake, count: '在线帮扶机制' },
                    { id: 'notices', label: '公告下发', icon: Megaphone, count: '实时下发追踪' },
                  ].map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveTab(sub.id)}
                        className="p-3 bg-canvas-light/60 hover:bg-primary-light border border-hairline hover:border-primary/40 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center h-20 group"
                      >
                        <SubIcon className="w-5 h-5 text-ink-muted group-hover:text-primary transition-colors" />
                        <span className="text-xs font-bold text-ink mt-1.5 truncate w-full">{sub.label}</span>
                        <span className="text-[9px] text-ink-subtle truncate w-full mt-0.5">{sub.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 3: 诉求闭环中心 */}
          <div 
            className="bg-surface border border-hairline hover:border-primary hover:shadow-float rounded-2xl p-6 transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Module Intro */}
              <div className="lg:col-span-4 pb-4 lg:pb-0 lg:border-r lg:border-hairline lg:pr-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-coral-light/25 text-coral flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">诉求闭环中心</h3>
                    <span className="text-caption text-coral font-bold font-mono tracking-wider block">APPEALS CLOSE-LOOP</span>
                  </div>
                  <span className="ml-auto lg:hidden px-2.5 py-0.5 rounded-full bg-coral-light text-coral text-caption font-bold">
                    模块 03
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-3 leading-relaxed">
                  实时承接并归纳居民反馈的留言诉求、困难帮扶与日常代办。通过“派单-处置-销账”实现诉求全链条 100% 闭环。
                </p>
              </div>

              {/* Middle Column: Core Stats */}
              <div className="lg:col-span-5 px-0 lg:px-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-canvas-light/60 border border-hairline rounded-xl p-3 text-center">
                    <span className="text-caption text-ink-muted block truncate">待处理留言</span>
                    <span className="text-sm font-bold text-coral block mt-1">{todos.filter(t => t.status === 'pending').length} 件待办</span>
                  </div>
                  <div className="bg-canvas-light/60 border border-hairline rounded-xl p-3 text-center">
                    <span className="text-caption text-ink-muted block truncate">已结案互助</span>
                    <span className="text-sm font-bold text-primary block mt-1">25 件已完成</span>
                  </div>
                  <div className="bg-canvas-light/60 border border-hairline rounded-xl p-3 text-center">
                    <span className="text-caption text-ink-muted block truncate">居民满意度</span>
                    <span className="text-sm font-bold text-ink block mt-1">4.95 / 5.00</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Button */}
              <div className="lg:col-span-3">
                <button
                  onClick={() => setActiveTab('feedback')}
                  className="w-full py-3 bg-coral hover:bg-coral-hover text-canvas font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm font-sans"
                >
                  <MessageSquare className="w-4 h-4" />
                  处理居民留言与互助诉求
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Panel: Dynamic Tasks & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Work Scheduler checklist */}
          <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm lg:col-span-8 flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-hairline mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3.5 bg-coral rounded" />
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-display">
                  当前处于待办列表的诉求及任务 ({todos.filter(t => t.status === 'pending').length}个未处理)
                </h3>
              </div>
              <span className="text-3xs text-ink-subtle">点击行可一键跳转相关模块</span>
            </div>

            <div className="divide-y divide-hairline flex-1">
              {todos.map((todo) => {
                const isResolved = todo.status === 'resolved';
                const priorityColor =
                  todo.priority === 'high'
                    ? 'border-coral-light/30 bg-coral-light/10 text-coral'
                    : todo.priority === 'medium'
                    ? 'border-amber-light/30 bg-amber-light/10 text-amber'
                    : 'border-jade-light/30 bg-jade-light/10 text-jade';

                return (
                  <div
                    key={todo.id}
                    onClick={() => !isResolved && handleTodoClick(todo)}
                    className={`py-3 flex items-start justify-between gap-3 transition-colors group ${
                      isResolved ? 'opacity-50' : 'hover:bg-canvas/40 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={(e) => handleResolveTodo(todo.id, e)}
                        disabled={isResolved}
                        className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                          isResolved
                            ? 'bg-jade border-jade text-canvas'
                            : 'border-hairline group-hover:border-jade text-transparent hover:text-jade/60'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </button>
                      <div className="min-w-0">
                        <p className={`text-xs font-medium leading-relaxed ${isResolved ? 'line-through text-ink-subtle' : 'text-ink'}`}>
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-4xs font-mono text-ink-subtle flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {todo.time}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 border bg-canvas/60 text-ink-muted border-hairline rounded">
                            {todo.source}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-caption px-1.5 py-0.2 rounded-full border uppercase ${priorityColor}`}>
                        {todo.priority === 'high' ? '紧急' : todo.priority === 'medium' ? '中等' : '低'}
                      </span>
                      {!isResolved && (
                        <ArrowRight className="w-3.5 h-3.5 text-ink-subtle opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick operations hub */}
          <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3.5 border-b border-hairline">
                <div className="w-1.5 h-3.5 bg-jade rounded" />
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider font-display">
                  发布内容与快捷广播
                </h3>
              </div>
              <p className="text-3xs text-ink-muted mt-2.5 leading-relaxed">
                实时下发内容同步到 C端 居民手机，多级联防自治。
              </p>
            </div>

            <div className="space-y-2.5 my-4">
              <button
                onClick={() => onTriggerPublishForm('activity')}
                className="w-full p-2.5 bg-canvas hover:bg-jade-light/20 border border-hairline hover:border-jade/35 rounded-xl transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-jade-light text-jade flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink block">发布社区活动</span>
                    <span className="text-4xs text-ink-subtle block">同步到“本周活动”</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-subtle group-hover:text-jade transition-colors" />
              </button>

              <button
                onClick={() => onTriggerPublishForm('notice')}
                className="w-full p-2.5 bg-canvas hover:bg-jade-light/20 border border-hairline hover:border-jade/35 rounded-xl transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-jade-light text-jade flex items-center justify-center">
                    <Megaphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink block">发布重要通告</span>
                    <span className="text-4xs text-ink-subtle block">水电停运已读追踪</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-subtle group-hover:text-jade transition-colors" />
              </button>
            </div>

            <div className="p-2.5 bg-canvas/30 border border-hairline rounded-xl text-center">
              <span className="text-4xs font-mono text-ink-subtle">
                杨主任安全工作巡视期：备勤良好
              </span>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          {metrics.map((m, idx) => {
            const isPositive = m.trend > 0;
            return (
              <div
                key={idx}
                className="bg-surface border border-hairline hover:border-jade/35 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="text-3xs text-ink-muted font-medium tracking-wide truncate">
                  {m.label}
                </div>
                <div className="my-2.5">
                  <span className="text-xl font-bold tracking-tight text-ink font-mono">
                    {m.value}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-hairline/40">
                  <span className="text-4xs text-ink-subtle truncate max-w-[65%]">
                    {m.source}
                  </span>
                  {m.trend !== 0 ? (
                    <span className={`text-3xs font-semibold flex items-center gap-0.5 ${isPositive ? 'text-jade' : 'text-coral'}`}>
                      {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {m.trendLabel}
                    </span>
                  ) : (
                    <span className="text-3xs text-ink-subtle">持平</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 3: Key Trend Graphic Preview */}
        <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-hairline mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-3.5 rounded bg-jade" />
              <h2 className="text-sm font-bold tracking-tight text-ink font-display">
                本周社群活跃度趋势 (社区真实访问数据)
              </h2>
            </div>
            <div className="flex items-center gap-3 text-3xs">
              <span className="flex items-center gap-1 text-ink-muted">
                <span className="w-2.5 h-1.5 bg-jade rounded-sm inline-block" />
                小程序点击浏览 (UV)
              </span>
              <span className="flex items-center gap-1 text-ink-muted">
                <span className="w-2.5 h-1.5 bg-coral rounded-sm inline-block" />
                居民深度互助/报名次数
              </span>
            </div>
          </div>

          {/* Custom Responsive SVG Chart */}
          <div className="h-64 relative flex items-end">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[4, 3, 2, 1, 0].map((val) => (
                <div key={val} className="w-full flex items-center">
                  <span className="text-4xs text-ink-subtle w-8 font-mono">
                    {Math.round((maxVisits / 4) * val)}
                  </span>
                  <div className="flex-1 border-t border-hairline/20" />
                </div>
              ))}
            </div>

            <div className="flex-1 h-52 flex items-end justify-between px-6 relative z-10">
              {CHART_VISITS.map((item, idx) => {
                const visitsHeight = (item.visits / maxVisits) * 100;
                const activeHeight = (item.active / maxVisits) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Hover Tooltip */}
                    <div className="absolute -top-12 bg-canvas border border-hairline rounded-lg p-2 shadow-lg hidden group-hover:block z-30 min-w-[100px] text-center pointer-events-none animate-scale-up">
                      <div className="text-[10px] font-bold text-ink">{item.day}</div>
                      <div className="text-4xs text-jade">PV浏览: {item.visits}人</div>
                      <div className="text-4xs text-coral">互助参与: {item.active}次</div>
                    </div>

                    {/* Bar chart vectors */}
                    <div className="flex items-end gap-1.5 h-full w-12 justify-center">
                      <div
                        style={{ height: `${visitsHeight}%` }}
                        className="w-3.5 bg-jade/80 rounded-t-sm group-hover:bg-jade transition-all relative overflow-hidden"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                      </div>

                      <div
                        style={{ height: `${activeHeight}%` }}
                        className="w-3.5 bg-coral/80 rounded-t-sm group-hover:bg-coral transition-all relative overflow-hidden"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                      </div>
                    </div>

                    <span className="text-3xs text-ink-subtle mt-2 font-medium">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Detailed Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Function Use and Appeal Hotwords */}
          <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-hairline mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3.5 rounded bg-jade" />
                <h2 className="text-sm font-bold tracking-tight text-ink font-display">
                  功能使用热区与高频诉求热词
                </h2>
              </div>
              <span className="text-[10px] text-ink-muted">社区自治数据统计</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <h3 className="text-xs font-semibold text-ink-muted mb-3">小程序功能板块分布</h3>
                <div className="space-y-3">
                  {[
                    { name: '社区地图 (公共空间/活动)', pct: 40, color: 'bg-jade' },
                    { name: '邻里圈 (生活互助/动态)', pct: 35, color: 'bg-amber' },
                    { name: '关怀极简版 (老人专项)', pct: 15, color: 'bg-coral' },
                    { name: '我的会话 & 咨询', pct: 10, color: 'bg-sky-400' },
                  ].map((sec, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-3xs text-ink-muted mb-1">
                        <span>{sec.name}</span>
                        <span className="font-semibold text-ink">{sec.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden">
                        <div style={{ width: `${sec.pct}%` }} className={`h-full ${sec.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-ink-muted mb-3">本周居民诉求高频词</h3>
                <div className="space-y-2">
                  {POPULAR_KEYWORDS.map((k, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-canvas/40 border border-hairline rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-3xs font-bold text-jade bg-jade-light/20 w-4 h-4 rounded-full flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-xs font-semibold text-ink">{k.word}</span>
                      </div>
                      <span className="text-3xs font-mono text-ink-subtle">{k.count}次反馈</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Neighborhood Mutual Aid Category */}
          <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-hairline mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3.5 rounded bg-amber" />
                <h2 className="text-sm font-bold tracking-tight text-ink font-display">
                  邻里圈互助类型分布 (本周已结案)
                </h2>
              </div>
              <span className="text-3xs text-jade font-mono">响应率: 91.2%</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              <div className="w-36 h-36 relative shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-primary)" strokeWidth="12" strokeDasharray="100.5 251.2" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-amber)" strokeWidth="12" strokeDasharray="88 251.2" strokeDashoffset="-100.5" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-coral)" strokeWidth="12" strokeDasharray="37.7 251.2" strokeDashoffset="-188.5" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-primary-light)" strokeWidth="12" strokeDasharray="25.1 251.2" strokeDashoffset="-226.2" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold font-mono text-ink">91%</span>
                  <span className="text-caption text-ink-subtle">平均响应</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                {[
                  { name: '日常拼单', val: '40%', color: 'border-primary text-primary' },
                  { name: '代跑代取', val: '35%', color: 'border-amber text-amber' },
                  { name: '闲置交易', val: '15%', color: 'border-coral text-coral' },
                  { name: '照看互助', val: '10%', color: 'border-primary-light text-ink-muted' },
                ].map((leg, idx) => (
                  <div key={idx} className="p-2 bg-canvas/30 border border-hairline rounded-xl flex flex-col justify-center font-sans">
                    <span className="text-caption text-ink-muted flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full border-2 ${leg.color}`} />
                      {leg.name}
                    </span>
                    <span className="text-sm font-bold text-ink mt-0.5 font-mono">{leg.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Section 5: Care Dashboard Special Analytics */}
        <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-hairline mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-3.5 rounded bg-coral" />
              <h2 className="text-sm font-bold tracking-tight text-ink flex items-center gap-1.5 font-display">
                <Heart className="w-4 h-4 text-coral shrink-0" />
                <span>关怀版专项老龄守护大屏</span>
                <span className="text-caption px-2 py-0.5 rounded-full bg-coral-light/20 text-coral border border-coral/20 font-normal">
                  重点监控对象: {CHART_CARE_DATA.totalElderly}人
                </span>
              </h2>
            </div>
            <span className="text-caption text-ink-subtle">每日超时自动预警，配合社工志愿者上门跟进</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-sans text-center">
            <div className="p-4 bg-canvas/40 border border-hairline rounded-xl">
              <div className="text-3xs text-ink-muted">今日老人报平安率</div>
              <div className="text-2xl font-bold font-mono text-jade my-1.5">{CHART_CARE_DATA.reportedSafeRate}%</div>
              <div className="text-[10px] text-ink-subtle">昨日 90% | 稳定递增</div>
            </div>

            <div className="p-4 bg-canvas/40 border border-hairline rounded-xl">
              <div className="text-3xs text-ink-muted">需社工电话跟进</div>
              <div className="text-2xl font-bold font-mono text-coral my-1.5">{CHART_CARE_DATA.followUpRequired}人</div>
              <div className="text-[10px] text-ink-subtle">302 502超时未打卡</div>
            </div>

            <div className="p-4 bg-canvas/40 border border-hairline rounded-xl">
              <div className="text-3xs text-ink-muted">本月代办帮扶申请</div>
              <div className="text-2xl font-bold font-mono text-amber my-1.5">{CHART_CARE_DATA.thisMonthHelpRequests}件</div>
              <div className="text-[10px] text-ink-subtle">办结率: {CHART_CARE_DATA.helpCompletedRate}%</div>
            </div>

            <div className="p-4 bg-canvas/40 border border-hairline rounded-xl">
              <div className="text-3xs text-ink-muted">一键紧急呼救 (SOS)</div>
              <div className="text-2xl font-bold font-mono text-coral my-1.5">{CHART_CARE_DATA.sosCount}次</div>
              <div className="text-[10px] text-ink-subtle">平均响应: {CHART_CARE_DATA.sosAvgResponseTime}分钟</div>
            </div>
          </div>

          {/* Safety alert */}
          <div className="mt-4 p-3.5 bg-coral-light/10 border border-coral/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-coral animate-ping" />
              <span className="text-xs font-semibold text-ink">
                异常状态提示：王奶奶(3-502) 连续24h未打卡报平安，且无出入通行记录，可能处于熟睡、忘带手机或身体不适状态。
              </span>
            </div>
            <button
              onClick={() => setActiveTab('residents')}
              className="text-xs text-coral hover:text-coral-hover font-semibold shrink-0 cursor-pointer flex items-center gap-1"
            >
              立即派网格员上门 &rarr;
            </button>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12 selection:bg-jade/30 selection:text-jade">
      {/* Header section with identity status & reports download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-hairline rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-jade-light/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="text-2xs text-jade font-mono uppercase tracking-widest font-bold">
            COMMUNITY CONTROL COCKPIT
          </div>
          <h1 className="text-lg font-bold font-display text-ink mt-0.5 flex items-center gap-2">
            <Home className="w-4 h-4 text-jade" />
            <span>您好，{currentUser.name}</span>
            <span className="text-caption font-normal px-2 py-0.5 rounded-full bg-jade-light text-jade border border-jade/20">
              {currentUser.community}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-jade hover:bg-jade-hover text-canvas text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            自动生成周报/月报
          </button>
        </div>
      </div>

      {activeTab === 'workbench' ? renderWorkbench() : renderDashboard()}

      {/* Auto Weekly/Monthly Report Preview & PDF Simulator Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-canvas/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface border border-hairline rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-hairline mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-jade" />
                <h3 className="text-sm font-bold text-ink font-display">
                  「搭把手」社区自治周报月报自动生成器
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-ink-muted hover:text-ink hover:bg-canvas p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>

            {/* Toggle Report Type */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setSelectedReportTime('weekly');
                  setReportSuccess(false);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  selectedReportTime === 'weekly'
                    ? 'bg-jade-light/20 border-jade text-jade font-bold'
                    : 'border-hairline text-ink-muted hover:text-ink'
                }`}
              >
                生成本周运营简报
              </button>
              <button
                onClick={() => {
                  setSelectedReportTime('monthly');
                  setReportSuccess(false);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  selectedReportTime === 'monthly'
                    ? 'bg-jade-light/20 border-jade text-jade font-bold'
                    : 'border-hairline text-ink-muted hover:text-ink'
                }`}
              >
                生成上月治理报告
              </button>
            </div>

            {/* Report Content Draft Preview */}
            <div className="bg-canvas border border-hairline rounded-xl p-5 max-h-[350px] overflow-y-auto space-y-4 text-xs select-text font-sans">
              <div className="text-center pb-3 border-b border-hairline/60">
                <h4 className="font-bold text-sm text-ink tracking-wide uppercase font-display">
                  「搭把手」社区自治运营{selectedReportTime === 'weekly' ? '本周运营数据简报' : '上月治理综合报告'}
                </h4>
                <p className="text-[10px] text-ink-subtle mt-1">
                  网格单位: {currentUser.community} | 报告周期: {selectedReportTime === 'weekly' ? '2026-07-05 至 2026-07-11' : '2026-06-01 至 2026-06-30'}
                </p>
              </div>

              {selectedReportTime === 'weekly' ? (
                <>
                  {/* Stats Block */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-jade font-display flex items-center gap-1">
                      <span className="w-1.5 h-3.5 rounded bg-jade inline-block" />
                      一、核心自治运营指标总览
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">注册居民档案</span>
                        <span className="font-bold text-ink">347人 (+12新增)</span>
                      </div>
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">本周活跃用户</span>
                        <span className="font-bold text-ink">89人 (活跃度↑8.2%)</span>
                      </div>
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">活动实到签到率</span>
                        <span className="font-bold text-ink">90.5% (共4场活动)</span>
                      </div>
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">生活圈互助接单率</span>
                        <span className="font-bold text-ink">91.2% (已结案25起)</span>
                      </div>
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">留言诉求闭环率</span>
                        <span className="font-bold text-ink">94.0% (闭环反馈)</span>
                      </div>
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">居民自治综合满意度</span>
                        <span className="font-bold text-ink">4.68分 / 满分5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-jade font-display flex items-center gap-1">
                      <span className="w-1.5 h-3.5 rounded bg-jade inline-block" />
                      二、本周居民热点诉求聚类与处置
                    </h5>
                    <p className="text-ink-muted leading-relaxed">
                      本周通过 <b>居民端系统</b> “喊一声”留言板块和“爱心代办”模块累计收集居民有效诉求 8 件。经智能系统分类聚类，热点词云分布如下：
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-ink-muted">
                      <li><span className="text-ink font-semibold">停车位供给不足：</span>累计触发 12 次。系统已提示优化充电桩和临停收费机制，居委会正制定方案。</li>
                      <li><span className="text-ink font-semibold">夜间施工噪音干扰：</span>累计触发 8 次。已通过社工与周边商铺/工地进行线下协调，约定21点后停止噪音作业。</li>
                      <li><span className="text-ink font-semibold">公共设施损坏维修：</span>累计触发 6 次。4件已当场派单并由“红色管家”志愿者维修完毕，2件已流转至专项跟进。</li>
                    </ul>
                    <p className="text-ink-muted leading-relaxed mt-1">
                      整体诉求的首次响应平均时长降至 <b>15分钟</b> 以内，平均结案闭环时长 <b>3.2小时</b>。
                    </p>
                  </div>

                  {/* Special Elder care stats */}
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-jade font-display flex items-center gap-1">
                      <span className="w-1.5 h-3.5 rounded bg-jade inline-block" />
                      三、独居群体平安守护专项周报
                    </h5>
                    <p className="text-ink-muted leading-relaxed">
                      针对辖区内登记的 <b>12名重点独居与空巢老人</b>，本周安全守护人打卡与一键报平安率达到 <b>92.5%</b>。本周共自动触发未报平安预警 3 次，经专责社工/网格员 10分钟内上门或电话核实，均为忘带手机或误操作，均已百分之百安全排除。
                    </p>
                    <p className="text-ink-muted leading-relaxed">
                      本周共提供老龄专项买药代办 4 次、助餐送饭 8 次，一键紧急求救 (SOS) 保持 0 报警，整体守护态势良好。
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Monthly Stats */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-jade font-display flex items-center gap-1">
                      <span className="w-1.5 h-3.5 rounded bg-jade inline-block" />
                      一、全月居民参与度与自治资产总盘
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">居民电子档案率</span>
                        <span className="font-bold text-ink">347户 (100%覆盖)</span>
                      </div>
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">月活跃居民总量</span>
                        <span className="font-bold text-ink">243人 (月活率70%)</span>
                      </div>
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">共享空间预约能效</span>
                        <span className="font-bold text-ink">58场 (累计144.5h)</span>
                      </div>
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">邻里互助总贴数</span>
                        <span className="font-bold text-ink">154条 (互助比率65%)</span>
                      </div>
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">群团活动组织场次</span>
                        <span className="font-bold text-ink">18场 (累计报名116人)</span>
                      </div>
                      <div className="p-2 bg-surface rounded-lg border border-hairline">
                        <span className="text-ink-muted block text-[10px]">爱心商户特惠人次</span>
                        <span className="font-bold text-ink">86人次 (社会共建)</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly aid distribution */}
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-jade font-display flex items-center gap-1">
                      <span className="w-1.5 h-3.5 rounded bg-jade inline-block" />
                      二、邻里圈互助与社交资产报告
                    </h5>
                    <p className="text-ink-muted leading-relaxed">
                      上月“邻里圈”成为社区温情流转的主阵地，累计发帖 154 条，其中：<b>日常拼单占 40%、代跑代取占 35%、闲置交易占 15%、照看互助占 10%</b>。
                    </p>
                    <p className="text-ink-muted leading-relaxed">
                      全月涌现出 <b>32名</b> 活跃互助达人（如3号楼李阿姨、5号楼张大哥等），人均接单 4 次以上，累计帮助行动不便邻里 58 人次。社区居委会拟在下周茶话会对这批“社区优秀合伙人”进行积分表彰，并赋予 10 信用分奖励。
                    </p>
                  </div>

                  {/* Monthly Elder care stats */}
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-jade font-display flex items-center gap-1">
                      <span className="w-1.5 h-3.5 rounded bg-jade inline-block" />
                      三、老龄守护及特殊人群帮扶月度总结
                    </h5>
                    <p className="text-ink-muted leading-relaxed">
                      上月，智能守护系统累计对 12 名重点独居与空巢老人触发超时预警 14 次。其中 12 次为老人忘带手机外出，2 次为手机电量耗尽自动关机。网格员与志愿者做到 100% 响应并建立线下探视记录，无一漏网。
                    </p>
                    <p className="text-ink-muted leading-relaxed">
                      暖心专线累计接听 42 人次求助，为行动不便老人提供医保代缴 12 次、代购药 18 次。爱心商家提供特惠午餐 56 人次。一键呼救 (SOS) 响应速度平均在 2.8 分钟以内，守护机制闭环安全，运转极其稳健。
                    </p>
                  </div>
                </>
              )}

              <div className="text-[10px] text-ink-subtle text-right border-t border-hairline/60 pt-3">
                报告审核人: 杨主任 | 系统智能辅助排版生成
              </div>
            </div>

            {/* Actions for Modal */}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-[11px] text-ink-muted">
                * PDF 报告将自动按照「搭把手」ToG 专供深色大屏VI标准排版。
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-canvas text-xs text-ink-muted hover:text-ink border border-hairline hover:border-hairline rounded-xl transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="px-5 py-2 bg-jade hover:bg-jade-hover text-canvas text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                >
                  {exporting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-canvas border-t-transparent rounded-full animate-spin inline-block" />
                      正在排版导出...
                    </>
                  ) : reportSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      导出成功!
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      确认导出 PDF 报告
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
