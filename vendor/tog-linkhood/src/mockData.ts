import {
  User,
  Metric,
  TodoItem,
  Activity,
  Announcement,
  Space,
  Service,
  SocialWorker,
  Resident,
  AntiFraudReminder,
  Feedback,
  Hotline
} from './types';

export const INITIAL_USER: User = {
  name: '杨主任',
  phone: '13812345678',
  role: 'COMMUNITY_STAFF',
  community: '西红门街道社区'
};

export const ROLE_INFO = {
  STREET_STAFF: {
    title: '街道办工作人员',
    desc: '查看全域数据、导出报告、发布街道级公告',
    perms: '全域读写/审核'
  },
  COMMUNITY_STAFF: {
    title: '社区/居委会工作人员',
    desc: '管理本社区内容、查看本社区数据、处理居民需求',
    perms: '本社区读写'
  },
  PARTY_CENTER_OPERATOR: {
    title: '党群服务中心运营人员',
    desc: '管理本中心活动、查看阵地使用数据',
    perms: '本中心管理'
  },
  WOMEN_FEDERATION: {
    title: '妇联/群团组织工作人员',
    desc: '管理帮扶申请、查看特殊群体数据',
    perms: '妇联/帮扶领域'
  }
};

export const INITIAL_METRICS = (role: string): Metric[] => [
  {
    label: '注册居民',
    value: role === 'STREET_STAFF' ? '1,542人' : '347人',
    trend: 12,
    trendLabel: '+12人',
    source: '居民注册数据'
  },
  {
    label: '本周活跃',
    value: role === 'STREET_STAFF' ? '412人' : '89人',
    trend: 8,
    trendLabel: '↑ 8%',
    source: '用户登录使用数据'
  },
  {
    label: '活动参与率',
    value: '67%',
    trend: 5,
    trendLabel: '↑ 5%',
    source: '活动报名签到数据'
  },
  {
    label: '互助完成率',
    value: '91%',
    trend: -2,
    trendLabel: '↓ 2%',
    source: '邻里圈互助数据'
  },
  {
    label: '诉求闭环率',
    value: '94%',
    trend: 3,
    trendLabel: '↑ 3%',
    source: '反馈问题数据'
  },
  {
    label: '居民满意度',
    value: '4.6分',
    trend: 0,
    trendLabel: '持平',
    source: '活动/互助评价汇总'
  }
];

export const INITIAL_TODOS: TodoItem[] = [
  {
    id: 'todo-1',
    title: '周末烘焙课报名已满（20/20人），建议准备签到物料',
    priority: 'medium',
    source: '活动管理',
    time: '今天 10:15',
    status: 'pending'
  },
  {
    id: 'todo-2',
    title: '“棋牌赛”活动待审核（3号楼502 业主张大爷发起）',
    priority: 'medium',
    source: '活动管理',
    time: '今天 09:30',
    status: 'pending'
  },
  {
    id: 'todo-3',
    title: '收到2条居民留言，请在24小时内尽快回复',
    priority: 'high',
    source: '需求反馈',
    time: '今天 14:30',
    status: 'pending'
  },
  {
    id: 'todo-4',
    title: '王奶奶（3号楼502）连续2天未报平安，建议电话问候或上门拜访',
    priority: 'high',
    source: '关怀版数据',
    time: '昨天 18:00',
    status: 'pending'
  },
  {
    id: 'todo-5',
    title: '陈爷爷（4号楼202）申请“代买菜服务”，等待管理员派单',
    priority: 'medium',
    source: '帮扶管理',
    time: '今天 08:45',
    status: 'pending'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    name: '周末烘焙课 (烘焙大师进社区)',
    time: '2026-07-18 14:00',
    location: '党群服务中心2楼共享厨房',
    description: '邀请专业西点师现场传授手工蛋糕与饼干制作，增进邻里感情。适合亲子与青年居民。',
    limit: 20,
    registered: 20,
    signedIn: 18,
    organizer: '社区居委会',
    status: '报名中',
    registrants: [
      { name: '王敏', phone: '139****1101', time: '2026-07-11 09:12', signedIn: true },
      { name: '李佳佳', phone: '135****4521', time: '2026-07-11 09:15', signedIn: true },
      { name: '小雅', phone: '188****8811', time: '2026-07-11 09:40', signedIn: false },
      { name: '张旭', phone: '131****5689', time: '2026-07-11 10:02', signedIn: true },
      { name: '陈晨', phone: '150****2311', time: '2026-07-11 11:20', signedIn: true }
    ]
  },
  {
    id: 'act-2',
    name: '首届老年棋牌赛 (象棋与围棋)',
    time: '2026-07-18 14:00',
    location: '2号楼老年人日间照料中心',
    description: '棋逢对手，乐在其中。欢迎社区内的象棋和围棋爱好者报名参赛，设有精美参与奖！',
    limit: 16,
    registered: 8,
    signedIn: 0,
    organizer: '3号楼502居民自治筹备组',
    status: '报名中',
    registrants: [
      { name: '张大爷', phone: '133****1212', time: '2026-07-11 09:30', signedIn: false },
      { name: '李大爷', phone: '130****9088', time: '2026-07-11 10:15', signedIn: false },
      { name: '赵叔叔', phone: '137****3412', time: '2026-07-11 11:00', signedIn: false }
    ]
  },
  {
    id: 'act-3',
    name: '免费量血压、测血糖 (爱心义诊)',
    time: '2026-07-15 09:00',
    location: '1号楼党群驿站小广场',
    description: '联合社区卫生服务站医生，为辖区居民提供免费血压测量、血糖检测及健康咨询服务。',
    limit: 100,
    registered: 12,
    signedIn: 10,
    organizer: '社区卫生服务站',
    status: '报名中',
    registrants: [
      { name: '王奶奶', phone: '136****5500', time: '2026-07-11 08:30', signedIn: true },
      { name: '陈爷爷', phone: '132****7711', time: '2026-07-11 08:45', signedIn: true }
    ]
  },
  {
    id: 'act-4',
    name: '夕阳红读书分享会 (第二期)',
    time: '2026-07-16 14:00',
    location: '社区图书馆(党群中心1楼)',
    description: '读好书，交好友。本期分享主题为《岁月无声，光影流传》，请带上您最爱的一本书。',
    limit: 12,
    registered: 6,
    signedIn: 0,
    organizer: '夕阳红志愿服务队',
    status: '报名中',
    registrants: [
      { name: '周阿姨', phone: '189****9900', time: '2026-07-11 09:00', signedIn: false }
    ]
  },
  {
    id: 'act-5',
    name: '青年夜校：零基础尤克里里课',
    time: '2026-07-16 19:00',
    location: '党群服务中心3楼多功能厅',
    description: '下班后的解压神器！零基础入门弹唱，社区提供教具，赶紧加入青年夜校吧！',
    limit: 25,
    registered: 22,
    signedIn: 0,
    organizer: '团支部 & 青年之家',
    status: '报名中',
    registrants: [
      { name: '阿栋', phone: '186****2211', time: '2026-07-11 12:00', signedIn: false },
      { name: '小刘', phone: '159****8822', time: '2026-07-11 13:10', signedIn: false }
    ]
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '【重要】关于西红门街道社区7月13日停水检修的通知',
    content: '各位居民：因自来水管网年度维护，西红门街道社区将于2026年7月13日（下周一）09:00至17:00停水检修。请各位提前做好储水准备，并关闭好家中水龙头，以免造成意外损失。停水期间给您带来不便，敬请谅解！',
    category: '停水停电',
    isScheduled: false,
    publishTime: '2026-07-11 08:00',
    isImportant: true,
    readCount: 285,
    unreadCount: 62
  },
  {
    id: 'ann-2',
    title: '【防暑提醒】高温黄色预警来袭，防暑降温不可大意',
    content: '气象台发布高温黄色预警，预计未来三天我市最高气温将达到37℃以上。请社区居民，尤其是老年人及慢性病患者，尽量减少高温时段户外活动，室内开启空调防暑降温，多喝温水。如有不适可前往居委会驿站免费领取藿香正气水。',
    category: '安全提醒',
    isScheduled: false,
    publishTime: '2026-07-10 16:30',
    isImportant: false,
    readCount: 198,
    unreadCount: 149
  },
  {
    id: 'ann-3',
    title: '“共享爱心，互助邻里”社区旧物市集开始招募摊主啦！',
    content: '为践行低碳环保与邻里互助理念，居委会拟于7月25日下午举办“共享爱心，互助邻里”旧物市集。现在诚邀各位邻居报名出摊，可以交易闲置玩具、图书、手工艺品、花卉等。招募摊位20个，名额有限，先到先得。请前往居委会一楼登记。',
    category: '活动通知',
    isScheduled: false,
    publishTime: '2026-07-09 10:00',
    isImportant: false,
    readCount: 220,
    unreadCount: 127
  },
  {
    id: 'ann-4',
    title: '居民基本养老保险、医保缴费新政策线上解读指南',
    content: '2026年度居民养老保险及医疗保险参保缴费工作已全面启动。针对居民关心的“缴费标准是否变化”、“补贴力度是否加大”、“如何线上快速缴费”等核心疑问，本期指南进行了详细归纳和解答，欢迎查阅分享！',
    category: '政策宣传',
    isScheduled: true,
    publishTime: '2026-07-12 09:00',
    isImportant: false,
    readCount: 0,
    unreadCount: 347
  }
];

export const INITIAL_SPACES: Space[] = [
  {
    id: 'space-1',
    name: '共享厨房 & 烘焙烘焙坊',
    location: '党群服务中心2楼西侧',
    openHours: '09:00 - 21:00',
    capacity: 25,
    facilities: ['烤箱*2', '双门冰箱', '全套厨具', '消毒柜', '中岛台'],
    photo: '🧑‍🍳',
    bookingType: '微信小程序预约 / 现场审核',
    status: '开放中'
  },
  {
    id: 'space-2',
    name: '日间照料室 & 老年娱乐中心',
    location: '2号楼1层底商102室',
    openHours: '08:30 - 18:00',
    capacity: 30,
    facilities: ['按摩椅*2', '棋牌桌*4', '便携药箱', '血压计', '电视机'],
    photo: '🀄',
    bookingType: '无需预约，现场刷身份证或报姓名登录',
    status: '开放中'
  },
  {
    id: 'space-3',
    name: '社区自习室 & 24小时共享书房',
    location: '党群服务中心1楼东侧',
    openHours: '00:00 - 24:00',
    capacity: 20,
    facilities: ['独立格间*12', '百兆WiFi', '共享充电线', '自助饮水机', '防眩护眼灯'],
    photo: '📖',
    bookingType: '小程序在线锁座',
    status: '开放中'
  },
  {
    id: 'space-4',
    name: '多功能体能律动馆 (瑜伽健身房)',
    location: '党群服务中心3楼中厅',
    openHours: '10:00 - 22:00',
    capacity: 15,
    facilities: ['落地全身大镜子', '专业律动音响', '瑜伽垫*10', '更衣间', '空气净化器'],
    photo: '🧘',
    bookingType: '小程序预约（按小时封顶）',
    status: '维护中'
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'svc-1',
    name: '邻里小超 (西红门店)',
    category: '便民商超',
    location: '1号楼底商105',
    hours: '07:30 - 23:00',
    phone: '13555223344',
    tags: ['柴米油盐', '果蔬生鲜', '免费暂存快递'],
    discount: '社区注册居民尊享指定蔬菜9.5折，米面粮油满50送洗衣液。',
    isRecommended: true
  },
  {
    id: 'svc-2',
    name: '王记手工面馆 (家乡的味道)',
    category: '餐饮美食',
    location: '3号楼底商102',
    hours: '10:00 - 21:30',
    phone: '13912128989',
    tags: ['手擀面', '快餐干净', '70岁以上半价'],
    discount: '70岁以上社区独居老人享肉丝面5折优惠（每餐限一份）。',
    isRecommended: true
  },
  {
    id: 'svc-3',
    name: '搭把手全能居室维修服务队',
    category: '家政维修',
    location: '物业办公室201',
    hours: '08:30 - 17:30',
    phone: '0571-88889999',
    tags: ['电路疏通', '漏水抢修', '家具组装', '持证上岗'],
    discount: '持志愿者勋章/信用分>110的居民免上门费。特殊困难家庭全免费。',
    isRecommended: true
  },
  {
    id: 'svc-4',
    name: '社区康复与慢性病理疗站',
    category: '健康医疗',
    location: '2号楼底商108',
    hours: '09:00 - 17:00 (周一至周五)',
    phone: '18022334455',
    tags: ['艾灸推拿', '用药咨询', '建档建档', '中医保健'],
    discount: '免费为辖区65岁以上老年人进行基础健康建档和日常听诊。',
    isRecommended: false
  }
];

export const INITIAL_SOCIAL_WORKERS: SocialWorker[] = [
  {
    id: 'sw-1',
    name: '张兰芳',
    role: '专职网格员、资深社区社工',
    area: '1号楼、2号楼重点网格',
    schedule: '周一至周五 08:30-17:30，周六值班',
    phone: '13912349911',
    services: ['特殊群体心理疏导', '低保救助审核', '网格日常巡查纠纷调解']
  },
  {
    id: 'sw-2',
    name: '高明凯',
    role: '青年社工、文化艺术骨干',
    area: '3号楼网格、党群中心空间运营',
    schedule: '周二至周六 13:00-21:00 (青年夜校专场)',
    phone: '18844552211',
    services: ['社区文艺团队组织', '青年夜校运营', '空间活动策划、新媒体公告']
  }
];

export const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 'res-1',
    name: '王奶奶 (王桂英)',
    building: '3号楼',
    room: '502室',
    phone: '13655110022',
    registerTime: '2025-10-15',
    activityCount: 14,
    creditScore: 120,
    redFlowers: 15,
    goodReviews: 24,
    tags: ['独居老人', '困难家庭'],
    status: '活跃'
  },
  {
    id: 'res-2',
    name: '张大爷 (张德山)',
    building: '3号楼',
    room: '401室',
    phone: '13312349090',
    registerTime: '2025-11-20',
    activityCount: 22,
    creditScore: 115,
    redFlowers: 8,
    goodReviews: 12,
    tags: ['志愿者', '党员'],
    status: '活跃'
  },
  {
    id: 'res-3',
    name: '小雅 (陈静雅)',
    building: '3号楼',
    room: '502室',
    phone: '18899882211',
    registerTime: '2026-03-01',
    activityCount: 6,
    creditScore: 102,
    redFlowers: 2,
    goodReviews: 4,
    tags: ['中青年'],
    status: '常态'
  },
  {
    id: 'res-4',
    name: '阿栋 (高振栋)',
    building: '5号楼',
    room: '201室',
    phone: '18655442211',
    registerTime: '2026-01-10',
    activityCount: 19,
    creditScore: 135,
    redFlowers: 28,
    goodReviews: 42,
    tags: ['志愿者', '党员'],
    status: '活跃'
  },
  {
    id: 'res-5',
    name: '陈爷爷 (陈建国)',
    building: '4号楼',
    room: '202室',
    phone: '13211009900',
    registerTime: '2025-08-12',
    activityCount: 3,
    creditScore: 105,
    redFlowers: 4,
    goodReviews: 8,
    tags: ['独居老人'],
    status: '低频'
  }
];

export const INITIAL_FRAUD_ALERTS: AntiFraudReminder[] = [
  {
    id: 'fraud-1',
    content: '【防诈提醒】凡是接到电话，自称是“公检法”要求核实资产并引导资金转入所谓“安全账户”的，100%是诈骗！警官绝对不会通过QQ、微信办案。如有疑问请即拨96110咨询。',
    publishDate: '2026-07-11',
    isActive: true,
    views: 184
  },
  {
    id: 'fraud-2',
    content: '【防诈提醒】警惕低价特惠“老年健康讲座”！推销所谓神药秘方、购买理财产品获返利的，多为非法集资陷阱。请广大老人在作出任何大额付款前，与子女商量或咨询居委会社工。',
    publishDate: '2026-07-10',
    isActive: false,
    views: 142
  },
  {
    id: 'fraud-3',
    content: '【防诈提醒】近期针对青年群体的“刷单返利”、“虚假网络贷款”诈骗高发。严禁参与任何形式的网络兼职刷单，凡是放款前要求收取保证金、手续费的均属诈骗。',
    publishDate: '2026-07-09',
    isActive: false,
    views: 215
  }
];

export const INITIAL_FEEDBACKS: Feedback[] = [
  {
    id: 'fb-1',
    residentName: '小雅',
    residentPhone: '188****2211',
    building: '3号楼',
    room: '502室',
    question: '楼下的快递柜最近总是卡住打不开，取件非常不方便，快递员经常把包裹丢在地上，能不能联系运营商尽快上门维修或者做一次保养？',
    helpNeeded: '联系丰巢/速递易网点客服或派物业排查线路接口电源是否正常。',
    time: '2026-07-11 14:30',
    status: '待处理',
    replies: []
  },
  {
    id: 'fb-2',
    residentName: '阿栋',
    residentPhone: '186****2211',
    building: '5号楼',
    room: '201室',
    question: '居委会最近组织的烘焙课反响超级好，但名额一下子就抢空了，我们群里很多青年邻居都特别想去体验。居委会和党群服务中心未来能不能增加一些棋牌项目或者晚间夜校的尤克里里、手工编制等夜间课？',
    helpNeeded: '建议在群内发起活动调研，收集大家的兴趣点，联系网格青年之家和高校志愿者进行常态化开课。',
    time: '2026-07-10 09:20',
    status: '处理中',
    replies: [
      {
        sender: 'staff',
        content: '非常感谢阿栋的建议！看到大家对我们社区活动的热情我们非常开心。我们的青年社工明凯已经在跟几家艺术工作室对接，计划在下个月增开尤克里里零基础小班、以及每周四的青年手工皮具沙龙。具体排期会通过小程序在下周一发布哦！',
        time: '2026-07-10 11:15'
      }
    ]
  },
  {
    id: 'fb-3',
    residentName: '王奶奶',
    residentPhone: '136****0022',
    building: '3号楼',
    room: '502室',
    question: '我关节炎犯了，这几天走楼梯下楼太疼，买菜和买米都不太方便，小程序上写的“关怀帮扶服务”能不能有人帮我代买一把小油菜、一块豆腐和一小袋面粉送到门口呀？老伴不在身边，多谢。',
    helpNeeded: '派遣夕阳红青年志愿者或网格员带购物单上门代购，并送上门协助垃圾分类。',
    time: '2026-07-09 15:45',
    status: '已解决',
    replies: [
      {
        sender: 'staff',
        content: '王奶奶您好，您的帮扶申请我们这边已经收到并为您指派了同楼栋的志愿者小张。小张已经于今天下午四点半买好油菜、豆腐和面粉送到您家门口，顺便帮您把家里的厨余垃圾带下楼了。请您注意关节防寒保暖，有任何急需随时通过关怀版一键呼救或联系我们！',
        time: '2026-07-09 17:00'
      },
      {
        sender: 'resident',
        content: '太感谢小张和居委会的小张了，大热天的给我送到家，真是帮大忙了！给你们送五星好评！',
        time: '2026-07-09 18:30'
      }
    ]
  }
];

export const INITIAL_HOTLINES: Hotline[] = [
  { id: 'hot-1', name: '居委会办公热线', phone: '0571-87123456', category: '社区/居委会' },
  { id: 'hot-2', name: '社区物业客服电话', phone: '0571-88889999', category: '物业管理' },
  { id: 'hot-3', name: '网格管家值班热线', phone: '13912349911', category: '楼栋管家' },
  { id: 'hot-4', name: '社区家庭保健医生', phone: '18022334455', category: '社区医生' },
  { id: 'hot-5', name: '街道妇联维权帮扶站', phone: '0571-87998822', category: '妇联' }
];

export const CHART_VISITS = [
  { day: '周一', visits: 120, active: 45, mutual: 8, feedback: 3 },
  { day: '周二', visits: 154, active: 58, mutual: 12, feedback: 2 },
  { day: '周三', visits: 188, active: 72, mutual: 15, feedback: 5 },
  { day: '周四', visits: 165, active: 68, mutual: 10, feedback: 4 },
  { day: '周五', visits: 210, active: 94, mutual: 18, feedback: 1 },
  { day: '周六', visits: 245, active: 110, mutual: 25, feedback: 6 },
  { day: '周日', visits: 195, active: 85, mutual: 20, feedback: 4 }
];

export const CHART_MUTUAL_CATEGORY = [
  { name: '日常拼单', value: 40, color: 'text-primary' },
  { name: '代跑代取', value: 35, color: 'text-amber' },
  { name: '闲置交易', value: 15, color: 'text-coral' },
  { name: '照看互助', value: 10, color: 'text-sky-400' }
];

export const CHART_FEEDBACK_CATEGORY = [
  { name: '报修求助', value: 40, color: '#FF8568' },
  { name: '服务咨询', value: 25, color: '#F0B85C' },
  { name: '建议反馈', value: 20, color: '#4DBFA8' },
  { name: '投诉举报', value: 15, color: '#38BDF8' }
];

export const CHART_CARE_DATA = {
  totalElderly: 12,
  reportedSafeRate: 92,
  followUpRequired: 2,
  thisMonthHelpRequests: 12,
  helpCompletedRate: 75,
  medicineCheckRate: 88,
  sosCount: 1,
  sosAvgResponseTime: 3 // minutes
};

export const POPULAR_KEYWORDS = [
  { word: '停车位紧张', count: 12 },
  { word: '空调噪音', count: 8 },
  { word: '垃圾分类', count: 6 },
  { word: '快递暂存', count: 5 },
  { word: '宠物扰民', count: 3 }
];
