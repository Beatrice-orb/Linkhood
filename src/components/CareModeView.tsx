import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Clock,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  Plus,
  Trash2,
  Bell,
  FileText
} from 'lucide-react';
import { UserProfile, Space, Event, Service, FeedItem } from '../types';

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
  handleLikePost: (id: string) => void;
  setSelectedSpace: (space: Space | null) => void;
  setSelectedEvent: (event: Event | null) => void;
  setShowAnnouncementsModal: (show: boolean) => void;
  setShowOnboardingModal: (show: boolean) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  triggerToggleCareMode: (target: boolean) => void;
  handleStartPrivateChat: (name: string, type: string) => void;
  persistPost: (body: { type: 'help' | 'moment' | 'rally'; category?: string; content: string; meetingTime?: string; bountyPoints?: number }) => Promise<FeedItem | null>;
}

// 2.2 Elders Users Data (10 elder users)
const elderUsers = [
  { name: '王秀兰', age: 68, room: '3-502', desc: '独居，退休教师，爱串门', tags: ['#广场舞', '#编织', '#热心肠'], flowers: 45, praise: 23 },
  { name: '张德明', age: 72, room: '5-201', desc: '退休工人，喜欢下棋打牌', tags: ['#象棋', '#太极', '#老酒'], flowers: 18, praise: 12 },
  { name: '李桂芳', age: 65, room: '2-103', desc: '帮女儿带孩子，喜欢做饭', tags: ['#做饭', '#带孙子', '#养生'], flowers: 29, praise: 15 },
  { name: '赵卫东', age: 70, room: '3-308', desc: '退休干部，热心社区事务', tags: ['#书法', '#读书', '#志愿者'], flowers: 36, praise: 19 },
  { name: '刘美英', age: 62, room: '1-405', desc: '退休护士，懂健康知识', tags: ['#健康', '#太极', '#热心肠'], flowers: 41, praise: 22 },
  { name: '陈国平', age: 76, room: '4-202', desc: '独居，腿脚不太好', tags: ['#下棋', '#听戏', '#养生'], flowers: 12, praise: 6 },
  { name: '孙玉珍', age: 69, room: '6-302', desc: '退休会计，手工好', tags: ['#编织', '#手工', '#热心肠'], flowers: 33, praise: 17 },
  { name: '周素芳', age: 58, room: '4-101', desc: '广场舞领队，精力充沛', tags: ['#广场舞', '#合唱团', '#热心肠'], flowers: 50, praise: 26 },
  { name: '吴志强', age: 74, room: '6-201', desc: '退休工程师，喜欢修东西', tags: ['#维修', '#园艺', '#热心肠'], flowers: 38, praise: 20 },
  { name: '郑美兰', age: 66, room: '2-301', desc: '退休教师，喜欢张罗事', tags: ['#读书会', '#合唱团', '#热心肠'], flowers: 31, praise: 16 }
];

// 2.3 Public Spaces Data (8 spaces)
const elderSpaces = [
  { id: 'sp-1', name: '老年活动室', location: '3号楼B1层', category: '活动室', description: '打牌、下棋、聊天、看电视。内配空调、软座沙发和热饮水机。', capacity: 25, rating: 4.9, icon: '🏠', status: '开放中' },
  { id: 'sp-2', name: '小区广场', location: '小区中心大榕树下', category: '室外', description: '晨练太极、晚间广场舞，带有缓步橡胶跑道。', capacity: 100, rating: 4.8, icon: '⛲', status: '开放中' },
  { id: 'sp-3', name: '棋牌角', location: '3号楼B1层东侧', category: '活动室', description: '扑克、象棋、麻将等。提供专用大字扑克与防滑麻将。', capacity: 12, rating: 4.7, icon: '🀄', status: '开放中' },
  { id: 'sp-4', name: '社区食堂', location: '2号楼1层中厅', category: '厨房', description: '低油低盐的老年午餐、晚餐。凭敬老卡可享8.5折。', capacity: 50, rating: 4.9, icon: '🍱', status: '营业中' },
  { id: 'sp-5', name: '小区花园', location: '小区东侧水榭旁', category: '室外', description: '漫步赏花、晒太阳聊天、带孙子。设有遮阳凉亭与爱心长椅。', capacity: 80, rating: 4.8, icon: '🏡', status: '开放中' },
  { id: 'sp-6', name: '社区阅览室', location: '2号楼1层阅览厅', category: '书吧', description: '看今日报纸、长者大字图书、进行书法临摹练习。', capacity: 20, rating: 4.9, icon: '📖', status: '开放中' },
  { id: 'sp-7', name: '健身角', location: '小区西侧林荫道', category: '健身房', description: '晨练康复训练，配有双人漫步机、太极推揉器等。', capacity: 15, rating: 4.6, icon: '🏃', status: '开放中' },
  { id: 'sp-8', name: '社区诊所', location: '小区东门旁', category: '健身房', description: '提供每日量血压、长者看病配药、健康咨询等。', capacity: 10, rating: 4.9, icon: '🏥', status: '营业中' }
];

// 2.4 Weekly Events Data (5 events)
const elderEvents = [
  { id: 'ev-1', name: '🀄 老年棋牌赛', time: '周六 14:00', location: '老年活动室', organizer: '居委会', target: '爱打牌下棋的老人', signedUp: 15, capacity: 20, description: '友谊第一，比赛第二！精美大礼包等您来拿。' },
  { id: 'ev-2', name: '🏥 免费量血压健康监测', time: '周三 09:00', location: '社区诊所', organizer: '社区医生', target: '所有社区居民，特别推荐60岁以上老人', signedUp: 42, capacity: 100, description: '刘医生亲诊，教您科学管理血压。' },
  { id: 'ev-3', name: '📖 夕阳红读书会《红楼梦》', time: '周四 14:00', location: '社区阅览室', organizer: '居委会', target: '喜欢文学阅读的长辈', signedUp: 8, capacity: 15, description: '分享经典，围炉夜话，畅谈精彩篇章。' },
  { id: 'ev-4', name: '💃 广场舞基础班教学', time: '每天 19:00', location: '小区广场', organizer: '周阿姨', target: '爱跳舞锻炼的长辈', signedUp: 35, capacity: 50, description: '免费辅导，新曲排练，强身健体，保持活力！' },
  { id: 'ev-5', name: '🧶 温暖牌手工编织课', time: '周三 14:00', location: '社区阅览室', organizer: '手工小组', target: '喜欢针织编织的手工爱好者', signedUp: 6, capacity: 12, description: '编织围巾，爱心捐赠，传递指尖的关怀。' }
];

// 2.5 Nearby Services Data (12 services)
const elderServices = [
  { id: 'se-1', name: '社区便民超市', type: '超市', location: '2号楼底商102', hours: '08:00 - 21:00', phone: '021-65431001', rating: 4.9, tags: ['送货上门', '支持敬老卡'] },
  { id: 'se-2', name: '顺丰快递代办点', type: '快递', location: '小区东门1号岗亭', hours: '08:30 - 20:00', phone: '13918880001', rating: 4.8, tags: ['上门取件', '重物代搬'] },
  { id: 'se-3', name: '老龄便民理发店', type: '生活服务', location: '3号楼底商104', hours: '09:00 - 18:00', phone: '021-65431003', rating: 4.9, tags: ['剪发10元', '行动不便上门'] },
  { id: 'se-4', name: '社区卫生服务中心', type: '医疗', location: '小区东门旁', hours: '24小时值班', phone: '021-65431200', rating: 4.9, tags: ['医保定点', '慢病配药'] },
  { id: 'se-5', name: '聚财平价大药房', type: '医疗', location: '小区南门外50米', hours: '08:00 - 22:00', phone: '021-65431005', rating: 4.8, tags: ['送药上门', '免费切片'] },
  { id: 'se-6', name: '长者健康康复站', type: '医疗', location: '1号楼1层东厅', hours: '09:00 - 17:00', phone: '021-65431006', rating: 4.7, tags: ['免费体验', '按摩理疗'] },
  { id: 'se-7', name: '老龄共享大食堂', type: '餐饮', location: '2号楼103', hours: '11:00 - 13:30, 17:00 - 19:30', phone: '021-65431007', rating: 4.9, tags: ['少盐无糖', '长者优惠'] },
  { id: 'se-8', name: '便民五金家修水电', type: '生活服务', location: '居委会大院内', hours: '08:30 - 18:30', phone: '13612345678', rating: 4.8, tags: ['老旧排查', '免费换灯泡'] },
  { id: 'se-9', name: '暖心老牌包子铺', type: '餐饮', location: '小区西门对面', hours: '06:00 - 14:00', phone: '18512349901', rating: 4.9, tags: ['纯手工', '支持预订'] },
  { id: 'se-10', name: '清新惠民干洗店', type: '生活服务', location: '4号楼102', hours: '09:00 - 20:00', phone: '021-65431010', rating: 4.6, tags: ['上门取送', '衣物熨烫'] },
  { id: 'se-11', name: '松龄太极拳用品店', type: '生活服务', location: '北侧商业街12号', hours: '09:30 - 19:00', phone: '021-65431011', rating: 4.7, tags: ['团购打折', '正品太极服'] },
  { id: 'se-12', name: '菜篮子生鲜直销店', type: '超市', location: '西门商业广场1层', hours: '06:30 - 20:00', phone: '021-65431012', rating: 4.9, tags: ['极速新鲜', '清晨特价'] }
];

// 2.6 Staff Workers Data (4 people)
const elderSocialWorkers = [
  { id: 'sw-1', name: '小王', role: '楼栋管家', area: '3号楼/4号楼', dutyTime: '全天24小时在线', phone: '18599990000', scope: '老年人日常代购、定期上门体恤探访、排除水电安全隐患', avatar: '👨‍💼' },
  { id: 'sw-2', name: '刘医生', role: '社区医生', area: '社区诊所', dutyTime: '每周三 09:00 - 17:30', phone: '021-65431200', scope: '免费量血压、慢病指导、药物服用调整及心理健康开导', avatar: '🥼' },
  { id: 'sw-3', name: '小张', role: '社区志愿者', area: '泊寓A区', dutyTime: '周一至周五 08:00 - 18:00', phone: '13812345678', scope: '高龄长辈免费送餐、爱心陪同就医、代买蔬菜及送药上门', avatar: '🙋‍♂️' },
  { id: 'sw-4', name: '李主任', role: '居委会主任', area: '1号楼101居委会', dutyTime: '周一至周五 09:00 - 17:00', phone: '021-65432101', scope: '高龄补贴认证、养老补贴申请协助、政策讲解及大字指南发放', avatar: '👵' }
];

// 2.5 Initial Feed Items (Neighborhood Circle)
const initialElderFeed: FeedItem[] = [
  { id: 'fd-1', type: 'help', category: '代取', authorName: '陈国平', authorRoom: '4-202', distance: 120, time: '10分钟前', content: '👴 腿脚不方便，谁明天去菜市场帮我带一把葱和两个西红柿？年纪大了，下雨天实在是不太敢下楼，非常感谢好心人！', likes: 5, comments: [], actionStatus: 'idle' },
  { id: 'fd-2', type: 'moment', authorName: '王秀兰', authorRoom: '3-502', distance: 0, time: '25分钟前', content: '剛出爐一鍋熱騰騰、香噴噴的發麵大包子（豬肉大白菜餡），包了特別多，自己一個人根本吃不完，誰家想吃包子的，隨時來3号楼502拿呀！❤️', likes: 12, comments: [] },
  { id: 'fd-3', type: 'help', category: '闲置', authorName: '刘美英', authorRoom: '1-405', distance: 180, time: '1小时前', content: '👩‍⚕️ 家里有个闲置的电子手臂血压计，功能完全正常，还附带大屏和语音播报。有需要的独居老姐妹可以直接拿走用！', likes: 8, comments: [], actionStatus: 'idle' },
  { id: 'fd-4', type: 'help', category: '闲置', authorName: '赵卫东', authorRoom: '3-308', distance: 10, time: '2小时前', content: '我家老头子的不锈钢轮椅现在闲置了，九成新，折叠很方便。哪位长辈家里最近腿脚不便需要临时过渡的？请随时私信我，我让我儿子给您送下楼！', likes: 15, comments: [], actionStatus: 'idle' },
  { id: 'fd-5', type: 'help', category: '照看', authorName: '李桂芳', authorRoom: '2-103', distance: 90, time: '4小时前', content: '今天包餃子包多了，給103樓道裡獨居的陳大爺和張阿姨送了兩盤過去，遠親不如近鄰，平平安安就是最大的福氣！🥟', likes: 20, comments: [], actionStatus: 'claimed' },
  { id: 'fd-6', type: 'moment', authorName: '王秀兰', authorRoom: '3-502', distance: 0, time: '3小时前', content: '📸 今天吃完早飯在小區散步，看見綠化帶的玫瑰和牽牛花開得真叫一個水靈，拍了幾張發到朋友圈和大夥兒分享，祝大夥兒今日都有個好心情！🌹🌸🌺🌼', likes: 23, comments: [], image: '🌹🌸🌺' },
  { id: 'fd-7', type: 'moment', authorName: '张德明', authorRoom: '5-201', distance: 220, time: '5小时前', content: '📸 下午去老伴坟前坐了两个钟头，擦了擦照片，跟她讲了讲最近社区装了扶手和无障碍通道，还聊了聊隔壁老赵。心里感到暖洋洋的。🌅🪵🍂', likes: 45, comments: [] },
  { id: 'fd-8', type: 'moment', authorName: '周素芳', authorRoom: '4-101', distance: 80, time: '6小时前', content: '📸 昨晚姐妹們排练廣舞《最炫民族風》的精彩視頻截圖，大夥兒跳得非常整齊、精神抖擻！歡迎更多大媽加入我們！💃💃💃', likes: 33, comments: [] },
  { id: 'fd-9', type: 'moment', authorName: '孙玉珍', authorRoom: '6-302', distance: 150, time: '8小时前', content: '📸 剛親手織完一條紅藍相間的羊毛圍巾，花了大半個月呢，等入冬了寄給在遠方讀大學的小孫子，希望他戴上能感受到暖和。🧣🧶', likes: 19, comments: [] },
  { id: 'fd-10', type: 'moment', authorName: '赵卫东', authorRoom: '3-308', distance: 10, time: '10小时前', content: '📸 新寫了一幅行書字幅“上善若水，厚德載物”，老伴誇我比上星期寫的有進步，大夥看看這筆鋒字體寫得怎麼樣？🖌️📜', likes: 28, comments: [] },
  { id: 'fd-11', type: 'moment', authorName: '吴志强', authorRoom: '6-201', distance: 140, time: '1天前', content: '工具箱沒白買！今天看見休閒廣場木長椅的扶手有點鬆動了，回家拿了螺絲刀和鋼釘把松的地方全部加固了一遍，這下長辈們坐上去休息更穩當安全了。🛠️', likes: 52, comments: [] },
  { id: 'fd-12', type: 'rally', authorName: '周素芳', authorRoom: '4-101', distance: 80, time: '1小时前', content: '🎉【广场舞召集】今晚7点半大榕树广场，学习《荷塘月色》最新分解舞步，不限制基础，只要愿意扭一扭的大姐们全部欢迎！让我们一起健康舞动起来！💃', likes: 10, comments: [] },
  { id: 'fd-13', type: 'rally', authorName: '张德明', authorRoom: '5-201', distance: 220, time: '2小时前', content: '🎉【棋牌约战】今天下午14:30，在3号楼B1层老年活动室下中国象棋，三缺一，谁手痒想杀两盘的赶紧来！老赵、老陈都在！🀄♟️', likes: 6, comments: [] },
  { id: 'fd-14', type: 'rally', authorName: '郑美兰', authorRoom: '2-301', distance: 110, time: '3小时前', content: '🎉【夕阳红读书会】周四下午14:00在社区阅览室举行，本期主讲分享路遥的《平凡的世界》。欢迎所有热爱文学故事、乐于分享思想的老姐妹、老大哥一同交流探讨！📖', likes: 11, comments: [] }
];

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
  handleLikePost,
  setSelectedSpace,
  setSelectedEvent,
  setShowAnnouncementsModal,
  setShowOnboardingModal,
  showToast,
  triggerToggleCareMode,
  handleStartPrivateChat,
  persistPost,
}: CareModeViewProps) {

  // Local state controllers for elder-friendly reactive data
  const [localFeeds, setLocalFeeds] = useState<FeedItem[]>(initialElderFeed);

  useEffect(() => {
    const ownPersistedPosts = feedItems.filter((item) => item.authorId === currentUser.id);
    if (ownPersistedPosts.length === 0) return;
    setLocalFeeds((current) => [
      ...ownPersistedPosts,
      ...current.filter((item) => !ownPersistedPosts.some((persisted) => persisted.id === item.id)),
    ]);
  }, [currentUser.id, feedItems]);
  const [localRegisteredEvents, setLocalRegisteredEvents] = useState<string[]>([]);
  const [localBookedSpaces, setLocalBookedSpaces] = useState<string[]>([]);
  const [localGuardians, setLocalGuardians] = useState([
    { id: '1', name: '女儿小雅', phone: '13812345678', relation: '子女', isPrimary: true },
    { id: '2', name: '楼栋管家小王', phone: '18599990000', relation: '管家', isPrimary: false }
  ]);
  const [localMeds, setLocalMeds] = useState([
    { id: '1', name: '阿司匹林', dosage: '1片', frequency: '每日一次', time: '早饭后 08:30', takenToday: false },
    { id: '2', name: '高血压平压药', dosage: '2片', frequency: '每日两次', time: '早晚服药 08:00 / 20:00', takenToday: true }
  ]);

  // SOS States
  const [showSOSConfirm, setShowSOSConfirm] = useState(false);
  const [sosActiveLevel, setSOSActiveLevel] = useState<number>(0); // 0: inactive, 1, 2, 3
  const [sosSecondsLeft, setSOSSecondsLeft] = useState(120);

  // Modals & Carousel states
  const [showCommunityInfo, setShowCommunityInfo] = useState(false);
  const [showCareNotices, setShowCareNotices] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [showOnboardingBig, setShowOnboardingBig] = useState(false);
  const [careNotificationUnread, setCareNotificationUnread] = useState(2);
  const [fraudIndex, setFraudIndex] = useState(0);
  const [showFraudKnowledge, setShowFraudKnowledge] = useState(false);

  // Quick Action forms
  const [todayReportedSafe, setTodayReportedSafe] = useState(false);
  const [showHelpApplication, setShowHelpApplication] = useState(false);
  const [helpAppCategory, setHelpAppCategory] = useState('代买菜');
  const [helpAppTime, setHelpAppTime] = useState('');
  const [helpAppNotes, setHelpAppNotes] = useState('');

  // Floating Publisher States (The 3 Buttons)
  const [showCarePublish, setShowCarePublish] = useState(false);
  const [carePublishType, setCarePublishType] = useState<'help' | 'moment' | 'activity'>('help');
  const [careHelpWhat, setCareHelpWhat] = useState('');
  const [careHelpWhen, setCareHelpWhen] = useState('');
  const [careHelpWhere, setCareHelpWhere] = useState('');
  const [careMomentContent, setCareMomentContent] = useState('');

  // Start Activity simplified form
  const [careActivityWhat, setCareActivityWhat] = useState('');
  const [careActivityWhen, setCareActivityWhen] = useState('');
  const [careActivityWhere, setCareActivityWhere] = useState('');
  const [careActivityPhone, setCareActivityPhone] = useState('');

  // Detailed Modal Views for My Profile Subsections
  const [careActiveMenuModal, setCareActiveMenuModal] = useState<string | null>(null);
  const [innerHealthTab, setInnerHealthTab] = useState<'guardians' | 'meds'>('guardians');
  const [innerActivityTab, setInnerActivityTab] = useState<'publish' | 'events' | 'help'>('publish');
  const [innerPolicyTab, setInnerPolicyTab] = useState<'policy' | 'cert'>('policy');

  // Interactive Simulated Chat Dialogs
  const [activeSimChat, setActiveSimChat] = useState<{
    id: string;
    title: string;
    type: 'help' | 'event';
    messages: { sender: 'me' | 'other'; text: string; time: string }[];
  } | null>(null);

  // Map popup navigation
  const [showRouteMap, setShowRouteMap] = useState<string | null>(null);

  // Adding Form State
  const [newGuardName, setNewGuardName] = useState('');
  const [newGuardPhone, setNewGuardPhone] = useState('');
  const [newGuardRelation, setNewGuardRelation] = useState('子女');

  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTime, setNewMedTime] = useState('');

  // Automatic scrolling for Fraud Alerts
  const fraudTips = [
    "🛡️【财产安全】最近有冒充燃气、自来水公司上门推销高价滤水器或报警器的，千万不要给陌生人开门！",
    "🛡️【财产安全】凡是自称“公检法”说您涉嫌洗钱、要求您把钱转入“安全账户”验证的，全是诈骗，立刻挂断！",
    "❤️【情感关怀】有陌生人打电话自称是在外地的孙辈哭诉打架急需钱，请先跟子女核实，千万不要直接转账！",
    "💊【健康医疗】有些“养生讲座”宣传能包治百病、购买保健品返现的，都是针对老年人的陷阱，有病请去正规医院！",
    "📋【生活帮扶】遇到行动不便需要采购、理发、修家电的情况，请随时点击下方的“申请生活帮扶”或联系管家！",
    "🛡️【财产安全】遇到要验证码或叫您去银行ATM机进行“资金核验”操作的，极大概率是骗局，千万不要相信！",
    "❤️【情感关怀】不轻信网络结交的“热心好友”介绍的稳赚不赔理财投资，多和居委会及子女聊聊，警惕温情陷阱！",
    "💊【健康医疗】免费赠送鸡蛋、挂面并宣传免费体检、推销数万元天价床垫或治疗仪的，均为虚假宣传！"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setFraudIndex(prev => (prev + 1) % fraudTips.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // SOS Simulation Countdown
  useEffect(() => {
    let timer: any;
    if (sosActiveLevel > 0) {
      timer = setInterval(() => {
        setSOSSecondsLeft(prev => {
          if (prev <= 1) {
            if (sosActiveLevel === 1) {
              setSOSActiveLevel(2);
              showToast('🚨 第一级守护人未在限定时间内确认。已自动转入第二级社工上门查看！', 'error');
              return 180;
            } else if (sosActiveLevel === 2) {
              setSOSActiveLevel(3);
              showToast('🚨 紧急警报！第二级社工超时未达。已极速上报第三级物业保安团队携医务120紧急破门！', 'error');
              return 300;
            } else {
              clearInterval(timer);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sosActiveLevel]);

  // Click handler for emergency confirmation
  const handleSOSConfirm = () => {
    setShowSOSConfirm(false);
    setSOSActiveLevel(1);
    setSOSSecondsLeft(120);
    showToast('🆘 紧急救援通知已通过电话、短信、软件强行广播发送至子女及专职管家！', 'error');
  };

  const handleReportSafe = () => {
    if (todayReportedSafe) return;
    setTodayReportedSafe(true);
    showToast('今日已报平安！您的守护人小雅、管家小王已同步收到。奖励小红花1朵🌺！', 'success');
  };

  const handleHelpAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`帮扶申请成功！已分派给楼栋管家小王和志愿者小张，他们将尽快上门协助您。`, 'success');
    setShowHelpApplication(false);
    setHelpAppTime('');
    setHelpAppNotes('');
  };

  // Preset Template loader for elder activities
  const handleLoadActivityTemplate = (type: string) => {
    const today = '今天';
    switch (type) {
      case '打牌/下棋':
        setCareActivityWhat('下午打牌下棋，缺一个人，老少皆宜');
        setCareActivityWhen('今天下午2点');
        setCareActivityWhere('3号楼B1层棋牌角');
        break;
      case '太极/晨练':
        setCareActivityWhat('明天早上一起打杨氏太极拳，强身健体');
        setCareActivityWhen('明天早上7点');
        setCareActivityWhere('小区中心广场大榕树下');
        break;
      case '广场舞':
        setCareActivityWhat('今晚广场舞新曲排练，姐妹们一起来扭一扭');
        setCareActivityWhen('今天晚上19:30');
        setCareActivityWhere('小区大广场东侧');
        break;
      case '读书会':
        setCareActivityWhat('夕阳红读书会，本期围炉共读经典《红楼梦》');
        setCareActivityWhen('周四下午14:00');
        setCareActivityWhere('2号楼1层社区阅览室');
        break;
      case '合唱团':
        setCareActivityWhat('长者合唱团排练，学唱经典老歌');
        setCareActivityWhen('本周六下午15:00');
        setCareActivityWhere('2号楼多功能长者活动厅');
        break;
      case '聚餐':
        setCareActivityWhat('明天中午老年大食堂拼桌聚餐，AA制拉近邻里情');
        setCareActivityWhen('明天中午11:45');
        setCareActivityWhere('2号楼1层社区食堂');
        break;
    }
    showToast(`已成功套用【${type}】活动快捷模板！`, 'info');
  };

  // Submit the elder-friendly publisher through the shared backend.
  const handleCarePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let contentStr = '';
    let imageStr: string | undefined = undefined;

    if (carePublishType === 'help') {
      if (!careHelpWhat.trim()) return;
      contentStr = `🙋【生活求助】我想求助：“${careHelpWhat}”；希望在【${careHelpWhen || '尽快'}】送到【${careHelpWhere || '本楼栋公共区域'}】。有能帮忙的邻居吗？`;
    } else if (carePublishType === 'moment') {
      if (!careMomentContent.trim()) return;
      contentStr = `📸 【长者分享】“${careMomentContent}”`;
      imageStr = '☀️';
    } else {
      if (!careActivityWhat.trim() || !careActivityWhen.trim() || !careActivityWhere.trim()) return;
      contentStr = `🎉【邻里聚会召集】“${careActivityWhat}”。时间：${careActivityWhen}，地点：${careActivityWhere}。${careActivityPhone ? `联系电话：${careActivityPhone}` : ''}。想玩的一起报名接龙呀！`;
    }

    const savedPost = await persistPost({
      type: carePublishType === 'activity' ? 'rally' : carePublishType,
      category: carePublishType === 'help' ? '代取' : undefined,
      content: contentStr,
      meetingTime: carePublishType === 'help'
        ? careHelpWhen || '尽快'
        : carePublishType === 'activity'
          ? `${careActivityWhen} · ${careActivityWhere}`
          : undefined,
      bountyPoints: carePublishType === 'help' ? 5 : undefined,
    });
    if (!savedPost) return;

    setLocalFeeds((current) => [{ ...savedPost, image: savedPost.image || imageStr }, ...current.filter((item) => item.id !== savedPost.id)]);
    showToast(carePublishType === 'activity' ? '🎉 活动发起成功！已广播展示在邻里圈。' : '发布成功！感谢您的分享！', 'success');

    // Clear forms
    setCareHelpWhat(''); setCareHelpWhen(''); setCareHelpWhere('');
    setCareMomentContent('');
    setCareActivityWhat(''); setCareActivityWhen(''); setCareActivityWhere(''); setCareActivityPhone('');
    setShowCarePublish(false);
  };

  const handleClaimHelpLocal = (itemId: string, authorName: string) => {
    setLocalFeeds(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, actionStatus: 'claimed' };
      }
      return item;
    }));
    showToast(`您已成功认领帮助【${authorName}】！已为您自动开启零打字对话窗。`, 'success');

    // Open sim chat
    setActiveSimChat({
      id: itemId,
      title: `与邻居 ${authorName} 的帮扶沟通`,
      type: 'help',
      messages: [
        { sender: 'other', text: `您好，太谢谢您认领我的求助了！`, time: '刚刚' },
        { sender: 'me', text: `没关系，顺手的事儿，我正好看见了！`, time: '刚刚' }
      ]
    });
  };

  const handleRegisterEventLocal = (evId: string, evName: string) => {
    if (localRegisteredEvents.includes(evId)) return;
    setLocalRegisteredEvents([...localRegisteredEvents, evId]);
    showToast(`✅ 【${evName}】报名接龙成功！您可以随时在“我的活动群”中进行快捷交流。`, 'success');
  };

  const handleSendQuickReply = (text: string) => {
    if (!activeSimChat) return;
    const myMsg = { sender: 'me' as const, text, time: '刚刚' };
    const replyMsg = { sender: 'other' as const, text: '太好啦，我知道了，非常感谢！', time: '刚刚' };
    setActiveSimChat({
      ...activeSimChat,
      messages: [...activeSimChat.messages, myMsg, replyMsg]
    });
    showToast('快捷短语发送成功！', 'success');
  };

  return (
    <div className="px-3.5 py-1 space-y-6 animate-fade-in text-lg leading-relaxed selection:bg-coral/20 pb-24">

      {/* ======================================================== */}
      {/*              SOS FLOATING EMERGENCY TRIGGER              */}
      {/* ======================================================== */}
      <div className="fixed bottom-24 right-5" style={{ zIndex: 99999 }}>
        <button
          onClick={() => setShowSOSConfirm(true)}
          className="w-22 h-22 rounded-full bg-coral text-white flex flex-col items-center justify-center font-black shadow-2xl border-4 border-white transition-transform active:scale-90"
          id="sos-floating-button"
        >
          <span className="text-3xl">🆘</span>
          <span className="text-sm font-black -mt-0.5 tracking-wider">呼救</span>
        </button>
      </div>

      {/* SOS CONFIRMATION POPUP */}
      {showSOSConfirm && (
        <div className="fixed inset-0 bg-ink/80 flex items-center justify-center p-5 animate-fade-in" style={{ zIndex: 99999 }}>
          <div className="bg-canvas border-4 border-coral rounded-[36px] w-full max-w-sm p-6 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-coral/10 rounded-full flex items-center justify-center mx-auto text-coral text-4xl animate-bounce">
              ⚠️
            </div>
            <div className="space-y-3">
              <h3 className="font-black text-2xl text-ink">确认发出紧急求救？</h3>
              <p className="text-sm font-extrabold text-coral">系统将呼叫紧急联络人并定位到您家！</p>

              <div className="bg-canvas p-4.5 rounded-2xl text-left text-xs space-y-2.5 border-2 border-hairline font-black text-ink-muted">
                <p>📍 呼救定位：<span className="text-coral">泊寓A区 3号楼 {currentUser.room}室</span></p>
                <p>📞 紧急通知：<span className="text-ink">女儿小雅、楼栋管家小王</span></p>
                <p>三级警报机制：前两级超时未确认，将通知保安物业并呼叫120。</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowSOSConfirm(false)}
                className="py-4 bg-surface border-2 border-hairline text-ink font-black text-sm rounded-2xl active:scale-95 transition-all"
              >
                误触取消
              </button>
              <button
                onClick={handleSOSConfirm}
                className="py-4 bg-coral hover:bg-coral-hover text-white font-black text-sm rounded-2xl shadow-md active:scale-95 transition-all"
              >
                🆘 确认求救
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS ACTIVE COUNTDOWN STATUS SCREEN */}
      {sosActiveLevel > 0 && (
        <div className="fixed inset-0 bg-coral flex flex-col items-center justify-center p-6 text-white text-center space-y-6" style={{ zIndex: 99999 }}>
          <div className="w-28 h-28 bg-white text-coral rounded-full flex items-center justify-center text-4xl font-black shadow-2xl animate-bounce">
            SOS
          </div>
          <div className="space-y-3 px-2">
            <h2 className="text-2xl font-black">求助已发出：第 {sosActiveLevel} 级响应</h2>
            <p className="text-base font-bold opacity-90 max-w-sm leading-relaxed">
              {sosActiveLevel === 1 && "第一级：已通知女儿小雅及管家小王。正在联络其进行确认，120秒无应答将自动转为越级呼救！"}
              {sosActiveLevel === 2 && "第二级：子女无应答！居委会及网格员小张已接获紧急通知并火速上门查看！"}
              {sosActiveLevel === 3 && "第三级：高度危机！安保团队已携急救包与防盗破门器赶赴您家并拨打120！"}
            </p>
            <div className="bg-white/10 p-5 rounded-3xl text-left text-xs max-w-sm font-black border border-white/20 space-y-2">
              <p>📍 求助人定位：泊寓A区 3号楼 {currentUser.room}室</p>
              <p>⏱️ 超时转下一级倒计时：<span className="text-yellow-300 font-mono text-sm">{sosSecondsLeft} 秒</span></p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
            <button
              onClick={() => {
                if (sosActiveLevel < 3) {
                  setSOSActiveLevel(prev => prev + 1);
                  setSOSSecondsLeft(sosActiveLevel === 1 ? 180 : 300);
                  showToast('已人工快速推进到下一级响应进行测试。', 'info');
                } else {
                  showToast('已经是最高响应等级。', 'info');
                }
              }}
              className="py-3 bg-white/10 border border-white/30 text-white font-bold text-xs rounded-xl"
            >
              ⏩ 模拟超时：进入下一级响应测试
            </button>
            <button
              onClick={() => {
                setSOSActiveLevel(0);
                showToast('已取消本次求救警报，守护人及管家已接获撤销信号。', 'success');
              }}
              className="py-4 bg-white text-coral font-black text-sm rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              ✅ 已安全，撤销求救
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/*                     CARE MODE - HOME TAB                 */}
      {/* ======================================================== */}
      {activeTab === 'home' && (
        <div className="space-y-5 animate-fade-in text-left">

          {/* ANTI-FRAUD BANNER (CAROUSEL) */}
          <div className="bg-amber-light p-4 rounded-[28px] border-2 border-amber/30 flex items-center gap-3 shadow-xs">
            <span className="text-2xl animate-bounce shrink-0">🛡️</span>
            <button
              onClick={() => setShowFraudKnowledge(true)}
              className="flex-1 text-left active:scale-99 transition-all"
            >
              <p className="text-[10px] text-amber-hover font-black uppercase tracking-wider leading-none">防诈骗/痛点每日早提醒</p>
              <p className="text-xs font-black text-ink mt-1.5 truncate">
                {fraudTips[fraudIndex]}
              </p>
            </button>
            <span className="text-[10px] text-amber font-black shrink-0 bg-white/70 px-2.5 py-1.5 rounded-full border border-amber/20">
              多学两招
            </span>
          </div>

          {/* TWO COMPACT QUICK ACTION BUTTONS (Moved above tabs & shrunk) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleReportSafe}
              disabled={todayReportedSafe}
              className={`py-3.5 px-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                todayReportedSafe
                  ? 'bg-jade-light text-jade border-jade/20 opacity-90 cursor-not-allowed'
                  : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700'
              }`}
            >
              <span className="text-xl">{todayReportedSafe ? '✅' : '👋'}</span>
              <div className="text-left">
                <p className="font-black text-xs leading-tight">
                  {todayReportedSafe ? '今日已报平安' : '点击报平安'}
                </p>
                <p className="text-[9px] font-bold opacity-85 leading-none mt-0.5">
                  {todayReportedSafe ? '女儿及管家已悉知' : '自动告知家人'}
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowHelpApplication(true)}
              className="py-3.5 px-3 bg-amber text-white border-2 border-transparent hover:bg-amber-hover rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span className="text-xl">📋</span>
              <div className="text-left">
                <p className="font-black text-xs leading-tight">申请生活帮扶</p>
                <p className="text-[9px] font-bold opacity-90 leading-none mt-0.5">代买药/剪发/维修</p>
              </div>
            </button>
          </div>

          {/* FOUR BIG STAT OVERVIEW CARDS */}
          <div className="grid grid-cols-4 gap-2.5 bg-surface p-3.5 rounded-[32px] border-2 border-hairline shadow-xs">
            {[
              { key: 'spaces', label: '公共空间', count: `${elderSpaces.length}处`, icon: '🏠' },
              { key: 'events', label: '本周活动', count: `${elderEvents.length}场`, icon: '📅' },
              { key: 'services', label: '周边服务', count: `${elderServices.length}家`, icon: '🏪' },
              { key: 'social', label: '专属社工', count: `${elderSocialWorkers.length}人`, icon: '🤝' }
            ].map(card => {
              const isSel = homeSubTab === card.key;
              return (
                <button
                  key={card.key}
                  onClick={() => setHomeSubTab(card.key as any)}
                  className={`flex flex-col items-center justify-center py-4 px-1 rounded-2xl border-2 transition-all text-center ${
                    isSel ? 'border-jade bg-jade-light/80 ring-4 ring-jade/20 scale-102' : 'border-hairline bg-canvas'
                  }`}
                >
                  <span className="text-3xl">{card.icon}</span>
                  <span className="text-xs font-black text-ink mt-2 truncate w-full">{card.label}</span>
                  <span className="text-xs font-black text-ink-muted mt-1 font-mono">{card.count}</span>
                </button>
              );
            })}
          </div>

          {/* SUB-TAB CONTENTS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-1.5 border-b-2 border-hairline">
              <h3 className="font-black text-base text-ink flex items-center gap-2">
                {homeSubTab === 'spaces' && '🏠 社区公共空间'}
                {homeSubTab === 'events' && '📅 本周精彩活动'}
                {homeSubTab === 'services' && '🏪 周边便利商家'}
                {homeSubTab === 'social' && '🤝 长者专职社工/志愿者'}
              </h3>
              <span className="text-xs text-ink-muted font-bold">向左滑显示更多</span>
            </div>

            {/* 1. PUBLIC SPACES (8 items) */}
            {homeSubTab === 'spaces' && (
              <div className="space-y-4">
                {elderSpaces.map(sp => {
                  const isBooked = localBookedSpaces.includes(sp.id);
                  return (
                    <div key={sp.id} className="bg-surface p-5 rounded-[28px] border-2 border-hairline space-y-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl p-2.5 bg-canvas rounded-2xl border border-hairline">{sp.icon}</span>
                          <div>
                            <h4 className="font-black text-lg text-ink">{sp.name}</h4>
                            <p className="text-xs text-ink-muted font-black mt-1">📍 {sp.location} • 👥 容纳{sp.capacity}人</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-amber bg-amber-light px-2 py-1 rounded-lg">★ {sp.rating}分</span>
                      </div>
                      <p className="text-sm text-ink-muted font-bold leading-relaxed">
                        💡 场景设施：{sp.description}
                      </p>
                      <div className="grid grid-cols-2 gap-3.5 pt-1">
                        <button
                          onClick={() => setShowRouteMap(sp.name)}
                          className="py-3 bg-canvas hover:bg-hairline text-ink border border-hairline font-black text-xs rounded-xl flex items-center justify-center gap-1.5"
                        >
                          📍 步行指引导航
                        </button>
                        <button
                          onClick={() => {
                            if (isBooked) return;
                            setLocalBookedSpaces([...localBookedSpaces, sp.id]);
                            showToast(`【${sp.name}】预订并登记成功！`);
                          }}
                          className={`py-3 font-black text-xs rounded-xl ${
                            isBooked ? 'bg-jade-light text-jade' : 'bg-jade hover:bg-jade-hover text-white shadow-sm'
                          }`}
                        >
                          {isBooked ? '✓ 已预订登记' : '📅 预约使用登记'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. WEEKLY EVENTS (5 items) */}
            {homeSubTab === 'events' && (
              <div className="space-y-4">
                {elderEvents.map(ev => {
                  const isSigned = localRegisteredEvents.includes(ev.id);
                  return (
                    <div key={ev.id} className="bg-surface p-5 rounded-[28px] border-2 border-hairline space-y-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-lg text-ink">{ev.name}</h4>
                          <span className="inline-block mt-2 px-3 py-1 bg-coral/10 text-coral text-xs rounded-full font-black">
                            发起人：{ev.organizer}
                          </span>
                        </div>
                        <span className="text-xs text-ink-muted font-black">
                          已接龙 <strong className="text-coral text-sm">{ev.signedUp + (isSigned ? 1 : 0)}</strong>/{ev.capacity}人
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-ink-muted font-black">
                        <p>🕒 举办时间：{ev.time}</p>
                        <p>📍 活动地点：{ev.location}</p>
                        <p>👥 适合长辈：{ev.target}</p>
                      </div>
                      <p className="text-sm text-ink-subtle font-bold border-t border-hairline pt-3">
                        💬 介绍：{ev.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          onClick={() => {
                            if (!isSigned) {
                              showToast('请先点击报名接龙活动！', 'info');
                              return;
                            }
                            setActiveSimChat({
                              id: ev.id,
                              title: `${ev.name} 接龙群聊`,
                              type: 'event',
                              messages: [
                                { sender: 'other', text: `欢迎邻居进入 ${ev.name} 准备群！请按时到场。`, time: '刚刚' }
                              ]
                            });
                          }}
                          className="py-3 bg-canvas text-ink border border-hairline font-black text-xs rounded-xl flex items-center justify-center gap-1"
                        >
                          💬 沟通群聊 {isSigned && '🟢'}
                        </button>
                        <button
                          onClick={() => handleRegisterEventLocal(ev.id, ev.name)}
                          className={`py-3 font-black text-xs rounded-xl ${
                            isSigned ? 'bg-jade-light text-jade border-jade/20' : 'bg-jade text-white shadow-sm'
                          }`}
                        >
                          {isSigned ? '✓ 已报名接龙' : '✅ 我要报名接龙'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. NEIGHBOR SERVICES (12 items) */}
            {homeSubTab === 'services' && (
              <div className="space-y-4">
                {elderServices.map(se => (
                  <div key={se.id} className="bg-surface p-5 rounded-[28px] border-2 border-hairline space-y-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-lg text-ink">{se.name}</h4>
                        <p className="text-xs text-ink-muted font-bold mt-1">📍 地址：{se.location} | 🕒 {se.hours}</p>
                      </div>
                      <span className="text-xs bg-amber-light text-amber border border-amber/20 px-2 py-0.5 rounded font-black">⭐ {se.rating}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {se.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-jade/10 text-jade rounded font-black">{tag}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setShowRouteMap(se.name)}
                        className="py-3 bg-canvas text-ink border border-hairline font-black text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        🗺️ 查看指引
                      </button>
                      <a
                        href={`tel:${se.phone}`}
                        onClick={(e) => {
                          e.preventDefault();
                          showToast(`正在自动一键拨号联络商家：${se.phone}`);
                        }}
                        className="py-3 bg-jade hover:bg-jade-hover text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        📞 电话联系
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. SOCIAL WORKERS (4 cards) */}
            {homeSubTab === 'social' && (
              <div className="space-y-4">
                {elderSocialWorkers.map(sw => (
                  <div key={sw.id} className="bg-surface p-5 rounded-[28px] border-2 border-hairline space-y-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-14 h-14 bg-jade-light text-jade border-2 border-jade/15 rounded-full flex items-center justify-center text-3xl shadow-sm">
                        {sw.avatar}
                      </span>
                      <div>
                        <h4 className="font-black text-lg text-ink flex items-center gap-2">
                          {sw.name}
                          <span className="text-xs bg-jade text-white px-2 py-0.5 rounded font-black">{sw.role}</span>
                        </h4>
                        <p className="text-xs text-ink-muted font-bold mt-1">🕒 值班时间：{sw.dutyTime}</p>
                      </div>
                    </div>

                    <p className="text-sm text-ink-muted font-bold leading-relaxed pt-1">
                      💼 服务范围：{sw.scope}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => {
                          setActiveSimChat({
                            id: sw.id,
                            title: `咨询 ${sw.role} ${sw.name}`,
                            type: 'help',
                            messages: [
                              { sender: 'other', text: `您好！我是您的专属${sw.role}${sw.name}，请问有什么可以帮助您的？`, time: '刚刚' }
                            ]
                          });
                        }}
                        className="py-3 bg-canvas text-ink border border-hairline font-black text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        💬 提问在线咨询
                      </button>
                      <a
                        href={`tel:${sw.phone}`}
                        onClick={(e) => {
                          e.preventDefault();
                          showToast(`正在为您呼叫${sw.role}${sw.name}：${sw.phone}`);
                        }}
                        className="py-3 bg-jade text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm"
                      >
                        📞 拨打电话联系
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* THREE GIANT BOTTOM LAUNCHERS (Section 1.2 requirement) */}
          <div className="flex flex-col gap-3 pt-5 border-t-2 border-hairline">
            <button
              onClick={() => {
                setCarePublishType('help');
                setShowCarePublish(true);
              }}
              className="w-full py-5 bg-coral hover:bg-coral-hover text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <span className="text-2xl">🙋</span> 我需要帮助
            </button>
            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={() => {
                  setCarePublishType('moment');
                  setShowCarePublish(true);
                }}
                className="py-4.5 bg-jade hover:bg-jade-hover text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <span className="text-xl">📝</span> 发条动态
              </button>
              <button
                onClick={() => {
                  setCarePublishType('activity');
                  setShowCarePublish(true);
                }}
                className="py-4.5 bg-amber hover:bg-amber-hover text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <span className="text-xl">🎉</span> 发起活动
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/*               CARE MODE - NEIGHBORHOOD CIRCLE TAB        */}
      {/* ======================================================== */}
      {activeTab === 'circle' && (
        <div className="space-y-5 animate-fade-in text-left">

          <div className="flex justify-between items-center">
            <h2 className="font-black text-xl text-ink">👥 邻里圈 · 关怀版</h2>
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              互助与活动分享
            </span>
          </div>

          {/* Filter subtabs */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
            {[
              { key: '全部', label: '全部信息 🖥️' },
              { key: '关怀圈', label: '老年兴趣圈 🌺' },
              { key: '互助需求', label: '邻里求助 🤝' },
              { key: '居民动态', label: '日常动态 📸' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFeedFilter(f.key)}
                className={`text-sm px-5 py-3 rounded-full border-2 shrink-0 font-black transition-all ${
                  feedFilter === f.key
                    ? 'bg-jade text-white border-transparent shadow-md'
                    : 'bg-surface text-ink-muted border-hairline'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Elder Wellness interest group if "关怀圈" is selected */}
          {feedFilter === '关怀圈' && (
            <div className="bg-indigo-50 p-4.5 rounded-[28px] border-2 border-indigo-100 space-y-3 shadow-xs">
              <h3 className="font-black text-indigo-950 text-base flex items-center gap-2">
                <span>🌺</span> 银龄老年轻松俱乐部
              </h3>
              <div className="space-y-2.5">
                {[
                  { text: "👴 社区书法社招新：每周二下午2点在2号楼阅览室。免费备纸墨！", action: "我要报名" },
                  { text: "👵 陪伴独居长辈志愿组：支持上门唠家常解寂寞或陪院散步。", action: "呼叫志愿者" },
                  { text: "🥗 健康知识讲座：周五上午讲解长者低糖抗炎餐，附送磨砂保温杯！", action: "我要报名" }
                ].map((tip, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-2xl text-xs text-indigo-900 border border-indigo-100 flex justify-between items-center gap-2">
                    <p className="font-black leading-relaxed flex-1">{tip.text}</p>
                    <button
                      onClick={() => showToast(`已为您自动预约提交“${tip.action}”！`, 'success')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shrink-0"
                    >
                      报名
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feed listings from local state */}
          <div className="space-y-4">
            {localFeeds
              .filter(item => {
                if (feedFilter === '全部') return true;
                if (feedFilter === '互助需求') return item.type === 'help';
                if (feedFilter === '居民动态') return item.type === 'moment';
                if (feedFilter === '关怀圈') return item.type === 'activity' || item.type === 'rally' as any;
                return true;
              })
              .map(item => {
                const isHelp = item.type === 'help';
                const isActivity = item.type === 'activity' || item.type === 'rally' as any;
                return (
                  <div key={item.id} className="bg-surface p-5 rounded-[32px] border-2 border-hairline space-y-4 shadow-sm animate-fade-in">

                    {/* User profile */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="w-12 h-12 rounded-full bg-jade text-white font-black text-lg flex items-center justify-center shadow-xs">
                          {item.authorName.charAt(0)}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-base text-ink">{item.authorName}</span>
                            <span className="text-[10px] text-ink-muted bg-canvas border border-hairline px-1.5 py-0.5 rounded font-bold">
                              {item.authorRoom}
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-subtle mt-0.5 font-bold">{item.time} • 邻居</p>
                        </div>
                      </div>
                      {isHelp && (
                        <span className="text-xs px-2.5 py-1 bg-coral/10 text-coral border border-coral/20 rounded-full font-black">
                          求助邻居 🙋
                        </span>
                      )}
                      {isActivity && (
                        <span className="text-xs px-2.5 py-1 bg-amber-light text-amber border border-amber/20 rounded-full font-black">
                          🎉 邻里活动
                        </span>
                      )}
                    </div>

                    <p className="text-base font-black text-ink leading-relaxed break-all">
                      {item.content}
                    </p>

                    {item.image && (
                      <div className="p-4 bg-canvas rounded-2xl border border-hairline text-center text-4xl select-none">
                        {item.image}
                      </div>
                    )}

                    {/* Bottom actions */}
                    <div className="flex justify-between items-center pt-3 border-t border-hairline">
                      <button
                        onClick={() => {
                          if (item.authorId) {
                            handleLikePost(item.id);
                          } else {
                            item.hasLiked = !item.hasLiked;
                            item.likes = item.hasLiked ? item.likes + 1 : item.likes - 1;
                            setLocalFeeds([...localFeeds]);
                            showToast(item.hasLiked ? '点赞鼓励成功！感谢大爱！' : '取消点赞');
                          }
                        }}
                        className={`flex items-center gap-1.5 text-xs font-black ${item.hasLiked ? 'text-coral' : 'text-ink-muted'}`}
                      >
                        <span className="text-xl">❤️</span> 点赞 ({item.likes})
                      </button>

                      {isHelp && item.actionStatus !== 'claimed' && (
                        <button
                          onClick={() => item.authorId ? handleHelpAction(item.id) : handleClaimHelpLocal(item.id, item.authorName)}
                          className="py-2.5 px-4 bg-coral hover:bg-coral-hover text-white font-black text-xs rounded-xl shadow-sm transition-all active:scale-95"
                        >
                          {item.authorId === currentUser.id ? (item.helpStatus === 'claimed' ? '✅ 确认完成' : '取消需求') : '🙌 我来帮他'}
                        </button>
                      )}
                      {isHelp && item.actionStatus === 'claimed' && (
                        <span className="text-xs text-jade bg-jade-light border border-jade/15 px-3 py-1.5 rounded-xl font-black">
                          ✓ 热心邻居正在帮扶中
                        </span>
                      )}

                      {isActivity && (
                        <button
                          onClick={() => handleRegisterEventLocal(item.id, '聚会活动')}
                          className="py-2.5 px-4 bg-amber hover:bg-amber-hover text-white font-black text-xs rounded-xl shadow-sm transition-all active:scale-95"
                        >
                          ✅ 我要参加接龙
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
          </div>

          {/* THREE GIANT BOTTOM LAUNCHERS (Section 1.2 requirement) */}
          <div className="flex flex-col gap-3 pt-5 border-t-2 border-hairline">
            <button
              onClick={() => {
                setCarePublishType('help');
                setShowCarePublish(true);
              }}
              className="w-full py-5 bg-coral hover:bg-coral-hover text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <span className="text-2xl">🙋</span> 我需要帮助
            </button>
            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={() => {
                  setCarePublishType('moment');
                  setShowCarePublish(true);
                }}
                className="py-4.5 bg-jade hover:bg-jade-hover text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <span className="text-xl">📝</span> 发条动态
              </button>
              <button
                onClick={() => {
                  setCarePublishType('activity');
                  setShowCarePublish(true);
                }}
                className="py-4.5 bg-amber hover:bg-amber-hover text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <span className="text-xl">🎉</span> 发起活动
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/*                      CARE MODE - ME TAB                  */}
      {/* ======================================================== */}
      {activeTab === 'me' && (
        <div className="space-y-5 animate-fade-in text-left">

          {/* User profile card */}
          <div className="bg-surface p-5 rounded-[32px] border-2 border-hairline space-y-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-jade flex items-center justify-center text-3xl font-black text-white shadow-md border-2 border-white">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-base text-ink flex items-center gap-2">
                  {currentUser.name}
                  <span className="text-xs bg-jade-light text-jade border border-jade/15 px-2 py-0.5 rounded font-bold">已认证长辈</span>
                </h3>
                <p className="text-xs text-jade font-black mt-1.5">🚪 我的常住：泊寓A区 · 3号楼 {currentUser.room}室</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center pt-1.5">
              <div className="bg-jade-light/30 p-3.5 rounded-2xl border-2 border-jade/15">
                <span className="block text-xs font-black text-jade">⭐ 邻里好评</span>
                <span className="text-lg font-black text-jade mt-0.5 block font-mono">23 次</span>
              </div>
              <div className="bg-amber-light p-3.5 rounded-2xl border-2 border-amber/20">
                <span className="block text-xs font-black text-amber">🌺 小红花勋章</span>
                <span className="text-lg font-black text-amber mt-0.5 block font-mono">45 朵</span>
              </div>
            </div>
          </div>

          {/* Mode switch */}
          <button
            onClick={() => triggerToggleCareMode(false)}
            className="w-full py-4.5 bg-jade-light border-2 border-jade text-jade hover:bg-jade-light/80 rounded-[28px] font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
          >
            <span>🔄 切换到普通版（字小功能多）</span>
          </button>

          {/* 4 Large Clean Grid Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'health_safety', label: '🏥 安全与药盒', desc: '设定守护人、用药提醒打卡', color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200/60' },
              { key: 'activity_help', label: '📅 活动与求助', desc: '活动接龙、求助与帮扶记录', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200/60' },
              { key: 'policy_cert', label: '📖 政策与认证', desc: '高龄津贴/医保、居委认证', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200/60' },
              { key: 'sys_settings', label: '⚙️ 关怀版设置', desc: '字体大小、声音设定、版本', color: 'bg-gray-50 hover:bg-gray-100 border-gray-200/60' }
            ].map(menu => (
              <button
                key={menu.key}
                onClick={() => setCareActiveMenuModal(menu.key)}
                className={`p-4 rounded-[24px] border-2 flex flex-col items-start text-left justify-between transition-all active:scale-98 shadow-xs ${menu.color}`}
              >
                <h4 className="font-black text-sm text-ink flex items-center gap-1.5">
                  {menu.label}
                </h4>
                <p className="text-[10px] text-ink-muted font-bold mt-2.5 leading-relaxed">{menu.desc}</p>
                <div className="self-end mt-4 bg-white/80 p-1.5 rounded-full border border-hairline/20 shadow-2xs">
                  <ChevronRight className="w-3.5 h-3.5 text-ink-subtle" />
                </div>
              </button>
            ))}
          </div>

        </div>
      )}

      {showCarePublish && (
        <div className="fixed inset-0 bg-ink/80 flex flex-col justify-end" style={{ zIndex: 99999 }}>
          <div className="bg-canvas border-t-4 border-jade rounded-t-[36px] max-h-[92%] overflow-y-auto flex flex-col p-6 space-y-4 text-left">
            <div className="flex justify-between items-center pb-2.5 border-b-2 border-hairline">
              <h3 className="font-black text-lg text-ink">
                {carePublishType === 'help' && '🙋 我需要帮助'}
                {carePublishType === 'moment' && '📝 发条社区动态'}
                {carePublishType === 'activity' && '🎉 邻里活动发起'}
              </h3>
              <button onClick={() => setShowCarePublish(false)} className="w-9 h-9 rounded-full bg-surface text-ink flex items-center justify-center font-black">✕</button>
            </div>

            <form onSubmit={handleCarePublishSubmit} className="space-y-4 text-xs font-black">
              {carePublishType === 'help' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm text-ink">什么事？（必填）</label>
                    <input
                      type="text"
                      value={careHelpWhat}
                      onChange={(e) => setKeepSpacesAndVal(e.target.value, setCareHelpWhat)}
                      placeholder="例如：我需要有人帮我取快递"
                      className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-xl px-3.5 py-4 outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm text-ink">什么时间？</label>
                    <input
                      type="text"
                      value={careHelpWhen}
                      onChange={(e) => setKeepSpacesAndVal(e.target.value, setCareHelpWhen)}
                      placeholder="例如：今天下午3点"
                      className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-xl px-3.5 py-4 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm text-ink">在哪？</label>
                    <input
                      type="text"
                      value={careHelpWhere}
                      onChange={(e) => setKeepSpacesAndVal(e.target.value, setCareHelpWhere)}
                      placeholder="例如：3号楼门口"
                      className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-xl px-3.5 py-4 outline-none"
                    />
                  </div>
                </>
              )}

              {carePublishType === 'moment' && (
                <div className="space-y-2">
                  <label className="block text-sm text-ink font-black">想说什么？（必填）</label>
                  <textarea
                    rows={4}
                    value={careMomentContent}
                    onChange={(e) => setCareMomentContent(e.target.value)}
                    placeholder="例如：今天天气真好"
                    className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-xl p-4 outline-none resize-none"
                    required
                  />
                  <p className="text-[10px] text-ink-subtle">📷 配图：长辈可直接点击手机相册选择照片。</p>
                </div>
              )}

              {carePublishType === 'activity' && (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-jade">💡 模板推荐一键套用：</label>
                    <div className="flex flex-wrap gap-2 pb-1.5">
                      {['打牌/下棋', '太极/晨练', '广场舞', '读书会', '合唱团', '聚餐'].map(temp => (
                        <button
                          type="button"
                          key={temp}
                          onClick={() => handleLoadActivityTemplate(temp)}
                          className="px-3.5 py-2 bg-canvas border border-hairline hover:border-jade text-ink text-[11px] font-black rounded-lg transition-all"
                        >
                          {temp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm text-ink">什么活动？（必填）</label>
                    <input
                      type="text"
                      value={careActivityWhat}
                      onChange={(e) => setCareActivityWhat(e.target.value)}
                      placeholder="例如：下午打牌，缺一个人"
                      className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-xl px-3.5 py-4 outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm text-ink">什么时候？</label>
                      <input
                        type="text"
                        value={careActivityWhen}
                        onChange={(e) => setCareActivityWhen(e.target.value)}
                        placeholder="例如：今天下午2点"
                        className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-xl px-3.5 py-4 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm text-ink">在哪儿？</label>
                      <input
                        type="text"
                        value={careActivityWhere}
                        onChange={(e) => setCareActivityWhere(e.target.value)}
                        placeholder="例如：3号楼活动室"
                        className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-xl px-3.5 py-4 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm text-ink">留个电话（选填）</label>
                    <input
                      type="text"
                      value={careActivityPhone}
                      onChange={(e) => setCareActivityPhone(e.target.value)}
                      placeholder="方便邻居联系你"
                      className="w-full bg-surface border-2 border-hairline focus:border-jade rounded-xl px-3.5 py-4 outline-none"
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-4.5 bg-jade hover:bg-jade-hover text-white font-black text-sm rounded-2xl shadow-md mt-2">确认广播发布</button>
            </form>
          </div>
        </div>
      )}

      {/* WALK PATH NAVIGATION MAP POPUP */}
      {showRouteMap && (
        <div className="fixed inset-0 bg-ink/80 flex items-center justify-center p-5" style={{ zIndex: 99999 }}>
          <div className="bg-canvas border-2 border-jade rounded-[36px] w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-lg text-ink flex items-center justify-center gap-1.5">
              <span>🚶</span> 步行去【{showRouteMap}】
            </h3>
            <div className="relative h-60 w-full bg-emerald-50 rounded-2xl border-2 border-emerald-100 flex flex-col items-center justify-center p-4">
              <div className="text-sm font-black text-emerald-900 bg-white/90 px-3 py-1.5 rounded-full border border-emerald-100 shadow-xs animate-bounce mb-2">
                📍 精准定位指引中
              </div>
              <p className="text-xs text-emerald-950 font-black leading-relaxed">
                指引：从 A区3号楼 坐电梯下楼，沿林荫道前行120米，通过无障碍坡道，步行2分钟即到。过马路请看清左右来车！
              </p>
            </div>
            <button
              onClick={() => { showToast('已安全关闭地图指引。', 'info'); setShowRouteMap(null); }}
              className="w-full py-4 bg-jade text-white font-black text-sm rounded-2xl"
            >
              关闭指引，我已到达
            </button>
          </div>
        </div>
      )}

      {/* SIMULATED ZERO-TYPING INTERACTIVE CHAT */}
      {activeSimChat && (
        <div className="fixed inset-0 bg-ink/80 flex flex-col justify-end" style={{ zIndex: 99999 }}>
          <div className="bg-canvas border-t-4 border-jade rounded-t-[36px] h-[85%] flex flex-col p-6 space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b-2 border-hairline">
              <h3 className="font-black text-base text-ink">💬 {activeSimChat.title}</h3>
              <button onClick={() => setActiveSimChat(null)} className="w-9 h-9 rounded-full bg-surface text-ink flex items-center justify-center font-black">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 p-3.5 bg-canvas-muted rounded-2xl border border-hairline">
              {activeSimChat.messages.map((msg, index) => {
                const isMe = msg.sender === 'me';
                return (
                  <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-ink-subtle px-1.5 mb-0.5">{msg.time}</span>
                    <div className={`p-4 rounded-2xl max-w-[85%] text-xs font-black leading-relaxed shadow-sm ${
                      isMe ? 'bg-jade text-white rounded-tr-none' : 'bg-surface text-ink rounded-tl-none border border-hairline'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 border-t border-hairline pt-3">
              <p className="text-[10px] text-center font-black text-ink-subtle">
                💡 关怀版特惠：支持大字一键发送，无需长辈吃力打字
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['好的，收到！', '谢谢你，邻居！', '我在房间等你。'].map(reply => (
                  <button
                    key={reply}
                    onClick={() => handleSendQuickReply(reply)}
                    className="py-4 bg-surface border-2 border-hairline hover:bg-hairline text-ink font-black text-xs rounded-xl active:scale-95 transition-transform"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setActiveSimChat(null)} className="w-full py-4 bg-jade text-white font-black text-sm rounded-2xl">关闭对话</button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/*              CARE MODE - COMBINED MENU MODALS            */}
      {/* ======================================================== */}
      {careActiveMenuModal && (
        <div className="fixed inset-0 bg-ink/80 flex flex-col justify-end" style={{ zIndex: 99999 }}>
          <div className="bg-canvas border-t-4 border-jade rounded-t-[36px] max-h-[90%] overflow-y-auto flex flex-col p-6 space-y-4 text-left">

            <div className="flex justify-between items-center pb-2.5 border-b-2 border-hairline">
              <h3 className="font-extrabold text-lg text-ink">
                {careActiveMenuModal === 'health_safety' && '🏥 我的安全与健康药盒'}
                {careActiveMenuModal === 'activity_help' && '📅 我的活动、求助与帮扶'}
                {careActiveMenuModal === 'policy_cert' && '📖 办事政策指引与认证'}
                {careActiveMenuModal === 'sys_settings' && '⚙️ 关怀版系统设定'}
              </h3>
              <button onClick={() => setCareActiveMenuModal(null)} className="w-9 h-9 rounded-full bg-surface text-ink flex items-center justify-center font-black">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[70vh] space-y-4">

              {/* 1. HEALTH AND SAFETY */}
              {careActiveMenuModal === 'health_safety' && (
                <div className="space-y-4">
                  {/* Selector Tabs */}
                  <div className="flex bg-canvas-muted p-1.5 rounded-2xl border-2 border-hairline">
                    <button
                      onClick={() => setInnerHealthTab('guardians')}
                      className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
                        innerHealthTab === 'guardians' ? 'bg-jade text-white shadow-sm' : 'text-ink-muted'
                      }`}
                    >
                      🛡️ 安全守护人 ({localGuardians.length}人)
                    </button>
                    <button
                      onClick={() => setInnerHealthTab('meds')}
                      className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
                        innerHealthTab === 'meds' ? 'bg-jade text-white shadow-sm' : 'text-ink-muted'
                      }`}
                    >
                      💊 吃药提醒本 ({localMeds.length}项)
                    </button>
                  </div>

                  {innerHealthTab === 'guardians' ? (
                    <div className="space-y-4 text-xs font-black animate-fade-in">
                      <div className="space-y-2.5">
                        {localGuardians.map(g => (
                          <div key={g.id} className="bg-surface p-4 rounded-2xl border-2 border-hairline flex justify-between items-center">
                            <div>
                              <p className="text-sm font-black text-ink">{g.name} ({g.relation})</p>
                              <p className="text-xs text-ink-muted mt-1">📞 手机号：{g.phone}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] rounded font-black ${g.isPrimary ? 'bg-jade text-white' : 'bg-surface border border-hairline text-ink-muted'}`}>
                              {g.isPrimary ? '主守护人' : '备用守护'}
                            </span>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newGuardName.trim() || !newGuardPhone.trim()) return;
                        setLocalGuardians([...localGuardians, { id: Date.now().toString(), name: newGuardName, phone: newGuardPhone, relation: newGuardRelation, isPrimary: false }]);
                        setNewGuardName(''); setNewGuardPhone('');
                        showToast('守护人添加登记成功！');
                      }} className="bg-surface p-4.5 rounded-2xl border-2 border-hairline space-y-3">
                        <h4 className="text-sm font-black text-ink">➕ 登记增加新守护人</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="姓名" value={newGuardName} onChange={e => setNewGuardName(e.target.value)} className="bg-canvas border border-hairline rounded-lg p-2.5 outline-none font-black" required />
                          <input type="text" placeholder="手机号" value={newGuardPhone} onChange={e => setNewGuardPhone(e.target.value)} className="bg-canvas border border-hairline rounded-lg p-2.5 outline-none font-black" required />
                        </div>
                        <select value={newGuardRelation} onChange={e => setNewGuardRelation(e.target.value)} className="w-full bg-canvas border border-hairline rounded-lg p-2.5 outline-none font-black">
                          <option value="子女">子女</option>
                          <option value="伴侣">伴侣</option>
                          <option value="管家">管家</option>
                          <option value="亲属">其他亲属</option>
                        </select>
                        <button type="submit" className="w-full py-3.5 bg-jade text-white rounded-xl font-black text-xs">确认增加守护人</button>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs font-black animate-fade-in">
                      <div className="space-y-2.5">
                        {localMeds.map(m => (
                          <div key={m.id} className="bg-surface p-4 rounded-2xl border-2 border-hairline flex justify-between items-center">
                            <div>
                              <p className="text-sm font-black text-ink">{m.name} | {m.dosage}</p>
                              <p className="text-xs text-ink-muted mt-1">🕒 时间点：{m.time} ({m.frequency})</p>
                            </div>
                            <button
                              onClick={() => {
                                m.takenToday = !m.takenToday;
                                setLocalMeds([...localMeds]);
                                showToast(m.takenToday ? '服药打卡成功！保持规律服药！' : '已撤销用药标记');
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-black ${m.takenToday ? 'bg-jade-light text-jade border border-jade/15' : 'bg-jade text-white'}`}
                            >
                              {m.takenToday ? '✓ 今日已服药' : '💊 点击服药打卡'}
                            </button>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newMedName.trim() || !newMedDosage.trim()) return;
                        setLocalMeds([...localMeds, { id: Date.now().toString(), name: newMedName, dosage: newMedDosage, frequency: '每日一次', time: newMedTime || '09:00', takenToday: false }]);
                        setNewMedName(''); setNewMedDosage(''); setNewMedTime('');
                        showToast('新药物服用计划登记成功！');
                      }} className="bg-surface p-4.5 rounded-2xl border-2 border-hairline space-y-3">
                        <h4 className="text-sm font-black text-ink">➕ 登记新药物计划</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="药品名称" value={newMedName} onChange={e => setNewMedName(e.target.value)} className="bg-canvas border border-hairline rounded-lg p-2.5 outline-none font-black" required />
                          <input type="text" placeholder="剂量 (如1片)" value={newMedDosage} onChange={e => setNewMedDosage(e.target.value)} className="bg-canvas border border-hairline rounded-lg p-2.5 outline-none font-black" required />
                        </div>
                        <input type="text" placeholder="时间点 (如 08:30)" value={newMedTime} onChange={e => setNewMedTime(e.target.value)} className="w-full bg-canvas border border-hairline rounded-lg p-2.5 outline-none font-black" />
                        <button type="submit" className="w-full py-3.5 bg-jade text-white rounded-xl font-black text-xs">确认增加提醒</button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* 2. ACTIVITY AND HELP RECORDS */}
              {careActiveMenuModal === 'activity_help' && (
                <div className="space-y-4">
                  {/* Selector Tabs */}
                  <div className="flex bg-canvas-muted p-1.5 rounded-2xl border-2 border-hairline">
                    <button
                      onClick={() => setInnerActivityTab('publish')}
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${
                        innerActivityTab === 'publish' ? 'bg-jade text-white shadow-sm' : 'text-ink-muted'
                      }`}
                    >
                      📝 我的动态/求助
                    </button>
                    <button
                      onClick={() => setInnerActivityTab('events')}
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${
                        innerActivityTab === 'events' ? 'bg-jade text-white shadow-sm' : 'text-ink-muted'
                      }`}
                    >
                      📅 活动接龙群
                    </button>
                    <button
                      onClick={() => setInnerActivityTab('help')}
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${
                        innerActivityTab === 'help' ? 'bg-jade text-white shadow-sm' : 'text-ink-muted'
                      }`}
                    >
                      🤝 爱心帮扶
                    </button>
                  </div>

                  {innerActivityTab === 'publish' && (
                    <div className="space-y-3 text-xs font-black text-ink-muted animate-fade-in">
                      {localFeeds.filter(f => f.authorName === currentUser.name).length === 0 ? (
                        <div className="text-center py-8 text-ink-subtle font-black">往期发布历史为空。</div>
                      ) : (
                        localFeeds.filter(f => f.authorName === currentUser.name).map(f => (
                          <div key={f.id} className="bg-surface p-4 rounded-2xl border border-hairline space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="px-2 py-0.5 bg-jade/10 text-jade rounded font-black">{f.type === 'help' ? '求助' : f.type === 'rally' as any ? '活动发起' : '动态'}</span>
                              <span className="font-mono">{f.time}</span>
                            </div>
                            <p className="text-sm text-ink leading-relaxed font-black">{f.content}</p>

                            {f.type === ('rally' as any) && (
                              <div className="bg-canvas p-2.5 rounded-xl mt-1 border border-hairline">
                                <p className="text-[10px] text-jade font-black">🟢 报名接龙名单：张德明、李桂芳、王秀兰 已报名接龙！</p>
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setLocalFeeds(prev => prev.filter(item => item.id !== f.id));
                                showToast('已撤销并删除该发布。');
                              }}
                              className="text-coral flex items-center gap-1 font-black text-[11px] pt-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> 撤销该广播
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {innerActivityTab === 'events' && (
                    <div className="space-y-3 text-xs font-black animate-fade-in">
                      {localRegisteredEvents.length === 0 ? (
                        <div className="text-center py-8 text-ink-subtle font-black">您当前尚未报名接龙任何社区活动。</div>
                      ) : (
                        localRegisteredEvents.map(id => {
                          const matched = elderEvents.find(e => e.id === id);
                          if (!matched) return null;
                          return (
                            <div key={id} className="bg-surface p-4 rounded-2xl border border-hairline space-y-2">
                              <h4 className="text-sm font-black text-ink">{matched.name}</h4>
                              <p className="text-[10px] text-ink-muted">🕒 举办时间：{matched.time} | 📍 {matched.location}</p>
                              <button
                                onClick={() => {
                                  setActiveSimChat({
                                    id: matched.id,
                                    title: `${matched.name} 活动交流群`,
                                    type: 'event',
                                    messages: [
                                      { sender: 'other', text: `欢迎邻居们进入 ${matched.name} 准备大群！`, time: '1小时前' }
                                    ]
                                  });
                                }}
                                className="py-2.5 bg-jade text-white w-full rounded-xl text-xs font-black"
                              >
                                💬 进入本活动群聊 (免打字)
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {innerActivityTab === 'help' && (
                    <div className="space-y-3 text-xs font-black animate-fade-in">
                      <div className="bg-surface p-4 rounded-2xl border border-hairline space-y-2">
                        <p className="text-jade font-black text-[10px]">✓ 正在帮扶中 • 陈国平的老年买菜需求</p>
                        <p className="text-sm text-ink">帮其捎带葱和西红柿。明天上午10点顺路代购。</p>
                        <button
                          onClick={() => {
                            setActiveSimChat({
                              id: 'fd-1',
                              title: '与邻居 陈国平 帮扶沟通',
                              type: 'help',
                              messages: [
                                { sender: 'other', text: '邻居，真是谢谢您能帮我去菜市场带葱和西红柿！', time: '刚才' },
                                { sender: 'me', text: '顺手的事，明天买好了给您放门口！', time: '刚才' }
                              ]
                            });
                          }}
                          className="py-2.5 bg-jade text-white w-full rounded-xl mt-1 text-xs font-black"
                        >
                          💬 进入快捷短语对话窗
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. POLICIES AND CERTIFICATION */}
              {careActiveMenuModal === 'policy_cert' && (
                <div className="space-y-4">
                  {/* Selector Tabs */}
                  <div className="flex bg-canvas-muted p-1.5 rounded-2xl border-2 border-hairline">
                    <button
                      onClick={() => setInnerPolicyTab('policy')}
                      className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
                        innerPolicyTab === 'policy' ? 'bg-jade text-white shadow-sm' : 'text-ink-muted'
                      }`}
                    >
                      📖 养老办事政策
                    </button>
                    <button
                      onClick={() => setInnerPolicyTab('cert')}
                      className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
                        innerPolicyTab === 'cert' ? 'bg-jade text-white shadow-sm' : 'text-ink-muted'
                      }`}
                    >
                      🏠 楼栋居委实名认证
                    </button>
                  </div>

                  {innerPolicyTab === 'policy' ? (
                    <div className="space-y-4 text-xs font-black text-ink-muted animate-fade-in">
                      <div className="bg-indigo-50 p-4.5 rounded-2xl space-y-2 border border-indigo-100">
                        <h4 className="text-sm font-black text-indigo-950">👵 1. 社区高龄长者津贴申请</h4>
                        <p className="text-xs text-indigo-900 leading-relaxed font-semibold">
                          凡我社区户籍、年龄满70周岁长辈，每月发放高龄营养津贴。携身份证、户口本、敬老卡在1号楼居委会前台一键登记即可开通。
                        </p>
                      </div>
                      <div className="bg-indigo-50 p-4.5 rounded-2xl space-y-2 border border-indigo-100">
                        <h4 className="text-sm font-black text-indigo-950">💊 2. 异地医保联网直接报销指南</h4>
                        <p className="text-xs text-indigo-900 leading-relaxed font-semibold">
                          第一步：手机或居委前台备案；第二步：就医结算直接刷社保卡享受直报。有不明白的，可拨打电话居委会李主任进行代办。
                        </p>
                      </div>
                      <a
                        href="tel:02165432101"
                        onClick={(e) => {
                          e.preventDefault();
                          showToast('正在为您连线居委会咨询：021-65432101');
                        }}
                        className="py-4 bg-jade text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                      >
                        📞 居委会政策一键拨号人工咨询
                      </a>
                    </div>
                  ) : (
                    <div className="bg-surface p-5 rounded-2xl border-2 border-hairline space-y-3.5 text-xs font-black text-ink-muted animate-fade-in">
                      <p className="text-jade font-black text-sm">✓ 已通过社区实名身份认证</p>
                      <p>🚪 认证常住楼宇：泊寓A区 3号楼</p>
                      <p>🚪 认证常住房间：{currentUser.room}室</p>
                      <p className="leading-relaxed">👑 认证等级：<span className="text-jade">金牌长辈用户</span> (享有全部生活帮扶与优先呼救调度调度权)</p>
                    </div>
                  )}
                </div>
              )}

              {/* 4. SYSTEM SETTINGS */}
              {careActiveMenuModal === 'sys_settings' && (
                <div className="space-y-4 text-xs font-black text-ink">
                  <div className="bg-surface p-4 rounded-2xl border-2 border-hairline space-y-4">
                    <div className="flex justify-between items-center">
                      <span>长辈版超特大字体 (36-40rpx)</span>
                      <span className="text-jade font-black">已开启🟢</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>新公告短信及电话同步提醒</span>
                      <span className="text-jade font-black">已开启🟢</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>一键SOS急极震动提示音</span>
                      <span className="text-jade font-black">已开启🟢</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-ink-subtle leading-relaxed bg-canvas p-3 rounded-xl border border-hairline font-bold">
                    搭把手关怀适老化软件版本 v1.6.0<br />
                    技术服务：已通过上海市民政局适老化适障级金牌认证评定
                  </p>

                  <button
                    onClick={() => {
                      setCareActiveMenuModal(null);
                      triggerToggleCareMode(false);
                    }}
                    className="w-full py-4 bg-jade-light border-2 border-jade text-jade rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
                  >
                    🔄 快捷切换到普通版（字小功能多）
                  </button>
                </div>
              )}

            </div>

            <button
              onClick={() => setCareActiveMenuModal(null)}
              className="w-full py-4.5 bg-jade text-white font-black text-sm rounded-2xl shadow-md mt-4"
            >
              返回上一级
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Micro Helper to protect spacing behavior during typing
function setKeepSpacesAndVal(val: string, setter: (s: string) => void) {
  setter(val);
}
