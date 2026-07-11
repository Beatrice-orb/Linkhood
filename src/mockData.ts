import { UserProfile, Space, Service, Event, FeedItem, Announcement, WeeklyReport } from './types';

export const mockUsers: UserProfile[] = [
  {
    id: 'user_xiaoya',
    name: '小雅',
    room: '3-502',
    age: 26,
    profession: '互联网运营',
    tags: ['做饭日常', '养猫', '夜猫子'],
    creditScore: 92,
    points: 45,
    helpCount: 23,
    frequency: '每日',
    badges: ['拼单达人', '热心肠', '社区活宝'],
    joinedDays: 178,
    isMe: true
  },
  {
    id: 'user_adong',
    name: '阿栋',
    room: '5-201',
    age: 28,
    profession: '程序员',
    tags: ['运动', '加班狗', '咖啡'],
    creditScore: 90,
    points: 80,
    helpCount: 12,
    frequency: '每日',
    badges: ['运动健将', '咖啡控'],
    joinedDays: 154
  },
  {
    id: 'user_xiaoyu',
    name: '小鱼',
    room: '2-103',
    age: 24,
    profession: '研究生',
    tags: ['宠物', '独居日常', '电影'],
    creditScore: 95,
    points: 120,
    helpCount: 8,
    frequency: '每日',
    badges: ['铲屎官', '影评达人'],
    joinedDays: 120
  },
  {
    id: 'user_ajie',
    name: '阿杰',
    room: '3-308',
    age: 27,
    profession: '设计师',
    tags: ['运动', '摄影', '音乐'],
    creditScore: 88,
    points: 30,
    helpCount: 5,
    frequency: '每周3次',
    badges: ['美学大师'],
    joinedDays: 90
  },
  {
    id: 'user_xiaolin',
    name: '小琳',
    room: '1-405',
    age: 25,
    profession: '会计',
    tags: ['读书', '电影', '周末宅'],
    creditScore: 85,
    points: 15,
    helpCount: 3,
    frequency: '每周2次',
    badges: ['文艺青年'],
    joinedDays: 45
  },
  {
    id: 'user_ahua',
    name: '阿华',
    room: '4-202',
    age: 30,
    profession: '销售',
    tags: ['出差党', '夜宵'],
    creditScore: 90,
    points: 50,
    helpCount: 7,
    frequency: '每周3次',
    badges: ['社交达人'],
    joinedDays: 110
  },
  {
    id: 'user_xiaolin_teacher',
    name: '小林',
    room: '6-302',
    age: 29,
    profession: '教师',
    tags: ['手工', '园艺', '做饭'],
    creditScore: 92,
    points: 65,
    helpCount: 10,
    frequency: '每周3次',
    badges: ['手艺达人', '园艺家'],
    joinedDays: 135
  },
  {
    id: 'user_zhangayi',
    name: '张阿姨',
    room: '4-202',
    age: 58,
    profession: '退休',
    tags: ['园艺', '广场舞', '热心'],
    creditScore: 88,
    points: 110,
    helpCount: 15,
    frequency: '每日',
    badges: ['热心大妈', '广场舞领舞'],
    joinedDays: 300
  },
  {
    id: 'user_akai',
    name: '阿凯',
    room: '3-308',
    age: 27,
    profession: '产品经理',
    tags: ['加班狗', '篮球'],
    creditScore: 86,
    points: 25,
    helpCount: 6,
    frequency: '每周3次',
    badges: ['加班狂人'],
    joinedDays: 80
  },
  {
    id: 'user_wangshu',
    name: '王叔',
    room: '6-101',
    age: 62,
    profession: '退休',
    tags: ['书法', '太极', '园艺'],
    creditScore: 90,
    points: 140,
    helpCount: 20,
    frequency: '每日',
    badges: ['社区长者', '书法家'],
    joinedDays: 365
  }
];

export const mockSpaces: Space[] = [
  {
    id: 'space_kitchen',
    name: '社区共享厨房',
    location: '3号楼B1层',
    time: '07:00-22:00',
    bookingMethod: '小程序预约（提前1天）',
    capacity: '8人',
    facilities: ['电磁炉 × 2', '微波炉 × 1', '冰箱 × 1', '电饭煲 × 1', '锅具套装', '餐具套装（8人份）', '调味料基础包（油盐酱醋）', '餐桌 × 1', '吧台椅 × 4'],
    status: '开放预约',
    rating: 4.8,
    reviewsCount: 46,
    description: '住户免费使用，需提前预约。电梯直达B1层，出电梯右转即到。',
    notices: [
      '每次预约限2小时，如需延长请重新预约',
      '使用后请自行清洁，恢复原状',
      '损坏物品照价赔偿',
      '使用后请拍照上传“使用后状态”'
    ],
    image: '🍳',
    bookings: [
      { timeSlot: '07:00-09:00', isBooked: false },
      { timeSlot: '09:00-11:00', isBooked: true, bookerName: '小雅', bookerRoom: '3-502' },
      { timeSlot: '11:00-13:00', isBooked: true, bookerName: '阿栋', bookerRoom: '5-201' },
      { timeSlot: '13:00-15:00', isBooked: false },
      { timeSlot: '15:00-17:00', isBooked: false },
      { timeSlot: '17:00-19:00', isBooked: true, bookerName: '小鱼', bookerRoom: '2-103' },
      { timeSlot: '19:00-21:00', isBooked: false },
      { timeSlot: '21:00-22:00', isBooked: false }
    ],
    reviews: [
      { rating: 5, comment: '设施很全，跟朋友一起做饭很开心', authorName: '小雅', authorRoom: '3-502', date: '3天前' },
      { rating: 5, comment: '第一次用，很干净，下次再来', authorName: '阿栋', authorRoom: '5-201', date: '1周前' },
      { rating: 4, comment: '锅具可以再更新一下，其他都很好', authorName: '阿杰', authorRoom: '1-304', date: '2周前' }
    ]
  },
  {
    id: 'space_activity',
    name: '邻里活动室',
    location: '3号楼B1层',
    time: '08:00-21:00',
    bookingMethod: '小程序预约（提前2小时）',
    capacity: '15人',
    facilities: ['投影仪', '音响', '白板', '折叠桌椅', '饮水机', '桌球台'],
    status: '开放预约',
    rating: 4.6,
    reviewsCount: 32,
    description: '提供多功能会议、桌游、放映、瑜伽及桌球活动空间，支持邻里社交与聚会。',
    notices: [
      '保持室内安静，不打扰其他邻居',
      '爱护投影与音响等电子设备',
      '带走个人垃圾，保持场地整洁'
    ],
    image: '🎯',
    bookings: [
      { timeSlot: '08:00-10:00', isBooked: false },
      { timeSlot: '10:00-12:00', isBooked: true, bookerName: '王叔', bookerRoom: '6-101' },
      { timeSlot: '12:00-14:00', isBooked: false },
      { timeSlot: '14:00-16:00', isBooked: true, bookerName: '张阿姨', bookerRoom: '4-202' },
      { timeSlot: '16:00-18:00', isBooked: false },
      { timeSlot: '18:00-20:00', isBooked: false },
      { timeSlot: '20:00-21:00', isBooked: false }
    ],
    reviews: [
      { rating: 5, comment: '投影仪效果很好，带孩子们来看了电影。', authorName: '张阿姨', authorRoom: '4-202', date: '5天前' }
    ]
  },
  {
    id: 'space_gym',
    name: '24小时健身房',
    location: '1号楼1层',
    time: '24小时',
    bookingMethod: '门禁刷卡（住户免费）',
    capacity: '20人',
    facilities: ['跑步机 × 3', '椭圆机 × 2', '哑铃架', '瑜伽垫 × 5', '动感单车 × 2'],
    status: '开放中',
    rating: 4.7,
    reviewsCount: 88,
    description: '24小时面向所有公寓住户免费开放，刷脸或门禁卡即可进入。配备基础有氧与力量器械。',
    notices: [
      '运动前请做好热身，注意人身安全',
      '使用器械后请用酒精棉片擦拭汗水',
      '哑铃使用后请物归原位'
    ],
    image: '🏃',
    bookings: [],
    reviews: [
      { rating: 5, comment: '夜猫子福音，凌晨一点人少，练得很爽！', authorName: '阿栋', authorRoom: '5-201', date: '2天前' },
      { rating: 4, comment: '希望可以增加一个杠铃架，器械维护得不错。', authorName: '阿杰', authorRoom: '3-308', date: '1周前' }
    ]
  },
  {
    id: 'space_garden',
    name: '楼顶花园',
    location: '每栋楼顶',
    time: '06:00-22:00',
    bookingMethod: '无需预约',
    capacity: '30人',
    facilities: ['休闲座椅', '绿植景观', '遮阳伞', '小型烧烤区（需报备）'],
    status: '开放中',
    rating: 4.9,
    reviewsCount: 74,
    description: '每栋楼顶均设有空中花园，白天可享受阳光与绿植，晚上是吹风看星星的绝佳去处。',
    notices: [
      '禁止高空抛物，违者追究法律责任',
      '烧烤区需要提前向物业进行安全报备',
      '21:30后请降低音量，避免影响顶层住户'
    ],
    image: '🌸',
    bookings: [],
    reviews: [
      { rating: 5, comment: '晚霞太美了，吹风超级舒服，强烈推荐。', authorName: '小鱼', authorRoom: '2-103', date: '1天前' }
    ]
  },
  {
    id: 'space_book',
    name: '共享书吧',
    location: '2号楼1层',
    time: '09:00-21:00',
    bookingMethod: '无需预约',
    capacity: '12人',
    facilities: ['藏书约800本', '阅读桌', '充电插座', '自助咖啡机'],
    status: '开放中',
    rating: 4.9,
    reviewsCount: 52,
    description: '静谧的阅读与办公空间，提供丰富的图书和无限量自助低价咖啡。',
    notices: [
      '请保持安静，接听电话请至书吧外',
      '书籍阅读后请放回原分类架',
      '咖啡机属于自助，请保持咖啡台面清洁'
    ],
    image: '📚',
    bookings: [],
    reviews: [
      { rating: 5, comment: '非常适合带电脑来办公，有网有电，还有浓郁的咖啡香！', authorName: '阿凯', authorRoom: '3-308', date: '3天前' }
    ]
  },
  {
    id: 'space_meeting',
    name: '社区会议室',
    location: '物业中心旁',
    time: '09:00-18:00',
    bookingMethod: '小程序预约（提前3天）',
    capacity: '30人',
    facilities: ['大型会议桌', '超清投影仪', '无线麦克风', '白板'],
    status: '可预约',
    rating: 4.5,
    reviewsCount: 12,
    description: '适合社区事务商议、中型讲座、自发学术沙龙等，可向物业预约使用。',
    notices: [
      '仅限非商用、利于社区建设的会议使用',
      '请提前3天提出申请，说明会议主题'
    ],
    image: '💼',
    bookings: [
      { timeSlot: '09:00-12:00', isBooked: false },
      { timeSlot: '12:00-15:00', isBooked: true, bookerName: '物业中心', bookerRoom: '服务台' },
      { timeSlot: '15:00-18:00', isBooked: false }
    ],
    reviews: []
  },
  {
    id: 'space_play',
    name: '儿童游乐区',
    location: '小区中心广场',
    time: '08:00-20:00',
    bookingMethod: '无需预约',
    capacity: '—',
    facilities: ['滑梯', '秋千', '沙池', '家长休息椅'],
    status: '开放中',
    rating: 4.6,
    reviewsCount: 29,
    description: '小区中央的安全无障碍儿童乐园，铺设了防摔塑胶地垫。',
    notices: [
      '儿童游玩须有家长全程陪同监护',
      '请勿带宠物进入沙池区'
    ],
    image: '🎈',
    bookings: [],
    reviews: []
  },
  {
    id: 'space_garden_plot',
    name: '社区菜园',
    location: '小区东侧',
    time: '全天',
    bookingMethod: '小程序认领（每季度开放）',
    capacity: '—',
    facilities: ['种植箱 × 12', '共享农具', '自动浇水设施'],
    status: '认领中',
    rating: 4.7,
    reviewsCount: 18,
    description: '每季度提供12个共享种植箱供居民认领，自己动手体验播种、耕耘与收获的喜悦。',
    notices: [
      '认领期为一季度，如需续期请重新参与抽签认领',
      '请勿采摘他人种植箱内的果蔬'
    ],
    image: '👩‍🌾',
    bookings: [],
    reviews: [
      { rating: 5, comment: '认领了一个箱子种生菜和草莓，体验田园乐趣！', authorName: '张阿姨', authorRoom: '4-202', date: '2周前' }
    ]
  },
  {
    id: 'space_pet',
    name: '宠物活动区',
    location: '小区西侧',
    time: '06:00-22:00',
    bookingMethod: '无需预约',
    capacity: '—',
    facilities: ['围栏安全防护', '宠物便便箱', '饮水点', '基础跨栏设施'],
    status: '开放中',
    rating: 4.8,
    reviewsCount: 40,
    description: '宠物们的快乐社交场所，设有防逃跑双层围栏，在这里狗狗可以自由奔跑。',
    notices: [
      '携犬出户必须栓绳，进入区内解开围栏前请先观察',
      '必须及时清理自家宠物的排泄物'
    ],
    image: '🐶',
    bookings: [],
    reviews: [
      { rating: 5, comment: '可以松开绳子让它在里面奔跑，真好，还有便便袋提供。', authorName: '小鱼', authorRoom: '2-103', date: '3天前' }
    ]
  },
  {
    id: 'space_laundry',
    name: '共享洗衣房',
    location: '每栋楼1层',
    time: '06:00-23:00',
    bookingMethod: '扫码使用',
    capacity: '—',
    facilities: ['商用洗衣机 × 3', '商用烘干机 × 2', '蒸汽熨烫台'],
    status: '使用中',
    rating: 4.4,
    reviewsCount: 65,
    description: '每栋楼大堂1层均设有共享洗烘中心，适合清洗大件被褥与多阴雨天快速烘干。',
    notices: [
      '清洗宠物用品请使用专门的宠物隔离洗衣机',
      '衣物洗完后请及时取出，避免占用他人时间'
    ],
    image: '🧺',
    bookings: [],
    reviews: []
  }
];

export const mockServices: Service[] = [
  {
    id: 'service_convenience',
    name: '邻里便利店',
    type: '超市便利',
    location: '小区南门入口',
    hours: '24小时',
    phone: '13812345678',
    rating: 4.6,
    tags: ['可代收快递', '关东煮好吃', '24h营业'],
    reviews: ['深夜下班回来能喝到热乎乎的关东煮，太治愈了。', '老板人很热情，平时还能寄存个小东西。'],
    hasDiscount: true,
    discountText: '凭“搭把手”认证住户享自营零食 9.5 折',
    image: '🏪'
  },
  {
    id: 'service_supermarket',
    name: '鲜生优选超市',
    type: '生鲜超市',
    location: '小区南门对面100米',
    hours: '07:00-22:00',
    phone: '13823456789',
    rating: 4.8,
    tags: ['蔬菜新鲜', '晚上8点后打折', '种类齐全'],
    reviews: ['每天晚上的折扣力度很大，非常划算！', '生鲜食品确实新鲜，离得近很方便。'],
    hasDiscount: true,
    discountText: '晚 8:30 后熟食及生鲜菜品全场 7 折起',
    image: '🥦'
  },
  {
    id: 'service_sf',
    name: '顺丰快递站',
    type: '快递服务',
    location: '小区东门旁',
    hours: '09:00-21:00',
    phone: '95338',
    rating: 4.5,
    tags: ['可寄件', '可暂存', '速度快'],
    reviews: ['小哥态度好，寄大件还给搭把手。', '存件很安全，凭取件码拿。'],
    hasDiscount: false,
    discountText: '',
    image: '📦'
  },
  {
    id: 'service_cainiao',
    name: '菜鸟驿站',
    type: '快递服务',
    location: '小区西门内',
    hours: '09:00-20:00',
    phone: '13834567890',
    rating: 4.3,
    tags: ['小区内最方便', '自助取件'],
    reviews: ['就在小区西门里面，下班顺路取走，最方便。', '高峰期排队人有点多，希望能多开几个扫码枪。'],
    hasDiscount: false,
    discountText: '',
    image: '📮'
  },
  {
    id: 'service_pharmacy',
    name: '仁心药房',
    type: '药店',
    location: '南门对面50米',
    hours: '08:00-22:30',
    phone: '13845678901',
    rating: 4.7,
    tags: ['24小时售药窗口', '支持医保'],
    reviews: ['半夜孩子发烧，通过24小时小窗买到了退烧药，救了急。', '药师很专业，还详细交代了吃药注意事项。'],
    hasDiscount: true,
    discountText: '常备家用药箱套餐享 8.8 折优惠',
    image: '💊'
  },
  {
    id: 'service_laundry_service',
    name: '洁衣洗衣',
    type: '洗衣服务',
    location: '2号楼B1层',
    hours: '07:00-21:00',
    phone: '13856789012',
    rating: 4.4,
    tags: ['自助+人工', '皮具护理', '洗鞋'],
    reviews: ['鞋子洗得很干净，和新的一样。', '大衣干洗速度挺快，还有上门取送服务。'],
    hasDiscount: true,
    discountText: '季度干洗充值 200 送 30 元',
    image: '🧼'
  },
  {
    id: 'service_canteen',
    name: '邻里食堂',
    type: '餐饮',
    location: '2号楼1层',
    hours: '07:00-20:00',
    phone: '13867890123',
    rating: 4.2,
    tags: ['便宜', '干净', '老年优惠'],
    reviews: ['两荤一素只要15块，真便宜！', '偶尔不想做饭就去食堂解决，干净放心。'],
    hasDiscount: true,
    discountText: '“搭把手”住户早餐享 9 折，60岁以上老人 8 折',
    image: '🍱'
  },
  {
    id: 'service_cafe',
    name: '转角咖啡',
    type: '咖啡/简餐',
    location: '1号楼1层',
    hours: '08:00-20:00',
    phone: '13878901234',
    rating: 4.9,
    tags: ['环境好', '适合办公', '老板人超好'],
    reviews: [
      '拿铁很好喝，豆子很香 —— 小雅',
      '环境超好，适合周末带电脑来办公 —— 阿栋',
      '老板人很好，偶尔会送小饼干 —— 小鱼'
    ],
    hasDiscount: true,
    discountText: '凭“搭把手”小程序住户认证，所有饮品 9 折',
    image: '☕'
  },
  {
    id: 'service_haircut',
    name: '小区理发店',
    type: '理发',
    location: '南门旁',
    hours: '09:00-21:00',
    phone: '13889012345',
    rating: 4.1,
    tags: ['便宜', '快剪30元', '不推销'],
    reviews: ['师傅手艺很麻利，快剪30元不推销，太省心了。', '洗剪吹一套很实惠。'],
    hasDiscount: true,
    discountText: '新店试营业期间，所有剪发套餐住户享 8 折',
    image: '✂️'
  },
  {
    id: 'service_clinic',
    name: '社区诊所',
    type: '医疗服务',
    location: '东门旁',
    hours: '08:00-18:00',
    phone: '120xxxxxxxx',
    rating: 4.5,
    tags: ['常见病诊疗', '打疫苗', '医生和蔼'],
    reviews: ['平时感冒发烧拿药很方便，医生护士都很温柔。', '带宝宝来打流感疫苗。'],
    hasDiscount: false,
    discountText: '',
    image: '🏥'
  },
  {
    id: 'service_pet_hospital',
    name: '宠物医院',
    type: '宠物服务',
    location: '南门对面200米',
    hours: '09:00-20:00',
    phone: '13890123456',
    rating: 4.6,
    tags: ['疫苗体检', '寄养服务', '设备先进'],
    reviews: ['带我家橘猫来打疫苗，医生很轻柔。', '寄养环境干净，每天发视频，很放心。'],
    hasDiscount: true,
    discountText: '住户专享：宠物洗澡美容年卡 8.5 折',
    image: '🐱'
  },
  {
    id: 'service_fruit',
    name: '水果摊',
    type: '生鲜',
    location: '小区西门流动',
    hours: '16:00-21:00',
    phone: '—',
    rating: 4.3,
    tags: ['价格便宜', '应季水果', '甜度高'],
    reviews: ['水果特别甜，大叔人好，每次都给抹零。', '西瓜便宜又红，夏天经常去买。'],
    hasDiscount: false,
    discountText: '',
    image: '🍉'
  }
];

export const mockEvents: Event[] = [
  {
    id: 'event_baking',
    name: '周末烘焙课',
    type: '兴趣课程',
    time: '10/14 周六 14:00-16:00',
    location: '共享厨房（3号楼B1层）',
    organizer: '物业',
    signedUp: 6,
    capacity: 8,
    status: '报名中',
    fee: '免费（材料由物业提供）',
    introduction: '想做蛋糕但不知道怎么开始？小雅邻居来教你！本次学习内容：基础戚风蛋糕制作、奶油打发技巧、简单水果装饰。做完可以带回家分享哦 🎂',
    activeMembers: ['3号楼502 小雅（指导老师）', '5号楼201 阿栋', '2号楼103 小鱼', '3号楼308 阿杰', '1号楼405 小琳', '4号楼202 阿华'],
    joinedByMe: false
  },
  {
    id: 'event_basketball',
    name: '邻里篮球赛',
    type: '体育运动',
    time: '10/15 周日 09:00-11:00',
    location: '小区篮球场',
    organizer: '居民发起（3号楼阿凯）',
    signedUp: 8,
    capacity: 10,
    status: '即将满员',
    fee: '免费',
    introduction: '周末早晨一起来打场篮球吧！3v3或4v4友谊赛，主要为了锻炼身体、结识爱打球的邻居，有基础的赶紧报名，男女不限，备有功能饮料。',
    activeMembers: ['3号楼308 阿凯', '5号楼201 阿栋', '3号楼308 阿杰', '4号楼202 阿华', '2号楼501 小勇', '1号楼602 阿强'],
    joinedByMe: false
  },
  {
    id: 'event_market',
    name: '社区二手市集',
    type: '闲置交换',
    time: '10/21 周六 10:00-15:00',
    location: '小区中心广场',
    organizer: '居委会',
    signedUp: 12,
    capacity: 30,
    status: '报名中',
    fee: '免费（自备野餐垫或小桌子）',
    introduction: '搬家整理出很多用不着的闲置物件？丢了可惜，不如拿来二手市集卖掉或者与邻居交换！欢迎带着玩具、书籍、手作、小家电来摆摊。',
    activeMembers: ['6号楼302 小林', '3号楼502 小雅', '4号楼202 张阿姨', '2号楼103 小鱼'],
    joinedByMe: false
  },
  {
    id: 'event_pet_date',
    name: '宠物相亲大会',
    type: '宠物社交',
    time: '10/22 周日 15:00-17:00',
    location: '宠物活动区',
    organizer: '居民发起（2号楼小鱼）',
    signedUp: 5,
    capacity: 15,
    status: '报名中',
    fee: '自备零食与便便袋',
    introduction: '为你家主子找个玩伴或者相亲对象！现场备有宠物跨栏、拍照打卡点以及“最萌主子”投票。欢迎各类汪星人、喵星人（需装航空箱）参与。',
    activeMembers: ['2号楼103 小鱼', '3号楼502 小雅', '4号楼202 张阿姨'],
    joinedByMe: false
  },
  {
    id: 'event_phone_class',
    name: '老年人智能手机课',
    type: '公益课堂',
    time: '10/18 周三 09:30-11:00',
    location: '邻里活动室',
    organizer: '居委会',
    signedUp: 12,
    capacity: 15,
    status: '报名中',
    fee: '免费',
    introduction: '教社区老年人学会使用智能手机，包括微信视频、亮码出行、挂号、网购打车及防范电信诈骗等。欢迎年轻住户自愿报名当志愿者助教。',
    activeMembers: ['4号楼202 张阿姨', '6号楼101 王叔'],
    joinedByMe: false
  },
  {
    id: 'event_halloween',
    name: '万圣节亲子派对',
    type: '节日活动',
    time: '10/28 周六 18:00-20:00',
    location: '小区中心广场',
    organizer: '物业+居委会',
    signedUp: 15,
    capacity: 20,
    status: '报名中',
    fee: '免费（需穿着cosplay服装）',
    introduction: '不给糖就捣蛋！社区万圣节讨糖路线出发，现场有南瓜灯雕刻比赛、脸部彩绘与神秘鬼屋大冒险，限20组家庭参与，报名请备注宝贝年龄。',
    activeMembers: ['4号楼202 张阿姨'],
    joinedByMe: false
  },
  {
    id: 'event_reading',
    name: '读书分享会',
    type: '兴趣小组',
    time: '10/19 周四 19:00-21:00',
    location: '共享书吧',
    organizer: '居民自发',
    signedUp: 4,
    capacity: 12,
    status: '报名中',
    fee: '免费（现场咖啡半价）',
    introduction: '本期读书分享会主题：【寻找内心的平静】。带上一本你最近读过的心动之书，与邻居们聊聊书中的片段与你产生共鸣的瞬间。',
    activeMembers: ['1号楼405 小琳', '2号楼103 小鱼'],
    joinedByMe: false
  },
  {
    id: 'event_morning_run',
    name: '周末晨跑团',
    type: '运动健康',
    time: '每周六 07:00-08:00',
    location: '小区门口集合',
    organizer: '居民发起（1号楼阿栋）',
    signedUp: 7,
    capacity: 100, // Unlimited representation
    status: '长期有效',
    fee: '免费',
    introduction: '每周六清晨，我们一起环小区外河道晨跑 5 公里。不管你是跑圈大神还是小白，这里都有你的配速，跑完一起去食堂吃早餐！',
    activeMembers: ['5号楼201 阿栋', '3号楼308 阿凯', '3号楼308 阿杰'],
    joinedByMe: false
  },
  {
    id: 'event_canteen_try',
    name: '社区食堂试吃日',
    type: '生活服务',
    time: '10/17 周二 11:30-13:00',
    location: '邻里食堂',
    organizer: '物业',
    signedUp: 30,
    capacity: 50,
    status: '报名中',
    fee: '免费试吃，需填写反馈意见表',
    introduction: '邻里食堂菜单全面更新！特邀社区50位住户进行新品试吃，包括红烧肉、酸菜鱼、时令小炒等多道招牌菜，名额有限，先到先得。',
    activeMembers: ['4号楼202 张阿姨', '6号楼101 王叔', '3号楼502 小雅'],
    joinedByMe: false
  },
  {
    id: 'event_picture_book',
    name: '亲子绘本阅读',
    type: '亲子活动',
    time: '每周日 10:00-11:30',
    location: '共享书吧',
    organizer: '居委会',
    signedUp: 6,
    capacity: 10,
    status: '长期有效',
    fee: '免费',
    introduction: '每周日早晨，由退休的优秀幼师小林老师（居委会组织）在共享书吧为社区 3-8 岁孩子讲读中英文优秀绘本故事，带孩子走进奇妙的文学世界。',
    activeMembers: ['6号楼302 小林', '4号楼202 张阿姨'],
    joinedByMe: false
  }
];

export const mockFeedItems: FeedItem[] = [
  // 4.1 互助类动态
  {
    id: 'feed_1',
    type: 'help',
    category: '拼单',
    authorName: '小雅',
    authorRoom: '3号楼502',
    distance: 87,
    time: '20分钟前',
    content: '想买牛肉卷，一个人吃不完一盒，在盒马凑单，还差2人分。',
    likes: 12,
    hasLiked: false,
    meetingTime: '今晚19:00 在3号楼门口集合',
    bountyPoints: 5,
    creditScore: 92,
    helpCount: 23,
    actionText: '我来帮',
    actionStatus: 'idle',
    comments: [
      { id: 'c1_1', authorName: '阿栋', authorRoom: '5号楼201', content: '加我一个！我也想吃牛肉卷。' },
      { id: 'c1_2', authorName: '小雅', authorRoom: '3号楼502', content: '好滴阿栋，今晚见，还差一人～' }
    ]
  },
  {
    id: 'feed_2',
    type: 'help',
    category: '代取',
    authorName: '阿杰',
    authorRoom: '3号楼308',
    distance: 120,
    time: '1小时前',
    content: '快递在小区西门菜鸟驿站，有个大重箱子今晚前必须取，有人顺路能帮忙捎带到3号楼楼下吗？',
    likes: 4,
    hasLiked: false,
    meetingTime: '今日20:00前取即可',
    bountyPoints: 3,
    creditScore: 88,
    helpCount: 5,
    actionText: '我来帮',
    actionStatus: 'idle',
    comments: []
  },
  {
    id: 'feed_3',
    type: 'help',
    category: '照看',
    authorName: '小鱼',
    authorRoom: '2号楼103',
    distance: 200,
    time: '3小时前',
    content: '周末要出差两天，求好心邻居上门帮忙喂猫、铲屎一次。我家猫很乖不咬人。',
    likes: 18,
    hasLiked: true,
    meetingTime: '10/14-10/15 每天一次',
    bountyPoints: 15,
    creditScore: 95,
    helpCount: 8,
    actionText: '我来帮',
    actionStatus: 'idle',
    comments: [
      { id: 'c3_1', authorName: '小雅', authorRoom: '3号楼502', content: '我可以呀，我也养猫，非常熟练！' },
      { id: 'c3_2', authorName: '小鱼', authorRoom: '2号楼103', content: '哇塞太感谢小雅了！那我私信你。' }
    ]
  },
  {
    id: 'feed_4',
    type: 'help',
    category: '闲置',
    authorName: '阿栋',
    authorRoom: '5号楼201',
    distance: 50,
    time: '5小时前',
    content: '搬家整理出一台闲置的小台扇，功能完全完好，有需要的邻居吗？免费自取。',
    image: '🌬️',
    likes: 25,
    hasLiked: false,
    meetingTime: '5号楼201自取',
    bountyPoints: 0,
    creditScore: 90,
    helpCount: 12,
    actionText: '我想要',
    actionStatus: 'idle',
    comments: [
      { id: 'c4_1', authorName: '小琳', authorRoom: '1号楼405', content: '小风扇还在吗？想要，正巧宿舍缺一个。' },
      { id: 'c4_2', authorName: '阿栋', authorRoom: '5号楼201', content: '还在的，今晚就可以来拿。' }
    ]
  },
  {
    id: 'feed_5',
    type: 'help',
    category: '交换',
    authorName: '小林',
    authorRoom: '6号楼302',
    distance: 300,
    time: '2小时前',
    content: '做晚饭正要起锅发现没大蒜了😂 拿自家母鸡生的土鸡蛋两个换一头蒜，急求！',
    likes: 6,
    hasLiked: false,
    meetingTime: '6号楼302 门口敲门',
    bountyPoints: 0,
    creditScore: 85,
    helpCount: 3,
    actionText: '我有大蒜',
    actionStatus: 'idle',
    comments: []
  },

  // 4.2 日常分享动态
  {
    id: 'feed_6',
    type: 'moment',
    authorName: '小鱼',
    authorRoom: '2号楼103',
    distance: 200,
    time: '30分钟前',
    content: '今天傍晚的天空实在是太美了，忍不住在15楼拍了一张，这晚霞简直了！🌆',
    image: '🌅',
    likes: 23,
    hasLiked: false,
    tags: ['日常美好'],
    comments: [
      { id: 'c6_1', authorName: '小雅', authorRoom: '3号楼502', content: '好好看！是几楼拍的？' },
      { id: 'c6_2', authorName: '小鱼', authorRoom: '2号楼103', content: '15楼，视野超好！' },
      { id: 'c6_3', authorName: '阿栋', authorRoom: '5号楼201', content: '我今天在路上也看到了！但用手机拍不出你这效果。' }
    ]
  },
  {
    id: 'feed_7',
    type: 'moment',
    authorName: '阿栋',
    authorRoom: '5号楼201',
    distance: 50,
    time: '2小时前',
    content: '搬来泊寓后第一次尝试自己下厨做红烧肉，结果好像水加多了炖成了红烧肉汤😂 翻车了！',
    image: '🍲',
    likes: 15,
    hasLiked: false,
    tags: ['做饭日常'],
    comments: [
      { id: 'c7_1', authorName: '小雅', authorRoom: '3号楼502', content: '哈哈哈，比我第一次强多了！' },
      { id: 'c7_2', authorName: '阿栋', authorRoom: '5号楼201', content: '求大厨小雅改天指导！' },
      { id: 'c7_3', authorName: '小鱼', authorRoom: '2号楼103', content: '你住几号楼？我也想去蹭吃（学做饭）！' }
    ]
  },
  {
    id: 'feed_8',
    type: 'moment',
    authorName: '小雅',
    authorRoom: '3号楼502',
    distance: 87,
    time: '3小时前',
    content: '我家这位橘猫主子又在窗台上晒太阳了，像一坨大发面馒头，一整天动都不动。',
    image: '🐱',
    likes: 34,
    hasLiked: true,
    tags: ['宠物日常', '猫主子'],
    comments: [
      { id: 'c8_1', authorName: '小鱼', authorRoom: '2号楼103', content: '同款橘猫！我家主子也是个晒太阳狂。' },
      { id: 'c8_2', authorName: '阿杰', authorRoom: '3号楼308', content: '好想rua一下！几楼？我直接上来。' },
      { id: 'c8_3', authorName: '小雅', authorRoom: '3号楼502', content: '502 欢迎来撸！' }
    ]
  },
  {
    id: 'feed_9',
    type: 'moment',
    authorName: '阿凯',
    authorRoom: '3号楼308',
    distance: 87,
    time: '5小时前',
    content: '凌晨两点还在为新版本改方案，咖啡已经喝了三杯。社区里还有人一样在修仙熬夜的吗？☕',
    likes: 8,
    hasLiked: false,
    tags: ['加班狗', '深夜emo'],
    comments: [
      { id: 'c9_1', authorName: '小琳', authorRoom: '1号楼405', content: '我！刚改完财务报表的第三版😭' },
      { id: 'c9_2', authorName: '阿栋', authorRoom: '5号楼201', content: '同是天涯打工人，加油。' },
      { id: 'c9_3', authorName: '阿凯', authorRoom: '3号楼308', content: '原来大家都不睡啊哈哈，心理平衡了。' }
    ]
  },
  {
    id: 'feed_10',
    type: 'moment',
    authorName: '张阿姨',
    authorRoom: '4号楼202',
    distance: 150,
    time: '1天前',
    content: '今天下楼买菜，发现小区东门的樱花树都开花了，天气暖和起来了，春天来啦！🌸',
    image: '🌸',
    likes: 18,
    hasLiked: false,
    tags: ['小区美景'],
    comments: [
      { id: 'c10_1', authorName: '小鱼', authorRoom: '2号楼103', content: '张阿姨拍得真好看！请问这是在哪里拍的？' },
      { id: 'c10_2', authorName: '张阿姨', authorRoom: '4号楼202', content: '就在小区东侧大铁门左手边那一棵。' }
    ]
  },
  {
    id: 'feed_11',
    type: 'moment',
    authorName: '小林',
    authorRoom: '6号楼302',
    distance: 300,
    time: '2小时前',
    content: '给闺蜜织的生日礼物围巾终于大功告成了！手都快织酸了，不过暖融融的好有成就感。🧶',
    image: '🧣',
    likes: 28,
    hasLiked: false,
    tags: ['手工', '日常'],
    comments: [
      { id: 'c11_1', authorName: '小雅', authorRoom: '3号楼502', content: '太好看了吧！求教手艺！' },
      { id: 'c11_2', authorName: '小林', authorRoom: '6号楼302', content: '周末有空来我这儿！我教你呀' },
      { id: 'c11_3', authorName: '小鱼', authorRoom: '2号楼103', content: '报名+1，想要冬天的第一条手织围巾！' }
    ]
  },

  // 4.3 小活动召集
  {
    id: 'feed_12',
    type: 'rally',
    authorName: '阿栋',
    authorRoom: '5号楼201',
    distance: 50,
    time: '1天前',
    content: '周六下午2点小区会所羽毛球场打球，租好场了，还缺2人，有兴趣的一起来！自带拍子哈。🏸',
    likes: 5,
    hasLiked: false,
    meetingTime: '10/14 周六 14:00-16:00 · 小区会所',
    actionText: '我要报名',
    actionStatus: 'idle',
    comments: []
  },
  {
    id: 'feed_13',
    type: 'rally',
    authorName: '小雅',
    authorRoom: '3号楼502',
    distance: 87,
    time: '2天前',
    content: '今晚8点楼顶花园天气好无云，打算带点啤酒零食上去吹风看星星，想来的直接上来！✨',
    likes: 12,
    hasLiked: false,
    meetingTime: '今晚 20:00 · 3号楼楼顶花园',
    actionText: '我要参与',
    actionStatus: 'idle',
    comments: [
      { id: 'c13_1', authorName: '小鱼', authorRoom: '2号楼103', content: '我来我来！我带点薯片和辣条！' },
      { id: 'c13_2', authorName: '阿栋', authorRoom: '5号楼201', content: '我也上去凑个热闹，用不用带个野餐垫或毯子？' },
      { id: 'c13_3', authorName: '小雅', authorRoom: '3号楼502', content: '好呀，多带个垫子最棒啦。' }
    ]
  },

  // 4.4 话题讨论
  {
    id: 'feed_14',
    type: 'topic',
    authorName: '话题小组',
    authorRoom: '置顶话题',
    distance: 0,
    time: '本周热议',
    content: '#这周一个人吃了什么 💬 大家都来晒一晒自己的单人伙食吧，外卖、泡面、还是自炊大餐？',
    likes: 45,
    hasLiked: false,
    tags: ['这周一个人吃了什么'],
    comments: [
      { id: 't1_1', authorName: '小雅', authorRoom: '3-502', content: '连续三天在共享厨房煮辛拉面加双份流心蛋，我是不是要废了😂' },
      { id: 't1_2', authorName: '阿栋', authorRoom: '5-201', content: '我昨天也是加班回来泡面解决，同道中人。' },
      { id: 't1_3', authorName: '阿凯', authorRoom: '3-308', content: '今天解锁了番茄炒蛋！人生第一次自己做饭，太香了。' },
      { id: 't1_4', authorName: '小琳', authorRoom: '1-405', content: '番茄炒蛋永远的神！恭喜阿凯入坑！' },
      { id: 't1_5', authorName: '小鱼', authorRoom: '2-103', content: '吃了一整周的外卖和食堂，周末终于动手做了个沙拉。' }
    ]
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann_1',
    type: '停水通知',
    title: '明早9点全小区停水',
    content: '因二次供水水箱清洗和高压水泵常规维护，小区将于10月13日（周二）09:00 - 12:00全区停水。请各位邻居提前做好生活用水储备，外出前务必关闭家中水龙头，以免造成损失。',
    time: '今天',
    importance: '🔴重要'
  },
  {
    id: 'ann_2',
    type: '活动通知',
    title: '周末烘焙课开始报名',
    content: '本周六下午2点，共享厨房，跟着3号楼的小雅老师学做戚风蛋糕，原料工具全免费！限额8人，先到先得。',
    time: '今天',
    importance: '🟡一般'
  },
  {
    id: 'ann_3',
    type: '安全提醒',
    title: '谨防快递诈骗新手段',
    content: '近日，有外部不法分子冒充快递小哥，声称快递破损进行“扫码退款”或“上门加微信赔偿”。在此物业郑重提醒：菜鸟驿站与顺丰快递均无此类私下退款操作，请核实身份，切勿扫码。',
    time: '昨天',
    importance: '🔴重要'
  },
  {
    id: 'ann_4',
    type: '公告',
    title: '小区垃圾分类时间调整',
    content: '根据居委会与业委会最新协议，从10月15日起，小区垃圾定时定点投放时间调整为：早 07:00 - 09:00，晚 19:00 - 21:00。请配合垃圾分类，非投放时间切勿将垃圾堆积在通道。',
    time: '2天前',
    importance: '🟡一般'
  },
  {
    id: 'ann_5',
    type: '活动回顾',
    title: '中秋游园会精彩回顾',
    content: '非常感谢上百位邻居共同参与上周末在小区广场举办的中秋猜灯谜、手作月饼和汉服游园活动！多亏了热心邻居们搭把手，现场井然有序。点击查看活动大合照！',
    time: '1周前',
    importance: '🟢已结束'
  },
  {
    id: 'ann_6',
    type: '公告',
    title: '小区新入驻理发店试营业',
    content: '好消息！南门外旁快剪理发店正式入驻试营业。理发师傅手艺精湛，快剪仅需30元且承诺不办卡、不推销。试营业前三天出示“搭把手”住户认证，更可享受 8 折优惠！',
    time: '3天前',
    importance: '🟡一般'
  },
  {
    id: 'ann_7',
    type: '紧急',
    title: '3号楼电梯常规年检维护通知',
    content: '因电梯特种设备年度安全检查与钢丝绳保养，3号楼高区电梯将于10月14日上午 09:00 - 11:00 暂停运行。请低层居民走楼梯，高层需要出行的居民错开此时间段。',
    time: '1天前',
    importance: '🔴紧急'
  },
  {
    id: 'ann_8',
    type: '公告',
    title: '邻里食堂精选菜单更新',
    content: '应广大年轻住户要求，邻里食堂本周新增招牌红烧肉、酸菜无骨鱼、金汤肥牛等新菜品，同时保持两荤一素 15 元的实惠套餐不变。欢迎大家下班后来品尝！',
    time: '2天前',
    importance: '🟡一般'
  }
];

export const mockWeeklyReport: WeeklyReport = {
  weekRange: '10/06 - 10/12',
  activeUsers: 347,
  newUser: 28,
  retention: '76%',
  helpRequests: 45,
  helpCompleted: 41,
  helpRate: '91%',
  feedPosts: 87,
  activitiesCount: 5,
  satisfaction: 4.7,
  hotTopics: [
    { topic: '这周一个人吃了什么', count: 32 },
    { topic: '家里的毛孩子在干嘛', count: 28 },
    { topic: '小区里你最爱的一角', count: 21 }
  ],
  activeBuildings: [
    { building: '3号楼', count: 18 },
    { building: '5号楼', count: 12 },
    { building: '2号楼', count: 8 }
  ],
  residentDemands: [
    { demand: '快递代取', count: 23 },
    { demand: '拼单/团购', count: 15 },
    { demand: '宠物照看', count: 7 }
  ],
  followUpItems: [
    '6号楼连续3天无新用户注册，需联动宿管管家线下贴海报宣传',
    '8号楼活动室预约使用率下降40%，下周尝试引入周末桌游沙龙重新引流',
    '邻里食堂收到2条差评（反映口味偏咸），已反馈给食堂经理，下周一前落实清淡菜系改良'
  ]
};
