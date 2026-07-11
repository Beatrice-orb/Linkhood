-- ====================================================================
-- Schema for Da Ba Shou (搭把手) Community Public Services and Activities
-- Version: v0.1
-- ====================================================================

-- 1. Public Spaces (公共空间) Table
CREATE TABLE IF NOT EXISTS spaces (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    booking_method VARCHAR(100) NOT NULL,
    capacity VARCHAR(50),
    facilities TEXT[] NOT NULL,
    status VARCHAR(50) NOT NULL, -- '开放中', '开放预约', '可预约', '使用中', '认领中'
    rating DECIMAL(3, 2) DEFAULT 5.00,
    reviews_count INT DEFAULT 0,
    description TEXT,
    notices TEXT[] NOT NULL,
    image VARCHAR(50) NOT NULL -- Emoji or Tailwind CSS icon token
);

-- 2. Local Services and Outlets (周边服务) Table
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- '超市便利', '生鲜超市', '快递服务', '药店', '理发', '医疗服务' 等
    location VARCHAR(200) NOT NULL,
    hours VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    rating DECIMAL(3, 2) DEFAULT 5.00,
    tags TEXT[] NOT NULL,
    reviews TEXT[] NOT NULL,
    has_discount BOOLEAN DEFAULT FALSE,
    discount_text TEXT,
    image VARCHAR(50) NOT NULL -- Emoji or Tailwind CSS icon token
);

-- 3. Community Activities and Events (社区活动) Table
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- '兴趣课程', '体育运动', '闲置交换', '宠物社交', '公益课堂' 等
    time VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    organizer VARCHAR(100) NOT NULL,
    signed_up INT DEFAULT 0,
    capacity INT NOT NULL,
    status VARCHAR(50) NOT NULL, -- '报名中', '即将满员', '长期有效', '已截止'
    fee VARCHAR(100) NOT NULL,
    introduction TEXT NOT NULL,
    active_members TEXT[] NOT NULL
);
