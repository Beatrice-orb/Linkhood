import { useEffect } from 'react';
import { DemoLaunchpad } from './demo/DemoLaunchpad';
import { DemoProvider } from './demo/DemoStore';
import { useHashRoute } from './demo/navigation';
import { ResidentServicesApp } from './resident/ResidentServicesApp';
import { TogDesktopApp } from './tog/TogDesktopApp';
import { TogMobileApp } from './tog/TogMobileApp';
import './demo/demo.css';

const titles: Record<string, string> = {
  '/demo': '搭把手 · 双端联动 Demo',
  '/resident/services': '搭把手 · 居民端身边服务',
  '/tog/desktop/services': '搭把手 · 公共服务接入台',
  '/tog/desktop/activities': '搭把手 · 活动运营台',
  '/tog/desktop/insights': '搭把手 · 需求与反馈',
  '/tog/mobile/workbench': '搭把手 · 社区工作台',
  '/tog/mobile/visit': '搭把手 · 走访记录核对',
};

function RoutedApp() {
  const route = useHashRoute();

  useEffect(() => {
    document.title = titles[route] ?? titles['/demo'];
  }, [route]);

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
