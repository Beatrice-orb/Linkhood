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
  Heart
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
  onTriggerPublishForm,
}: DashboardProps) {
  const [selectedReportTime, setSelectedReportTime] = useState<'weekly' | 'monthly'>('weekly');
  const [showReportModal, setShowReportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Load metrics dynamically depending on selected role
  const metrics = INITIAL_METRICS(currentUser.role);

  // Resolve or complete a todo item
  const handleResolveTodo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTodos(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, status: 'resolved' as const } : todo))
    );
  };

  // Click on todo item to jump to the respective view
  const handleTodoClick = (todo: TodoItem) => {
    if (todo.source === '活动管理') {
      setActiveTab('activities');
    } else if (todo.source === '需求反馈') {
      setActiveTab('feedback');
    } else if (todo.source === '关怀版数据') {
      setActiveTab('residents');
    } else if (todo.source === '帮扶管理') {
      setActiveTab('feedback'); // messages/complaints
    }
  };

  // Generate Report Helper
  const handleGenerateReport = () => {
    setShowReportModal(true);
    setReportSuccess(false);
  };

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
      }, 1500);
    }, 2000);
  };

  // Chart Calculations
  const maxVisits = Math.max(...CHART_VISITS.map(v => v.visits));
  const maxActive = Math.max(...CHART_VISITS.map(v => v.active));

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
          <p className="text-xs text-ink-muted mt-1">
            当前处于【To G 治理大屏反色主题】。本周社区整体运转平稳，活动组织活跃。
          </p>
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

      {activeTab === 'workbench' ? (
        <>
          {/* Section 1: KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
            {metrics.map((m, idx) => {
              const isPositive = m.trend > 0;
              const isNegative = m.trend < 0;
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
                      <span
                        className={`text-3xs font-semibold flex items-center gap-0.5 ${
                          isPositive ? 'text-jade' : 'text-coral'
                        }`}
                      >
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

          {/* Section 2: Today's Todos & Quick Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Today's Todo Lists (8 cols) */}
            <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm lg:col-span-8 flex flex-col">
              <div className="flex items-center justify-between pb-3.5 border-b border-hairline">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3.5 rounded bg-coral" />
                  <h2 className="text-sm font-bold tracking-tight text-ink">
                    今日待办驾驶舱 ({todos.filter(t => t.status === 'pending').length}项待处理)
                  </h2>
                </div>
                <span className="text-3xs text-ink-subtle">
                  点击待办行可直接跳转到对应管理控制台模块
                </span>
              </div>

              <div className="divide-y divide-hairline flex-1 mt-2">
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
                      className={`py-3.5 flex items-start justify-between gap-3 transition-colors group ${
                        isResolved ? 'opacity-50' : 'hover:bg-canvas/40 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={(e) => handleResolveTodo(todo.id, e)}
                          disabled={isResolved}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            isResolved
                              ? 'bg-jade border-jade text-canvas'
                              : 'border-hairline group-hover:border-jade text-transparent hover:text-jade/60'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        </button>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-medium leading-relaxed ${
                              isResolved ? 'line-through text-ink-subtle' : 'text-ink'
                            }`}
                          >
                            {todo.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-4xs font-mono text-ink-subtle flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {todo.time}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md border bg-canvas/60 text-ink-muted border-hairline">
                              {todo.source}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-caption px-2 py-0.5 rounded-full border uppercase ${priorityColor}`}>
                          {todo.priority === 'high' ? '高紧急' : todo.priority === 'medium' ? '中优先' : '低常规'}
                        </span>
                        {!isResolved && (
                          <ArrowRight className="w-3.5 h-3.5 text-ink-subtle opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {todos.length === 0 && (
                  <div className="py-8 text-center text-caption text-ink-subtle">
                    完美！今天没有任何未处理的事务。
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions (4 cols) */}
            <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm lg:col-span-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3.5 border-b border-hairline">
                  <div className="w-1.5 h-3.5 rounded bg-jade" />
                  <h2 className="text-sm font-bold tracking-tight text-ink">
                    快捷高频操作
                  </h2>
                </div>
                <p className="text-3xs text-ink-muted mt-2.5 leading-relaxed">
                  一键发布内容、审核留言、查看全域大屏，操作实时同步到【搭把手小程序】居民端，一处发布多端生效。
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 my-5">
                <button
                  onClick={() => onTriggerPublishForm('activity')}
                  className="w-full p-3.5 bg-canvas hover:bg-jade-light/20 border border-hairline hover:border-jade/30 rounded-xl transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-jade-light text-jade flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-ink block">
                        发布社区活动
                      </span>
                      <span className="text-4xs text-ink-subtle block mt-0.5">
                        同步至 C端“本周活动”板块
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-subtle group-hover:text-jade transition-colors" />
                </button>

                <button
                  onClick={() => onTriggerPublishForm('notice')}
                  className="w-full p-3.5 bg-canvas hover:bg-jade-light/20 border border-hairline hover:border-jade/30 rounded-xl transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-jade-light text-jade flex items-center justify-center font-bold">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-ink block">
                        发布重要公告
                      </span>
                      <span className="text-4xs text-ink-subtle block mt-0.5">
                        政策宣传/停水停电已读追踪
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-subtle group-hover:text-jade transition-colors" />
                </button>

                <button
                  onClick={() => setActiveTab('feedback')}
                  className="w-full p-3.5 bg-canvas hover:bg-jade-light/20 border border-hairline hover:border-jade/30 rounded-xl transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-jade-light text-jade flex items-center justify-center font-bold">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-ink block">
                        处理居民留言诉求
                      </span>
                      <span className="text-4xs text-ink-subtle block mt-0.5">
                        审核留言、指派志愿者、反馈
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-subtle group-hover:text-jade transition-colors" />
                </button>

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="w-full p-3.5 bg-canvas hover:bg-jade-light/20 border border-hairline hover:border-jade/30 rounded-xl transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-jade-light text-jade flex items-center justify-center font-bold">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-ink block">
                        查看完整数据看板
                      </span>
                      <span className="text-4xs text-ink-subtle block mt-0.5">
                        活跃度、关怀专项等可视化
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-subtle group-hover:text-jade transition-colors" />
                </button>
              </div>

              <div className="p-3 bg-canvas/30 border border-hairline rounded-xl text-center">
                <span className="text-caption text-ink-subtle">
                  24h 应急响应中心：已备勤
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Key Trend Graphic Preview */}
          <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-hairline mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3.5 rounded bg-jade" />
                <h2 className="text-sm font-bold tracking-tight text-ink">
                  本周社群活跃度趋势 (To C 真实访问数据)
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

              {/* Graphical Path Overlay */}
              <div className="flex-1 h-[80%] flex justify-between items-end px-4 relative z-10">
                {CHART_VISITS.map((item, idx) => {
                  const visitsHeight = (item.visits / maxVisits) * 100;
                  const activeHeight = (item.active / maxActive) * 100;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Hover Tooltip */}
                      <div className="absolute -top-12 bg-canvas border border-hairline rounded-lg p-2 shadow-lg hidden group-hover:block z-30 min-w-[100px] text-center pointer-events-none animate-scale-up">
                        <div className="text-[10px] font-bold text-ink">{item.day}</div>
                        <div className="text-4xs text-jade">PV浏览: {item.visits}人</div>
                        <div className="text-4xs text-coral">互助参与: {item.active}次</div>
                      </div>

                      {/* Bar 1: visits */}
                      <div className="flex items-end gap-1.5 h-full w-12 justify-center">
                        <div
                          style={{ height: `${visitsHeight}%` }}
                          className="w-3.5 bg-jade/80 rounded-t-sm group-hover:bg-jade transition-all relative overflow-hidden"
                        >
                          <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                        </div>

                        {/* Bar 2: active */}
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
        </>
      ) : (
        /* Detailed Data Dashboard (activeTab === 'dashboard') */
        <div className="space-y-6">
          {/* Section 1: Detailed Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 1. Resident Active Distribution & Popular Keywords */}
            <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3.5 border-b border-hairline mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3.5 rounded bg-jade" />
                  <h2 className="text-sm font-bold tracking-tight text-ink">
                    功能使用热区与高频诉求热词
                  </h2>
                </div>
                <span className="text-[10px] text-ink-muted">To C 数据统计</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Visual heat breakdown */}
                <div>
                  <h3 className="text-xs font-semibold text-ink-muted mb-3">
                    小程序功能板块分布
                  </h3>
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

                {/* Hot keywords list */}
                <div>
                  <h3 className="text-xs font-semibold text-ink-muted mb-3">
                    本周居民诉求高频词
                  </h3>
                  <div className="space-y-2">
                    {POPULAR_KEYWORDS.map((k, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-canvas/40 border border-hairline rounded-xl"
                      >
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

            {/* 2. Neighborhood Mutual Aid Category Distribution */}
            <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3.5 border-b border-hairline mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3.5 rounded bg-amber" />
                  <h2 className="text-sm font-bold tracking-tight text-ink">
                    邻里圈互助类型分布 (本周已结案)
                  </h2>
                </div>
                <span className="text-3xs text-jade">响应率: 91.2%</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                {/* SVG Donut Chart */}
                <div className="w-36 h-36 relative shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Ring 1: 40% (0 to 40) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="var(--color-primary)"
                      strokeWidth="12"
                      strokeDasharray="100.5 251.2"
                      strokeDashoffset="0"
                    />
                    {/* Ring 2: 35% (40 to 75) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="var(--color-amber)"
                      strokeWidth="12"
                      strokeDasharray="88 251.2"
                      strokeDashoffset="-100.5"
                    />
                    {/* Ring 3: 15% (75 to 90) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="var(--color-coral)"
                      strokeWidth="12"
                      strokeDasharray="37.7 251.2"
                      strokeDashoffset="-188.5"
                    />
                    {/* Ring 4: 10% (90 to 100) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="var(--color-primary-light)"
                      strokeWidth="12"
                      strokeDasharray="25.1 251.2"
                      strokeDashoffset="-226.2"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold font-mono text-ink">91%</span>
                    <span className="text-caption text-ink-subtle">平均响应</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                  {[
                    { name: '日常拼单', val: '40%', color: 'border-primary text-primary' },
                    { name: '代跑代取', val: '35%', color: 'border-amber text-amber' },
                    { name: '闲置交易', val: '15%', color: 'border-coral text-coral' },
                    { name: '照看互助', val: '10%', color: 'border-primary-light text-ink-muted' },
                  ].map((leg, idx) => (
                    <div key={idx} className="p-2 bg-canvas/30 border border-hairline rounded-xl flex flex-col justify-center">
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

          {/* Section 2: Care Dashboard Special Analytics (关怀版专项数据) */}
          <div className="bg-surface border border-hairline rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-hairline mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3.5 rounded bg-coral" />
                <h2 className="text-sm font-bold tracking-tight text-ink flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-coral shrink-0" />
                  <span>关怀版专项老龄守护大屏</span>
                  <span className="text-caption px-2 py-0.5 rounded-full bg-coral-light/20 text-coral border border-coral/20 font-normal">
                    重点监控对象: {CHART_CARE_DATA.totalElderly}人
                  </span>
                </h2>
              </div>
              <span className="text-caption text-ink-subtle">
                每日超时自动预警守护人，配合社区社工上门跟进
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-canvas/40 border border-hairline rounded-xl text-center">
                <div className="text-3xs text-ink-muted">今日老人报平安率</div>
                <div className="text-2xl font-bold font-mono text-jade my-1.5">
                  {CHART_CARE_DATA.reportedSafeRate}%
                </div>
                <div className="text-[10px] text-ink-subtle">昨日 90% | 稳定递增</div>
              </div>

              <div className="p-4 bg-canvas/40 border border-hairline rounded-xl text-center">
                <div className="text-3xs text-ink-muted">需社工电话跟进</div>
                <div className="text-2xl font-bold font-mono text-coral my-1.5">
                  {CHART_CARE_DATA.followUpRequired}人
                </div>
                <div className="text-[10px] text-ink-subtle">302 502超时未打卡</div>
              </div>

              <div className="p-4 bg-canvas/40 border border-hairline rounded-xl text-center">
                <div className="text-3xs text-ink-muted">本月代办帮扶申请</div>
                <div className="text-2xl font-bold font-mono text-amber my-1.5">
                  {CHART_CARE_DATA.thisMonthHelpRequests}件
                </div>
                <div className="text-[10px] text-ink-subtle">办结率: {CHART_CARE_DATA.helpCompletedRate}%</div>
              </div>

              <div className="p-4 bg-canvas/40 border border-hairline rounded-xl text-center">
                <div className="text-3xs text-ink-muted">一键紧急呼救 (SOS)</div>
                <div className="text-2xl font-bold font-mono text-coral my-1.5">
                  {CHART_CARE_DATA.sosCount}次
                </div>
                <div className="text-[10px] text-ink-subtle">平均响应: {CHART_CARE_DATA.sosAvgResponseTime}分钟</div>
              </div>
            </div>

            {/* Additional Safety Warning alerts */}
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
      )}

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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  selectedReportTime === 'weekly'
                    ? 'bg-jade-light/20 border-jade text-jade'
                    : 'border-hairline text-ink-muted hover:text-ink'
                }`}
              >
                生成本周综合工作报告
              </button>
              <button
                onClick={() => {
                  setSelectedReportTime('monthly');
                  setReportSuccess(false);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  selectedReportTime === 'monthly'
                    ? 'bg-jade-light/20 border-jade text-jade'
                    : 'border-hairline text-ink-muted hover:text-ink'
                }`}
              >
                生成上月治理综合报告
              </button>
            </div>

            {/* Report Content Draft Preview */}
            <div className="bg-canvas border border-hairline rounded-xl p-5 max-h-[350px] overflow-y-auto space-y-4 text-xs select-text">
              <div className="text-center pb-3 border-b border-hairline/60">
                <h4 className="font-bold text-sm text-ink tracking-wide uppercase font-display">
                  「搭把手」社区自治运营{selectedReportTime === 'weekly' ? '本周周报' : '上月月报'}
                </h4>
                <p className="text-[10px] text-ink-subtle mt-1">
                  网格单位: {currentUser.community} | 报告时间: 2026-07-11
                </p>
              </div>

              {/* Stats Block */}
              <div className="space-y-2">
                <h5 className="font-bold text-jade">&sect; 核心运营指标总览</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 bg-surface rounded-lg border border-hairline">
                    <span className="text-ink-muted block text-[10px]">注册居民数</span>
                    <span className="font-bold text-ink">347人 (+12新增)</span>
                  </div>
                  <div className="p-2 bg-surface rounded-lg border border-hairline">
                    <span className="text-ink-muted block text-[10px]">周活跃用户</span>
                    <span className="font-bold text-ink">89人 (活跃度↑8%)</span>
                  </div>
                  <div className="p-2 bg-surface rounded-lg border border-hairline">
                    <span className="text-ink-muted block text-[10px]">活动签到率</span>
                    <span className="font-bold text-ink">90% (本周4场)</span>
                  </div>
                  <div className="p-2 bg-surface rounded-lg border border-hairline">
                    <span className="text-ink-muted block text-[10px]">互助接单率</span>
                    <span className="font-bold text-ink">91.2% (已结案25起)</span>
                  </div>
                  <div className="p-2 bg-surface rounded-lg border border-hairline">
                    <span className="text-ink-muted block text-[10px]">诉求办结率</span>
                    <span className="font-bold text-ink">94.0% (闭环反馈)</span>
                  </div>
                  <div className="p-2 bg-surface rounded-lg border border-hairline">
                    <span className="text-ink-muted block text-[10px]">居民综合满意度</span>
                    <span className="font-bold text-ink">4.6分 / 满分5.0</span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-jade">&sect; 居民诉求聚类与高频词</h5>
                <p className="text-ink-muted leading-relaxed">
                  本周居民高频诉求前三位分别为：<span className="text-ink font-semibold">停车位不足(12次)</span>、
                  <span className="text-ink font-semibold">噪音扰民(8次)</span>、
                  <span className="text-ink font-semibold">公共设施维修(6次)</span>。
                  目前，在居委会与物业通力合作下，停车收费规则优化草案已在征集居民意见中。
                </p>
              </div>

              {/* Special Elder care stats */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-jade">&sect; 特殊群体关怀专项汇报</h5>
                <p className="text-ink-muted leading-relaxed">
                  针对辖区 <span className="text-ink font-semibold">12名重点独居老人</span>
                  ，本周安全报平安率保持在 <span className="text-ink font-semibold">92%</span>。
                  本月累计收到关怀版买药、买菜等专项爱心派单申请 12件，已指派社区志愿者结案 9件，剩余
                  3件正在派单中。一键呼救热线响应时间平均在 3分钟内。
                </p>
              </div>

              <div className="text-[10px] text-ink-subtle text-right border-t border-hairline/60 pt-3">
                报告审核人: 李主任 | 系统智能辅助排版生成
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
