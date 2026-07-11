import React, { useState, useEffect } from 'react';
import { 
  mockUsers, 
  mockSpaces, 
  mockServices, 
  mockEvents, 
  mockFeedItems, 
  mockAnnouncements, 
  mockWeeklyReport 
} from './mockData';
import { UserProfile, Space, Service, Event, FeedItem, Announcement, WeeklyReport } from './types';
import { 
  DabashouMap, 
  DabashouCircle, 
  DabashouMe, 
  DabashouPublish, 
  DabashouCredit, 
  DabashouPoints, 
  DabashouBadge 
} from './components/Icons';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Award, 
  Users, 
  MessageSquare, 
  BookOpen, 
  Calendar, 
  Heart, 
  Send, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  TrendingUp, 
  Activity, 
  ChevronRight, 
  User, 
  Share2, 
  Info,
  Gift,
  Plus,
  Compass,
  Smile,
  Zap,
  HelpCircle,
  FileText,
  Sparkles
} from 'lucide-react';
import CareModeView from './components/CareModeView';

export default function App() {
  // Current logged in user (starts with 小雅)
  const [currentUser, setCurrentUser] = useState<UserProfile>(
    mockUsers.find(u => u.id === 'user_xiaoya') || mockUsers[0]
  );

  // App tabs
  type Tab = 'home' | 'circle' | 'chat' | 'me';
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Care Mode State (Persisted in localStorage)
  const [careMode, setCareMode] = useState<boolean>(() => {
    return localStorage.getItem('careMode') === 'true';
  });

  // Custom Confirmation Dialog for Care Mode
  const [showCareModeConfirm, setShowCareModeConfirm] = useState<{
    visible: boolean;
    targetMode: boolean;
  }>({ visible: false, targetMode: false });

  // Helper to trigger Care Mode changes
  const triggerToggleCareMode = (target: boolean) => {
    setShowCareModeConfirm({ visible: true, targetMode: target });
  };

  const handleConfirmToggleCareMode = () => {
    const newVal = showCareModeConfirm.targetMode;
    setCareMode(newVal);
    localStorage.setItem('careMode', String(newVal));
    if (newVal) {
      if (activeTab === 'chat') {
        setActiveTab('home');
      }
    }
    setShowCareModeConfirm({ visible: false, targetMode: false });
    showToast(newVal ? '已成功切换至关怀版！' : '已返回普通版本！', 'info');
  };

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
  const handleCarePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (carePublishType === 'help') {
      if (!careHelpWhat.trim()) return;
      const content = `【求助】需要帮：${careHelpWhat}。时间：${careHelpWhen || '随时'}。地点：${careHelpWhere || '本楼栋/附近'}`;
      const newItem: FeedItem = {
        id: `care_help_${Date.now()}`,
        type: 'help',
        category: '代取',
        authorName: currentUser.name,
        authorRoom: currentUser.room,
        distance: 12,
        time: '刚刚',
        content: content,
        likes: 0,
        hasLiked: false,
        comments: [],
        meetingTime: careHelpWhen || '随时',
        bountyPoints: 5,
        creditScore: currentUser.creditScore,
        helpCount: currentUser.helpCount,
        actionText: '我来帮',
        actionStatus: 'idle',
        tags: ['长辈求助']
      };
      setFeedItems([newItem, ...feedItems]);
      showToast('求助信息发布成功！邻居们会尽快看到！', 'success');
    } else {
      if (!careMomentContent.trim()) return;
      const newItem: FeedItem = {
        id: `care_moment_${Date.now()}`,
        type: 'moment',
        authorName: currentUser.name,
        authorRoom: currentUser.room,
        distance: 15,
        time: '刚刚',
        content: careMomentContent,
        likes: 0,
        hasLiked: false,
        comments: [],
        creditScore: currentUser.creditScore,
        helpCount: currentUser.helpCount,
        tags: ['日常分享']
      };
      setFeedItems([newItem, ...feedItems]);
      showToast('动态发布成功！', 'success');
    }

    // Reset fields
    setCareHelpWhat('');
    setCareHelpWhen('');
    setCareHelpWhere('');
    setCareMomentContent('');
    setShowCarePublish(false);
  };

  // Sub tab inside Home (社区地图)
  type HomeSubTab = 'spaces' | 'events' | 'services' | 'social';
  const [homeSubTab, setHomeSubTab] = useState<HomeSubTab>('spaces');

  interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    time: string;
    isMe: boolean;
  }

  interface ChatSession {
    id: string;
    name: string;
    type: 'private' | 'group' | 'system';
    avatar: string;
    lastMessage: string;
    lastTime: string;
    unreadCount: number;
    subLabel: string;
    messages: ChatMessage[];
  }

  interface SocialWorkerService {
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

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: 'chat_system_1',
      name: '居委会小张',
      type: 'private',
      avatar: '👮',
      lastMessage: '好的小雅，我已经收到你的咨询。有任何进展我会同步给你！',
      lastTime: '10分钟前',
      unreadCount: 1,
      subLabel: '居委会专属管家',
      messages: [
        { id: 'm_sys_1', sender: '居委会小张', content: '您好，欢迎咨询！请问有什么我可以帮到您的？', time: '12:00', isMe: false },
        { id: 'm_sys_2', sender: '我', content: '小张您好，我想咨询一下我们3号楼周边的青年人才租房补贴申请流程。', time: '12:05', isMe: true },
        { id: 'm_sys_3', sender: '居委会小张', content: '好的小雅，我已经收到你的咨询。区里人才办刚刚更新了最新的系统申报指南，建议你可以先在小程序里把个人实名认证和社保缴纳证明关联上，有任何进展我会在私聊或社工服务区第一时间同步给你！加油！', time: '10分钟前', isMe: false }
      ]
    },
    {
      id: 'chat_ajie_1',
      name: '阿杰 (3-308)',
      type: 'private',
      avatar: '🎨',
      lastMessage: '哈哈，收到啦！六点半我拿到502给你。',
      lastTime: '1小时前',
      unreadCount: 0,
      subLabel: '拼单代取',
      messages: [
        { id: 'm_ajie_1', sender: '阿杰 (3-308)', content: '小雅，听说你要拼牛肉卷？算我一个！', time: '14:30', isMe: false },
        { id: 'm_ajie_2', sender: '我', content: '好呀！那下班回家顺路带上。', time: '14:32', isMe: true },
        { id: 'm_ajie_3', sender: '阿杰 (3-308)', content: '哈哈，收到啦！我今天正好有空，大蒜我已经装好袋了，大概六点半我拿到502给你。顺便期待你做的蔓越莓曲奇饼干呀！', time: '1小时前', isMe: false }
      ]
    },
    {
      id: 'chat_group_1',
      name: '周末烘焙分享群',
      type: 'group',
      avatar: '🧁',
      lastMessage: '阿华: 哇！我一定会准时参加，顺便带个保温盒！',
      lastTime: '2小时前',
      unreadCount: 0,
      subLabel: '活动群聊',
      messages: [
        { id: 'm_grp_1', sender: '系统', content: '“周末烘焙课”活动群聊已自动创建。', time: '10:00', isMe: false },
        { id: 'm_grp_2', sender: '我', content: '欢迎各位邻居加入烘焙交流群！这周六下午两点，共享厨房，不见不散！', time: '10:15', isMe: true },
        { id: 'm_grp_3', sender: '阿华', content: '哇！小雅老师居然亲自建群了，支持支持！我一定会准时参加，顺便带个保温盒！', time: '2小时前', isMe: false }
      ]
    }
  ]);

  const [selectedChatSession, setSelectedChatSession] = useState<ChatSession | null>(null);
  const [typedMessage, setTypedMessage] = useState('');

  const [socialWorkerServices] = useState<SocialWorkerService[]>([
    {
      id: 'social_1',
      image: '📋',
      name: '青年政策与补贴申领窗口',
      type: '政策咨询',
      organizer: '居委会 & 街道办',
      status: '在线解答',
      description: '为入驻本社区的青年提供各级租房补贴、高校毕业生生活补贴、社保补贴的一站式申领辅导和初审办理。',
      hours: '周一至周五 09:00 - 18:00',
      contact: '021-65432101 (居委会小张)'
    },
    {
      id: 'social_2',
      image: '🔧',
      name: '楼宇保修与工程自治站',
      type: '生活服务',
      organizer: '物业管理处',
      status: '5分钟响应',
      description: '针对住户家中的电路损坏、水管漏水、燃气隐患或公用设施保修，提供24小时极速反馈与上门排查。',
      hours: '24小时常驻在线',
      contact: '13812345678 (小王管家)'
    },
    {
      id: 'social_3',
      image: '🤝',
      name: '青年心理咨询与解压沙龙',
      type: '心理援助',
      organizer: '街道社工服务站',
      status: '每周预约',
      description: '常驻青年持证心理咨询师，提供一对一职场解压辅导、情感倾诉，并定期举办周五晚心理画画沙龙。',
      hours: '周三及周五 13:30 - 20:30',
      contact: '021-65432102 (刘社工)'
    },
    {
      id: 'social_4',
      image: '💼',
      name: '高校生求职辅导与创业帮扶',
      type: '创业就业',
      organizer: '区就业促进中心',
      status: '预约辅导',
      description: '免费提供简历诊断、模拟面试、落户积分咨询，以及初创青年社保补贴、创业免息贷款申报。',
      hours: '每周二、四 09:00 - 17:00',
      contact: '021-65432103 (张主任)'
    }
  ]);

  // Onboarding modal visibility (integrated from old bottom tab)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showResidentModal, setShowResidentModal] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);

  // Interactive local states (to allow real-time changes)
  const [spaces, setSpaces] = useState<Space[]>(mockSpaces);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(mockFeedItems);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport>(mockWeeklyReport);

  // New post states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostType, setNewPostType] = useState<'help' | 'moment'>('help');
  const [newPostCategory, setNewPostCategory] = useState<string>('拼单');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostBounty, setNewPostBounty] = useState(5);
  const [newPostMeeting, setNewPostMeeting] = useState('');

  // Selected space/service/event for detail popup modal
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Onboarding steps completed state (8 steps)
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [onboardingClaimed, setOnboardingClaimed] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick notice filter inside Home map
  const [activeSpaceFilter, setActiveSpaceFilter] = useState<string>('全部');
  const [activeServiceFilter, setActiveServiceFilter] = useState<string>('全部');
  const [activeEventFilter, setActiveEventFilter] = useState<string>('全部');
  const [feedFilter, setFeedFilter] = useState<string>('全部');

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Switch profiles
  const handleUserChange = (userId: string) => {
    const selected = mockUsers.find(u => u.id === userId);
    if (selected) {
      setCurrentUser({ ...selected });
      showToast(`切换为住户：${selected.name} (${selected.room}室)`, 'info');
    }
  };

  // 1. Booking slot functionality
  const handleBookSlot = (spaceId: string, timeSlot: string) => {
    setSpaces(prevSpaces => 
      prevSpaces.map(sp => {
        if (sp.id === spaceId) {
          const updatedBookings = sp.bookings.map(b => {
            if (b.timeSlot === timeSlot) {
              if (b.isBooked) {
                // If it was booked by me, allow canceling
                if (b.bookerName === currentUser.name) {
                  showToast(`已取消预约 ${sp.name} (${timeSlot})`);
                  return { ...b, isBooked: false, bookerName: undefined, bookerRoom: undefined };
                }
                return b;
              } else {
                // Check points/booking restrictions if any
                showToast(`成功预约 ${sp.name} (${timeSlot})！`);
                return { 
                  ...b, 
                  isBooked: true, 
                  bookerName: currentUser.name, 
                  bookerRoom: currentUser.room 
                };
              }
            }
            return b;
          });
          return { ...sp, bookings: updatedBookings };
        }
        return sp;
      })
    );
  };

  // Update selected space when state updates
  useEffect(() => {
    if (selectedSpace) {
      const updated = spaces.find(s => s.id === selectedSpace.id);
      if (updated) setSelectedSpace(updated);
    }
  }, [spaces]);

  // 2. Space review submission
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentRating, setNewCommentRating] = useState(5);

  const handleAddSpaceReview = (spaceId: string) => {
    if (!newCommentText.trim()) return;
    setSpaces(prevSpaces =>
      prevSpaces.map(sp => {
        if (sp.id === spaceId) {
          const newReview = {
            rating: newCommentRating,
            comment: newCommentText,
            authorName: currentUser.name,
            authorRoom: currentUser.room,
            date: '刚刚'
          };
          const updatedReviews = [newReview, ...sp.reviews];
          const averageRating = parseFloat(
            ((sp.rating * sp.reviewsCount + newCommentRating) / (sp.reviewsCount + 1)).toFixed(1)
          );
          showToast(`已发表对 ${sp.name} 的评价！`);
          return {
            ...sp,
            reviews: updatedReviews,
            reviewsCount: sp.reviewsCount + 1,
            rating: averageRating
          };
        }
        return sp;
      })
    );
    setNewCommentText('');
  };

  // 3. Register for events
  const ensureEventGroupChat = (eventName: string) => {
    setChatSessions(prev => {
      const exists = prev.some(chat => chat.name === `${eventName}交流群` || chat.name === eventName);
      if (exists) return prev;

      const newGroupChat: ChatSession = {
        id: `chat_event_${Date.now()}`,
        name: `${eventName}交流群`,
        type: 'group',
        avatar: '🧁',
        lastMessage: '系统消息: 你已加入活动，群聊已自动建立。大家一起来聊天吧！',
        lastTime: '刚刚',
        unreadCount: 0,
        subLabel: '活动群聊',
        messages: [
          { id: 'm_init', sender: '系统', content: `欢迎加入【${eventName}】活动群聊！群聊已自动建立，快和大家打个招呼吧。`, time: '刚刚', isMe: false }
        ]
      };
      return [newGroupChat, ...prev];
    });
  };

  const handleStartPrivateChat = (targetName: string, subLabel: string = '邻里私聊') => {
    // Check if chat session already exists
    const existing = chatSessions.find(chat => chat.name === targetName || chat.name.startsWith(targetName));
    if (existing) {
      setSelectedChatSession(existing);
      setActiveTab('chat');
      showToast(`已为您打开与 ${targetName} 的聊天框`, 'info');
      return;
    }

    // Otherwise, create a new private chat session
    const avatarMap: { [key: string]: string } = {
      '小雅': '🌸',
      '阿栋': '☕',
      '小鱼': '🐱',
      '阿杰': '🎨',
      '小琳': '📚',
      '阿华': '💼',
      '小林': '🌿',
      '张阿姨': '👵',
      '阿凯': '🏀',
      '王叔': '👴'
    };
    const avatar = avatarMap[targetName] || '👤';

    const newSession: ChatSession = {
      id: `chat_private_${Date.now()}`,
      name: targetName,
      type: 'private',
      avatar: avatar,
      lastMessage: '系统消息: 私聊已开启，快来发送你的第一条消息吧！',
      lastTime: '刚刚',
      unreadCount: 0,
      subLabel: subLabel,
      messages: [
        { id: `m_init_${Date.now()}`, sender: '系统', content: `您已与【${targetName}】建立私密对话通道，彼此通过搭把手互助积分建立信任。`, time: '刚刚', isMe: false }
      ]
    };

    setChatSessions(prev => [newSession, ...prev]);
    setSelectedChatSession(newSession);
    setActiveTab('chat');
    showToast(`已成功发起与 ${targetName} 的私聊`);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim() || !selectedChatSession) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: currentUser.name,
      content: typedMessage,
      time: '刚刚',
      isMe: true
    };

    const sessionToReply = selectedChatSession.name;
    const sessionType = selectedChatSession.type;

    setChatSessions(prev => prev.map(session => {
      if (session.id === selectedChatSession.id) {
        return {
          ...session,
          lastMessage: typedMessage,
          lastTime: '刚刚',
          messages: [...session.messages, newMessage]
        };
      }
      return session;
    }));

    setTypedMessage('');

    // Trigger auto reply after 1.2 second for premium feel
    setTimeout(() => {
      const replies: { [key: string]: string } = {
        '居委会小张': '好的小雅，我已经收到你的咨询。区里人才办刚刚更新了最新的系统申报指南，建议你可以先在小程序里把个人实名认证和社保缴纳证明关联上，有任何进展我会在私聊或社工服务区第一时间同步给你！加油！',
        '阿杰 (3-308)': '哈哈，收到啦！我今天正好有空，大蒜我已经装好袋了，大概六点半我拿到502给你。顺便期待你做的蔓越莓曲奇饼干呀！',
        '周末烘焙分享群': '阿华: 哇！小雅老师居然亲自建群了，支持支持！我一定会准时参加，顺便带个保温盒！',
        '青年政策与补贴申领窗口': '居委会办事处: 收到您的政策咨询。为了提高办事效率，建议您先登录国家政务平台小程序完成个人社保关联，准备好本科毕业证书照片，周一直接来前台，3分钟即可搞定！'
      };

      const replyContent = replies[sessionToReply] || `好的，${currentUser.name}！搭把手邻居收到你的消息啦。我们社区的小伙伴们都是热心肠，一有空就会回复你。祝你在咱们青年公寓住得开心！🌻`;

      const autoReplyMessage: ChatMessage = {
        id: `msg_reply_${Date.now()}`,
        sender: sessionType === 'group' ? '阿华' : sessionToReply,
        content: replyContent,
        time: '刚刚',
        isMe: false
      };

      setChatSessions(prev => prev.map(session => {
        if (session.id === selectedChatSession.id) {
          return {
            ...session,
            lastMessage: replyContent,
            lastTime: '刚刚',
            messages: [...session.messages, autoReplyMessage]
          };
        }
        return session;
      }));
    }, 1200);
  };

  useEffect(() => {
    if (selectedChatSession) {
      const updated = chatSessions.find(c => c.id === selectedChatSession.id);
      if (updated) setSelectedChatSession(updated);
    }
  }, [chatSessions]);

  const handleRegisterEvent = (eventId: string) => {
    setEvents(prev => 
      prev.map(ev => {
        if (ev.id === eventId) {
          if (ev.joinedByMe) {
            // Cancel registration
            showToast(`已取消报名活动：${ev.name}`);
            return {
              ...ev,
              joinedByMe: false,
              signedUp: ev.signedUp - 1,
              activeMembers: ev.activeMembers.filter(m => !m.includes(currentUser.name))
            };
          } else {
            if (ev.signedUp >= ev.capacity && ev.capacity > 0) {
              showToast('该活动名额已满！', 'info');
              return ev;
            }
            showToast(`成功报名活动：${ev.name}！已为您自动建立群聊。`);
            ensureEventGroupChat(ev.name);
            return {
              ...ev,
              joinedByMe: true,
              signedUp: ev.signedUp + 1,
              activeMembers: [...ev.activeMembers, `${currentUser.room} ${currentUser.name}`]
            };
          }
        }
        return ev;
      })
    );
  };

  // Keep selected event modal synchronized
  useEffect(() => {
    if (selectedEvent) {
      const updated = events.find(e => e.id === selectedEvent.id);
      if (updated) setSelectedEvent(updated);
    }
  }, [events]);

  // 4. Neighborhood Circle Interactions: Like, Comment, Claim/Help
  const handleLikePost = (postId: string) => {
    setFeedItems(prev =>
      prev.map(item => {
        if (item.id === postId) {
          const hasLiked = !item.hasLiked;
          return {
            ...item,
            hasLiked,
            likes: hasLiked ? item.likes + 1 : item.likes - 1
          };
        }
        return item;
      })
    );
  };

  const [feedCommentInput, setFeedCommentInput] = useState<{ [postId: string]: string }>({});

  const handleAddFeedComment = (postId: string) => {
    const commentText = feedCommentInput[postId];
    if (!commentText || !commentText.trim()) return;

    setFeedItems(prev =>
      prev.map(item => {
        if (item.id === postId) {
          const newComment = {
            id: `comment_${Date.now()}`,
            authorName: currentUser.name,
            authorRoom: currentUser.room,
            content: commentText
          };
          return {
            ...item,
            comments: [...item.comments, newComment]
          };
        }
        return item;
      })
    );

    setFeedCommentInput(prev => ({ ...prev, [postId]: '' }));
    showToast('发表评论成功！');
  };

  const handleHelpAction = (postId: string) => {
    setFeedItems(prev =>
      prev.map(item => {
        if (item.id === postId) {
          if (item.actionStatus === 'claimed') {
            showToast('您已经响应了该需求！可在“我的”页面联系邻居。', 'info');
            return item;
          }

          // User helps neighbor: gains points, credit score goes up slightly, adds system comment
          const gainedPoints = item.bountyPoints || 0;
          setCurrentUser(prevUser => ({
            ...prevUser,
            points: prevUser.points + gainedPoints,
            helpCount: prevUser.helpCount + 1,
            creditScore: Math.min(prevUser.creditScore + 1, 100)
          }));

          // Add a systematic confirmation comment
          const sysComment = {
            id: `sys_comment_${Date.now()}`,
            authorName: '系统小助手',
            content: `✨ 邻居 [${currentUser.name}] 响应了该互助请求，正快马加鞭前往帮手！`
          };

          showToast(`恭喜！您接下了 [${item.authorName}] 的需求！帮人玫瑰，手留余香。 ${gainedPoints > 0 ? `+${gainedPoints} 积分` : ''}`);

          // Update Operator Report Stats dynamically
          setWeeklyReport(prevReport => ({
            ...prevReport,
            helpCompleted: prevReport.helpCompleted + 1,
            helpRate: `${Math.round(((prevReport.helpCompleted + 1) / prevReport.helpRequests) * 100)}%`
          }));

          return {
            ...item,
            actionStatus: 'claimed',
            comments: [...item.comments, sysComment]
          };
        }
        return item;
      })
    );
  };

  // 5. Create Dynamic Post
  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newItem: FeedItem = {
      id: `custom_${Date.now()}`,
      type: newPostType,
      category: newPostType === 'help' ? (newPostCategory as any) : undefined,
      authorName: currentUser.name,
      authorRoom: currentUser.room,
      distance: Math.floor(Math.random() * 200) + 10,
      time: '刚刚',
      content: newPostContent,
      likes: 0,
      hasLiked: false,
      comments: [],
      meetingTime: newPostType === 'help' ? newPostMeeting || '今晚或随时商议' : undefined,
      bountyPoints: newPostType === 'help' ? newPostBounty : undefined,
      creditScore: currentUser.creditScore,
      helpCount: currentUser.helpCount,
      actionText: newPostType === 'help' ? (newPostCategory === '闲置' ? '我想要' : '我来帮') : undefined,
      actionStatus: 'idle',
      tags: newPostType === 'moment' ? ['新发布', '日常分享'] : undefined
    };

    setFeedItems([newItem, ...feedItems]);
    setShowCreatePost(false);
    setNewPostContent('');
    setNewPostMeeting('');
    
    // Update dashboard metrics
    setWeeklyReport(prev => ({
      ...prev,
      feedPosts: prev.feedPosts + 1,
      helpRequests: newPostType === 'help' ? prev.helpRequests + 1 : prev.helpRequests
    }));

    showToast('发布成功！快来看看邻里圈里的反馈吧。');
  };

  // 6. Onboarding On-Click Steps
  const completeStep = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps(prev => [...prev, stepNumber]);
      if (stepNumber === 1) {
        showToast('已成功申请加入 3号楼 微信业主群！', 'success');
      } else if (stepNumber === 2) {
        setActiveTab('circle');
        setFeedFilter('互助需求');
        showToast('已跳转至邻里圈！可在顶部的“互助需求”分类查看或发布代取。', 'info');
      } else if (stepNumber === 3) {
        setActiveTab('home');
        setActiveServiceFilter('全部');
        showToast('已为您展示周边服务指南地图！', 'info');
      } else if (stepNumber === 4) {
        setActiveTab('home');
        setActiveServiceFilter('餐饮');
        showToast('已为您过滤小区餐饮推荐！', 'info');
      } else if (stepNumber === 5) {
        setActiveTab('home');
        setActiveSpaceFilter('全部');
        showToast('已为您定位全部社区公共空间！', 'info');
      } else if (stepNumber === 6) {
        showToast('已打开报修反馈单，我们的客服管家小王将在5分钟内回复！', 'success');
      } else if (stepNumber === 7) {
        setActiveTab('circle');
        setFeedFilter('居民动态');
        showToast('快在邻居们的精彩生活分享下点个赞、评个论吧！', 'info');
      }
    }
  };

  // Claim onboarding reward
  const claimOnboardingReward = () => {
    if (completedSteps.length === 8 && !onboardingClaimed) {
      setOnboardingClaimed(true);
      setCurrentUser(prev => ({
        ...prev,
        points: prev.points + 30
      }));
      showToast('🎉 成功解锁本社区！新手大礼包：+30 积分已发放到您的账户。', 'success');
    }
  };

  // Filter items based on global search
  const filteredSpaces = spaces.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.facilities.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeSpaceFilter === '全部' || 
                          (activeSpaceFilter === '健身房' && s.name.includes('健身')) ||
                          (activeSpaceFilter === '活动室' && s.name.includes('活动')) ||
                          (activeSpaceFilter === '书吧' && s.name.includes('书吧')) ||
                          (activeSpaceFilter === '厨房' && s.name.includes('厨房'));
    return matchesSearch && matchesFilter;
  });

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeServiceFilter === '全部' || s.type === activeServiceFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeEventFilter === '全部' || e.type === activeEventFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredFeedItems = feedItems.filter(item => {
    if (feedFilter === '全部') return true;
    if (feedFilter === '互助需求') return item.type === 'help';
    if (feedFilter === '居民动态') return item.type === 'moment';
    if (feedFilter === '小活动召集') return item.type === 'rally';
    if (feedFilter === '话题讨论') return item.type === 'topic';
    return true;
  });

  // Calculate stats on top
  const totalHelpCountToday = feedItems.filter(i => i.type === 'help' && i.actionStatus !== 'claimed').length;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col lg:flex-row font-sans">
      
      {/* LEFT SIDE: Active User Switcher Panel */}
      <div className="w-full lg:w-72 bg-surface p-6 border-b lg:border-b-0 lg:border-r border-hairline flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-jade-light p-2.5 rounded-xl border border-jade/20">
            <Users className="w-6 h-6 text-jade" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-ink font-display">住户视角切换</h2>
            <p className="text-xs text-ink-muted">选择不同角色体验个性化主页</p>
          </div>
        </div>

        <p className="text-xs text-ink-muted bg-canvas p-3 rounded-lg border border-hairline">
          💡 <strong>搭把手</strong> 是社区高度互信、温情互助的核心纽带。切换住户可看其对应房号、信用积分与个性标签，并以其身份参与空间预约、活动报名或发布互助。
        </p>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] lg:max-h-none custom-scrollbar">
          {mockUsers.map(user => {
            const isMe = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                onClick={() => handleUserChange(user.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isMe 
                    ? 'bg-jade-light border-jade text-ink shadow-sm' 
                    : 'bg-surface hover:bg-canvas border-hairline text-ink-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isMe ? 'bg-jade text-white' : 'bg-canvas text-ink-muted'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm text-ink">{user.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-canvas text-ink-muted border border-hairline rounded">
                        {user.room}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted truncate max-w-[120px]">{user.profession}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-0.5 text-[10px] text-amber bg-amber-light px-1.5 py-0.5 rounded border border-amber/20 font-number font-bold">
                    <DabashouCredit className="w-2.5 h-2.5" />
                    <span>信用{user.creditScore}</span>
                  </div>
                  <span className="text-[10px] text-jade font-number font-bold">帮{user.helpCount}次</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER: Simulated WeChat Mini-Program Smartphone View */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-canvas">
        
        {/* Toast Notification Widget */}
        {toast && (
          <div className="fixed top-6 z-50 transform -translate-x-1/2 left-1/2 max-w-sm w-[90%] bg-surface border border-hairline shadow-lg text-ink rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
            <div className={`p-1.5 rounded-lg ${toast.type === 'success' ? 'bg-jade-light text-jade' : 'bg-amber-light text-amber'}`}>
              {toast.type === 'success' ? <Check className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">系统通知</p>
              <p className="text-xs text-ink-muted mt-0.5">{toast.message}</p>
            </div>
          </div>
        )}

        {/* Smartphone Container Mockup */}
        <div id="smartphone-container" className="w-full max-w-[412px] h-[820px] bg-surface rounded-[48px] border-[12px] border-ink shadow-lg overflow-hidden flex flex-col relative">
          
          {/* Top Notch / Camera & Speaker */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-6 w-36 bg-ink rounded-b-2xl z-40 flex items-center justify-center gap-2">
            <div className="w-12 h-1 bg-ink rounded-full"></div>
            <div className="w-2 h-2 bg-ink rounded-full"></div>
          </div>

          {/* Simulated Status Bar */}
          <div className="pt-7 px-6 pb-2 bg-surface text-ink flex justify-between items-center text-xs z-30 select-none border-b border-hairline/30">
            <span className="font-semibold font-number">21:50</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-canvas text-ink-muted border border-hairline px-1.5 py-0.2 rounded font-number font-bold">
                5G
              </span>
              <div className="w-5 h-2.5 border border-hairline rounded-sm p-0.5 flex items-center">
                <div className="bg-jade h-full w-[85%] rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT PORT (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-canvas pb-20 relative pt-2">

            {careMode ? (
              <CareModeView
                currentUser={currentUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                homeSubTab={homeSubTab}
                setHomeSubTab={setHomeSubTab}
                spaces={spaces}
                events={events}
                services={services}
                socialWorkerServices={socialWorkerServices}
                activeSpaceFilter={activeSpaceFilter}
                setActiveSpaceFilter={setActiveSpaceFilter}
                filteredSpaces={filteredSpaces}
                activeEventFilter={activeEventFilter}
                setActiveEventFilter={setActiveEventFilter}
                filteredEvents={filteredEvents}
                activeServiceFilter={activeServiceFilter}
                setActiveServiceFilter={setActiveServiceFilter}
                filteredServices={filteredServices}
                feedFilter={feedFilter}
                setFeedFilter={setFeedFilter}
                filteredFeedItems={filteredFeedItems}
                feedItems={feedItems}
                setFeedItems={setFeedItems}
                handleHelpAction={handleHelpAction}
                setSelectedSpace={setSelectedSpace}
                setSelectedEvent={setSelectedEvent}
                setShowAnnouncementsModal={setShowAnnouncementsModal}
                setShowOnboardingModal={setShowOnboardingModal}
                showToast={showToast}
                triggerToggleCareMode={triggerToggleCareMode}
                handleStartPrivateChat={handleStartPrivateChat}
              />
            ) : (
              <>
                {/* HOME TAB CONTENT */}
                {activeTab === 'home' && (
              <div className="p-4 space-y-5 animate-fade-in">

                {/* Quick Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="输入关键词，搜索空间、活动、周边服务..."
                    className="w-full bg-surface border border-hairline focus:border-jade focus:ring-1 focus:ring-jade rounded-xl pl-9 pr-4 py-2 text-xs text-ink placeholder-ink-subtle outline-none transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-ink-muted hover:text-ink"
                    >
                      清除
                    </button>
                  )}
                </div>

                {/* Announcement Swiper Area */}
                <div 
                  onClick={() => setShowAnnouncementsModal(true)}
                  className="bg-surface border border-hairline hover:border-coral/20 rounded-xl p-3 flex items-start gap-2.5 cursor-pointer transition-colors group animate-fade-in"
                >
                  <div className="bg-coral-hover/10 text-coral px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 shrink-0 flex items-center gap-0.5 border border-coral/20">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    最新公告
                  </div>
                  <div className="flex-1 min-w-0">
                    {announcements.slice(0, 3).map((ann, i) => (
                      <div key={ann.id} className={`${i > 0 ? 'hidden' : 'block'} animate-fade-in`}>
                        <div className="flex justify-between items-center gap-1">
                          <span className="font-semibold text-xs text-ink truncate group-hover:text-jade transition-colors">{ann.title}</span>
                          <span className={`text-[8px] font-medium px-1.5 py-0.2 rounded shrink-0 ${
                            ann.importance.includes('重要') || ann.importance.includes('紧急') 
                              ? 'bg-coral-hover/10 text-coral border border-coral/20' 
                              : 'bg-canvas text-ink-muted border border-hairline'
                          }`}>
                            {ann.importance}
                          </span>
                        </div>
                        <p className="text-[10px] text-ink-muted line-clamp-1 mt-0.5">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Four Core Functional Tabs (Bento-Grid Control Panel) */}
                <div className="grid grid-cols-2 gap-3 animate-fade-in">
                  {[
                    { 
                      key: 'spaces', 
                      label: '公共空间', 
                      desc: '共享自建健身书吧', 
                      icon: '🏠', 
                      activeClass: 'bg-jade text-white border-transparent shadow-md shadow-jade/20 scale-[1.02]',
                      inactiveClass: 'bg-surface border-hairline hover:border-jade/30 text-ink'
                    },
                    { 
                      key: 'events', 
                      label: '本周活动', 
                      desc: '兴趣社交闲置交换', 
                      icon: '🗓️', 
                      activeClass: 'bg-coral text-white border-transparent shadow-md shadow-coral/20 scale-[1.02]',
                      inactiveClass: 'bg-surface border-hairline hover:border-coral/30 text-ink'
                    },
                    { 
                      key: 'services', 
                      label: '周边服务', 
                      desc: '周边服务商户', 
                      icon: '🏪', 
                      activeClass: 'bg-ink text-white border-transparent shadow-md shadow-ink/20 scale-[1.02]',
                      inactiveClass: 'bg-surface border-hairline hover:border-ink/30 text-ink'
                    },
                    { 
                      key: 'social', 
                      label: '社工服务', 
                      desc: '暖心扶助邻里共治', 
                      icon: '🤝', 
                      isCore: true,
                      activeClass: 'bg-amber text-white border-transparent shadow-md shadow-amber/20 scale-[1.02] ring-2 ring-amber/50',
                      inactiveClass: 'bg-amber-light/80 border-amber/30 text-ink ring-1 ring-amber/15 hover:border-amber/50'
                    }
                  ].map(sub => {
                    const isActive = homeSubTab === sub.key;
                    return (
                      <button
                        key={sub.key}
                        onClick={() => setHomeSubTab(sub.key as any)}
                        className={`p-3 rounded-2xl text-left transition-all relative border overflow-hidden flex flex-col justify-between h-24 group cursor-pointer ${
                          isActive ? sub.activeClass : sub.inactiveClass
                        }`}
                      >
                        {/* Background giant icon */}
                        <span className={`absolute right-1.5 bottom-1 text-4xl opacity-10 select-none pointer-events-none group-hover:scale-110 transition-transform ${
                          isActive ? 'text-white' : ''
                        }`}>
                          {sub.icon}
                        </span>

                        {/* Top Line with Icon & Badge */}
                        <div className="flex justify-between items-center w-full">
                          <span className={`text-base p-1.5 rounded-xl ${
                            isActive ? 'bg-white/20 text-white' : 'bg-canvas border border-hairline'
                          }`}>
                            {sub.icon}
                          </span>
                          
                          {sub.isCore && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                              isActive 
                                ? 'bg-white text-amber border border-white' 
                                : 'bg-coral text-white shadow-xs animate-pulse'
                            }`}>
                              核心功能
                            </span>
                          )}
                        </div>

                        {/* Bottom Labels */}
                        <div className="mt-1.5 min-w-0">
                          <span className="block font-bold text-sm tracking-tight">
                            {sub.label}
                          </span>
                          <span className={`block text-[10px] mt-0.5 truncate ${
                            isActive ? 'text-white/80' : 'text-ink-muted'
                          }`}>
                            {sub.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* TAB SUB-FUNCTION RENDER ZONE */}
                {homeSubTab === 'spaces' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
                        <span className="text-lg">🏠</span>
                        公共空间 ({filteredSpaces.length})
                      </h3>
                      <span className="text-[10px] text-ink-muted">住户自建与共享</span>
                    </div>

                    {/* Filter tags */}
                    <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                      {['全部', '健身房', '活动室', '书吧', '厨房'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setActiveSpaceFilter(tag)}
                          className={`text-[9px] px-2 py-0.8 rounded-full border shrink-0 transition-all ${
                            activeSpaceFilter === tag 
                              ? 'bg-jade text-white border-transparent' 
                              : 'bg-surface text-ink-muted border-hairline hover:text-ink hover:bg-canvas'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {filteredSpaces.map(sp => (
                        <button
                          key={sp.id}
                          onClick={() => setSelectedSpace(sp)}
                          className="w-full bg-surface p-3 rounded-xl border border-hairline hover:border-jade/20 text-left transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-xl shadow-xs">
                              {sp.image}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-ink group-hover:text-jade transition-colors">
                                  {sp.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 bg-jade-light text-jade border border-jade/10 rounded font-medium">
                                  {sp.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-ink-muted mt-0.5 flex items-center gap-1">
                                <span>📍 {sp.location}</span>
                                <span>•</span>
                                <span>👥 容纳{sp.capacity}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 pl-2">
                            <div className="flex items-center text-amber font-semibold text-xs gap-0.5">
                              <span>★</span>
                              <span className="font-number">{sp.rating}</span>
                            </div>
                            <span className="text-[9px] text-ink-muted mt-0.5 font-number">{sp.reviewsCount} 评价</span>
                          </div>
                        </button>
                      ))}
                      {filteredSpaces.length === 0 && (
                        <p className="text-center py-6 text-xs text-ink-muted">没有符合筛选的空间</p>
                      )}
                    </div>
                  </div>
                )}

                {homeSubTab === 'events' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
                        <span className="text-lg">🗓️</span>
                        本周活动 ({filteredEvents.length})
                      </h3>
                      <span className="text-[10px] text-ink-muted">发起聚会</span>
                    </div>

                    <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                      {['全部', '兴趣课程', '体育运动', '闲置交换', '宠物社交', '节日活动'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setActiveEventFilter(tag)}
                          className={`text-[9px] px-2 py-0.8 rounded-full border shrink-0 transition-all ${
                            activeEventFilter === tag 
                              ? 'bg-jade text-white border-transparent' 
                              : 'bg-surface text-ink-muted border-hairline hover:text-ink hover:bg-canvas'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {filteredEvents.map(ev => (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className="w-full bg-surface p-3 rounded-xl border border-hairline hover:border-jade/20 text-left transition-all flex items-center justify-between group"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] px-1.5 py-0.2 bg-jade-light text-jade border border-jade/10 rounded font-medium shrink-0">
                                {ev.type}
                              </span>
                              <span className="font-bold text-xs text-ink group-hover:text-jade transition-colors truncate">
                                {ev.name}
                              </span>
                            </div>
                            
                            <p className="text-[9px] text-ink-muted mt-1 truncate">
                              ⏰ {ev.time}
                            </p>
                            <p className="text-[9px] text-ink-muted mt-0.5 truncate">
                              📍 {ev.location} • 发起方: <span className="text-ink font-medium">{ev.organizer}</span>
                            </p>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-number ${
                              ev.signedUp >= ev.capacity ? 'bg-coral-hover/10 text-coral' : 'bg-jade-light text-jade'
                            }`}>
                              {ev.signedUp}/{ev.capacity}人
                            </span>
                            <span className="text-[8px] text-ink-subtle mt-1 font-number">
                              {ev.status}
                            </span>
                          </div>
                        </button>
                      ))}
                      {filteredEvents.length === 0 && (
                        <p className="text-center py-6 text-xs text-ink-muted">没有符合条件的活动</p>
                      )}
                    </div>
                  </div>
                )}

                {homeSubTab === 'services' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
                        <span className="text-lg">🏪</span>
                        周边服务 ({filteredServices.length}家)
                      </h3>
                      <span className="text-[10px] text-ink-muted">住户专属打折推荐</span>
                    </div>

                    <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                      {['全部', '超市便利', '生鲜超市', '快递服务', '药店', '洗衣服务', '餐饮', '理发', '医疗服务', '宠物服务', '生鲜'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setActiveServiceFilter(tag)}
                          className={`text-[9px] px-2 py-0.8 rounded-full border shrink-0 transition-all ${
                            activeServiceFilter === tag 
                              ? 'bg-jade text-white border-transparent' 
                              : 'bg-surface text-ink-muted border-hairline hover:text-ink hover:bg-canvas'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {filteredServices.map(ser => (
                        <button
                          key={ser.id}
                          onClick={() => setSelectedService(ser)}
                          className="bg-surface p-3 rounded-xl border border-hairline hover:border-jade/30 text-left transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-xl">{ser.image}</span>
                              <div className="flex items-center text-amber text-[10px] font-semibold gap-0.5">
                                <span>★</span>
                                <span className="font-number">{ser.rating}</span>
                              </div>
                            </div>
                            
                            <h4 className="font-bold text-xs text-ink group-hover:text-jade mt-2 truncate">
                              {ser.name}
                            </h4>
                            <p className="text-[9px] text-ink-muted mt-0.5 truncate">{ser.location}</p>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-hairline">
                            {ser.hasDiscount ? (
                              <span className="text-[8px] text-coral font-medium bg-coral-hover/10 border border-coral/20 px-1 rounded block truncate">
                                🉐 {ser.discountText || '住户特惠折扣'}
                              </span>
                            ) : (
                              <span className="text-[8px] text-ink-muted block truncate font-number">
                                ⏰ {ser.hours}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                      {filteredServices.length === 0 && (
                        <div className="col-span-2 text-center py-6 text-xs text-ink-muted">没有匹配的服务商户</div>
                      )}
                    </div>
                  </div>
                )}

                {homeSubTab === 'social' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
                        <span className="text-lg">🤝</span>
                        社工服务 ({socialWorkerServices.length})
                      </h3>
                      <span className="text-[10px] text-ink-muted">专业常驻 • 暖心援助</span>
                    </div>

                    <div className="bg-jade-light/50 p-3 rounded-xl border border-jade/15 text-[10px] text-ink-muted leading-relaxed">
                      💡 泊寓青年社区共治中心联合街道社工站，在此特设在线咨询专区。你可以一键联系专业社工，咨询政策补贴、办理事务，或获取心理咨询与就业辅导。
                    </div>

                    <div className="space-y-3">
                      {socialWorkerServices.map(service => (
                        <div 
                          key={service.id}
                          className="bg-surface border border-hairline p-3 rounded-xl space-y-2.5 hover:border-jade/30 transition-all"
                        >
                          <div className="flex justify-between items-start gap-1.5">
                            <div className="flex gap-2 min-w-0">
                              <span className="text-2xl shrink-0 p-1 bg-canvas rounded-lg border border-hairline text-ink">{service.image}</span>
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs text-ink truncate">{service.name}</h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <span className="text-[8px] bg-jade-light text-jade border border-jade/15 px-1.5 py-0.2 rounded">
                                    {service.type}
                                  </span>
                                  <span className="text-[8px] bg-canvas text-ink-muted border border-hairline px-1.5 py-0.2 rounded truncate">
                                    举办方: {service.organizer}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-[8px] bg-jade text-white border border-transparent px-1.5 py-0.2 rounded shrink-0 font-bold">
                              {service.status}
                            </span>
                          </div>

                          <p className="text-[10px] text-ink-muted leading-relaxed">{service.description}</p>

                          <div className="bg-canvas p-2 rounded-lg text-[8px] font-number text-ink-muted space-y-0.5">
                            <p>⏰ 服务时间: <span className="text-ink">{service.hours}</span></p>
                            <p>📞 电话方式: <span className="text-ink">{service.contact}</span></p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => showToast(`正在模拟拨打电话: ${service.contact.split(' ')[0]}`, 'info')}
                              className="py-1.5 bg-canvas hover:bg-hairline text-ink border border-hairline rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all"
                            >
                              <span>📞 电话联系</span>
                            </button>
                            <button
                              onClick={() => handleStartPrivateChat(service.name, '社工专区')}
                              className="py-1.5 bg-jade hover:bg-jade-hover text-white rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all"
                            >
                              <span>💬 在线咨询</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* NEIGHBORHOOD CIRCLE TAB CONTENT */}
            {activeTab === 'circle' && (
              <div className="p-4 space-y-4 animate-fade-in">
                {/* Dynamic Circle Filter bar */}
                <div className="flex gap-1 overflow-x-auto pb-1.5 custom-scrollbar">
                  {['全部', '互助需求', '居民动态', '小活动召集', '话题讨论'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFeedFilter(f)}
                      className={`text-[10px] px-3 py-1 rounded-full border shrink-0 font-medium transition-all ${
                        feedFilter === f 
                          ? 'bg-jade text-white border-transparent shadow-xs' 
                          : 'bg-surface text-ink-muted border-hairline hover:text-ink hover:bg-canvas'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Trigger to Write a Dynamic Post */}
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full bg-jade-light/60 border border-jade/25 hover:border-jade/40 p-3 rounded-2xl flex items-center justify-between text-left transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-jade flex items-center justify-center text-white">
                      <DabashouPublish className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">发布我的互助或动态</p>
                      <p className="text-[10px] text-ink-muted">求代取、拼单凑数、二手置换 or 分享日常</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-muted" />
                </button>

                {/* POST FEED ITEMS */}
                <div className="space-y-4">
                  {filteredFeedItems.map(item => {
                    const isHelp = item.type === 'help';
                    const isTopic = item.type === 'topic';
                    const isRally = item.type === 'rally';
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-2xl border transition-all ${
                          isTopic 
                            ? 'bg-jade-light/40 border border-jade/25 shadow-xs animate-fade-in' 
                            : 'bg-surface border border-hairline hover:border-hairline/80'
                        }`}
                      >
                        {/* Header information */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-canvas border border-hairline flex items-center justify-center font-bold text-xs text-jade">
                              {item.authorName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-ink">{item.authorName}</span>
                                <span className="text-[9px] text-ink-muted font-number font-bold">{item.authorRoom}</span>
                              </div>
                              <p className="text-[9px] text-ink-subtle flex items-center gap-1 font-number">
                                <span>📍 距您 {item.distance}米</span>
                                <span>•</span>
                                <span>{item.time}</span>
                              </p>
                            </div>
                          </div>

                          {/* Category Badge or bounty */}
                          <div className="flex items-center gap-1.5">
                            {isHelp && item.category && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-coral-hover/10 text-coral border border-coral/20 rounded-md font-medium">
                                🤝 {item.category}
                              </span>
                            )}
                            {isRally && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-jade-light text-jade border border-jade/10 rounded-md font-medium">
                                🏸 活动招集
                              </span>
                            )}
                            {item.bountyPoints ? (
                              <span className="text-[9px] px-1.5 py-0.5 bg-amber-light text-amber border border-amber/20 rounded-md font-bold font-number">
                                🪙 {item.bountyPoints}积分
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Body Content */}
                        <div className="mt-3 text-xs text-ink leading-relaxed break-all">
                          {item.content}
                        </div>

                        {/* Attached Image/Icon Representation */}
                        {item.image && (
                          <div className="mt-3 p-4 bg-canvas rounded-xl border border-hairline flex items-center justify-center text-4xl select-none">
                            {item.image}
                          </div>
                        )}

                        {/* Event specific details if help / rally */}
                        {(isHelp || isRally) && item.meetingTime && (
                          <div className="mt-3 bg-canvas p-2.5 rounded-xl border border-hairline space-y-1">
                            {isHelp && (
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-ink-muted">🕒 截止时间:</span>
                                <span className="text-jade font-medium truncate max-w-[200px]">{item.meetingTime}</span>
                              </div>
                            )}
                            {isRally && (
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-ink-muted">🏸 集合时间:</span>
                                <span className="text-jade font-medium truncate max-w-[200px]">{item.meetingTime}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-[10px] pt-1 border-t border-hairline">
                              <span className="text-ink-muted">🛡️ 邻里信任分:</span>
                              <span className="text-jade font-number font-bold">★ {item.creditScore || 90}</span>
                            </div>
                          </div>
                        )}

                        {/* Action buttons (Like, Help, Comments Count) */}
                        <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
                          <div className="flex items-center gap-4 text-ink-muted">
                            <button 
                              onClick={() => handleLikePost(item.id)}
                              className={`flex items-center gap-1 hover:text-coral transition-colors ${item.hasLiked ? 'text-coral' : ''}`}
                            >
                              <Heart className={`w-4 h-4 ${item.hasLiked ? 'fill-coral text-coral' : ''}`} />
                              <span className="text-xs font-number">{item.likes}</span>
                            </button>
                            <span className="flex items-center gap-1 text-xs">
                              <MessageSquare className="w-4 h-4 text-ink-muted" />
                              <span className="font-number">{item.comments.length}</span>
                            </span>
                          </div>

                          {/* Quick Interactive Button */}
                          {item.actionText && (
                            <button
                              onClick={() => {
                                if (isHelp) handleHelpAction(item.id);
                                if (isRally) {
                                  // Enroll simulation for rally
                                  if (item.actionStatus === 'claimed') {
                                    showToast('您已退出该小活动召集');
                                    setFeedItems(prev => prev.map(f => f.id === item.id ? { ...f, actionStatus: 'idle', likes: f.likes - 1 } : f));
                                  } else {
                                    showToast('成功报名该小活动！快去准备出发吧！');
                                    setFeedItems(prev => prev.map(f => f.id === item.id ? { ...f, actionStatus: 'claimed', likes: f.likes + 1 } : f));
                                  }
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 ${
                                item.actionStatus === 'claimed'
                                  ? 'bg-canvas text-ink-muted border border-hairline cursor-not-allowed'
                                  : 'bg-jade hover:bg-jade-hover text-white active:scale-95 shadow-sm'
                              }`}
                            >
                              {item.actionStatus === 'claimed' ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>已承接/加入</span>
                                </>
                              ) : (
                                <span>{item.actionText}</span>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Embedded Comments Thread */}
                        {item.comments.length > 0 && (
                          <div className="mt-3 bg-canvas p-2.5 rounded-xl border border-hairline space-y-2 text-[11px]">
                            {item.comments.map(comment => (
                              <div key={comment.id} className="text-ink-muted">
                                <span className="font-bold text-ink">
                                  {comment.authorName} 
                                  {comment.authorRoom ? ` (${comment.authorRoom})` : ''}: 
                                </span>{' '}
                                {comment.content}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment input box */}
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="写下你的想法，给邻居捎句话..."
                            value={feedCommentInput[item.id] || ''}
                            onChange={(e) => setFeedCommentInput(prev => ({ ...prev, [item.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddFeedComment(item.id);
                            }}
                            className="flex-1 bg-canvas border border-hairline hover:border-jade/30 rounded-lg text-[10px] px-2.5 py-1 text-ink placeholder-ink-muted outline-none focus:border-jade transition-colors"
                          />
                          <button
                            onClick={() => handleAddFeedComment(item.id)}
                            className="bg-canvas border border-hairline text-ink-muted hover:bg-jade-light hover:text-jade p-1.5 rounded-lg transition-colors shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* MY CHAT TAB CONTENT */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full bg-canvas text-ink animate-fade-in">
                {selectedChatSession ? (
                  /* ACTIVE CHAT SESSION VIEW */
                  <div className="flex-1 flex flex-col h-full bg-canvas">
                    {/* Header */}
                    <div className="px-4 py-3 bg-surface border-b border-hairline flex items-center justify-between sticky top-0 z-10">
                      <button 
                        onClick={() => setSelectedChatSession(null)}
                        className="text-ink-muted hover:text-ink flex items-center gap-1 text-xs font-bold"
                      >
                        <span>← 返回</span>
                      </button>
                      <div className="text-center">
                        <h3 className="font-bold text-xs text-ink flex items-center justify-center gap-1">
                          <span>{selectedChatSession.avatar}</span>
                          <span>{selectedChatSession.name}</span>
                        </h3>
                        <p className="text-[9px] text-ink-subtle font-number font-bold">{selectedChatSession.subLabel}</p>
                      </div>
                      <div className="w-8"></div> {/* Spacer */}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col">
                      {selectedChatSession.messages.map((msg, i) => {
                        const isSystem = msg.sender === '系统';
                        if (isSystem) {
                          return (
                            <div key={msg.id || i} className="text-center my-2 animate-fade-in">
                              <span className="inline-block bg-canvas text-ink-muted text-[9px] px-3 py-1 rounded-lg border border-hairline font-number font-bold">
                                📢 {msg.content}
                              </span>
                            </div>
                          );
                        }

                        const isMe = msg.isMe;
                        return (
                          <div 
                            key={msg.id || i} 
                            className={`flex gap-2 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
                          >
                            <div className="w-7 h-7 rounded-full bg-canvas border border-hairline flex items-center justify-center text-xs shrink-0 select-none font-bold">
                              {isMe ? currentUser.name.charAt(0) : selectedChatSession.avatar}
                            </div>
                            <div className="space-y-0.5">
                              <div className={`text-[9px] text-ink-subtle ${isMe ? 'text-right' : 'text-left'} font-number`}>
                                {isMe ? '我' : msg.sender} • {msg.time}
                              </div>
                              <div className={`p-2.5 rounded-2xl text-xs break-all shadow-xs ${
                                isMe 
                                  ? 'bg-jade text-white rounded-tr-none' 
                                  : 'bg-surface text-ink border border-hairline rounded-tl-none'
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input message box */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="p-3 bg-surface border-t border-hairline flex gap-2"
                    >
                      <input
                        type="text"
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        placeholder="想对邻友说点什么..."
                        className="flex-1 bg-canvas border border-hairline hover:border-jade/30 focus:border-jade rounded-xl px-3 py-2 text-xs text-ink placeholder-ink-muted outline-none transition-colors"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-jade hover:bg-jade-hover text-white p-2.5 rounded-xl transition-colors shrink-0 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  /* CHAT SESSIONS LIST VIEW */
                  <div className="p-4 space-y-4 animate-fade-in flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-jade" />
                        我的消息列表 ({chatSessions.length})
                      </h3>
                      <span className="text-[10px] text-ink-muted">实时沟通 • 互助信任</span>
                    </div>

                    <div className="space-y-2">
                      {chatSessions.map(session => (
                        <button
                          key={session.id}
                          onClick={() => setSelectedChatSession(session)}
                          className="w-full bg-surface hover:bg-canvas p-3 rounded-xl border border-hairline hover:border-jade/30 text-left transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-xl shadow-xs shrink-0">
                              {session.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-ink group-hover:text-jade transition-colors">
                                  {session.name}
                                </span>
                                <span className="text-[8px] bg-canvas border border-hairline text-ink-muted px-1.5 py-0.2 rounded font-medium">
                                  {session.subLabel}
                                </span>
                              </div>
                              <p className="text-[10px] text-ink-muted mt-1 truncate max-w-[200px]">
                                {session.lastMessage}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 pl-2">
                            <span className="text-[9px] text-ink-subtle font-number">{session.lastTime}</span>
                            {session.unreadCount > 0 && (
                              <span className="w-4 h-4 rounded-full bg-coral text-white font-bold text-[9px] flex items-center justify-center mt-1 shadow-xs font-number">
                                {session.unreadCount}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                      {chatSessions.length === 0 && (
                        <div className="text-center py-12 space-y-2">
                          <p className="text-xl">💬</p>
                          <p className="text-xs text-ink-muted">暂无聊天会话</p>
                          <p className="text-[10px] text-ink-subtle">加入社区活动或在邻里圈点击私聊，即可开始私信！</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MY ACCOUNT PROFILE TAB */}
            {activeTab === 'me' && (
              <div className="p-4 space-y-4 animate-fade-in">
                
                {/* Profile header block */}
                <div className="bg-jade-light/40 p-4 rounded-2xl border border-jade/25 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-jade flex items-center justify-center font-bold text-lg text-white shadow-sm">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-ink">{currentUser.name}</h3>
                        <span className="text-[10px] bg-canvas text-jade border border-jade/10 px-2 py-0.2 rounded font-number font-bold">
                          {currentUser.room} 室
                        </span>
                      </div>
                      <p className="text-[10px] text-ink-muted mt-0.5">{currentUser.profession}</p>
                    </div>
                  </div>

                  {/* Multi stats block */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="bg-surface p-2 rounded-xl border border-hairline">
                      <span className="block text-[10px] text-ink-subtle font-medium flex items-center justify-center gap-1">
                        <DabashouCredit className="w-3.5 h-3.5 text-jade shrink-0" />
                        信用评分
                      </span>
                      <span className="text-sm font-bold text-jade font-number mt-1 block">
                        {currentUser.creditScore} <span className="text-[8px] font-normal text-ink-muted">分</span>
                      </span>
                    </div>
                    <div className="bg-surface p-2 rounded-xl border border-hairline">
                      <span className="block text-[10px] text-ink-subtle font-medium flex items-center justify-center gap-1">
                        <DabashouPoints className="w-3.5 h-3.5 text-amber shrink-0" />
                        当前积分
                      </span>
                      <span className="text-sm font-bold text-amber font-number mt-1 block">
                        {currentUser.points} <span className="text-[8px] font-normal text-ink-muted">分</span>
                      </span>
                    </div>
                    <div className="bg-surface p-2 rounded-xl border border-hairline">
                      <span className="block text-[10px] text-ink-subtle font-medium flex items-center justify-center gap-1">
                        <DabashouPublish className="w-3.5 h-3.5 text-coral shrink-0" />
                        累计帮扶
                      </span>
                      <span className="text-sm font-bold text-coral font-number mt-1 block">
                        {currentUser.helpCount} <span className="text-[8px] font-normal text-ink-muted">次</span>
                      </span>
                    </div>
                  </div>

                  {/* Personal Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {currentUser.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-2 py-0.5 bg-canvas text-ink-muted rounded-md border border-hairline">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* 关怀版一键切换按钮 */}
                  <div className="mt-4 pt-4 border-t border-hairline">
                    <button
                      type="button"
                      onClick={() => triggerToggleCareMode(true)}
                      className="w-full py-3 bg-jade/10 hover:bg-jade/15 border border-jade/30 text-jade rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      <span>🌺 一键切换至：关怀版（适老化版本）</span>
                    </button>
                  </div>
                </div>

                {/* Achievements List */}
                <div className="bg-surface p-4 rounded-xl border border-hairline space-y-2.5">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <DabashouBadge className="w-4 h-4 text-jade" />
                    🏅 我的社区勋章
                  </h4>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    {currentUser.badges?.map((badge, i) => (
                      <div key={badge} className="p-2 bg-canvas rounded-xl border border-hairline flex flex-col items-center justify-center gap-1">
                        <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                        <span className="text-[9px] text-ink font-medium truncate w-full">{badge}</span>
                      </div>
                    )) || (
                      <p className="text-[10px] text-ink-muted col-span-3">尚未获得勋章</p>
                    )}
                  </div>
                </div>

                {/* Account info items */}
                <div className="bg-surface rounded-xl border border-hairline divide-y divide-hairline text-xs">
                  <div className="p-3 flex justify-between items-center text-ink">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-jade" />
                      已经入驻社区
                    </span>
                    <span className="font-number font-bold text-ink-muted">{currentUser.joinedDays || 120} 天</span>
                  </div>
                  <div className="p-3 flex justify-between items-center text-ink">
                    <span className="flex items-center gap-1.5">
                      <DabashouCredit className="w-4 h-4 text-jade" />
                      当前活跃频率
                    </span>
                    <span className="font-medium text-ink-muted">{currentUser.frequency || '每日'}</span>
                  </div>
                </div>

                {/* History actions list (Mock dynamically based on feeds) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-ink">📋 我的近期社区动态</h4>
                  <div className="space-y-2">
                    {feedItems.filter(f => f.authorName === currentUser.name).slice(0, 3).map(item => (
                      <div key={item.id} className="p-3 bg-surface rounded-xl border border-hairline text-xs flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] text-ink-subtle font-number font-bold">
                            {item.type === 'help' ? '🤝 互助求助' : '日常分享'} • {item.time}
                          </p>
                          <p className="text-ink truncate mt-1">{item.content}</p>
                        </div>
                        <span className="text-[10px] text-ink-muted shrink-0 font-number">
                          ❤️ {item.likes}
                        </span>
                      </div>
                    ))}
                    {feedItems.filter(f => f.authorName === currentUser.name).length === 0 && (
                      <p className="text-center py-6 text-[10px] text-ink-muted bg-canvas rounded-xl border border-hairline">
                        暂无发布记录，快去邻里圈发一条吧
                      </p>
                    )}
                  </div>
                </div>

              </div>
            )}

              </>
            )}

          </div>

          {/* SIMULATED BOTTOM TAB BAR */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-surface border-t border-hairline flex justify-around items-center px-2 z-40 shadow-md">
            <button
              onClick={() => { setActiveTab('home'); setSearchQuery(''); }}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'home' ? 'text-jade scale-105 font-bold' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <DabashouMap className="w-5 h-5" />
              <span className="text-[9px] font-medium">社区地图</span>
            </button>

            <button
              onClick={() => setActiveTab('circle')}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'circle' ? 'text-jade scale-105 font-bold' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <DabashouCircle className="w-5 h-5" />
              <span className="text-[9px] font-medium">邻里圈</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-1 transition-all relative ${
                activeTab === 'chat' ? 'text-jade scale-105 font-bold' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {chatSessions.some(c => c.unreadCount > 0) && (
                <span className="absolute top-0 right-1.5 w-1.5 h-1.5 rounded-full bg-coral animate-ping"></span>
              )}
              <MessageSquare className="w-5 h-5" />
              <span className="text-[9px] font-medium">我的聊天</span>
            </button>

            <button
              onClick={() => setActiveTab('me')}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'me' ? 'text-jade scale-105 font-bold' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <DabashouMe className="w-5 h-5" />
              <span className="text-[9px] font-medium">我的</span>
            </button>
          </div>

          {/* OVERLAY MODAL: 1. SPACE DETAILS (BOOKING & REVIEWS) */}
          {selectedSpace && (
            <div className="absolute inset-0 bg-ink/75 z-50 animate-fade-in flex flex-col justify-end">
              <div className="bg-canvas border-t border-hairline rounded-t-[32px] max-h-[85%] overflow-y-auto custom-scrollbar flex flex-col">
                
                {/* Header image placeholder */}
                <div className="p-6 bg-jade-light/40 flex justify-between items-start border-b border-hairline sticky top-0 z-10 backdrop-blur-md bg-opacity-95">
                  <div>
                    <span className="text-3xl">{selectedSpace.image}</span>
                    <h2 className="font-bold text-base text-ink mt-1">{selectedSpace.name}</h2>
                    <p className="text-[10px] text-ink-muted mt-1 font-number">⭐ {selectedSpace.rating}分 • 已有{selectedSpace.reviewsCount}人评价</p>
                  </div>
                  <button 
                    onClick={() => setSelectedSpace(null)}
                    className="w-8 h-8 rounded-full bg-surface hover:bg-canvas text-ink flex items-center justify-center font-bold text-sm border border-hairline shadow-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 space-y-4 text-xs">
                  
                  {/* Space stats & details list */}
                  <div className="space-y-2 bg-surface p-3.5 rounded-xl border border-hairline">
                    <p className="text-ink"><strong className="text-jade">📍 物理位置:</strong> {selectedSpace.location}</p>
                    <p className="text-ink"><strong className="text-jade">🕐 开放时间:</strong> {selectedSpace.time}</p>
                    <p className="text-ink"><strong className="text-jade">👥 容纳人数:</strong> {selectedSpace.capacity}</p>
                    <p className="text-ink"><strong className="text-jade">💰 预约费用:</strong> 住户完全免费</p>
                    <p className="text-ink"><strong className="text-jade">🔗 预约规则:</strong> {selectedSpace.bookingMethod}</p>
                  </div>

                  {/* Intro */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-ink">📝 空间描述</h4>
                    <p className="text-ink-muted leading-relaxed text-[11px]">{selectedSpace.description}</p>
                  </div>

                  {/* Facilities list */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-ink">🛠️ 配套设施 ({selectedSpace.facilities.length}项)</h4>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      {selectedSpace.facilities.map(fac => (
                        <span key={fac} className="bg-surface p-2 border border-hairline text-ink-muted rounded-lg">
                          • {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notices and warnings */}
                  <div className="space-y-1.5 bg-jade-light/30 border border-jade/10 rounded-xl p-3">
                    <h4 className="font-bold text-jade flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      预约使用须知
                    </h4>
                    <ul className="space-y-1 text-[10px] text-ink-muted">
                      {selectedSpace.notices.map((no, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span>{i+1}.</span>
                          <span>{no}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bookings slot grid (if bookingMethod mentions booking) */}
                  {selectedSpace.bookings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-ink">📅 本周预约情况 (本周五)</h4>
                      <div className="grid grid-cols-2 gap-1.5">
                        {selectedSpace.bookings.map(book => {
                          const isBookedByMe = book.isBooked && book.bookerName === currentUser.name;
                          return (
                            <button
                              key={book.timeSlot}
                              onClick={() => handleBookSlot(selectedSpace.id, book.timeSlot)}
                              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-14 ${
                                book.isBooked 
                                  ? isBookedByMe 
                                    ? 'bg-jade border-jade text-white' 
                                    : 'bg-canvas border-hairline text-ink-subtle cursor-not-allowed'
                                  : 'bg-surface hover:bg-canvas border-hairline text-ink hover:border-jade/30'
                              }`}
                              disabled={book.isBooked && !isBookedByMe}
                            >
                              <span className="text-[9px] font-number block">{book.timeSlot}</span>
                              <div className="flex justify-between items-center w-full mt-1">
                                <span className="text-[10px] font-bold">
                                  {book.isBooked ? (isBookedByMe ? '已预定 (我)' : `${book.bookerName}`) : '可预约'}
                                </span>
                                {book.isBooked ? (
                                  isBookedByMe ? (
                                    <span className="text-[8px] bg-white/20 text-white px-1 rounded">点击取消</span>
                                  ) : (
                                    <span className="text-[8px] bg-canvas text-ink-subtle px-1 rounded">{book.bookerRoom}</span>
                                  )
                                ) : (
                                  <span className="text-[8px] text-jade">点击预定</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* User Reviews */}
                  <div className="space-y-3 pt-3 border-t border-hairline">
                    <h4 className="font-bold text-ink flex justify-between items-center">
                      <span>👤 住户评价 ({selectedSpace.reviews.length})</span>
                      <span className="text-[10px] text-ink-muted">温和友好评分</span>
                    </h4>

                    {/* Review submit form */}
                    <div className="bg-surface p-3 rounded-xl border border-hairline space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-ink-muted">为此公共空间打分:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(num => (
                            <button
                              key={num}
                              onClick={() => setNewCommentRating(num)}
                              className={`text-sm ${num <= newCommentRating ? 'text-amber' : 'text-ink-subtle'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="谈谈你的使用体验，如卫生、插座好用度..."
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="flex-1 bg-canvas border border-hairline rounded-lg text-[10px] px-2 py-1 text-ink placeholder-ink-muted outline-none focus:border-jade"
                        />
                        <button
                          onClick={() => handleAddSpaceReview(selectedSpace.id)}
                          className="bg-jade hover:bg-jade-hover text-white text-[10px] px-3 rounded-lg font-medium transition-colors shadow-xs"
                        >
                          提交
                        </button>
                      </div>
                    </div>

                    {/* Review threads */}
                    <div className="space-y-2">
                      {selectedSpace.reviews.map((rev, i) => (
                        <div key={i} className="p-3 bg-canvas rounded-xl border border-hairline">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-ink">{rev.authorName} <span className="text-ink-subtle font-normal">{rev.authorRoom}</span></span>
                            <span className="text-ink-subtle font-number">{rev.date}</span>
                          </div>
                          <div className="flex text-amber text-[8px] my-1">
                            {Array.from({ length: rev.rating }).map((_, idx) => (
                              <span key={idx}>★</span>
                            ))}
                          </div>
                          <p className="text-ink-muted text-[10px] leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}
                      {selectedSpace.reviews.length === 0 && (
                        <p className="text-center text-ink-subtle py-3 text-[10px]">暂无居民评价，来做第一个反馈者吧</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer submit action */}
                <div className="p-4 bg-surface border-t border-hairline sticky bottom-0 flex justify-between items-center">
                  <div className="text-[10px] text-ink-muted">住户守则：预约请准时，改期请提前取消。</div>
                  <button 
                    onClick={() => {
                      showToast('预约通道已完全开启，可以直接在上方时间格子选择预约。');
                    }}
                    className="bg-jade hover:bg-jade-hover text-white px-5 py-2 rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all"
                  >
                    立即预约空间
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* OVERLAY MODAL: 2. SERVICE DETAILS */}
          {selectedService && (
            <div className="absolute inset-0 bg-ink/75 z-50 animate-fade-in flex flex-col justify-end">
              <div className="bg-canvas border-t border-hairline rounded-t-[32px] max-h-[80%] overflow-y-auto custom-scrollbar flex flex-col">
                
                <div className="p-6 bg-jade-light/40 flex justify-between items-start border-b border-hairline sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-surface p-2 rounded-xl border border-hairline">{selectedService.image}</span>
                    <div>
                      <h2 className="font-bold text-base text-ink">{selectedService.name}</h2>
                      <p className="text-[10px] text-ink-muted mt-0.5 font-number">🏷️ {selectedService.type} • ⭐ {selectedService.rating}分</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedService(null)}
                    className="w-8 h-8 rounded-full bg-surface hover:bg-canvas text-ink flex items-center justify-center font-bold text-sm border border-hairline shadow-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 space-y-4 text-xs">
                  
                  {/* Stats list */}
                  <div className="space-y-2 bg-surface p-3.5 rounded-xl border border-hairline">
                    <p className="text-ink"><strong>📍 物理位置:</strong> {selectedService.location}</p>
                    <p className="text-ink"><strong>🕐 营业时间:</strong> {selectedService.hours}</p>
                    <p className="text-ink"><strong>📞 咨询电话:</strong> <span className="font-number text-jade font-bold">{selectedService.phone}</span></p>
                    <p className="text-ink"><strong>⭐ 居民评分:</strong> {selectedService.rating} 分 (优秀商户)</p>
                  </div>

                  {/* Discount special offer */}
                  {selectedService.hasDiscount && (
                    <div className="bg-coral-light/20 border border-coral/20 p-4 rounded-xl space-y-1">
                      <h4 className="font-bold text-coral flex items-center gap-1">
                        <Gift className="w-4 h-4" />
                        住户专享尊享特权
                      </h4>
                      <p className="text-xs text-ink font-medium leading-relaxed mt-1">
                        {selectedService.discountText}
                      </p>
                      <p className="text-[9px] text-ink-subtle mt-1">
                        * 使用时请向店员出示本小程序认证页面。
                      </p>
                    </div>
                  )}

                  {/* Resident reviews list */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-ink">👍 真实住户口碑推荐</h4>
                    <div className="space-y-2 text-[11px] text-ink-muted leading-relaxed">
                      {selectedService.reviews.map((rev, i) => (
                        <div key={i} className="p-2.5 bg-surface rounded-xl border border-hairline flex items-start gap-2">
                          <span className="text-jade font-bold">“</span>
                          <p className="text-ink">{rev}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlight tags */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-ink">特色体验标签</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedService.tags.map(t => (
                        <span key={t} className="bg-canvas px-2 py-1 border border-hairline rounded-md text-[10px] text-ink-muted">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="p-4 bg-surface border-t border-hairline flex gap-2">
                  <button 
                    onClick={() => showToast(`收藏 ${selectedService.name} 成功！可在“我的”快捷调用。`)}
                    className="flex-1 py-2.5 bg-canvas hover:bg-surface text-ink-muted border border-hairline rounded-xl font-bold text-xs"
                  >
                    👍 收藏商户
                  </button>
                  <button 
                    onClick={() => showToast(`正在拨打电话: ${selectedService.phone}...`)}
                    className="flex-1 py-2.5 bg-jade hover:bg-jade-hover text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>一键打电话</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* OVERLAY MODAL: 3. EVENT DETAILS */}
          {selectedEvent && (
            <div className="absolute inset-0 bg-ink/75 z-50 animate-fade-in flex flex-col justify-end">
              <div className="bg-canvas border-t border-hairline rounded-t-[32px] max-h-[85%] overflow-y-auto custom-scrollbar flex flex-col">
                
                <div className="p-6 bg-jade-light/40 flex justify-between items-start border-b border-hairline sticky top-0 z-10">
                  <div>
                    <span className="text-[10px] bg-canvas text-jade border border-jade/15 px-2 py-0.2 rounded-md font-number font-bold">
                      {selectedEvent.type}
                    </span>
                    <h2 className="font-bold text-base text-ink mt-1.5">{selectedEvent.name}</h2>
                    <p className="text-[10px] text-ink-muted mt-1 font-number">🕒 {selectedEvent.time}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="w-8 h-8 rounded-full bg-surface hover:bg-canvas text-ink flex items-center justify-center font-bold text-sm border border-hairline shadow-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 space-y-4 text-xs">
                  
                  {/* Stats card */}
                  <div className="space-y-2 bg-surface p-3.5 rounded-xl border border-hairline">
                    <p className="text-ink"><strong>📍 集合地点:</strong> {selectedEvent.location}</p>
                    <p className="text-ink"><strong>👤 活动发起方:</strong> {selectedEvent.organizer}</p>
                    <p className="text-ink"><strong>💰 材料/拼费:</strong> <span className="font-semibold text-jade">{selectedEvent.fee}</span></p>
                    <p className="text-ink"><strong>👥 报名限额:</strong> 当前 {selectedEvent.signedUp} 人 / 限额 {selectedEvent.capacity} 人</p>
                  </div>

                  {/* Intro */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-ink">📝 详细内容介绍</h4>
                    <p className="text-ink-muted leading-relaxed text-[11px] bg-canvas p-3 rounded-xl border border-hairline">
                      {selectedEvent.introduction}
                    </p>
                  </div>

                  {/* Registered Neighbors List */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-ink">👥 已报名邻居名单 ({selectedEvent.activeMembers.length}人)</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEvent.activeMembers.map(member => (
                        <span 
                          key={member} 
                          className={`text-[10px] px-2.5 py-1 rounded-full border ${
                            member.includes(currentUser.name)
                              ? 'bg-jade text-white border-jade font-bold'
                              : 'bg-canvas text-ink-muted border border-hairline'
                          }`}
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="p-4 bg-surface border-t border-hairline flex gap-2 items-center justify-between">
                  <div className="text-[10px] text-ink-muted">
                    * 居民自发性活动，安全第一，互助同乐。
                  </div>
                  <button 
                    onClick={() => handleRegisterEvent(selectedEvent.id)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 ${
                      selectedEvent.joinedByMe
                        ? 'bg-canvas text-ink-muted border border-hairline hover:bg-surface'
                        : selectedEvent.signedUp >= selectedEvent.capacity
                          ? 'bg-canvas text-ink-subtle border border-hairline cursor-not-allowed'
                          : 'bg-jade hover:bg-jade-hover text-white'
                    }`}
                  >
                    {selectedEvent.joinedByMe ? '✕ 取消报名' : selectedEvent.signedUp >= selectedEvent.capacity ? '名额已满' : '✅ 立即报名活动'}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* OVERLAY MODAL: 4. CREATE NEW POST / REQUIREMENT FORM */}
          {showCreatePost && (
            <div className="absolute inset-0 bg-ink/75 z-50 animate-fade-in flex flex-col justify-end">
              <div className="bg-canvas border-t border-hairline rounded-t-[32px] max-h-[90%] overflow-y-auto custom-scrollbar flex flex-col">
                
                <div className="p-6 bg-jade-light/40 flex justify-between items-start border-b border-hairline sticky top-0 z-10">
                  <div>
                    <h2 className="font-bold text-base text-ink">✍️ 发布邻里圈动态</h2>
                    <p className="text-[10px] text-ink-muted mt-0.5">将以您的当前住户角色: [ {currentUser.name} {currentUser.room} ] 署名发布</p>
                  </div>
                  <button 
                    onClick={() => setShowCreatePost(false)}
                    className="w-8 h-8 rounded-full bg-surface hover:bg-canvas text-ink flex items-center justify-center font-bold text-sm border border-hairline shadow-xs"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreatePostSubmit} className="p-4 space-y-4 text-xs">
                  
                  {/* Type toggler */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-ink-muted font-bold uppercase tracking-wider">选择发布内容类型</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewPostType('help')}
                        className={`py-2 rounded-xl font-bold border transition-all text-center ${
                          newPostType === 'help' 
                            ? 'bg-jade text-white border-jade shadow-xs' 
                            : 'bg-surface text-ink-muted border border-hairline hover:text-ink'
                        }`}
                      >
                        🤝 互助求助 (悬赏积分)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPostType('moment')}
                        className={`py-2 rounded-xl font-bold border transition-all text-center ${
                          newPostType === 'moment' 
                            ? 'bg-jade text-white border-jade shadow-xs' 
                            : 'bg-surface text-ink-muted border border-hairline hover:text-ink'
                        }`}
                      >
                        📸 居民动态 (日常分享)
                      </button>
                    </div>
                  </div>

                  {/* Category toggle (if help) */}
                  {newPostType === 'help' && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-ink-muted font-bold uppercase tracking-wider">选择互助子分类</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['拼单', '代取', '照看', '闲置', '交换'].map(cat => (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setNewPostCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                              newPostCategory === cat 
                                ? 'bg-jade-light text-jade border-jade/30 font-bold' 
                                : 'bg-surface text-ink-muted border border-hairline hover:text-ink'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bounty Points (if help) */}
                  {newPostType === 'help' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">悬赏积分悬赏 (您目前拥有: {currentUser.points}分)</label>
                        <span className="font-number font-bold text-amber text-sm">{newPostBounty} 积分</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={newPostBounty}
                        onChange={(e) => setNewPostBounty(parseInt(e.target.value))}
                        className="w-full accent-jade"
                      />
                      <p className="text-[9px] text-ink-subtle">
                        * 对方响应并完成互助后，您的积分将 safe 托管并转移至对方。
                      </p>
                    </div>
                  )}

                  {/* Body input text */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-ink-muted font-bold uppercase tracking-wider">发布内容描述</label>
                    <textarea
                      rows={4}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={
                        newPostType === 'help'
                          ? '例: 顺丰重件在东门，有没有人下班开车能帮忙捎一趟到2号楼？提供5积分。'
                          : '例: 在顶楼花园拍到了极光般的夜色！快看！'
                      }
                      className="w-full bg-surface border border-hairline hover:border-jade/30 focus:border-jade rounded-xl p-3 text-xs text-ink placeholder-ink-muted outline-none transition-all resize-none"
                      required
                    />
                  </div>

                  {/* Meeting deadline time (if help) */}
                  {newPostType === 'help' && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-ink-muted font-bold uppercase tracking-wider">期限/要求完成时段</label>
                      <input
                        type="text"
                        value={newPostMeeting}
                        onChange={(e) => setNewPostMeeting(e.target.value)}
                        placeholder="例: 今晚19:00前 或 随时可商议"
                        className="w-full bg-surface border border-hairline hover:border-jade/30 focus:border-jade rounded-xl px-3 py-2 text-xs text-ink placeholder-ink-muted outline-none transition-all"
                      />
                    </div>
                  )}

                  {/* Agreement */}
                  <p className="text-[9px] text-ink-subtle leading-relaxed">
                    * 请发布真实、友善的动态。如涉及不实交易或攻击邻居言论，居委会与楼栋管家小王将有权下架，并扣除您的信用分。
                  </p>

                  {/* Submit action */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-jade hover:bg-jade-hover text-white font-bold text-xs rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1"
                    >
                      <span>确认发布到邻里圈</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </form>

              </div>
            </div>
          )}

          {/* OVERLAY MODAL: ONBOARDING EXPLORE GUIDE (8 STEPS) */}
          {showOnboardingModal && (
            <div className="absolute inset-0 bg-ink/75 z-50 animate-fade-in flex flex-col justify-end">
              <div className="bg-canvas border-t border-hairline rounded-t-[32px] h-[85%] overflow-y-auto custom-scrollbar flex flex-col animate-slide-up">
                
                <div className="p-6 bg-jade-light/40 flex justify-between items-start border-b border-hairline sticky top-0 z-10">
                  <div>
                    <h2 className="font-bold text-base text-ink flex items-center gap-2">
                      <span>🎯</span>
                      <span>新人专属探索指南</span>
                    </h2>
                    <p className="text-[10px] text-ink-muted mt-1">
                      探索青年互信社区，完成 8 个趣味探索步骤，立得 30 积分新手礼！
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowOnboardingModal(false)}
                    className="w-8 h-8 rounded-full bg-surface hover:bg-canvas text-ink flex items-center justify-center font-bold text-sm border border-hairline shadow-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 space-y-4 text-xs">
                  
                  {/* Progress Block */}
                  <div className="bg-surface p-4 rounded-xl border border-hairline flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-ink-muted">当前指南探索进度</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-32 bg-canvas h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-jade h-full transition-all duration-500" 
                            style={{ width: `${(completedSteps.length / 8) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold font-number text-jade">
                          {completedSteps.length}/8
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (completedSteps.length === 8 && !onboardingClaimed) {
                          setOnboardingClaimed(true);
                          setChatSessions(prev => [
                            {
                              id: `chat_system_${Date.now()}`,
                              name: '搭把手官方小助手',
                              type: 'system',
                              avatar: '🤖',
                              lastMessage: '恭喜！您已成功领取30个新手积分福利，快去试试发布或响应互助吧。',
                              lastTime: '刚刚',
                              unreadCount: 1,
                              subLabel: '官方福利',
                              messages: [
                                { id: 'sys_1', sender: '系统', content: '恭喜您完成了搭把手「青年邻里共建指南」的所有关卡！30积分已顺利发送到您的账户，系统积分总额已更新。在搭把手，积分不仅仅是数字，更是邻里之间热心、信任与友爱的象征。', time: '刚刚', isMe: false }
                              ]
                            },
                            ...prev
                          ]);
                          setCurrentUser(prev => ({ ...prev, points: prev.points + 30 }));
                          showToast('成功领取30积分新人探索礼！', 'success');
                        }
                      }}
                      disabled={completedSteps.length < 8 || onboardingClaimed}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                        onboardingClaimed 
                          ? 'bg-jade-light text-jade border border-jade/25' 
                          : completedSteps.length === 8 
                            ? 'bg-amber hover:bg-amber/90 text-white shadow-xs animate-pulse' 
                            : 'bg-canvas text-ink-subtle cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{onboardingClaimed ? '已领 30 积分' : '领新手福利'}</span>
                    </button>
                  </div>

                  {/* 8 Step flow list */}
                  <div className="space-y-3 pb-8">
                    
                    {/* Step 1 */}
                    <div className={`p-3.5 rounded-xl border transition-all flex justify-between items-start ${
                      completedSteps.includes(1) 
                        ? 'bg-canvas border-hairline/60 text-ink-muted' 
                        : 'bg-surface border-hairline text-ink shadow-xs'
                    }`}>
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                          <span className="text-jade">【Step 1/8】</span>
                          🏠 认识你的楼栋
                        </h4>
                        <div className="text-[10px] text-ink-muted mt-1.5 space-y-0.5">
                          <p>• 您所在的 3号楼 共18层，每层6户</p>
                          <p>• 专属楼栋管家: <strong>小王管家 (138xxxx)</strong></p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!completedSteps.includes(1)) {
                              setCompletedSteps(prev => [...prev, 1]);
                              showToast('已申请加入楼栋专属业主群，进度+1');
                            }
                          }}
                          className={`mt-2 px-3 py-1 rounded text-[9px] font-medium transition-all ${
                            completedSteps.includes(1) 
                              ? 'bg-canvas text-jade border border-hairline/40' 
                              : 'bg-jade hover:bg-jade-hover text-white shadow-xs'
                          }`}
                        >
                          {completedSteps.includes(1) ? '✓ 已申请加入3号楼群' : '📱 立即加入3号楼群'}
                        </button>
                      </div>
                      {completedSteps.includes(1) && <CheckCircle2 className="w-4 h-4 text-jade shrink-0" />}
                    </div>

                    {/* Step 2 */}
                    <div className={`p-3.5 rounded-xl border transition-all flex justify-between items-start ${
                      completedSteps.includes(2) 
                        ? 'bg-canvas border-hairline/60 text-ink-muted' 
                        : 'bg-surface border-hairline text-ink'
                    }`}>
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                          <span className="text-jade">【Step 2/8】</span>
                          📦 快递怎么取
                        </h4>
                        <p className="text-[10px] text-ink-muted mt-1.5 leading-relaxed">
                          您的快递送至 <strong>小区西门菜鸟驿站</strong>（营业时间: 09:00 - 20:00）。
                          人不在家时，可在“邻里圈”呼叫邻居顺手代取。
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!completedSteps.includes(2)) {
                              setCompletedSteps(prev => [...prev, 2]);
                              setActiveTab('circle');
                              setShowOnboardingModal(false);
                              showToast('已跳转，请在邻里圈查看或发布求助，进度+1');
                            }
                          }}
                          className={`mt-2.5 py-1 px-2.5 rounded border text-[9px] font-medium transition-all ${
                            completedSteps.includes(2)
                              ? 'bg-canvas text-jade border border-hairline/40'
                              : 'bg-canvas hover:bg-surface text-jade border border-hairline'
                          }`}
                        >
                          {completedSteps.includes(2) ? '✓ 已了解快递规则' : '📤 去邻里圈看一声'}
                        </button>
                      </div>
                      {completedSteps.includes(2) && <CheckCircle2 className="w-4 h-4 text-jade shrink-0" />}
                    </div>

                    {/* Step 3 */}
                    <div className={`p-3.5 rounded-xl border transition-all flex justify-between items-start ${
                      completedSteps.includes(3) 
                        ? 'bg-canvas border-hairline/60 text-ink-muted' 
                        : 'bg-surface border-hairline text-ink'
                    }`}>
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                          <span className="text-jade">【Step 3/8】</span>
                          🛒 买菜去哪
                        </h4>
                        <p className="text-[10px] text-ink-muted mt-1.5">
                          小区南门对面 <strong>鲜生优选超市</strong> (走路2分钟)，每天晚上8点半后熟食和菜品疯狂打折。
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!completedSteps.includes(3)) {
                              setCompletedSteps(prev => [...prev, 3]);
                              setHomeSubTab('services');
                              setShowOnboardingModal(false);
                              showToast('已跳转至周边服务大厅，进度+1');
                            }
                          }}
                          className={`mt-2.5 py-1 px-2.5 rounded border text-[9px] font-medium transition-all ${
                            completedSteps.includes(3)
                              ? 'bg-canvas text-jade border border-hairline/40'
                              : 'bg-canvas hover:bg-surface text-jade border border-hairline'
                          }`}
                        >
                          {completedSteps.includes(3) ? '✓ 已获悉买菜折扣信息' : '🗺️ 查看周边服务地图'}
                        </button>
                      </div>
                      {completedSteps.includes(3) && <CheckCircle2 className="w-4 h-4 text-jade shrink-0" />}
                    </div>

                    {/* Step 4 */}
                    <div className={`p-3.5 rounded-xl border transition-all flex justify-between items-start ${
                      completedSteps.includes(4) 
                        ? 'bg-canvas border-hairline/60 text-ink-muted' 
                        : 'bg-surface border-hairline text-ink'
                    }`}>
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                          <span className="text-jade">【Step 4/8】</span>
                          🍽️ 吃饭怎么解决
                        </h4>
                        <p className="text-[10px] text-ink-muted mt-1.5">
                          推荐 <strong>2号楼1层邻里食堂</strong>（早7-晚8），健康便宜，出示小程序认证即享 9 折。
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!completedSteps.includes(4)) {
                              setCompletedSteps(prev => [...prev, 4]);
                              setHomeSubTab('services');
                              setShowOnboardingModal(false);
                              showToast('已跳转，可向店员出示专属认证，进度+1');
                            }
                          }}
                          className={`mt-2.5 py-1 px-2.5 rounded border text-[9px] font-medium transition-all ${
                            completedSteps.includes(4)
                              ? 'bg-canvas text-jade border border-hairline/40'
                              : 'bg-canvas hover:bg-surface text-jade border border-hairline'
                          }`}
                        >
                          {completedSteps.includes(4) ? '✓ 已了解邻里食堂' : '🍱 查看所有餐饮'}
                        </button>
                      </div>
                      {completedSteps.includes(4) && <CheckCircle2 className="w-4 h-4 text-jade shrink-0" />}
                    </div>

                    {/* Step 5 */}
                    <div className={`p-3.5 rounded-xl border transition-all flex justify-between items-start ${
                      completedSteps.includes(5) 
                        ? 'bg-canvas border-hairline/60 text-ink-muted' 
                        : 'bg-surface border-hairline text-ink'
                    }`}>
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                          <span className="text-jade">【Step 5/8】</span>
                          🏃 社区里好玩的
                        </h4>
                        <p className="text-[10px] text-ink-muted mt-1.5">
                          <strong>1号楼1层健身房</strong> 24h开放；<strong>2号楼共享书吧</strong> 提供自助咖啡；<strong>每栋楼顶花园</strong> 都可以看夕阳。
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!completedSteps.includes(5)) {
                              setCompletedSteps(prev => [...prev, 5]);
                              setHomeSubTab('spaces');
                              setShowOnboardingModal(false);
                              showToast('已跳转，现在即可预订公共健身房，进度+1');
                            }
                          }}
                          className={`mt-2.5 py-1 px-2.5 rounded border text-[9px] font-medium transition-all ${
                            completedSteps.includes(5)
                              ? 'bg-canvas text-jade border border-hairline/40'
                              : 'bg-canvas hover:bg-surface text-jade border border-hairline'
                          }`}
                        >
                          {completedSteps.includes(5) ? '✓ 已获悉娱乐配套设施' : '🏛️ 探索公共共享空间'}
                        </button>
                      </div>
                      {completedSteps.includes(5) && <CheckCircle2 className="w-4 h-4 text-jade shrink-0" />}
                    </div>

                    {/* Step 6 */}
                    <div className={`p-3.5 rounded-xl border transition-all flex justify-between items-start ${
                      completedSteps.includes(6) 
                        ? 'bg-canvas border-hairline/60 text-ink-muted' 
                        : 'bg-surface border-hairline text-ink'
                    }`}>
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                          <span className="text-jade">【Step 6/8】</span>
                          🆘 遇到问题找谁
                        </h4>
                        <p className="text-[10px] text-ink-muted mt-1.5">
                          24小时物业电话 (138xxxx)。支持一键在线申报反馈漏水、维修等故障问题。
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!completedSteps.includes(6)) {
                              setCompletedSteps(prev => [...prev, 6]);
                              setHomeSubTab('social');
                              setShowOnboardingModal(false);
                              showToast('已为您打开社工咨询通道，进度+1');
                            }
                          }}
                          className={`mt-2.5 py-1 px-2.5 rounded border text-[9px] font-medium transition-all ${
                            completedSteps.includes(6)
                              ? 'bg-canvas text-jade border border-hairline/40'
                              : 'bg-canvas hover:bg-surface text-jade border border-hairline'
                          }`}
                        >
                          {completedSteps.includes(6) ? '✓ 已获得客服反馈途径' : '🔧 在线客服保修反馈'}
                        </button>
                      </div>
                      {completedSteps.includes(6) && <CheckCircle2 className="w-4 h-4 text-jade shrink-0" />}
                    </div>

                    {/* Step 7 */}
                    <div className={`p-3.5 rounded-xl border transition-all flex justify-between items-start ${
                      completedSteps.includes(7) 
                        ? 'bg-canvas border-hairline/60 text-ink-muted' 
                        : 'bg-surface border-hairline text-ink'
                    }`}>
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                          <span className="text-jade">【Step 7/8】</span>
                          👋 认识有趣邻居
                        </h4>
                        <p className="text-[10px] text-ink-muted mt-1.5">
                          同楼502 <strong>小雅</strong>、201 <strong>阿栋</strong>等高活跃住户，随时欢迎大家去邻里圈互动交流。
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!completedSteps.includes(7)) {
                              setCompletedSteps(prev => [...prev, 7]);
                              setActiveTab('circle');
                              setShowOnboardingModal(false);
                              showToast('跳转成功，快在动态下给邻友点个赞说句Hi吧，进度+1');
                            }
                          }}
                          className={`mt-2.5 py-1 px-2.5 rounded border text-[9px] font-medium transition-all ${
                            completedSteps.includes(7)
                              ? 'bg-canvas text-jade border border-hairline/40'
                              : 'bg-canvas hover:bg-surface text-jade border border-hairline'
                          }`}
                        >
                          {completedSteps.includes(7) ? '✓ 已了解部分邻友' : '💬 去邻里圈打个招呼'}
                        </button>
                      </div>
                      {completedSteps.includes(7) && <CheckCircle2 className="w-4 h-4 text-jade shrink-0" />}
                    </div>

                    {/* Step 8 */}
                    <div className={`p-3.5 rounded-xl border transition-all flex justify-between items-start ${
                      completedSteps.includes(8) 
                        ? 'bg-canvas border-hairline/60 text-ink-muted' 
                        : 'bg-surface border-hairline text-ink'
                    }`}>
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                          <span className="text-jade">【Step 8/8】</span>
                          ✅ 邻里契约守则
                        </h4>
                        <p className="text-[10px] text-ink-muted mt-1.5">
                          本公寓为青年互信社区，遵守“爱护公物、饭后清洁、礼貌用词、互帮互助、及时回复”规则。
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!completedSteps.includes(8)) {
                              setCompletedSteps(prev => [...prev, 8]);
                              showToast('感谢您对青年邻里契约的支持，互助同乐，进度+1');
                            }
                          }}
                          className={`mt-2.5 py-1.5 px-3 rounded text-[9px] font-semibold transition-all ${
                            completedSteps.includes(8) 
                              ? 'bg-canvas text-jade border border-hairline/40' 
                              : 'bg-jade hover:bg-jade-hover text-white shadow-xs'
                          }`}
                        >
                          {completedSteps.includes(8) ? '✓ 我已阅读并同意邻里契约' : '✍️ 阅读并同意邻里契约'}
                        </button>
                      </div>
                      {completedSteps.includes(8) && <CheckCircle2 className="w-4 h-4 text-jade shrink-0" />}
                    </div>

                  </div>

                </div>

              </div>
            </div>
          )}

          {/* OVERLAY MODAL: RESIDENT DETAILS (当前居住) */}
          {showResidentModal && (
            <div className="absolute inset-0 bg-ink/75 z-50 animate-fade-in flex flex-col justify-end">
              <div className="bg-canvas border-t border-hairline rounded-t-[32px] max-h-[80%] overflow-y-auto custom-scrollbar flex flex-col animate-slide-up">
                
                <div className="p-6 bg-jade-light/40 flex justify-between items-start border-b border-hairline sticky top-0 z-10">
                  <div>
                    <h2 className="font-bold text-base text-ink">🏠 当前居住住户身份</h2>
                    <p className="text-[10px] text-ink-muted mt-0.5">您在社区中的在线人设</p>
                  </div>
                  <button 
                    onClick={() => setShowResidentModal(false)}
                    className="w-8 h-8 rounded-full bg-surface hover:bg-canvas text-ink flex items-center justify-center font-bold text-sm border border-hairline shadow-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 space-y-4 text-xs">
                  
                  {/* Big avatar card */}
                  <div className="bg-surface p-4 rounded-2xl border border-hairline flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-jade flex items-center justify-center font-bold text-xl text-white shadow-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-ink">{currentUser.name}</h3>
                        <span className="text-[9px] bg-canvas text-jade border border-jade/15 px-2 py-0.2 rounded font-number">
                          {currentUser.room}
                        </span>
                      </div>
                      <p className="text-[10px] text-ink-muted mt-1">{currentUser.profession}</p>
                    </div>
                  </div>

                  {/* Multi stats block */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-surface p-2.5 rounded-xl border border-hairline">
                      <span className="block text-[9px] text-ink-subtle">信用评分</span>
                      <span className="text-xs font-bold text-jade font-number">
                        ★ {currentUser.creditScore}
                      </span>
                    </div>
                    <div className="bg-surface p-2.5 rounded-xl border border-hairline">
                      <span className="block text-[9px] text-ink-subtle">我的积分</span>
                      <span className="text-xs font-bold text-amber font-number">
                        🪙 {currentUser.points}
                      </span>
                    </div>
                    <div className="bg-surface p-2.5 rounded-xl border border-hairline">
                      <span className="block text-[9px] text-ink-subtle">累计帮扶</span>
                      <span className="text-xs font-bold text-coral font-number">
                        {currentUser.helpCount}次
                      </span>
                    </div>
                  </div>

                  {/* Badges list */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-ink">🏆 拥有勋章</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentUser.badges?.map((badge, i) => (
                        <span key={badge} className="bg-canvas px-2.5 py-1 border border-hairline rounded-lg text-[9px] text-ink-muted font-medium">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Identity explanation alert */}
                  <div className="bg-jade-light/30 border border-jade/10 p-3.5 rounded-xl space-y-1">
                    <p className="text-jade font-bold text-[10px]">💡 住户视角切换提示</p>
                    <p className="text-[10px] text-ink-muted leading-relaxed">
                      在大屏左侧的<strong>「住户视角切换」</strong>控制面板中，您可以一键在「小雅」、「阿栋」、「小鱼」等十位不同住户间无缝切换，体验不同名下的积分资产、房号和信用勋章！
                    </p>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* OVERLAY MODAL: COMMUNITY ANNOUNCEMENTS LIST (最新公告) */}
          {showAnnouncementsModal && (
            <div className="absolute inset-0 bg-ink/75 z-50 animate-fade-in flex flex-col justify-end">
              <div className="bg-canvas border-t border-hairline rounded-t-[32px] max-h-[85%] overflow-y-auto custom-scrollbar flex flex-col animate-slide-up">
                
                <div className="p-6 bg-jade-light/40 flex justify-between items-start border-b border-hairline sticky top-0 z-10 backdrop-blur-md bg-opacity-95">
                  <div>
                    <h2 className="font-bold text-base text-ink">📢 社区最新公告栏</h2>
                    <p className="text-[10px] text-ink-muted mt-0.5">泊寓青年社区共治中心发布</p>
                  </div>
                  <button 
                    onClick={() => setShowAnnouncementsModal(false)}
                    className="w-8 h-8 rounded-full bg-surface hover:bg-canvas text-ink flex items-center justify-center font-bold text-sm border border-hairline shadow-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  {announcements.map(ann => (
                    <div key={ann.id} className="bg-surface p-4 rounded-2xl border border-hairline space-y-2">
                      <div className="flex justify-between items-start gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[9px] bg-jade-light/40 text-jade border border-jade/10 px-1.5 py-0.2 rounded font-bold shrink-0">
                            {ann.type}
                          </span>
                          <h4 className="font-bold text-xs text-ink truncate">{ann.title}</h4>
                        </div>
                        <span className={`text-[8px] font-medium px-1.5 py-0.2 rounded shrink-0 ${
                          ann.importance.includes('重要') || ann.importance.includes('紧急') 
                            ? 'bg-coral-light/20 text-coral border border-coral/10' 
                            : 'bg-canvas text-ink-muted border border-hairline'
                        }`}>
                          {ann.importance}
                        </span>
                      </div>
                      <p className="text-[10px] text-ink-muted leading-relaxed">{ann.content}</p>
                      <p className="text-[8px] text-ink-subtle font-number text-right">{ann.time}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* RIGHT SIDE: ToG Operator / Manager Weekly Analytics Report Dashboard */}
      <div className="w-full lg:w-96 bg-canvas p-6 border-t lg:border-t-0 lg:border-l border-hairline flex flex-col gap-5 overflow-y-auto custom-scrollbar">
        
        <div className="flex items-center gap-3">
          <div className="bg-jade-light/50 p-2.5 rounded-xl border border-jade/10">
            <TrendingUp className="w-6 h-6 text-jade" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-ink font-display">社区运营后置/周报</h2>
            <p className="text-xs text-ink-muted">物业/居委会自治管理控制台</p>
          </div>
        </div>

        <p className="text-xs text-ink-muted bg-surface p-3 rounded-xl border border-hairline leading-relaxed">
          🏆 泊寓A区积极推进 <strong>ToG 邻里共治共建</strong>，通过「搭把手」小程序的邻里圈互助，解决末端配送、闲置置换等难题。以下为本周智能运维产生的真实报表。
        </p>

        {/* Weekly Report Stat Widgets */}
        <div className="space-y-4">
          
          {/* Header range */}
          <div className="flex justify-between items-center bg-surface p-2.5 rounded-xl border border-hairline text-xs">
            <span className="text-ink-muted font-medium">统计区间:</span>
            <span className="font-number font-bold text-jade">{weeklyReport.weekRange}</span>
          </div>

          {/* Grid numbers */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-surface p-3 rounded-xl border border-hairline flex flex-col justify-between h-16">
              <span className="text-[10px] text-ink-subtle block">活跃用户</span>
              <span className="text-lg font-bold text-ink font-number">{weeklyReport.activeUsers} <span className="text-xs font-normal text-ink-muted">人</span></span>
            </div>
            <div className="bg-surface p-3 rounded-xl border border-hairline flex flex-col justify-between h-16">
              <span className="text-[10px] text-ink-subtle block">新入驻住户</span>
              <span className="text-lg font-bold text-jade font-number">+{weeklyReport.newUser} <span className="text-xs font-normal text-ink-muted">人</span></span>
            </div>
            <div className="bg-surface p-3 rounded-xl border border-hairline flex flex-col justify-between h-16">
              <span className="text-[10px] text-ink-subtle block">互助发起 / 完成</span>
              <span className="text-sm font-bold text-ink font-number">{weeklyReport.helpRequests} / {weeklyReport.helpCompleted} <span className="text-[9px] font-normal text-ink-muted">条</span></span>
            </div>
            <div className="bg-surface p-3 rounded-xl border border-hairline flex flex-col justify-between h-16">
              <span className="text-[10px] text-ink-subtle block">互助完成率</span>
              <span className="text-lg font-bold text-coral font-number">{weeklyReport.helpRate}</span>
            </div>
          </div>

          {/* Hot Topics Top */}
          <div className="bg-surface p-4 rounded-xl border border-hairline space-y-2">
            <h4 className="text-xs font-bold text-ink flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-jade" />
              🔥 本周热议话题排行
            </h4>
            <div className="space-y-1.5 text-xs text-ink-muted pt-1">
              {weeklyReport.hotTopics.map((item, idx) => (
                <div key={item.topic} className="flex justify-between items-center">
                  <span>{idx+1}. #{item.topic}</span>
                  <span className="font-number text-ink-subtle">{item.count}人参与</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top active building */}
          <div className="bg-surface p-4 rounded-xl border border-hairline space-y-2">
            <h4 className="text-xs font-bold text-ink flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-jade" />
              📌 本周最活跃楼栋
            </h4>
            <div className="space-y-1.5 text-xs text-ink-muted pt-1">
              {weeklyReport.activeBuildings.map((item, idx) => (
                <div key={item.building} className="flex justify-between items-center">
                  <span>{idx+1 === 1 ? '🥇' : idx+1 === 2 ? '🥈' : '🥉'} {item.building}</span>
                  <span className="font-number text-jade font-bold">{item.count}次需求</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resident demands statistics */}
          <div className="bg-surface p-4 rounded-xl border border-hairline space-y-2">
            <h4 className="text-xs font-bold text-ink flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-jade" />
              📋 居民核心诉求TOP3
            </h4>
            <div className="space-y-1.5 text-xs text-ink-muted pt-1">
              {weeklyReport.residentDemands.map((item, idx) => (
                <div key={item.demand} className="flex justify-between items-center">
                  <span>{idx+1}. {item.demand}</span>
                  <span className="font-number text-ink-subtle">{item.count}次呼叫</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warning lists & follow up */}
          <div className="bg-coral-light/20 border border-coral/20 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-coral flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-coral" />
              ⚠️ 运维待关注与整改事项
            </h4>
            <ul className="space-y-2 text-[11px] text-ink-muted leading-relaxed list-disc list-inside">
              {weeklyReport.followUpItems.map((item, idx) => (
                <li key={idx}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick toggle announcement trigger */}
          <div className="bg-surface p-4 rounded-xl border border-hairline space-y-2">
            <h4 className="text-xs font-bold text-ink">🛠️ 快速模拟下发停水/紧急公告</h4>
            <p className="text-[10px] text-ink-muted">点击下发一条全新紧急通知，手机小程序首页将实时展现滚动横幅。</p>
            <button
              onClick={() => {
                const waterEmergency: Announcement = {
                  id: `ann_emergency_${Date.now()}`,
                  type: '紧急',
                  title: '【紧急】电网抢修临时停电通知',
                  content: '因小区外部高压电网突发临时故障，5号楼、6号楼将于今天23:00 - 23:30进行电网紧急割接，期间会短暂断电5分钟，请备好照明并避免使用电梯。',
                  time: '刚刚',
                  importance: '🔴紧急'
                };
                setAnnouncements([waterEmergency, ...announcements]);
                showToast('紧急电力抢修公告已在手机小程序顶部横幅中生效！', 'success');
              }}
              className="w-full bg-coral hover:bg-coral-hover text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
            >
              <span>下发抢修停电通知</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
