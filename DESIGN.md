---
version: alpha
name: daba-design-system
description: "A warm, local community-life-map design system for the WeChat mini-program '搭把手' and its Web admin dashboard. Anchored on warm canvas #F8F7F0, jade green #2F6B5F for trust and primary actions, and coral #F06A4B for high-energy responses. Supports neighborhood mutual aid, activity discovery, local services, social-worker info, chat, credit score, points, and badges."

colors:
  ink: "#17313B"
  ink-muted: "#5A6E74"
  ink-subtle: "#94A4A8"
  jade: "#2F6B5F"
  jade-hover: "#3D8274"
  jade-light: "#E8F2F3"
  coral: "#F06A4B"
  coral-hover: "#D85A3D"
  amber: "#E9A23B"
  amber-light: "#FDF5E6"
  canvas: "#F8F7F0"
  surface: "#FFFFFF"
  hairline: "#E5E3DA"

typography:
  h1:
    fontFamily: "PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: "PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.25
  h3:
    fontFamily: "PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: "PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.35
  number-lg:
    fontFamily: "Avenir Next Condensed, Arial Narrow, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.1
  number-sm:
    fontFamily: "Avenir Next Condensed, Arial Narrow, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.2

spacing:
  4: 4px
  8: 8px
  12: 12px
  16: 16px
  20: 20px
  24: 24px
  32: 32px
  48: 48px

rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  full: 9999px

icons:
  family: "Lucide outlined"
  strokeWidth: 2
  strokeLinecap: "round"
  strokeLinejoin: "round"
  viewBox: "0 0 24 24"
  color: "currentColor"
  sizes:
    xs: 16px
    sm: 20px
    md: 24px
    lg: 32px
    xl: 40px
  tabbar:
    map: "dabashou-map"
    circle: "dabashou-circle"
    chat: "MessageSquare"
    me: "dabashou-me"
  topFunctions:
    currentResidence: "MapPin"
    announcements: "Bell"
    guide: "BookOpen"
  homeTabs:
    spaces: "Building2"
    events: "Calendar"
    services: "Store"
    social: "HeartHandshake"
  feed:
    filterAll: "LayoutGrid"
    filterHelp: "HeartHandshake"
    filterMoment: "Smile"
    filterRally: "Users"
    filterTopic: "Hash"
    tagPindan: "ShoppingCart"
    tagDaiqu: "Truck"
    tagZhaokan: "Eye"
    tagXianzhi: "Package"
    like: "Heart"
    comment: "MessageCircle"
    share: "Share2"
    respond: "HandHelping"
  chat:
    group: "Users"
    helpDialog: "HeartHandshake"
    private: "User"
    system: "Bell"
    send: "Send"
    quickReply: "Zap"
    activityDetail: "Calendar"
    checkIn: "CheckCircle"
    complete: "CheckCircle2"
  profile:
    credit: "dabashou-credit"
    points: "dabashou-points"
    helpCount: "HandHelping"
    myPosts: "FileText"
    myHelps: "HeartHandshake"
    myActivities: "CalendarCheck"
    myBookmarks: "Bookmark"
    myReviews: "MessageSquare"
    buildingAuth: "ShieldCheck"
    settings: "Settings"
    badge: "dabashou-badge"
    joinedDays: "Clock"
    frequency: "Activity"
  admin:
    info: "Database"
    activities: "CalendarDays"
    notices: "Megaphone"
    dashboard: "BarChart3"
    published: "CheckCircle"
    pending: "Clock"
    offline: "XCircle"
    edit: "Pencil"
    delete: "Trash2"
    export: "Download"
  customIcons:
    - name: "dabashou-map"
      file: "src/assets/icons/dabashou-map.svg"
      usage: "Community map tab"
    - name: "dabashou-circle"
      file: "src/assets/icons/dabashou-circle.svg"
      usage: "Neighborhood circle tab"
    - name: "dabashou-me"
      file: "src/assets/icons/dabashou-me.svg"
      usage: "Profile tab"
    - name: "dabashou-publish"
      file: "src/assets/icons/dabashou-publish.svg"
      usage: "Floating publish button '喊一声'"
    - name: "dabashou-credit"
      file: "src/assets/icons/dabashou-credit.svg"
      usage: "Credit score"
    - name: "dabashou-points"
      file: "src/assets/icons/dabashou-points.svg"
      usage: "Points"
    - name: "dabashou-badge"
      file: "src/assets/icons/dabashou-badge.svg"
      usage: "Achievement badge"

components:
  page-background:
    backgroundColor: "{colors.canvas}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 16px
  card-large:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 20px
  button-primary:
    backgroundColor: "{colors.jade}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 12px 16px
    height: 44px
  button-primary-pressed:
    backgroundColor: "{colors.jade-hover}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 12px 16px
    height: 44px
  button-coral:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 10px 16px
    height: 40px
  button-coral-pressed:
    backgroundColor: "{colors.coral-hover}"
    textColor: "{colors.surface}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.jade}"
    typography: "{typography.body-sm}"
  chip-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: 6px 14px
    height: 32px
  chip-active:
    backgroundColor: "{colors.jade}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: 6px 14px
    height: 32px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 10px 14px
    height: 44px
  input-focused:
    border: "2px solid {colors.jade}"
    backgroundColor: "{colors.surface}"
  tabbar:
    backgroundColor: "{colors.surface}"
    borderTop: "1px solid {colors.hairline}"
    height: 98rpx
  tabbar-active:
    textColor: "{colors.jade}"
    iconColor: "{colors.jade}"
  tabbar-inactive:
    textColor: "{colors.ink-subtle}"
    iconColor: "{colors.ink-subtle}"
  top-function-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 12px
    width: 200rpx
    height: 96rpx
  top-function-icon:
    backgroundColor: "{colors.jade-light}"
    textColor: "{colors.jade}"
    rounded: "{rounded.full}"
    size: 40rpx
  data-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 16px
  announcement-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 16px
  announcement-tag:
    backgroundColor: "{colors.jade-light}"
    textColor: "{colors.jade}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  announcement-important:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.surface}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  mutual-aid-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 16px
  tag-pindan:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.surface}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  tag-daiqu:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.surface}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  tag-zhaokan:
    backgroundColor: "{colors.jade}"
    textColor: "{colors.surface}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  points-chip:
    backgroundColor: "{colors.amber-light}"
    textColor: "{colors.amber}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  credit-score:
    textColor: "{colors.jade}"
    typography: "{typography.number-sm}"
  profile-header:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 20px
  badge-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 12px
    size: 96rpx
  badge-card-locked:
    backgroundColor: "{colors.surface}"
    opacity: 0.4
    rounded: "{rounded.md}"
    padding: 12px
    size: 96rpx
  chat-bubble-own:
    backgroundColor: "{colors.jade}"
    textColor: "{colors.surface}"
    rounded: "12px 12px 4px 12px"
    padding: 10px 14px
  chat-bubble-other:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "12px 12px 12px 4px"
    padding: 10px 14px
  floating-publish:
    backgroundColor: "{colors.jade}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    size: 56px
    shadow: "0 4px 12px rgba(47, 107, 95, 0.24)"
  admin-sidebar:
    backgroundColor: "{colors.surface}"
    width: 200px
    borderRight: "1px solid {colors.hairline}"
  admin-sidebar-active:
    borderLeft: "4px solid {colors.jade}"
    backgroundColor: "{colors.jade-light}"
  admin-table-header:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
  admin-table-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
  status-published:
    backgroundColor: "{colors.jade-light}"
    textColor: "{colors.jade}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  status-pending:
    backgroundColor: "{colors.amber-light}"
    textColor: "{colors.amber}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  status-offline:
    backgroundColor: "{colors.hairline}"
    textColor: "{colors.ink-subtle}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
---

# 搭把手 Design System

## Overview

搭把手是一个**社区生活地图 + 青年邻里互助共享生态**的微信小程序，配套 Web 管理后台。核心体验是让居民知道：社区有什么、邻居在做什么、能找谁帮忙。

视觉基调是**温暖的社区生活地图**：亲切、在地、有活力，但不嘈杂；有邻里互动，但不是无限社交信息流；有信用与积分激励，但不制造焦虑或攀比。

不做政府蓝大屏、不做约会产品、不做商业化商城。

The interface should feel like a clean, local community notice board translated into a mobile app. Every screen anchors the user to a real place and time. Trust is visible through behavior, not opaque scores.

## Visual direction: breathing room & dual-mode

The current direction was too dense: tiny text, tight padding, and cards overloaded with metadata. The system now optimizes for **readability first, density second**.

### Breathing-room principles

1. **Minimum readable type.** Nothing smaller than `text-xs` (12 px in normal mode). Body defaults to `text-sm` (14 px). Decorative 8–10 px labels are removed.
2. **Card information budget.** One card carries at most three lines of core information. Extra metadata moves into a detail page, a bottom sheet, or an inline expand action.
3. **Generous internal spacing.** Cards start at 16 px padding; lists start at 12 px gaps; sections are separated by 24 px or more. Crowded `gap-2` / `p-3` combinations are upgraded.
4. **Badge discipline.** A card header shows at most two badges/tags. If more are needed, they wrap to a new line; they never squeeze into a single truncated row.
5. **Overflow is mandatory, not optional.** Every text container uses `min-w-0` plus `truncate` or `line-clamp`. Flex rows with text never allow children to blow past their parents.
6. **Presentation frame does not squeeze content.** The desktop phone preview can scale down, but the app content area is allowed to feel wider; the frame is for demo, not the real viewport constraint.

### Dual-mode overview

The product supports two visual modes. They share the same core information architecture but differ in density, sizing, and the visibility of senior/safety features.

- **Normal mode** — the default, lightweight consumer experience. Relaxed but efficient; four-tab navigation; richer metadata where space allows.
- **Care mode** — for residents who need larger type, taller tap targets, calmer layouts, and stronger safety nets. It follows the system font-size setting as much as possible so it does not break when users change OS-level text size. Where system scaling is not enough, the mode bumps base spacing and touch targets independently.

Care mode keeps the same four-tab navigation in the current implementation. When a resident switches into care mode while on the Chat tab, the app returns them to Home to reduce disorientation.

Care mode surfaces additional safety and wellness features that are always available but emphasized for elderly residents: SOS emergency help, anti-fraud reminders, daily safety check-in, guardians, medication records, policy Q&A, and help application. These are not new product capabilities in a business sense, but they are given prominent, single-tap placement in care mode.

## Colors

### Color Palette & Roles

- **Jade `#2F6B5F`** — primary action, verified state, civic trust.
- **Jade Hover `#3D8274`** — hover/pressed state for jade surfaces.
- **Jade Light `#E8F2F3`** — information surfaces, privacy notes, subtle backgrounds.
- **Coral `#F06A4B`** — high-energy action: "我来帮", "立即报名", "重要" tags.
- **Coral Hover `#D85A3D`** — pressed state for coral surfaces.
- **Amber `#E9A23B`** — caution that requires attention, not an error.
- **Amber Light `#FDF5E6`** — light warning or notice backgrounds, e.g. points reward.
- **Ink `#17313B`** — primary type and strong outlines.
- **Ink Muted `#5A6E74`** — secondary type and meta information.
- **Ink Subtle `#94A4A8`** — placeholder, disabled, helper text.
- **Canvas `#F8F7F0`** — warm page background. Deliberately not pure white.
- **Surface `#FFFFFF`** — card, sheet, and elevated surface background.
- **Hairline `#E5E3DA`** — 1 px borders and dividers on light surfaces.

### Usage Rules

- Use `jade` for the most common actions and verification states.
- Use `coral` for only ONE high-energy action per screen.
- Use `amber` for warnings, deadlines, and points-related highlights.
- Never use pure black `#000000`; `ink #17313B` is the darkest allowed color.
- Do not introduce additional brand colors beyond the palette above.

## Typography

### Font Families

- **Primary Chinese**: `PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif`
- **Numbers**: `Avenir Next Condensed, Arial Narrow, sans-serif`

### Hierarchy

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `{typography.h1}` | 28px | 700 | 1.2 | Page title |
| `{typography.h2}` | 22px | 700 | 1.25 | Section header |
| `{typography.h3}` | 18px | 600 | 1.3 | Card title |
| `{typography.body}` | 16px | 400 | 1.5 | Default body text |
| `{typography.body-sm}` | 14px | 400 | 1.5 | Card body, secondary text |
| `{typography.caption}` | 12px | 400 | 1.35 | Tags, timestamps, meta |
| `{typography.label}` | 13px | 500 | 1.35 | Buttons, form labels |
| `{typography.number-lg}` | 28px | 700 | 1.1 | Data card numbers |
| `{typography.number-sm}` | 15px | 600 | 1.2 | Credit score, points |

### Dual-mode typography

Normal-mode sizes are fixed for predictable craftsmanship. Care-mode sizes are **relative** so the OS text-size setting can enlarge them without clipping fixed-width layouts.

| Token | Normal mode | Care mode | Notes |
|---|---|---|---|
| `{typography.h1}` | 28 px | `clamp(28px, 1.75rem, 36px)` | Scales with system; capped so headings do not dominate |
| `{typography.h2}` | 22 px | `clamp(24px, 1.5rem, 30px)` | |
| `{typography.h3}` | 18 px | `clamp(20px, 1.25rem, 24px)` | |
| `{typography.body}` | 16 px | `1.125rem` (~18 px at default) | Follows system base; line-height stays 1.5 |
| `{typography.body-sm}` | 14 px | `1rem` (~16 px at default) | Becomes the effective care-mode body floor |
| `{typography.caption}` | 12 px | `0.875rem` (~14 px at default) | Minimum readable size; never below |
| `{typography.label}` | 13 px | `1rem` (~16 px at default) | Buttons and labels grow with system |
| `{typography.number-lg}` | 28 px | `clamp(28px, 1.75rem, 40px)` | Data-card numbers |
| `{typography.number-sm}` | 15 px | `1rem` (~16 px at default) | Credit / points |

Care-mode implementation rules:

- Use `rem` or `rpx` for type in care mode; avoid fixed `px` unless a hard minimum (e.g. `min-width`, icon sizes) is required.
- Set the root font size to `16px` and let the system/browser text-size preference scale `rem` values.
- Line height stays at 1.5 for body and 1.35 for captions/labels so enlarged text does not collide.
- Maximum line length in cards becomes **32 Chinese characters** in care mode (down from 40) to reduce horizontal eye travel.

### Principles

- Headings are compact and strong.
- Controls never inherit browser-default font sizes.
- Maximum line length in cards: 40 Chinese characters (normal), 32 Chinese characters (care).
- Numbers in data cards and credit/points use the narrow number font.
- No text smaller than 12 px in normal mode; no text smaller than 14 px equivalent in care mode.

## Layout

### Spacing System

Base unit: 4 px.

| Token | Value |
|---|---|
| `{spacing.4}` | 4px |
| `{spacing.8}` | 8px |
| `{spacing.12}` | 12px |
| `{spacing.16}` | 16px |
| `{spacing.20}` | 20px |
| `{spacing.24}` | 24px |
| `{spacing.32}` | 32px |
| `{spacing.48}` | 48px |

Do not invent intermediate values.

### Dual-mode spacing and density

| Scenario | Normal mode | Care mode | Rationale |
|---|---|---|---|
| Horizontal page padding | 32 rpx (16 px) | 28 rpx (14 px) | Larger text needs slightly less side margin to fit content |
| Card padding | 16 px | 20 px | More internal air for enlarged type |
| List gap | 12 px | 16 px | Each item breathes more |
| Section vertical rhythm | 24 px related / 48 px unrelated | 32 px related / 64 px unrelated | Slower scrolling, calmer hierarchy |
| Button height | 44 px | 56 px min | Larger tap target for motor accessibility |
| Button horizontal padding | 16 px | 20 px | Label has room to grow with system font |
| TabBar height | 98 rpx | 112 rpx | Icon and label can stack with larger type |
| Floating publish button | 56 × 56 px | 64 × 64 px | Minimum 56 px tap target, but larger is preferred |
| Badge/tag row gap | 8 px | 12 px | Multiple badges do not collide |
| Max visible feed cards per screen | 4–6 | 2–3 | Care mode trades density for clarity |

Density principles:

- **Normal mode:** information-rich but not cramped. Metadata is allowed when it helps scanning, but a single card never exceeds three lines of core content.
- **Care mode:** sparse and deliberate. Each screen focuses on one primary action; secondary information is one tap away.
- Both modes share the same 4-px base unit and token set; care mode simply steps up one spacing tier in most cases.

### Overflow and resilience

All layouts must survive user-defined font scaling and long strings:

- Every flex row that contains text must set `min-w-0` on text children.
- Single-line labels use `truncate`.
- Multi-line descriptions use `line-clamp-2` or `line-clamp-3`.
- Badge groups use `flex-wrap` with a max of two visible badges before wrapping; never `overflow-x: scroll` for metadata badges.
- Card titles and user names truncate; do not break layout with long real-world nicknames.
- In care mode, test at 1.5× and 2× system font sizes. If a component breaks, prefer wrapping over truncation for primary content; truncate only meta.

### WeChat Mini-Program Layout

- Canvas width: 750 rpx.
- Horizontal page padding: 32 rpx (16 px equivalent) in normal mode, 28 rpx in care mode.
- Section vertical rhythm: 48 rpx between unrelated sections, 24 rpx between grouped items, 12 rpx inside a card/list row in normal mode; step each up by one tier in care mode.
- Card radius: 12 px (`{rounded.md}`).
- Card background: `{colors.surface}`.
- Border style: 1 px solid `{colors.hairline}` for dividers and card outlines.
- Bottom TabBar height: 98 rpx (normal), 112 rpx (care); 4 equal tabs.
- Floating publish button: 56 × 56 px circle (normal), 64 × 64 px (care), positioned at least 120 rpx above the TabBar.
- Respect iPhone safe area and WeChat capsule button.

### Web Admin Layout

- Left sidebar: 200 px wide, background `{colors.surface}`, right border `{colors.hairline}`.
- Active sidebar item: 4 px left border `{colors.jade}`, background `{colors.jade-light}`.
- Main content background: `{colors.canvas}`.
- Table row height: 56 px.
- Max content width: 1440 px.

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Small chips, status badges |
| `{rounded.sm}` | 8px | Buttons, inputs, small cards |
| `{rounded.md}` | 12px | Cards, sheets, panels |
| `{rounded.lg}` | 16px | Bottom sheets, modals |
| `{rounded.full}` | 9999px | Avatars, circular icons, pills |

## Icons

### Icon System

- **Base family**: Lucide outlined icons.
- **Stroke width**: 2 px.
- **Stroke linecap/linejoin**: round.
- **ViewBox**: 0 0 24 24.
- **Color**: `currentColor` (inherits from parent text color).
- **No fills**: icons are stroke-only.

### Icon Sizes

| Size | Pixels | Use |
|---|---|---|
| `{icons.sizes.xs}` | 16px | Inline meta icons, tag icons |
| `{icons.sizes.sm}` | 20px | Small buttons, list rows |
| `{icons.sizes.md}` | 24px | TabBar, main function icons |
| `{icons.sizes.lg}` | 32px | Empty states, large buttons |
| `{icons.sizes.xl}` | 40px | Top function area icon containers |

In care mode, icons may step up one size where they sit next to enlarged text (e.g. TabBar uses `lg` instead of `md`), but stroke width stays 2 px.

### Icon Color States

- Default: `{colors.ink}`
- Active/selected: `{colors.jade}`
- High-energy/urgent: `{colors.coral}`
- Warning/points: `{colors.amber}`
- Disabled/secondary: `{colors.ink-subtle}`

### Key Icon Mappings

**TabBar**
- Community map: `{icons.tabbar.map}` (custom SVG)
- Neighborhood circle: `{icons.tabbar.circle}` (custom SVG)
- Chat: `{icons.tabbar.chat}` (Lucide MessageSquare)
- Me: `{icons.tabbar.me}` (custom SVG)

**Top floating function area**
- Current residence: `{icons.topFunctions.currentResidence}` (MapPin)
- Announcements: `{icons.topFunctions.announcements}` (Bell)
- New resident guide: `{icons.topFunctions.guide}` (BookOpen)

**Community map sub-tabs**
- Spaces: `{icons.homeTabs.spaces}` (Building2)
- Events: `{icons.homeTabs.events}` (Calendar)
- Services: `{icons.homeTabs.services}` (Store)
- Social workers: `{icons.homeTabs.social}` (HeartHandshake)

**Neighborhood circle**
- Filter all: `{icons.feed.filterAll}` (LayoutGrid)
- Mutual aid: `{icons.feed.filterHelp}` (HeartHandshake)
- Daily moment: `{icons.feed.filterMoment}` (Smile)
- Mini rally: `{icons.feed.filterRally}` (Users)
- Topic: `{icons.feed.filterTopic}` (Hash)
- Type tags: 拼单=ShoppingCart, 代取=Truck, 照看=Eye, 闲置=Package
- Like: `{icons.feed.like}` (Heart)
- Comment: `{icons.feed.comment}` (MessageCircle)
- Share: `{icons.feed.share}` (Share2)
- Respond: `{icons.feed.respond}` (HandHelping)

**Chat**
- Group: `{icons.chat.group}` (Users)
- Help dialog: `{icons.chat.helpDialog}` (HeartHandshake)
- Private: `{icons.chat.private}` (User)
- System: `{icons.chat.system}` (Bell)
- Send: `{icons.chat.send}` (Send)

**Profile**
- Credit score: `{icons.profile.credit}` (custom shield-check)
- Points: `{icons.profile.points}` (custom coin-star)
- Help count: `{icons.profile.helpCount}` (HandHelping)
- My posts: `{icons.profile.myPosts}` (FileText)
- My helps: `{icons.profile.myHelps}` (HeartHandshake)
- My activities: `{icons.profile.myActivities}` (CalendarCheck)
- My bookmarks: `{icons.profile.myBookmarks}` (Bookmark)
- My reviews: `{icons.profile.myReviews}` (MessageSquare)
- Building auth: `{icons.profile.buildingAuth}` (ShieldCheck)
- Settings: `{icons.profile.settings}` (Settings)
- Badge: `{icons.profile.badge}` (custom medal)

**Admin**
- Info management: `{icons.admin.info}` (Database)
- Activities: `{icons.admin.activities}` (CalendarDays)
- Notices: `{icons.admin.notices}` (Megaphone)
- Dashboard: `{icons.admin.dashboard}` (BarChart3)
- Published: `{icons.admin.published}` (CheckCircle)
- Pending: `{icons.admin.pending}` (Clock)
- Offline: `{icons.admin.offline}` (XCircle)

### Custom Project Icons

Located in `src/assets/icons/`:

- `{icons.customIcons[0].name}` — map pin with community mark, used for community map tab.
- `{icons.customIcons[1].name}` — three people in a circle, used for neighborhood circle tab.
- `{icons.customIcons[2].name}` — user with small building, used for profile tab.
- `{icons.customIcons[3].name}` — hand with plus, used for floating publish button.
- `{icons.customIcons[4].name}` — shield with check, used for credit score.
- `{icons.customIcons[5].name}` — coin with star, used for points.
- `{icons.customIcons[6].name}` — medal with star, used for achievement badges.

### Icon Do's and Don'ts

**Do**
- Use Lucide icons by exact name from the mapping above.
- Use custom SVGs only for the 7 concepts listed.
- Keep stroke width at 2 px across all icons.
- Let icons inherit color via `currentColor`.

**Don't**
- Do not mix filled and outlined icons.
- Do not use emoji as functional icons.
- Do not add shadows, gradients, or 3D effects to icons.
- Do not use different stroke widths within the same interface.
- Do not use star-rating meters for resident trust; use credit-score text instead.

## Components

### Buttons

**`button-primary`** — Jade CTA for primary actions: "查看详情", "立即报名", "确认发布".
- Background `{colors.jade}`, text `{colors.surface}`, 8 px radius, 44 px height, 16 px horizontal padding.
- Pressed: `{colors.jade-hover}`.
- **Care mode:** height 56 px min, horizontal padding 20 px, font size scales with system. Container allows text to wrap to two lines only if the action verb is unusually long; otherwise truncate.

**`button-secondary`** — Outlined button for secondary actions: "编辑", "取消", "稍后".
- Background `{colors.surface}`, text `{colors.ink}`, 1 px `{colors.hairline}` border.
- **Care mode:** same height/padding bump as primary.

**`button-coral`** — High-energy action: "我来帮", "确认完成", "重要".
- Background `{colors.coral}`, text `{colors.surface}`, 8 px radius, 40 px height.
- Pressed: `{colors.coral-hover}`.
- **Care mode:** height 48 px min to keep it prominent; 56 px preferred.

**`button-ghost`** — Inline text link in `{colors.jade}`.
- **Care mode:** increase tap target to at least 44 × 44 px by padding, even if the visible text is short.

### TabBar

- Background `{colors.surface}`, top border `{colors.hairline}`.
- 4 tabs in both normal and care mode: 社区地图 / 邻里圈 / 我的聊天 / 我的.
- Active: icon + label `{colors.jade}`.
- Inactive: `{colors.ink-subtle}`.
- Unread dot: 8 px diameter `{colors.coral}` with 2 px `{colors.surface}` border.
- **Care mode:** height 112 rpx, icon 28 × 28 rpx, label uses `text-xs` (14 px equivalent) and scales with system. Tab labels are allowed to wrap to two lines if needed, but prefer a shorter label. When the user toggles into care mode while on the Chat tab, the app switches them to Home to reduce disorientation.

### Top Floating Function Area

- Horizontal scroll container with snap-to-card behavior.
- Each card: 200 rpx × 96 rpx, `{colors.surface}`, 12 px radius.
- Icon container: 40 rpx circle, `{colors.jade-light}` background, `{colors.jade}` icon.
- Title: 14 px medium; meta: 12 px muted.
- **Care mode:** card 220 rpx × 112 rpx; icon 48 rpx; title 16 px; meta 14 px.

### Data Overview Cards

- 4-column grid, 12 rpx gap.
- Card: 12 px radius, `{colors.surface}`.
- Number: 28 px / 700 / `{colors.jade}` / Avenir Next Condensed.
- Label: 12 px / `{colors.ink-muted}`.
- Tap switches to corresponding sub-tab.
- **Care mode:** keeps the 4-column grid but with larger, more tappable cards (28 px icon, 12 px label, 16 px vertical padding); gap increases to 16 rpx. The cards serve as both summary and sub-tab navigation.

### Filter Chips

- Height 32 px, pill radius.
- Default: `{colors.surface}` background, `{colors.ink-muted}` text, 1 px `{colors.hairline}` border.
- Active: `{colors.jade}` background, `{colors.surface}` text.
- Horizontal scroll, 8 rpx gap.
- **Care mode:** height 40 px, horizontal padding 16 px; gap 12 rpx.

### Announcement Card

- `{colors.surface}` background, 12 px radius, 16 px padding.
- "最新公告" tag: `{colors.jade-light}` background, `{colors.jade}` text.
- "重要" tag: `{colors.coral}` background, `{colors.surface}` text.
- Title 16 px / 600; excerpt 14 px / muted, 2-line clamp.
- **Care mode:** padding 20 px; title uses `h3` scale; excerpt `line-clamp-3`; tags wrap if needed.

### Mutual-Aid Card

- `{colors.surface}` background, 12 px radius, 16 px padding.
- Header: 36 px circle avatar + nickname + building + distance/time meta.
- Type tags: 拼单=`{colors.coral}`, 代取=`{colors.amber}`, 照看=`{colors.jade}`, 闲置=`{colors.ink-muted}`.
- Points chip: `{colors.amber-light}` background, `{colors.amber}` icon + text.
- Title 16 px / 600.
- Time/place row: 16 px icon + 14 px muted text.
- Progress bar: track `{colors.jade-light}`, fill `{colors.jade}`.
- Credit line: "⭐ 信用分 92 · 已帮 23 次", 12 px muted.
- Action row: heart + count, comment + count, coral "我来帮" button.
- Comment preview: indented, `{colors.canvas}` background, 8 px radius.
- **Density rule:** header shows at most avatar + name + one badge. Extra meta (distance, time, building) is collapsed to one combined meta string. Tags max 2; if more, wrap.
- **Care mode:** padding 20 px; avatar 40 px; title uses `h3` scale; action row uses the larger coral button; credit line moves below the action row if horizontal space is insufficient.

### Activity Card

- Left thumbnail 80 × 80 rpx, 8 px radius.
- Title 16 px / 600; time 14 px / `{colors.jade}`.
- Initiator badge: "物业发起" or "居民发起" pill.
- Registration progress: "已报名 6/8 人"; remaining spots in `{colors.coral}` if < 30%.
- CTA: "立即报名" `{colors.jade}` button.
- **Care mode:** thumbnail 96 × 96 rpx; title and time each on their own line; button full-width below the text block.

### Profile Header

- `{colors.surface}` background, 12 px radius, 20 px padding.
- Avatar 64 px circle; name 20 px / 700; building tag `{colors.jade-light}` pill.
- Interest tags: hairline pill, 8 px radius.
- Stats row: 信用分（`{colors.jade}`）/ 积分（`{colors.amber}`）/ 累计帮扶（`{colors.ink-muted}`）.
- **Care mode:** padding 24 px; avatar 72 px; stats stack vertically or use a 2-column grid instead of a single row.

### Badge / Medal Card

- 96 × 96 rpx, 12 px radius, `{colors.surface}` background.
- Unlocked: full-color icon + title.
- Locked: 40% opacity + lock overlay.
- No 3D badges or animated sparkles.

### Chat

- Conversation list: 48 px circle avatar, name 16 px / 600, last message 14 px / muted, time 12 px / subtle, unread dot `{colors.coral}`.
- Own bubble: `{colors.jade}` background, `{colors.surface}` text, radius 12px 12px 4px 12px.
- Other bubble: `{colors.surface}` background, `{colors.ink}` text, radius 12px 12px 12px 4px.
- Quick reply chips: hairline pill, 8 px radius.
- Activity shortcut bar: `{colors.canvas}` background, 8 px radius.
- **Care mode:** avatar 56 px; name and last message each on their own line if the combined row becomes too tall; quick-reply chips use the larger button height (44 px min); send button 56 × 56 px.

### Floating Publish Button "喊一声"

- 56 × 56 px circle, `{colors.jade}` fill, `{colors.surface}` icon.
- Shadow: `0 4px 12px rgba(47, 107, 95, 0.24)`.
- Pressed scale 0.96.
- Opens action sheet: 找人搭把手 / 一起拼单 / 发条日常 / 组个小活动.
- **Care mode:** 64 × 64 px; icon 32 px; positioned at least 140 rpx above the taller TabBar.

### Web Admin Table

- Header: `{colors.canvas}` background, `{colors.ink-muted}` text, `{typography.label}`.
- Row: `{colors.surface}` background, `{colors.ink}` text, `{typography.body-sm}`.
- Row hover: `{colors.jade-light}`.
- Status pills: 已发布=`{colors.jade-light}`/`{colors.jade}`, 待审核=`{colors.amber-light}`/`{colors.amber}`, 已下架=`{colors.hairline}`/`{colors.ink-subtle}`.
- Action links: `{colors.jade}` text.
- **Care mode:** row height 64 px; action links become secondary buttons with 44 px height; status pills use 14 px text.

### Care-mode exclusive components

These features are emphasized in care mode to support elderly residents and their families. They use the same color system but receive larger touch targets, simpler flows, and single-tap placement.

#### SOS emergency trigger

- Floating button: 88 × 88 px circle, `{colors.coral}` fill, white icon + label, fixed above the TabBar on the right.
- Tap opens a full-screen confirmation modal with `{colors.coral}` border, location, notified guardians, and a three-level escalation explanation.
- Confirmed SOS enters a countdown/status screen. Level 1 notifies guardians; Level 2 adds community workers; Level 3 adds security and emergency services.
- **Visual style:** high contrast, minimal text, large buttons. No decorative animations except a gentle pulse on the floating button.

#### Anti-fraud banner

- Position: top of care-mode Home, above other content.
- Background `{colors.amber-light}`, `{colors.amber}` icon, 1 px `{colors.amber}` border at 30 % opacity.
- Carousel of short tips; tap opens a full-screen knowledge sheet.
- Text uses the larger care-mode caption size; line length capped at 32 characters.

#### Daily safety check-in

- Home-screen quick-action button, half-width beside "apply for help".
- Default state: `{colors.jade}` fill, white label. Completed state: `{colors.jade-light}` background, `{colors.jade}` text.
- One tap reports "safe today" and notifies guardians.

#### Apply for help

- Home-screen quick-action button, half-width beside daily check-in.
- `{colors.amber}` fill, white label.
- Opens a simple form: category (shopping, haircut, repair, etc.), preferred time, notes.
- Care-mode form uses stacked fields, 56 px min row height, and large radio/select chips.

#### Guardians

- Located in care-mode Profile / Health & Safety.
- List of contacts with name, relation, phone, primary flag.
- Add form: name, phone, relation; primary guardian toggle.
- Card style: `{colors.surface}` background, 20 px padding in care mode, large tap targets for phone call buttons.

#### Medication records

- Located in care-mode Profile / Health & Safety.
- Each medication card shows name, dosage, frequency, time, and a taken-today toggle.
- Add form: name, dosage, time.
- Care mode: cards are full-width, toggle button 44 × 44 px, time displayed in a large monospaced style.

#### Policy Q&A / certification

- Located in care-mode Profile.
- Two tabs: "policy guides" and "my certification".
- Policy cards use a soft tinted background (e.g. `{colors.jade-light}` or indigo-tinted equivalent) with clear headings and plain-language summaries.
- Certification status shown as a prominent confirmation card with badge, level, and verified date.

#### Care-mode feed publisher

- Normal mode uses the single floating "喊一声" button opening an action sheet.
- Care mode surfaces three large, labeled quick-publish buttons: "求助", "发动态", "发起活动".
- Each uses a full-width or half-width large button with an icon and short label; form flows are shortened to one screen where possible.

### Community operator weekly dashboard

A right-side analytics panel for property management and neighborhood committees. It is not a separate admin SPA in the current prototype; it sits beside the resident preview on desktop demo screens.

- Background `{colors.canvas}`, left border `{colors.hairline}`, width 384 px on desktop, full-width on mobile admin view.
- Header: `{colors.jade-light}` icon container + `{colors.ink}` title + `{colors.ink-muted}` subtitle "物业/居委会自治管理控制台".
- Intro block: `{colors.surface}` card with 14 px body text explaining the ToG co-governance angle.

#### Metric widgets

- 2-column grid, gap 8 px.
- Each widget: `{colors.surface}` background, 12 px radius, 1 px `{colors.hairline}` border, height 64 px.
- Label: 10 px / `{colors.ink-subtle}` (this is an exception to the 12 px minimum; it is metadata inside a dense dashboard and should be rare).
- Number: 18 px / 700 / `{colors.ink}` or `{colors.jade}` / number font.
- Metrics shown: active users, new residents, help requests / completed, help completion rate.

#### Ranking lists

- `{colors.surface}` card, 12 px radius, 16 px padding.
- Title row: 14 px / 600 icon + label.
- Row: 12 px / `{colors.ink-muted}` text, right-aligned `{colors.ink-subtle}` count.
- Lists: hot topics, most active buildings, top resident demands.

#### Follow-up items

- `{colors.amber-light}` background, `{colors.amber}` title, 1 px `{colors.amber}` border at 20 % opacity.
- Bulleted list, 11 px / `{colors.ink-muted}`.
- Used for operational alerts and remediation tasks.

## Interaction Constraints

- Minimum tap target: 44 × 44 px in normal mode, 48 × 48 px preferred in care mode.
- Disabled state: 40% opacity, no lift.
- Focus state: 2 px outline offset with `{colors.jade}` for keyboard users.
- Transitions: 150 ms ease for color and transform; 200 ms ease for height and opacity.
- Loading: inline skeletons preferred. Skeleton uses `{colors.jade-light}` with opacity pulse.
- Pull-to-refresh: preserve scroll position; show last update time.
- Like animation: brief scale 1 → 1.2 → 1 on heart, 150 ms; no particle burst.
- Points earned: toast with icon + "+N 积分", 2 s auto-dismiss.
- **Care mode:** reduce or disable non-essential animations; do not rely on motion to convey state.

## States and Feedback

### Empty State
- 64 px outline icon, one-line explanation, one constructive action.
- Examples: "暂无公共空间信息 · 联系物业补充"; "还没有邻里动态 · 来做第一个分享的人".

### Error State
- Inline errors: `{colors.amber}` text and icon below field.
- Blocking errors: full-width banner at top of section.
- Retry is explicit; do not auto-retry more than once.

### Success State
- Toast for lightweight success: "报名成功！已加入活动群", "发布成功".
- Full card for important completion: 互助完成确认页，展示双方头像、完成时间、积分变化、感谢按钮.

### Offline
- Persistent banner: "当前网络不可用，部分信息可能不是最新".

## Copy and Tone

- Address residents as "你" or nickname.
- Prefer verbs: "查看地图", "报名参加", "我来帮", "喊一声".
- Keep community copy local: use "咱们社区" rather than generic "平台".
- Credit score copy describes behavior, not identity: "信用分 92 · 来自 23 次互助" rather than "信用优秀".
- Notifications are helpful, not pushy: "明天 9 点全小区停水", not "你有一条未读消息！".

## Do's and Don'ts

### Do
- Use `{colors.canvas}` as the mini-program page background.
- Reserve `{colors.coral}` for the single most important action per screen.
- Use `{colors.jade}` for verification, trust, and primary navigation.
- Show credit score and points as behavior summaries, not identity labels.
- Mask phone numbers and exact room numbers by default.
- Keep cards at 12 px radius and buttons at 8 px radius.
- Give every card at most three lines of core information; push the rest to a detail view.
- Add `min-w-0` and `truncate`/`line-clamp` to every text container inside a flex row.
- Use relative units (`rem`/`rpx`) for care-mode text so it follows the system font-size setting.
- Allow badges and tags to wrap; never squeeze unlimited metadata into one row.

### Don't
- Do not use dark mode or purple/blue as the primary brand color.
- Do not use government-blue gradient hero banners or decorative data charts.
- Do not use dating-app swipes, card stacks, or mutual-like reveals.
- Do not use viral growth mechanics: share-to-unlock, invite-for-points, countdown pressure.
- Do not use public leaderboards that rank residents against each other.
- Do not use opaque algorithmic recommendations without explainable criteria.
- Do not display real ID photos, ID numbers, or unmasked phone numbers.
- Do not use 3D badges, glassmorphism, neon glows, or particle effects.
- Do not auto-post or auto-exchange contact details without explicit confirmation.
- Do not use Inter, Outfit, or other Western fonts as the primary typeface.
- Do not use spring/bounce easing such as `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- Do not use font sizes below 12 px in normal mode or below 14 px equivalent in care mode.
- Do not fix care-mode layouts with hard `px` font sizes; this defeats OS-level accessibility scaling.

## Implementation Constraints

### Font
- Primary font must be `PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif`.
- Numbers use `Avenir Next Condensed, Arial Narrow, sans-serif`.
- Do not use Inter, Outfit, or JetBrains Mono as the primary UI font.

### Dual-mode implementation

- Normal mode can use fixed `px` for craft control.
- Care mode must use **relative units** for text (`rem`, `em`, or `rpx` where the framework supports it) so the OS font-size setting is respected. Do not hard-code care-mode font sizes in `px`.
- Maintain a single set of components. Use a top-level mode class (e.g. `.care-mode`) to switch spacing, sizing, and typography tokens; do not fork components unless layout truly differs.
- Hardcoded sizes that must stay fixed even in care mode: icon stroke width, hairline border width, minimum tap-target dimensions, safe-area insets. Everything else should be allowed to scale or wrap.
- Test care mode at 1.25×, 1.5×, and 2× system font sizes. The goal is no horizontal overflow and no clipped text; vertical growth is expected.
- Avoid `height` declarations that pin text containers; use `min-height` plus padding instead.

### Data schema

Community map content and activities are backed by structured data in `data/public-service/`.

- `sources.v0.1.json` — public spaces and nearby services.
- `activities.v0.1.json` — community events and volunteer activities.
- `schema.sql` — PostgreSQL/MySQL table definitions for spaces, services, and activities.
- `README.md` — field definitions and integration notes.

The app consumes this data through `src/mockData.ts` in the prototype. Space, Service, and Event types in the frontend should stay aligned with the fields documented in the data README.

### Animation
Allowed:
- Fade in/out: 150–250 ms ease.
- Slide up/down: 200–300 ms ease or `cubic-bezier(0.16, 1, 0.3, 1)`.
- Scale press: 0.96, 100–150 ms ease.
- Skeleton opacity pulse: 1.5 s ease-in-out infinite.

Forbidden:
- Spring/bounce easing.
- Particle bursts, confetti, sparkle effects.
- Glassmorphism blur motion.
- Continuous looping animations on static UI.

### Shadows
- Cards: no shadow or `0 1px 2px rgba(23, 49, 59, 0.04)`.
- Floating button: `0 4px 12px rgba(47, 107, 95, 0.24)`.
- Modals: `0 8px 24px rgba(23, 49, 59, 0.08)`.

## Color Migration Map

When refactoring existing dark-slate/indigo code to this design system, map Tailwind classes as follows:

| Current code | Replace with | Token |
|---|---|---|
| `bg-slate-900` / `bg-slate-950` | `bg-canvas` | `canvas #F8F7F0` |
| `bg-slate-900/40`, `bg-slate-900/60` | `bg-surface` | `surface #FFFFFF` |
| `text-slate-100`, `text-white` | `text-ink` | `ink #17313B` |
| `text-slate-300` | `text-ink-muted` | `ink-muted #5A6E74` |
| `text-slate-400`, `text-slate-500` | `text-ink-subtle` | `ink-subtle #94A4A8` |
| `border-slate-800` | `border-hairline` | `hairline #E5E3DA` |
| `bg-indigo-600`, `bg-indigo-500` | `bg-jade` | `jade #2F6B5F` |
| `text-indigo-400` | `text-jade` | `jade #2F6B5F` |
| `bg-indigo-900/30` | `bg-jade-light` | `jade-light #E8F2F3` |
| `text-emerald-400` | `text-jade` | `jade #2F6B5F` |
| `bg-rose-500`, `text-red-400` | `bg-coral` / `text-coral` | `coral #F06A4B` |
| `text-amber-400` | `text-amber` | `amber #E9A23B` |
| Gradients from indigo/slate | Remove; use flat `canvas`/`surface` | — |

## Additional Components

### Toast
- Background `{colors.surface}`, 12 px radius, 1 px `{colors.hairline}`, soft shadow.
- Success icon in `{colors.jade}` circle; info icon in `{colors.jade-light}` circle.
- Auto-dismiss 2–3 s.
- **Care mode:** min-width 280 px; title and message scale with system font; dismiss button 44 × 44 px; auto-dismiss extends to 3–4 s.

### Modal / Bottom Sheet
- Overlay: `rgba(23, 49, 59, 0.48)`.
- Surface: `{colors.surface}`, 16 px radius.
- Header title 18 px / 600; close button top-right.
- CTA area: 1 px top border `{colors.hairline}`, primary button full-width.
- **Care mode:** content padding 24 px; CTA button uses the larger primary button height; action-sheet options stack with 48 px min row height.

### Role Switch Panel (demo/admin)
- Background `{colors.surface}`, 12 px radius, 1 px `{colors.hairline}` border.
- Active role: `{colors.jade-light}` background with `{colors.jade}` indicator.

### Skeleton Loading
- Base color `{colors.jade-light}` at 60% opacity.
- Pulse animation 1.5 s ease-in-out infinite.

### Rating Display
- Show numeric rating + review count as text: "⭐ 4.8 （46 人评价）".
- Do not use a 5-star visual meter as the primary rating widget.

## Copy Lock

Locked product copy:

- `搭把手`
- `邻里搭把手，服务家门口`
- `一个社区，应该有一张地图`
- `查社区有什么`
- `看邻居在干嘛`
- `跟谁聊什么`
- `喊一声`
- `我来帮`
- `报名成功！已加入活动群`
- `太棒了！你又帮了一个邻居`
