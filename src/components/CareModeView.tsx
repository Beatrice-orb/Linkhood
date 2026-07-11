import React, { useState } from 'react';
import { 
  ChevronRight, 
  Clock, 
  Send, 
  Gift, 
  CheckCircle2, 
  ArrowRight,
  ThumbsUp,
  MapPin,
  Calendar,
  Phone,
  MessageSquare
} from 'lucide-react';
import { UserProfile, Space, Event, Service, FeedItem } from '../types';
import { DabashouMap, DabashouCircle, DabashouMe } from './Icons';

export interface SocialWorkerService {
  id: string;
  image: string;
  name: string;
  type: string;
  organizer: string;
  status: string;
  description: string;
  hours: string;
  contact: string;
}

interface CareModeViewProps {
  currentUser: UserProfile;
  activeTab: 'home' | 'circle' | 'chat' | 'me';
  setActiveTab: (tab: 'home' | 'circle' | 'chat' | 'me') => void;
  homeSubTab: 'spaces' | 'events' | 'services' | 'social';
  setHomeSubTab: (tab: 'spaces' | 'events' | 'services' | 'social') => void;
  spaces: Space[];
  events: Event[];
  services: Service[];
  socialWorkerServices: SocialWorkerService[];
  activeSpaceFilter: string;
  setActiveSpaceFilter: (filter: string) => void;
  filteredSpaces: Space[];
  activeEventFilter: string;
  setActiveEventFilter: (filter: string) => void;
  filteredEvents: Event[];
  activeServiceFilter: string;
  setActiveServiceFilter: (filter: string) => void;
  filteredServices: Service[];
  feedFilter: string;
  setFeedFilter: (filter: string) => void;
  filteredFeedItems: FeedItem[];
  feedItems: FeedItem[];
  setFeedItems: React.Dispatch<React.SetStateAction<FeedItem[]>>;
  handleHelpAction: (id: string) => void;
  setSelectedSpace: (space: Space | null) => void;
  setSelectedEvent: (event: Event | null) => void;
  setShowAnnouncementsModal: (show: boolean) => void;
  setShowOnboardingModal: (show: boolean) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  triggerToggleCareMode: (target: boolean) => void;
  handleStartPrivateChat: (name: string, type: string) => void;
  persistPost: (body: { type: 'help' | 'moment'; category?: string; content: string; meetingTime?: string; bountyPoints?: number }) => Promise<boolean>;
}

export default function CareModeView({
  currentUser,
  activeTab,
  setActiveTab,
  homeSubTab,
  setHomeSubTab,
  spaces,
  events,
  services,
  socialWorkerServices,
  activeSpaceFilter,
  setActiveSpaceFilter,
  filteredSpaces,
  activeEventFilter,
  setActiveEventFilter,
  filteredEvents,
  activeServiceFilter,
  setActiveServiceFilter,
  filteredServices,
  feedFilter,
  setFeedFilter,
  filteredFeedItems,
  feedItems,
  setFeedItems,
  handleHelpAction,
  setSelectedSpace,
  setSelectedEvent,
  setShowAnnouncementsModal,
  setShowOnboardingModal,
  showToast,
  triggerToggleCareMode,
  handleStartPrivateChat,
  persistPost,
}: CareModeViewProps) {

  // Care-Mode Specific States
  const [showCareNotices, setShowCareNotices] = useState(false);
  const [showCarePublish, setShowCarePublish] = useState(false);
  const [carePublishType, setCarePublishType] = useState<'help' | 'moment'>('help');
  const [careHelpWhat, setCareHelpWhat] = useState('');
  const [careHelpWhen, setCareHelpWhen] = useState('');
  const [careHelpWhere, setCareHelpWhere] = useState('');
  const [careMomentContent, setCareMomentContent] = useState('');
  const [careActiveMenuModal, setCareActiveMenuModal] = useState<string | null>(null);
  const [careNotificationUnread, setCareNotificationUnread] = useState(2);

  // Submit caretaker publish form
  const handleCarePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (carePublishType === 'help') {
      if (!careHelpWhat.trim()) return;
      const content = `【求助】需要帮：${careHelpWhat}。时间：${careHelpWhen || '随时'}。地点：${careHelpWhere || '本楼栋/附近'}`;
      const saved = await persistPost({ type: 'help', category: '代取', content, meetingTime: careHelpWhen || '随时', bountyPoints: 5 });
      if (!saved) return;
    } else {
      if (!careMomentContent.trim()) return;
      const saved = await persistPost({ type: 'moment', content: careMomentContent });
      if (!saved) return;
    }

    // Reset fields
    setCareHelpWhat('');
    setCareHelpWhen('');
    setCareHelpWhere('');
    setCareMomentContent('');
    setShowCarePublish(false);
  };

  return (
    <div className="px-3 py-1 space-y-5 animate-fade-in text-base leading-relaxed">
      
      {/* CARE MODE - HOME TAB */}
      {activeTab === 'home' && (
        <div className="space-y-5 animate-fade-in">
          {/* Header with location pin and utilities */}
          <div className="bg-surface p-4 rounded-3xl border border-hairline flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-[10px] text-ink-subtle uppercase font-bold tracking-wider leading-none">我的社区</p>
                <h2 className="font-bold text-sm text-ink mt-0.5">泊寓A区 · {currentUser.room.split('-')[0] || '3'}号楼</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAnnouncementsModal(true)} className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink relative p-1.5 bg-canvas rounded-xl border border-hairline">
                <span className="text-xl">📢</span>
                <span className="text-[9px] font-bold">公告</span>
              </button>
              <button onClick={() => setShowCareNotices(true)} className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink relative p-1.5 bg-canvas rounded-xl border border-hairline">
                {careNotificationUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-coral text-white font-bold text-[9px] rounded-full flex items-center justify-center border border-white">
                    {careNotificationUnread}
                  </span>
                )}
                <span className="text-xl">🔔</span>
                <span className="text-[9px] font-bold">通知</span>
              </button>
              <button onClick={() => setShowOnboardingModal(true)} className="flex flex-col items-center gap-1 text-ink-muted hover:text-ink p-1.5 bg-canvas rounded-xl border border-hairline">
                <span className="text-xl">📖</span>
                <span className="text-[9px] font-bold">帮助</span>
              </button>
            </div>
          </div>

          {/* 4 Big Overview Cards */}
          <div className="grid grid-cols-4 gap-2 bg-surface p-3 rounded-3xl border border-hairline">
            {[
              { key: 'spaces', label: '公共空间', count: `${spaces.length}处`, icon: '🏠', color: 'bg-jade-light text-jade border-jade/20' },
              { key: 'events', label: '本周活动', count: `${events.length}场`, icon: '📅', color: 'bg-coral-hover/10 text-coral border-coral/20' },
              { key: 'services', label: '周边服务', count: `${services.length}家`, icon: '🏪', color: 'bg-canvas text-ink-muted border-hairline' },
              { key: 'social', label: '社工服务', count: `${socialWorkerServices.length}人`, icon: '🤝', color: 'bg-amber-light text-amber border-amber/20' }
            ].map(card => {
              const isSel = homeSubTab === card.key;
              return (
                <button
                  key={card.key}
                  onClick={() => setHomeSubTab(card.key as any)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all text-center ${
                    isSel ? 'border-jade bg-jade-light ring-2 ring-jade/30 scale-[1.03]' : 'border-hairline bg-surface hover:bg-canvas'
                  }`}
                >
                  <span className="text-2xl">{card.icon}</span>
                  <span className="text-[10px] font-bold text-ink mt-1 truncate w-full">{card.label}</span>
                  <span className="text-[9px] text-ink-muted font-bold font-number mt-0.5 block">{card.count}</span>
                </button>
              );
            })}
          </div>

          {/* High-Contrast Large Tab Row */}
          <div className="flex gap-2 pb-1 border-b border-hairline overflow-x-auto custom-scrollbar">
            {[
              { key: 'spaces', label: '公共空间 🏠' },
              { key: 'events', label: '本周活动 📅' },
              { key: 'services', label: '周边服务 🏪' },
              { key: 'social', label: '社工服务 🤝' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setHomeSubTab(tab.key as any)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold border shrink-0 transition-all ${
                  homeSubTab === tab.key
                    ? 'bg-jade text-white border-transparent shadow-md'
                    : 'bg-surface text-ink-muted border-hairline hover:bg-canvas'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-tab lists with Care design */}
          {homeSubTab === 'spaces' && (
            <div className="space-y-3.5 animate-fade-in">
              {/* Filter chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {['全部', '健身房', '活动室', '书吧', '厨房'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveSpaceFilter(tag)}
                    className={`text-[10px] px-3 py-1.5 rounded-full border shrink-0 font-bold transition-all ${
                      activeSpaceFilter === tag 
                        ? 'bg-jade text-white border-transparent' 
                        : 'bg-surface text-ink-muted border-hairline hover:text-ink hover:bg-canvas'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredSpaces.map(sp => (
                  <div key={sp.id} className="bg-surface p-4 rounded-3xl border border-hairline space-y-3 shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 bg-canvas rounded-2xl border border-hairline">{sp.image}</span>
                        <div>
                          <h4 className="font-bold text-sm text-ink">{sp.name}</h4>
                          <p className="text-xs text-ink-muted mt-1 font-bold">📍 {sp.location} • 👥 容纳{sp.capacity}人</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-amber flex items-center gap-0.5 shrink-0">⭐ {sp.rating}分</span>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed font-medium">服务内容: {sp.description}</p>
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => showToast(`正在进行空间电话咨询: 021-65432101`, 'info')}
                        className="py-3 bg-canvas hover:bg-hairline text-ink font-bold text-xs rounded-xl border border-hairline flex items-center justify-center gap-1"
                      >
                        📞 电话咨询
                      </button>
                      <button
                        onClick={() => setSelectedSpace(sp)}
                        className="py-3 bg-jade hover:bg-jade-hover text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        📅 预约与路线
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {homeSubTab === 'events' && (
            <div className="space-y-3.5 animate-fade-in">
              {/* Filter chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {['全部', '兴趣课程', '体育运动', '闲置交换', '节日活动'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveEventFilter(tag)}
                    className={`text-[10px] px-3 py-1.5 rounded-full border shrink-0 font-bold transition-all ${
                      activeEventFilter === tag 
                        ? 'bg-jade text-white border-transparent' 
                        : 'bg-surface text-ink-muted border-hairline hover:text-ink'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredEvents.map(ev => (
                  <div key={ev.id} className="bg-surface p-4 rounded-3xl border border-hairline space-y-3 shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] px-2 py-0.5 bg-jade-light text-jade border border-jade/10 rounded font-bold">{ev.type}</span>
                        <h4 className="font-bold text-sm text-ink mt-2">{ev.name}</h4>
                        <p className="text-xs text-ink-muted mt-1.5 font-semibold">⏰ 时间: {ev.time}</p>
                        <p className="text-xs text-ink-muted mt-0.5 font-semibold">📍 地点: {ev.location}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-jade-light text-jade shrink-0 font-number">{ev.signedUp}/{ev.capacity}人</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => showToast(`已联系发起人: ${ev.organizer}`, 'info')}
                        className="py-3 bg-canvas hover:bg-hairline text-ink font-bold text-xs rounded-xl border border-hairline flex items-center justify-center gap-1"
                      >
                        📞 问详情
                      </button>
                      <button
                        onClick={() => setSelectedEvent(ev)}
                        className="py-3 bg-coral hover:bg-coral-hover text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        📅 我要报名
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {homeSubTab === 'services' && (
            <div className="space-y-3.5 animate-fade-in">
              {/* Filter chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {['全部', '超市便利', '生鲜超市', '药店', '洗衣服务', '理发'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveServiceFilter(tag)}
                    className={`text-[10px] px-3 py-1.5 rounded-full border shrink-0 font-bold transition-all ${
                      activeServiceFilter === tag 
                        ? 'bg-jade text-white border-transparent' 
                        : 'bg-surface text-ink-muted border-hairline hover:text-ink'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredServices.map(ser => (
                  <div key={ser.id} className="bg-surface p-4 rounded-3xl border border-hairline space-y-3 shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 bg-canvas rounded-2xl border border-hairline">{ser.image}</span>
                        <div>
                          <h4 className="font-bold text-sm text-ink">{ser.name}</h4>
                          <p className="text-xs text-ink-muted mt-1 font-semibold">📍 {ser.location} • ⭐ {ser.rating}分</p>
                        </div>
                      </div>
                      {ser.hasDiscount && (
                        <span className="text-[10px] text-coral font-bold bg-coral/10 border border-coral/20 px-2 py-0.5 rounded-full">
                          住户折
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted font-bold">营业时间: {ser.hours}</p>
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => showToast(`正在拨号呼叫: ${ser.name}`, 'info')}
                        className="py-3 bg-jade text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        📞 打电话
                      </button>
                      <button
                        onClick={() => showToast(`正在启动一键导航: ${ser.location}`, 'info')}
                        className="py-3 bg-canvas border border-hairline hover:bg-hairline text-ink font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        📍 找路线
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {homeSubTab === 'social' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="bg-jade-light/50 p-4 rounded-2xl border border-jade/15 text-xs text-ink-muted leading-relaxed font-bold">
                💡 泊寓社区共治中心在此特设关怀社工服务。您可以一键电话呼叫您的楼栋管家、获取事务初审、心理辅导，有疑问立即获得解答！
              </div>

              <div className="space-y-3">
                {socialWorkerServices.map(service => (
                  <div key={service.id} className="bg-surface p-4 rounded-3xl border border-hairline space-y-3 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 bg-canvas rounded-2xl border border-hairline text-ink">{service.image}</span>
                        <div>
                          <h4 className="font-bold text-sm text-ink">{service.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 bg-jade-light text-jade border border-jade/15 rounded font-bold mt-1 inline-block">{service.type}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-jade text-white px-2 py-0.5 rounded font-bold shrink-0">{service.status}</span>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed font-medium">{service.description}</p>
                    <div className="bg-canvas p-3 rounded-2xl text-[11px] text-ink-muted space-y-1 font-bold">
                      <p>⏰ 服务时间: <span className="text-ink">{service.hours}</span></p>
                      <p>📞 电话方式: <span className="text-ink">{service.contact}</span></p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => showToast(`正在一键呼叫社工: ${service.contact.split(' ')[0]}`, 'info')}
                        className="py-3 bg-canvas hover:bg-hairline text-ink border border-hairline font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        📞 拨打电话
                      </button>
                      <button
                        onClick={() => {
                          handleStartPrivateChat(service.name, '关怀社工');
                          showToast(`已开始与 ${service.name} 聊天咨询`, 'success');
                        }}
                        className="py-3 bg-jade text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        💬 在线提问
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TWO GIANT ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                setCarePublishType('help');
                setShowCarePublish(true);
              }}
              className="py-4.5 bg-coral hover:bg-coral-hover text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="text-xl">🙋</span> 我需要帮助
            </button>
            <button
              onClick={() => {
                setCarePublishType('moment');
                setShowCarePublish(true);
              }}
              className="py-4.5 bg-jade hover:bg-jade-hover text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="text-xl">📝</span> 我发条动态
            </button>
          </div>

        </div>
      )}

      {/* CARE MODE - NEIGHBORHOOD CIRCLE TAB */}
      {activeTab === 'circle' && (
        <div className="space-y-5 animate-fade-in">
          
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-ink">👥 邻里圈</h2>
            <span className="text-xs text-ink-muted">温情互助与日常分享</span>
          </div>

          {/* Filter tags for Care mode */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
            {[
              { key: '全部', label: '全部内容 📱' },
              { key: '互助需求', label: '邻里求助 🤝' },
              { key: '居民动态', label: '邻里动态 📸' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFeedFilter(f.key)}
                className={`text-xs px-4 py-2.5 rounded-full border shrink-0 font-bold transition-all ${
                  feedFilter === f.key 
                    ? 'bg-jade text-white border-transparent shadow-sm' 
                    : 'bg-surface text-ink-muted border-hairline hover:text-ink hover:bg-canvas'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Feed Item Lists */}
          <div className="space-y-4">
            {filteredFeedItems
              .filter(item => item.type !== 'topic') // Hide Topic discussions in Care mode as requested
              .map(item => {
                const isHelp = item.type === 'help';
                return (
                  <div key={item.id} className="bg-surface p-5 rounded-3xl border border-hairline space-y-4 shadow-xs animate-fade-in">
                    
                    {/* Header user info */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="w-11 h-11 rounded-full bg-jade-light text-jade border border-jade/10 font-bold text-base flex items-center justify-center">
                          {item.authorName.charAt(0)}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-ink">{item.authorName}</span>
                            <span className="text-xs text-ink-muted bg-canvas border border-hairline px-2 py-0.2 rounded font-bold">{item.authorRoom}</span>
                          </div>
                          <p className="text-xs text-ink-subtle mt-0.5 font-medium">距您 {item.distance}米 • {item.time}</p>
                        </div>
                      </div>
                      {isHelp && (
                        <span className="text-xs px-2.5 py-1 bg-coral/10 text-coral border border-coral/20 rounded-xl font-bold">
                          求助
                        </span>
                      )}
                    </div>

                    {/* Body content */}
                    <p className="text-sm font-semibold text-ink leading-relaxed break-all">
                      {item.content}
                    </p>

                    {item.image && (
                      <div className="p-4 bg-canvas rounded-2xl border border-hairline flex items-center justify-center text-5xl select-none">
                        {item.image}
                      </div>
                    )}

                    {/* Footer like and help btn */}
                    <div className="flex justify-between items-center pt-3 border-t border-hairline">
                      <button
                        onClick={() => {
                          item.hasLiked = !item.hasLiked;
                          item.likes = item.hasLiked ? item.likes + 1 : item.likes - 1;
                          setFeedItems([...feedItems]);
                          showToast(item.hasLiked ? '给邻居点赞成功！' : '取消了点赞');
                        }}
                        className={`flex items-center gap-1.5 text-xs font-bold ${item.hasLiked ? 'text-coral' : 'text-ink-muted'}`}
                      >
                        <span className="text-lg">❤️</span> 点赞 ({item.likes})
                      </button>

                      {isHelp && item.actionStatus !== 'claimed' && (
                        <button
                          onClick={() => handleHelpAction(item.id)}
                          className="py-2.5 px-6 bg-coral hover:bg-coral-hover text-white font-bold text-xs rounded-xl shadow-md transition-all scale-102"
                        >
                          🙌 我来帮他
                        </button>
                      )}
                      {isHelp && item.actionStatus === 'claimed' && (
                        <span className="text-xs text-jade bg-jade-light border border-jade/15 px-3 py-1 rounded-lg font-bold">
                          ✓ 已有邻居帮扶中
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
          </div>

          {/* TWO GIANT ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                setCarePublishType('help');
                setShowCarePublish(true);
              }}
              className="py-4.5 bg-coral hover:bg-coral-hover text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="text-xl">🙋</span> 我需要帮助
            </button>
            <button
              onClick={() => {
                setCarePublishType('moment');
                setShowCarePublish(true);
              }}
              className="py-4.5 bg-jade hover:bg-jade-hover text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="text-xl">📝</span> 我发条动态
            </button>
          </div>

        </div>
      )}

      {/* CARE MODE - ME PROFILE TAB */}
      {activeTab === 'me' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Profile Header */}
          <div className="bg-surface p-5 rounded-3xl border border-hairline space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-jade flex items-center justify-center text-xl font-bold text-white shadow-md">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-ink">{currentUser.name}</h3>
                <p className="text-xs text-jade font-bold mt-1">🏠 我的楼栋: {currentUser.room} 室</p>
              </div>
            </div>

            {/* Score / flowers block */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-jade-light/30 p-3.5 rounded-2xl border border-jade/15">
                <span className="block text-xs font-bold text-jade">⭐ 邻里好评数</span>
                <span className="text-base font-bold text-jade mt-1 block font-number">23 次</span>
              </div>
              <div className="bg-amber-light p-3.5 rounded-2xl border border-amber/20">
                <span className="block text-xs font-bold text-amber">🌺 我的小红花</span>
                <span className="text-base font-bold text-amber mt-1 block font-number">{currentUser.points} 朵</span>
              </div>
            </div>
          </div>

          {/* Gigantic Identity Toggle Button */}
          <button
            onClick={() => triggerToggleCareMode(false)}
            className="w-full py-4 bg-jade-light border-2 border-jade text-jade hover:bg-jade-light/80 rounded-3xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
          >
            <span>🔄 切换到普通版</span>
          </button>

          {/* Giant Tap Menu rows */}
          <div className="space-y-3">
            {[
              { key: 'my_publish', label: '📝 我的求助与动态', icon: '📝' },
              { key: 'my_help', label: '🤝 我的爱心帮扶', icon: '🤝' },
              { key: 'my_events', label: '📅 我参加的社区活动', icon: '📅' },
              { key: 'my_reviews', label: '⭐ 邻里给我的好评', icon: '⭐' },
              { key: 'my_certification', label: '🏠 社区楼栋实名认证', icon: '🏠' },
              { key: 'my_settings', label: '⚙️ 系统设置', icon: '⚙️' }
            ].map(menu => (
              <button
                key={menu.key}
                onClick={() => setCareActiveMenuModal(menu.key)}
                className="w-full h-16 bg-surface px-4 rounded-2xl border border-hairline hover:border-jade/30 flex items-center justify-between transition-all active:scale-99"
              >
                <span className="flex items-center gap-3 text-sm font-bold text-ink">
                  <span className="text-xl">{menu.icon}</span>
                  {menu.label}
                </span>
                <ChevronRight className="w-5 h-5 text-ink-subtle" />
              </button>
            ))}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/*                    CARE MODE MODALS                      */}
      {/* ======================================================== */}

      {/* CARE MODE - NOTICES POPUP */}
      {showCareNotices && (
        <div className="absolute inset-0 bg-ink/75 z-50 animate-fade-in flex flex-col justify-end">
          <div className="bg-canvas border-t border-hairline rounded-t-[32px] max-h-[80%] overflow-y-auto custom-scrollbar flex flex-col p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-hairline">
              <h3 className="font-bold text-base text-ink flex items-center gap-2">
                <span>🔔</span> 社区关怀通知
              </h3>
              <button 
                onClick={() => { setShowCareNotices(false); setCareNotificationUnread(0); }}
                className="w-8 h-8 rounded-full bg-surface text-ink flex items-center justify-center font-bold text-sm border border-hairline"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-surface p-4 rounded-2xl border border-hairline space-y-1 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-coral">🔴 停水提醒</span>
                  <span className="text-[10px] text-ink-subtle">今天 10:00</span>
                </div>
                <p className="text-xs text-ink font-semibold mt-1">3号楼因管道检修，今天下午14:00 - 16:00将临时停水，请大家提前做好储水准备。</p>
              </div>
              <div className="bg-surface p-4 rounded-2xl border border-hairline space-y-1 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-jade">🟢 免费体检通知</span>
                  <span className="text-[10px] text-ink-subtle">昨天 15:30</span>
                </div>
                <p className="text-xs text-ink font-semibold mt-1">本周五上午09:00 - 11:30，社区联合卫生服务中心在1号楼共享活动室开展老年人免费健康体检与健康咨询。</p>
              </div>
            </div>
            <button
              onClick={() => { setShowCareNotices(false); setCareNotificationUnread(0); }}
              className="w-full py-3.5 bg-jade text-white font-bold text-xs rounded-xl"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* CARE MODE - SIMPLIFIED PUBLISH POPUP */}
      {showCarePublish && (
        <div className="absolute inset-0 bg-ink/75 z-50 animate-fade-in flex flex-col justify-end">
          <div className="bg-canvas border-t border-hairline rounded-t-[32px] max-h-[90%] overflow-y-auto custom-scrollbar flex flex-col p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-hairline">
              <h3 className="font-bold text-base text-ink flex items-center gap-1.5">
                {carePublishType === 'help' ? '🙋 填写求助信息' : '📝 发布居民动态'}
              </h3>
              <button 
                onClick={() => setShowCarePublish(false)}
                className="w-8 h-8 rounded-full bg-surface text-ink flex items-center justify-center font-bold text-sm border border-hairline"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCarePublishSubmit} className="space-y-4 text-xs text-left">
              {carePublishType === 'help' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-ink">1. 需要帮您做点什么？（必填）</label>
                    <input
                      type="text"
                      value={careHelpWhat}
                      onChange={(e) => setCareHelpWhat(e.target.value)}
                      placeholder="例如：买一份牛肉面、代领西门大件快递、换个灯泡"
                      className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-2xl px-4 py-3 text-xs text-ink placeholder-ink-subtle outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-ink">2. 什么时候需要？</label>
                    <input
                      type="text"
                      value={careHelpWhen}
                      onChange={(e) => setCareHelpWhen(e.target.value)}
                      placeholder="例如：今天下午6点前、随时都可以"
                      className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-2xl px-4 py-3 text-xs text-ink placeholder-ink-subtle outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-ink">3. 送到哪里？</label>
                    <input
                      type="text"
                      value={careHelpWhere}
                      onChange={(e) => setCareHelpWhere(e.target.value)}
                      placeholder="例如：3号楼502室、送到楼栋门口"
                      className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-2xl px-4 py-3 text-xs text-ink placeholder-ink-subtle outline-none transition-all"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-ink">写下想对邻居们说的话</label>
                  <textarea
                    rows={4}
                    value={careMomentContent}
                    onChange={(e) => setCareMomentContent(e.target.value)}
                    placeholder="例如：今天天气真好，在阳台晒太阳晒得很舒服！"
                    className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-2xl p-4 text-xs text-ink placeholder-ink-subtle outline-none transition-all resize-none"
                    required
                  />
                </div>
              )}

              <p className="text-[10px] text-ink-subtle leading-relaxed font-semibold">
                * 居委会和您的专属管家小王将全程协助，请您放心发布。
              </p>

              <button
                type="submit"
                className="w-full py-4 bg-jade hover:bg-jade-hover text-white font-bold text-sm rounded-2xl shadow-md transition-all"
              >
                确认发布
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CARE MODE - ME MENU DETAILS POPUP */}
      {careActiveMenuModal && (
        <div className="absolute inset-0 bg-ink/75 z-50 animate-fade-in flex flex-col justify-end">
          <div className="bg-canvas border-t border-hairline rounded-t-[32px] max-h-[85%] overflow-y-auto custom-scrollbar flex flex-col p-5 space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-hairline">
              <h3 className="font-bold text-base text-ink flex items-center gap-1.5">
                {careActiveMenuModal === 'my_publish' && '📝 我的求助与动态'}
                {careActiveMenuModal === 'my_help' && '🤝 我的爱心帮扶'}
                {careActiveMenuModal === 'my_events' && '📅 我参加的社区活动'}
                {careActiveMenuModal === 'my_reviews' && '⭐ 邻里给我的好评'}
                {careActiveMenuModal === 'my_certification' && '🏠 社区楼栋实名认证'}
                {careActiveMenuModal === 'my_settings' && '⚙️ 系统设置'}
              </h3>
              <button 
                onClick={() => setCareActiveMenuModal(null)}
                className="w-8 h-8 rounded-full bg-surface text-ink flex items-center justify-center font-bold text-sm border border-hairline"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {careActiveMenuModal === 'my_publish' && (
                <div className="space-y-2.5 text-left">
                  {feedItems.filter(f => f.authorName === currentUser.name).map(item => (
                    <div key={item.id} className="bg-surface p-4 rounded-2xl border border-hairline space-y-1">
                      <span className="text-[10px] font-bold text-jade">{item.type === 'help' ? '🤝 求助' : '📸 动态'} • {item.time}</span>
                      <p className="text-xs font-semibold text-ink leading-relaxed mt-1">{item.content}</p>
                    </div>
                  ))}
                  {feedItems.filter(f => f.authorName === currentUser.name).length === 0 && (
                    <p className="text-center py-6 text-ink-subtle">暂无求助或动态记录</p>
                  )}
                </div>
              )}

              {careActiveMenuModal === 'my_help' && (
                <div className="space-y-2.5 text-left">
                  <div className="bg-jade-light/50 p-3 rounded-2xl border border-jade/15 text-[11px] text-jade font-bold mb-1">
                    ❤️ 您已经累计帮扶了邻居 {currentUser.helpCount} 次！谢谢您的热心和爱心！
                  </div>
                  <div className="bg-surface p-4 rounded-2xl border border-hairline space-y-1">
                    <span className="text-[10px] font-bold text-jade">✓ 已完成 • 上周三</span>
                    <p className="text-xs font-semibold text-ink">帮3号楼302室的张奶奶代取了重件包裹，获得张奶奶五星好评！</p>
                  </div>
                  <div className="bg-surface p-4 rounded-2xl border border-hairline space-y-1">
                    <span className="text-[10px] font-bold text-jade">✓ 已完成 • 两周前</span>
                    <p className="text-xs font-semibold text-ink">帮2号楼102室小鱼照看了2小时宠物，获得了1朵小红花🌺！</p>
                  </div>
                </div>
              )}

              {careActiveMenuModal === 'my_events' && (
                <div className="space-y-2.5 text-left">
                  <p className="font-bold text-ink text-xs mb-1">您已报名参加的本周活动：</p>
                  <div className="bg-surface p-4 rounded-2xl border border-hairline space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-coral">🧁 社区烘焙分享</span>
                      <span className="text-[10px] text-jade font-bold">已成功报名</span>
                    </div>
                    <p className="text-xs text-ink-muted">⏰ 时间: 本周六下午两点<br />📍 地点: 3号楼B1层共享厨房</p>
                  </div>
                </div>
              )}

              {careActiveMenuModal === 'my_reviews' && (
                <div className="space-y-2.5 text-left">
                  <p className="font-bold text-ink text-xs mb-1">邻居们对您的温情评价：</p>
                  <div className="bg-surface p-4 rounded-2xl border border-hairline space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-ink">张奶奶 (3-302)</span>
                      <span className="text-ink-subtle">上周三</span>
                    </div>
                    <div className="text-amber text-xs">⭐⭐⭐⭐⭐</div>
                    <p className="text-xs text-ink-muted leading-relaxed font-medium">小雅这孩子真好，大热天帮我把几斤重的快递送上楼，真热心！</p>
                  </div>
                  <div className="bg-surface p-4 rounded-2xl border border-hairline space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-ink">小鱼 (2-102)</span>
                      <span className="text-ink-subtle">两周前</span>
                    </div>
                    <div className="text-amber text-xs">⭐⭐⭐⭐⭐</div>
                    <p className="text-xs text-ink-muted leading-relaxed font-medium">非常耐心的小姐姐，帮我照看小猫特别尽责，猫咪也很喜欢她！</p>
                  </div>
                </div>
              )}

              {careActiveMenuModal === 'my_certification' && (
                <div className="bg-surface p-5 rounded-3xl border border-hairline space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🏢</span>
                    <div>
                      <h4 className="font-bold text-sm text-ink">泊寓青年邻里实名认证</h4>
                      <span className="text-[10px] bg-jade-light text-jade border border-jade/15 px-2 py-0.5 rounded font-bold">已认证住户</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs border-t border-hairline pt-3 font-semibold text-ink-muted">
                    <p>👤 认证姓名: <span className="text-ink">{currentUser.name}</span></p>
                    <p>🚪 认证房间: <span className="text-ink">泊寓A区 3号楼 {currentUser.room}室</span></p>
                    <p>⏱️ 认证时间: <span className="text-ink">2026-03-15</span></p>
                  </div>
                  <p className="text-[10px] text-ink-subtle font-medium leading-relaxed">
                    * 实名认证信息已与居委会及管家系统安全对接，保障您的社区活动安全可信。
                  </p>
                </div>
              )}

              {careActiveMenuModal === 'my_settings' && (
                <div className="bg-surface p-4 rounded-2xl border border-hairline space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-ink">关怀版特大字体</span>
                    <div className="w-12 h-6 bg-jade rounded-full p-0.5 flex items-center justify-end">
                      <div className="bg-white w-5 h-5 rounded-full shadow"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-ink">新公告红点提醒</span>
                    <div className="w-12 h-6 bg-jade rounded-full p-0.5 flex items-center justify-end">
                      <div className="bg-white w-5 h-5 rounded-full shadow"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-ink">一键求助极速响应</span>
                    <div className="w-12 h-6 bg-jade rounded-full p-0.5 flex items-center justify-end">
                      <div className="bg-white w-5 h-5 rounded-full shadow"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-ink-subtle font-medium leading-relaxed pt-2 border-t border-hairline">
                    搭把手 关怀适老化版本 v1.2.0
                  </p>
                </div>
              )}

            </div>
            <button
              onClick={() => setCareActiveMenuModal(null)}
              className="w-full py-4 bg-jade text-white font-bold text-sm rounded-2xl shadow-md"
            >
              返回
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
