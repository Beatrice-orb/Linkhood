import {
  ArrowRight,
  HandHeart,
  Monitor,
  RotateCcw,
  Smartphone,
  Users,
} from 'lucide-react';
import { useDemoStore } from './DemoStore';
import { routeTo } from './navigation';

const entries = [
  {
    route: '/tog/desktop/workbench',
    icon: Monitor,
    eyebrow: '社区电脑端 · 独立调整版',
    title: '社区运营电脑端',
    description: '从今日任务进入公共服务、活动、居民跟进与需求回应。',
  },
  {
    route: '/resident/services',
    icon: Users,
    eyebrow: '居民端',
    title: '身边服务入口',
    description: '查看已发布服务、来源、适用对象与预登记方式。',
  },
  {
    route: '/tog/mobile/workbench',
    icon: Smartphone,
    eyebrow: '社区工作手机端',
    title: '今日工作台',
    description: '现场任务、供给核对与授权走访草稿。',
  },
];

export function DemoLaunchpad() {
  const { resetDemo, state } = useDemoStore();

  return (
    <main className="demo-launchpad">
      <header className="demo-launchpad__header">
        <div className="brand-lockup brand-lockup--large">
          <span className="brand-lockup__mark"><HandHeart aria-hidden="true" /></span>
          <span>搭把手</span>
        </div>
        <button className="button button--ghost" type="button" onClick={resetDemo}>
          <RotateCcw size={17} aria-hidden="true" /> 重置演示
        </button>
      </header>

      <section className="demo-launchpad__intro">
        <p className="demo-kicker">双端联动 Demo · v0.1</p>
        <h1>让公共服务更容易抵达居民</h1>
        <p>
          一条真实公共服务，从来源接入、AI 草稿、人工发布，到居民行动与脱敏回流，
          在同一个浏览器状态里完整演示。
        </p>
        <div className="demo-launchpad__status" role="status">
          当前进度：
          <strong>{state.intakePhase === 'published' ? '三伏贴服务已发布' : '三伏贴服务待接入'}</strong>
          <span>·</span>
          <strong>{state.residentEvents.filter((event) => event.type === 'service_interest_expressed').length} 条居民行动信号</strong>
        </div>
      </section>

      <section className="demo-launchpad__grid" aria-label="演示入口">
        {entries.map(({ route, icon: Icon, eyebrow, title, description }) => (
          <button className="demo-entry" type="button" key={route} onClick={() => routeTo(route)}>
            <span className="demo-entry__icon"><Icon aria-hidden="true" /></span>
            <span className="demo-entry__copy">
              <small>{eyebrow}</small>
              <strong>{title}</strong>
              <span>{description}</span>
            </span>
            <ArrowRight className="demo-entry__arrow" aria-hidden="true" />
          </button>
        ))}
      </section>
    </main>
  );
}
