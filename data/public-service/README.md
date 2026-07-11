# 社区公共服务与社交活动数据集 (Da Ba Shou Public Services Dataset)

本数据集旨在模拟与提供一个极具代表性的、高还原度的城市青年公寓及新型住宅社区（如“搭把手”邻里社群）的公共服务资源与社交活动数据。

本数据集可用于：
1. **社区大屏/看板**：实时呈现社区活跃度、空闲公共空间和热门活动。
2. **社交地图（Social Map）**：为住户可视化展示周边的共享设施、社区商户折扣、快递代收点、医疗诊所等。
3. **活动管理系统**：用于展示报名情况、可容纳人数、发起人及活跃人员画像。

---

## 1. 目录结构说明

```bash
data/public-service/
├── README.md               # 本说明文档
├── schema.sql              # PostgreSQL/MySQL 关系型数据库建表 SQL
├── activities.v0.1.json    # 社区社交与志愿公益活动（原“Events”模块真实数据）
└── sources.v0.1.json       # 社区共享空间（Spaces）及周边商户服务（Services）资源
```

---

## 2. 数据结构规范

### 2.1 社区公共空间 (`sources.v0.1.json -> spaces`)

| 属性名 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 唯一标识符 | `"space_kitchen"` |
| `name` | `string` | 空间/设施名称 | `"社区共享厨房"` |
| `location` | `string` | 物理位置 | `"3号楼B1层"` |
| `time` | `string` | 开放时段 | `"07:00-22:00"` |
| `bookingMethod` | `string` | 预约/准入方式 | `"小程序预约（提前1天）"` |
| `capacity` | `string` | 容纳人数 | `"8人"` |
| `facilities` | `string[]` | 内置设施列表 | `["电磁炉 × 2", "冰箱 × 1"]` |
| `status` | `string` | 当前状态 | `"开放预约"` |
| `rating` | `number` | 居民综合评分 (0-5) | `4.8` |
| `reviewsCount` | `number` | 已评价次数 | `46` |
| `description` | `string` | 简要介绍及指引 | `"住户免费使用，需提前预约。"` |
| `notices` | `string[]` | 使用须知/警告规则 | `["每次预约限2小时", "损坏物品照价赔偿"]` |
| `image` | `string` | 视觉标志（多为 Emoji 或 Icon 代号）| `"🍳"` |

### 2.2 居民专属服务商户 (`sources.v0.1.json -> services`)

| 属性名 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 唯一标识符 | `"service_convenience"` |
| `name` | `string` | 商户/站点名称 | `"邻里便利店"` |
| `type` | `string` | 服务分类 | `"超市便利"` |
| `location` | `string` | 地理位置 | `"小区南门入口"` |
| `hours` | `string` | 营业时间 | `"24小时"` |
| `phone` | `string` | 联系电话 | `"13812345678"` |
| `rating` | `number` | 满意度评分 | `4.6` |
| `tags` | `string[]` | 特色/口碑标签 | `["可代收快递", "24h营业"]` |
| `reviews` | `string[]` | 居民精选好评内容 | `["深夜下班能喝到热呼乎关东煮，治愈！"]` |
| `hasDiscount` | `boolean` | 是否提供本区认证特惠 | `true` |
| `discountText` | `string` | 专属折扣/特惠说明文本 | `"凭“搭把手”认证住户享自营零食 9.5 折"` |
| `image` | `string` | 视觉分类 Emoji | `"🏪"` |

### 2.3 社区社交活动 (`activities.v0.1.json`)

| 属性名 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | 唯一标识符 | `"event_baking"` |
| `name` | `string` | 活动主题 | `"周末烘焙课"` |
| `type` | `string` | 活动门类 | `"兴趣课程"` |
| `time` | `string` | 举办时段 | `"10/14 周六 14:00-16:00"` |
| `location` | `string` | 举办地点 | `"共享厨房（3号楼B1层）"` |
| `organizer` | `string` | 发起者/组织者 | `"物业"` |
| `signedUp` | `number` | 已报名人数 | `6` |
| `capacity` | `number` | 最大容量人数限制 | `8` |
| `status` | `string` | 活动进展状态 | `"报名中"` |
| `fee` | `string` | 费用说明 | `"免费（材料由物业提供）"` |
| `introduction` | `string` | 详细内容介绍及要求说明 | `"想做蛋糕但不知道怎么开始？小雅教你..."` |
| `activeMembers` | `string[]` | 当前已经报名的成员清单 | `["3号楼502 小雅（指导老师）", "5号楼201 阿栋"]` |

---

## 3. 应用数据对接说明

应用系统可以在 `src/mockData.ts` 中直接导入或读取这两个 JSON 文件。在 React 前端应用中，数据集已作为真实背景数据进行了深度的绑定和功能支持，保证界面功能体验不仅是纯静态呈现，更能进行**预约共享空间**、**加入社区活动（报名）**、**获取商户优惠认证**等模拟交互，打造闭环邻里互助社交图景。
