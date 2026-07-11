import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  ExternalLink,
  HandHeart,
  HeartHandshake,
  Home,
  Info,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import moxaSourceImage from '../assets/moxa-service-source.jpg';
import { useDemoStore } from '../demo/DemoStore';
import { routeTo } from '../demo/navigation';
import type { PublicServiceCard } from '../demo/types';

type ResidentTab = 'home' | 'help' | 'me';

const typeLabels: Record<PublicServiceCard['serviceType'], string> = {
  healthcare: '健康服务',
  education: '亲子教育',
  employment: '就业服务',
};

function ResidentServiceCard({ service, onOpen }: { service: PublicServiceCard; onOpen: () => void }) {
  return (
    <button className="resident-service-card" type="button" onClick={onOpen}>
      <span className={`resident-service-card__visual resident-service-card__visual--${service.serviceType}`}>
        {service.serviceType === 'healthcare' ? <img src={moxaSourceImage} alt="三伏贴服务" /> : service.serviceType === 'education' ? <Sparkles /> : <HeartHandshake />}
      </span>
      <span className="resident-service-card__body">
        <span className="resident-service-card__meta"><em>{typeLabels[service.serviceType]}</em><small>{service.availability.status === 'registration_open' ? '预约通道已开放' : '余量需确认'}</small></span>
        <strong>{service.shortTitle}</strong>
        <span><MapPin size={15} /> {service.location.split('；')[0]}</span>
        <span><CalendarDays size={15} /> {service.schedule.eventStart.replace('2026-', '').replace('-', '.')}—{service.schedule.eventEnd.replace('2026-', '').replace('-', '.')}</span>
        <small>来源：{service.source.label} · {service.availability.verifiedAt.slice(0, 10)} 核验</small>
      </span>
      <ChevronRight className="resident-service-card__arrow" aria-hidden="true" />
    </button>
  );
}

function ResidentBottomNav({ active, onChange }: { active: ResidentTab; onChange: (tab: ResidentTab) => void }) {
  return (
    <nav className="resident-bottom-nav" aria-label="居民端导航">
      <button type="button" aria-current={active === 'home' ? 'page' : undefined} className={active === 'home' ? 'is-active' : ''} onClick={() => onChange('home')}><Home /><span>首页</span></button>
      <button type="button" aria-current={active === 'help' ? 'page' : undefined} className={active === 'help' ? 'is-active' : ''} onClick={() => onChange('help')}><HandHeart /><span>搭把手</span></button>
      <button type="button" aria-current={active === 'me' ? 'page' : undefined} className={active === 'me' ? 'is-active' : ''} onClick={() => onChange('me')}><UserRound /><span>我的</span></button>
    </nav>
  );
}

function ServiceDetail({ service, onBack }: { service: PublicServiceCard; onBack: () => void }) {
  const { recordResidentEvent, state } = useDemoStore();
  const interestRecorded = state.residentEvents.some((event) => event.type === 'service_interest_expressed' && event.serviceId === service.id);

  const expressInterest = () => recordResidentEvent('service_interest_expressed', service.id);
  const openSource = () => {
    recordResidentEvent('service_source_opened', service.id);
    window.open(service.source.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="resident-detail">
      <header className="resident-detail__header"><button type="button" onClick={onBack} aria-label="返回服务列表"><ArrowLeft /></button><strong>服务详情</strong><button type="button" onClick={() => routeTo('/demo')} aria-label="返回演示入口"><HandHeart /></button></header>
      {service.serviceType === 'healthcare' && <img className="resident-detail__hero" src={moxaSourceImage} alt="三伏贴服务通知配图" />}
      <section className="resident-detail__intro"><span className={service.availability.status === 'registration_open' ? 'status-chip status-chip--success' : 'status-chip status-chip--warning'}>{service.availability.status === 'registration_open' ? '预约通道已开放' : '场次与余量需确认'}</span><h1>{service.title}</h1><p>{service.provider}</p></section>
      <section className="resident-detail__facts">
        <div><CalendarDays /><span><small>服务时间</small><strong>{service.schedule.eventStart} — {service.schedule.eventEnd}</strong></span></div>
        <div><MapPin /><span><small>服务地点</small><strong>{service.location}</strong></span></div>
        <div><UserRound /><span><small>适用对象</small><strong>{service.audience.join('、')}</strong></span></div>
        <div><CircleHelp /><span><small>预约方式</small><strong>{service.registrationMethod}</strong></span></div>
      </section>
      {service.eligibility && <section className="resident-detail__notice"><Info /><div><strong>先确认自己是否适合</strong><p>{service.eligibility}</p></div></section>}
      <section className="resident-detail__source">
        <div><ShieldCheck /><span><strong>信息来自 {service.source.label}</strong><small>最后核验：{service.availability.verifiedAt}</small></span></div>
        <p>{service.availability.basis}</p>
        <button className="button button--ghost button--block" type="button" onClick={openSource}><ExternalLink size={16} /> 查看官方原文</button>
      </section>
      <section className="resident-detail__unknown"><Clock3 /><span><strong>余量请向主办方确认</strong><small>平台不把计划容量当作实时剩余名额。</small></span></section>
      {interestRecorded && <div className="resident-action-success" role="status"><CheckCircle2 /><div><strong>已记录办理意向（演示）</strong><span>请按官方方式完成预登记；社区端只收到脱敏意向信号。</span></div></div>}
      <footer className="resident-detail__actions"><button className="button button--ghost" type="button" onClick={openSource}>查看官方原文</button><button className="button button--primary" type="button" onClick={expressInterest}>{interestRecorded ? '已表达办理意向' : '我想办理'}</button></footer>
      {interestRecorded && service.demoUse === 'primary_story' && <button className="resident-demo-next" type="button" onClick={() => routeTo('/tog/desktop/insights')}>查看社区端演示回流 <ArrowRight size={16} /></button>}
    </div>
  );
}

function ResidentHome({ onOpenProfile, onOpenService }: { onOpenProfile: () => void; onOpenService: (service: PublicServiceCard) => void }) {
  const { services, state } = useDemoStore();
  const [query, setQuery] = useState('帮爸妈找附近的三伏贴服务');
  const [searched, setSearched] = useState(true);
  const [showBoundary, setShowBoundary] = useState(false);
  const publishedServices = useMemo(() => services.filter((service) => service.publication.status === 'published'), [services]);
  const primaryPublished = state.intakePhase === 'published';

  return (
    <div className="resident-home">
      <header className="resident-home__header"><button className="resident-brand" type="button" onClick={() => routeTo('/demo')}><HandHeart /> 搭把手</button><div><strong>西红门社区</strong><span>北京市大兴区</span></div><button className="resident-avatar" type="button" aria-label="打开我的服务进度" onClick={onOpenProfile}>安</button></header>
      <section className="resident-hero"><p>身边的服务，随手找到</p><h1>今天需要哪方面的搭把手？</h1><form className="resident-search" role="search" onSubmit={(event) => { event.preventDefault(); setSearched(true); }}><Search aria-hidden="true" /><input value={query} onChange={(event) => { setQuery(event.target.value); setSearched(false); }} aria-label="搜索社区服务" /><button type="submit">找服务</button></form><div><button type="button" onClick={() => { setQuery('附近有什么健康服务'); setSearched(true); }}>看病就医</button><button type="button" onClick={() => { setQuery('暑期亲子教育活动'); setSearched(true); }}>亲子教育</button><button type="button" onClick={() => { setQuery('7 月招聘和就业服务'); setSearched(true); }}>就业办事</button></div></section>
      {!primaryPublished && <section className="resident-pending"><Sparkles /><div><strong>三伏贴服务正在由社区核对</strong><p>来源已接入，价格、容量和服务站时段正在确认。发布后会出现在这里。</p></div><button type="button" onClick={() => routeTo('/tog/desktop/services')}>看接入过程</button></section>}
      {primaryPublished && searched && <section className="resident-ai-answer"><Sparkles /><div><small>按你的问题匹配</small><strong>已从公开来源服务中找到相关结果</strong><p>请结合服务对象、资格、状态与官方办理方式判断是否适合。</p></div></section>}
      <section className="resident-section"><div className="resident-section__heading"><div><h2>正在开放的身边服务</h2><p>公开来源 · 状态可核验</p></div><button type="button" disabled title="当前已展示全部 3 项">全部服务 <ChevronRight /></button></div><div className="resident-service-list">{publishedServices.map((service) => <div key={service.id}><ResidentServiceCard service={service} onOpen={() => onOpenService(service)} /></div>)}</div></section>
      <section className="resident-low-risk"><div><HeartHandshake /><span><small>正式服务覆盖不到的小事</small><strong>邻里彼此搭把手</strong></span></div><article><span>借工具</span><div><strong>想借一辆手推车搬两箱书</strong><p>公共区域交接 · 已通过社区身份核验</p></div><button type="button" onClick={() => setShowBoundary((value) => !value)}>{showBoundary ? '收起边界' : '了解边界'}</button></article>{showBoundary && <small><ShieldCheck /> 只开放借工具、代取、旧物交换等低风险场景；不承接借贷、医疗急救或进门照护。</small>}</section>
    </div>
  );
}

function ResidentHelp() {
  const [selectedPath, setSelectedPath] = useState<'service' | 'neighbor' | null>(null);

  return (
    <div className="resident-simple-page"><header><HandHeart /><h1>先说说你需要什么</h1><p>AI 只帮你找到更合适的去处，不会自动替你发布或做决定。</p></header><section><button type="button" onClick={() => setSelectedPath('service')}><ShieldCheck /><span><strong>找社区或公共服务</strong><small>办事、就医、就业、亲子、助餐等</small></span><ChevronRight /></button><button type="button" onClick={() => setSelectedPath('neighbor')}><HeartHandshake /><span><strong>找可信邻里搭把手</strong><small>仅限借工具、代取、旧物交换等低风险小事</small></span><ChevronRight /></button></section>{selectedPath && <div className="resident-path-feedback" role="status"><CheckCircle2 /> {selectedPath === 'service' ? '已选择公共服务路径；返回首页可查看当前开放服务。' : '已选择低风险邻里互助路径；本版仅演示边界，不会真实发布需求。'}</div>}<div className="resident-boundary"><Info /> 紧急、医疗、借贷、进家门照护等需求会提示你联系专业机构或人工服务。</div></div>
  );
}

function ResidentMe() {
  const { services, state } = useDemoStore();
  const actions = state.residentEvents.filter((event) => event.type === 'service_interest_expressed');
  return (
    <div className="resident-simple-page resident-me"><header><span className="resident-profile-avatar">安</span><div><h1>安女士</h1><p>西红门社区 · 演示居民</p></div></header><section><h2>我的服务进度</h2>{actions.length === 0 ? <div className="resident-empty"><Clock3 /><p>还没有表达办理意向</p><span>从首页查看公开来源服务并决定下一步。</span></div> : actions.map((action) => { const service = services.find((item) => item.id === action.serviceId); return <article className="resident-progress-card" key={action.id}><CheckCircle2 /><div><strong>{service?.shortTitle ?? '公开服务'}办理意向</strong><p>已查看办理方式 · 请按官方渠道完成预登记</p><small>社区端仅收到匿名演示信号</small></div><ChevronRight /></article>; })}</section></div>
  );
}

export function ResidentServicesApp() {
  const { recordResidentEvent } = useDemoStore();
  const [tab, setTab] = useState<ResidentTab>('home');
  const [selectedService, setSelectedService] = useState<PublicServiceCard | null>(null);

  const openService = (service: PublicServiceCard) => {
    recordResidentEvent('service_card_viewed', service.id);
    setSelectedService(service);
  };

  if (selectedService) return <div className="resident-page"><div className="resident-frame"><div className="resident-demo-disclaimer"><Info /> 演示环境 · 内容来自公开来源快照，不代表与来源机构存在合作关系</div><ServiceDetail service={selectedService} onBack={() => setSelectedService(null)} /></div></div>;

  return (
    <div className="resident-page">
      <div className="resident-frame">
        <div className="resident-demo-disclaimer"><Info /> 演示环境 · 内容来自公开来源快照，不代表与来源机构存在合作关系</div>
        <main className="resident-main">{tab === 'home' ? <ResidentHome onOpenProfile={() => setTab('me')} onOpenService={openService} /> : tab === 'help' ? <ResidentHelp /> : <ResidentMe />}</main>
        <ResidentBottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}
