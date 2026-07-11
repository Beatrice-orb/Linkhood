import { useEffect } from 'react';
import { DemoLaunchpad } from './demo/DemoLaunchpad';
import { DemoProvider } from './demo/DemoStore';
import { useHashRoute } from './demo/navigation';
import { ResidentServicesApp } from './resident/ResidentServicesApp';
import { TogDesktopApp } from './tog/TogDesktopApp';
import { TogMobileApp } from './tog/TogMobileApp';
import App from './App';
import './demo/demo.css';

const titles: Record<string, string> = {
  '/demo': '搭把手 · 双端联动 Demo',
  '/resident': '搭把手 · 居民社区生活端',
  '/resident/services': '搭把手 · 居民端身边服务',
  '/tog/desktop/services': '搭把手 · 公共服务接入台',
  '/tog/desktop/workbench': '搭把手 · 社区今日工作台',
  '/tog/desktop/residents': '搭把手 · 居民服务档案',
  '/tog/desktop/permissions': '搭把手 · 数据与权限',
  '/tog/desktop/services/new': '搭把手 · 新增公共服务',
  '/tog/desktop/activities': '搭把手 · 活动运营台',
  '/tog/desktop/activities/new': '搭把手 · 新建活动',
  '/tog/desktop/insights': '搭把手 · 需求与反馈',
  '/tog/mobile/workbench': '搭把手 · 社区工作台',
  '/tog/mobile/activities': '搭把手 · 社工服务活动',
  '/tog/mobile/followup': '搭把手 · 居民跟进',
  '/tog/mobile/me': '搭把手 · 社工账号',
  '/tog/mobile/visit': '搭把手 · 走访记录核对',
};

function RoutedApp() {
  const route = useHashRoute();

  useEffect(() => {
    document.title = titles[route] ?? titles['/demo'];
  }, [route]);

  if (route === '/resident') return <App />;
  if (route === '/resident/services') return <ResidentServicesApp />;
  if (route.startsWith('/tog/desktop/')) return <TogDesktopApp route={route} />;
  if (route.startsWith('/tog/mobile/')) return <TogMobileApp route={route} />;
  return <DemoLaunchpad />;
}

export default function RootApp() {
  return (
    <DemoProvider>
      <RoutedApp />
    </DemoProvider>
  );
}
